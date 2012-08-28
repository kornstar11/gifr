/**
 Mongo Creds
 URL: username:password@example.com/mydb
*/
var connectUrl		= 'gifr';
var collections		= ['images'];
/**
Globals
*/
appName			= 'Gifr.io';
appUrl			= 'http://gifr.io';
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , expressLayouts = require('express-ejs-layouts');

db	 = require('mongojs').connect(connectUrl, collections);
app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('layout','layout');
  app.set('view engine', 'ejs');
  app.set('upload location','./public/uploads/');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(express.bodyParser());
  app.use(expressLayouts);
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
///^\/commits\/(\d+)(?:\.\.(\d+))?$/
app.get(/^\/(\d+)\/(\d+)?$/, routes.getRandomImage);
app.post('/upload', routes.upload);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
