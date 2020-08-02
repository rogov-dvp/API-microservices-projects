'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var cors = require('cors');
var sha1 = require('sha1')
var bodyParser = require("body-parser");

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI,{
   useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
//POST- body-parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//Schema & Model
const Schema = mongoose.Schema;
//URL schema & model
const urlSchema = new Schema({
  originalURL: {type: String},
  shortURL: {type: String},
  id: {type: Number},
});
const setURL = mongoose.model("setURL",urlSchema);
//Counter schema & model
const counterSchema = new Schema({
  counter: {type: Number}
});
const counter = mongoose.model("counter", counterSchema);


app.post("/api/shorturl/new", function(req,res) {
  //URLs
  const originalURL = req.body.url;
  const shortURL_woID = "https://thirsty-instinctive-milkshake.glitch.me/api/shorturl/"  
  //Validate URL
  
  dns.lookup(originalURL, function(err) {
    if(err) {
      console.log(err);
      return res.json({"error": "Invalid URL"});
    } else {
      
    console.log("valid URL");
  //Get id
  counter.findById({_id: process.env.COUNTER_ID}, function(err, data){
    if (err){ 
      return console.log(err);
    } else {
      //set id counter
      let id = data.counter;
      //Build short URL
      const shortURL = shortURL_woID + id;
      
      
      //Check if shortURL exists
      setURL.findOne({originalURL: originalURL}, function(err,datasetURL) {
            
        if(datasetURL === null){
          console.log(err)
          //URL does not exist, create a new one
 
          //Create new set of URLs
          setURL.create({ originalURL : originalURL, shortURL: shortURL, id: id}, function(err, data) {
              if(err) return console.log(err);
            console.log(data);
          });

          //response with original URL and shortned URL
          res.json({
            "original_url": originalURL,
            "short_url": shortURL,
            "id": id
          });

            //counter update for next URL
          counter.update({counter: ++id}, function(err, data) {
          if(err) return console.log(err);
          });
          
        } else {
          
          //URL exists  
          res.json({
            "original_url": datasetURL.originalURL,
            "short_url": datasetURL.shortURL,
            "id": datasetURL.id
          });
        }
        
      });
    }});
      
      
    } 
  });
});
  
  //search based on short URL input parameteres
  app.get("/api/shorturl/:paramsId", function(req,res){
    let {paramsId} = req.params;
    let queryId = parseInt(paramsId.trim());
    
    setURL.findOne({id: queryId}, function(err, data){
      if(err) return console.log(err);
      else {
        //Redirect to different webpage
       res.redirect('https://'+data.originalURL).end();
      }
      
    });
    
  });

app.listen(port, function () {
  console.log('Node.js listening ...');
});