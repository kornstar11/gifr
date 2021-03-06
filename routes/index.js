var getRandomNumber 	= function(count) {
	console.log('hit'+count);
  var random		= Math.floor(Math.random()*count);
  return random;
};
var getFilePath		= function() {
  return		 './public/uploads/'+req.files.upload.name;
};
var moveFile		= function(src,dst) {
	var fs = require('fs'),
	    util = require('util');

	var is = fs.createReadStream(src)
	var os = fs.createWriteStream(dst);

	util.pump(is, os, function() {
	    fs.unlinkSync(src);
	});

};
var pumpFileStream	= function(src,res) {
	var fs = require('fs'),
	    util = require('util');
	var readStream = fs.createReadStream(src);
	    // We replaced all the event handlers with a simple call to util.pump()
	    util.pump(readStream, res);
	console.log('done pumping');
};
var getFileSize		= function(src) {
	var fs 		= require('fs');
	var stat	=fs.statSync(src);
	return stat.size;
};
var fetchImage		= function(imageDb,res,req) {

		  var width	= req.params[0];
		  var height	= req.params[1];
		  var resize	= true;
		  var sizes	= imageDb.sizes;
		  var connect	= require('connect');
		console.log('B4 sizes');
		console.log(imageDb);
		  if(typeof sizes !== 'undefined') {
			console.log('SIZES');
		  	for(idx in sizes) {
				var size	= sizes[idx];
				console.log(size);
				if(size.width == width && size.height == height) {
					resize	= false;
				}
			}
		  }
		  if(imageDb.location == '') {
			res.end('Bad Image lookup!');
			return;
		  }
		    
		  var src	= app.get('upload location')+imageDb.location;
		  var dst	= app.get('upload location')+width+'_'+height+'_'+imageDb.location;
		  if(resize == true) {
			  var image	= require('imagemagick');
			  image.resize({
			    srcPath: 	src,
			    dstPath: 	dst,
			    width:	width,
			    height:	height
		
			  }, function(err,stout,stin) {
			    if(err) console.log(err);
			    console.log('Resized Image');
			    //Make this a function
			    var type	= connect.mime.lookup(dst);
			    console.log(type);
			    var size	= getFileSize(dst);
			    console.log('size'+size);
			    res.writeHead(200, {'Content-Type': type,
						'Content-Length': size});
			    var size 	= {width: width, height: height};
			    db.images.update({location: imageDb.location},{$push:{sizes: size}}, {multi:true},function(err) {
				if(err) throw err;
			    });
			    pumpFileStream(dst,res);
		  });
		} else {
			    var type	= connect.mime.lookup(dst);
			    console.log(type);
			    var size	= getFileSize(dst);
			    console.log('size'+size);
			    res.writeHead(200, {'Content-Type': type,
						'Content-Length': size});
			    pumpFileStream(dst,res);
		}
};
exports.index 		= function(req, res){
  res.render('index', { content: 'test' });
};
exports.getRandomImage 	= function(req, res){
  console.log('random image lookup...');
  var width	= req.params[0];
  var height	= req.params[1];
  console.log(width+'x'+height);
 	db.images.count(function(err,count){
	  var randomNum	= getRandomNumber(count);
	  console.log(randomNum);
	  db.images.find().limit(-1).skip(randomNum).next(function(err,imageDb) {
		 fetchImage(imageDb,res,req);
	});
      });
};
exports.getTagImage	= function(req,res) {
  console.log('tag image lookup...');
  var width	= req.params[0];
  var height	= req.params[1];
  var tag	= req.params[2];
  db.images.find({tags: tag}).limit(1,function(err,imageDb) {
	if(imageDb != null && imageDb.length > 0){
		console.log('HIT');
		fetchImage(imageDb[0],res,req);
	}
	else {
	  res.end('The tag: '+tag+' was not found... Why dont you find a image that should be taged that way and upload it!');
	
	}
  });
	
};
exports.upload		= function(req,res) {
	var fs 			= require('fs');
	var tags		= req.body.tags;
	//var uploadLocation	= './public/uploads/'+req.files.upload.name;
	var fileName		= req.files.upload.name.replace(' ','_');
	var uploadLocation	= app.get('upload location')+fileName;
	console.log(req.files.upload);
	moveFile(req.files.upload.path,uploadLocation);
               //fs.writeFile(uploadLocation, req.files.upload.path,'utf8', function (err) {
                      //if (err) throw err;
		      tagsArr	= tags.split(',');
		      console.log('got a upload for:');
		      console.log(tagsArr);
		      //Store this in Mongo
		      db.images.save({
				location: 	req.files.upload.name,
				tags:		tagsArr
		      }, function(err, saved) {
			if( err || !saved ) console.log("Image not saved");
			else console.log('updated Db');
		      });
                //});
        res.writeHead(302,"OK",{Location: appUrl});
        res.end();
};