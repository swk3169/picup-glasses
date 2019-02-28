var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.urlencoded({extended:false}))
app.locals.pretty=true;
var engines = require('consolidate');

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.get('/login', function(req, res){
  res.render('Login');
})
app.get('/register-member', function(req, res){
  res.render('register-member');
})
app.get('/imgs-calendar', function(req, res){
  fs.readFile('./calendar.png', function(err, data){
    res.writeHead(200, { 'Content-Type' : 'text/html'});
    res.end(data);
  })
})
app.get('/imgs-user', function(req, res){
  fs.readFile('./user-icon.png', function(err, data){
    res.writeHead(200, { 'Content-Type' : 'text/html'});
    res.end(data);
  })
})
app.listen(3000, function(){
  console.log('Connected, 3000 port!');
})
