'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var dns = require('dns');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
var MONGOLAB_URI = 'mongodb://fcc:fcc123@ds141813.mlab.com:41813/fcc';
mongoose.connect(MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }) );

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var shortUrlSchema = mongoose.Schema({
	"url":String,
	"shorturl":Number,
	created: { 
        type: Date,
        default: Date.now
    }
});

var ShortUrl = mongoose.model('ShortUrl',shortUrlSchema);

var countersSchema = mongoose.Schema({
	"_id":String,
	"sequence_value":Number
});

var Counters = mongoose.model('Counters',countersSchema);

function getNextSequenceValue(sequenceName){
console.log("called");
var nextVal = "";
nextVal =   3;
	console.log("asdf");
	//return 9;
	console.log(nextVal);
   return nextVal;
}

app.get('/api/shorturl/:id',function(req,res){
	var id = req.params.id;
	if (isNaN(id))
	{
		res.json({"error":"Wrong Format"});
	}
	else
	{
		ShortUrl.find({shorturl:id},function(err,url){
			if (err || url == "")
			{
				res.json({"error":"No short url found for given input"});
			}
			else
			{
				var newUrl = url[0]['url'];
				res.redirect(newUrl);
			}
		});
	}
});

app.post('/api/shorturl/new', function(req,res){
	var postUrlBody = req.body.url;
	var ind = postUrlBody.indexOf('//');
	var postUrl = postUrlBody.slice(ind+2);
	
	dns.lookup(postUrl, function(err,address){
		if (err)
		{
			console.log(postUrl);
			res.json({"error":"invalid URL"});
		}
		else
		{
			//console.log('post'+postUrl);
			ShortUrl.find({"url":postUrlBody}).exec(function(err,shortUrlFound){
				if (err)
				{
					var shortUrl = new ShortUrl({"shorturl":'a','url':postUrl});
					shortUrl.save(function(err){console.log(err)});
					console.log("in err");
				}
				else
				{
				console.log("for data"+shortUrlFound);
					if (shortUrlFound != "")
					{
					console.log(shortUrlFound);
						//console.log('found URL'+shortUrlFound[0]['shorturl']);
						res.json({"original_url":postUrlBody,"short_url":shortUrlFound[0]['shorturl']});
					}
					else
					{
					
						Counters.findOneAndUpdate(
						{_id: "shorturlid" },
						{$inc:{sequence_value:1}},
						{new:true}, 
						(err,data)=>{
							if (err)
							{
								//console.log("not saved");
								console.log(err);
							}
							else
							{
								//console.log("saved");
								//console.log(data);
								//console.log(data['sequence_value']);
								var shortUrl = new ShortUrl({"shorturl":data['sequence_value'],'url':postUrlBody});
								shortUrl.save(function(err,shortUrlSaved){
									if (err)
									{
										console.log(err);
									}
									else
									{
										res.json({"original_url":postUrlBody,"short_url":shortUrlSaved['shorturl']});
									}
								});
							
							}
							
							//return nextVal['sequence_value'];
						});
						
						
						//console.log(shortUrlSaved);
						console.log("not in err");
					}
				}
			});

		}
	});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});