/**
* Hotel Server.
* @author ishan210788@gmail.com
*/

var express = require('express');
var app = express();
var bodyParser =  require("body-parser");
var path = require('path'),
 fs = require('fs'),
 router = express.Router(),
 reload = require('reload'),
 http = require('http'),
 multer = require('multer');
var launcher = require('simple-autoreload-server');
var guest_list = require("./jsons/fdetails2.json");
app.use("/images", express.static(__dirname + '/images'));
app.use("/jquery-ui-1.11.4.custom", express.static(__dirname + '/jquery-ui-1.11.4.custom'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.urlencoded());

app.get('/', function (req, res) {
   res.sendFile('hotel_guest_list.html', { root: __dirname } );
})
app.set('port', process.env.PORT || 8081);
var server = http.createServer(app)

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.guid + '.jpg');
  }
});
 
var upload = multer({ storage: storage })

  app.post('/upload',upload.single("pic"), function (req, res) {
  console.log("json read ");
  console.log("size is "+ guest_list.length);
  guest_list.push({
    "fname":req.body.fname,
    "lname":req.body.lname,
    "age":req.body.age,
    "GUID": req.body.guid,
    "mnum": req.body.mnum
  });
  fs.writeFile('./jsons/fdetails2.json', JSON.stringify(guest_list, null, 2) , 'utf-8');

  console.log("size is "+ guest_list.length);
  res.redirect("/upload.html");
})

server = app.listen(app.get('port'), function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Hotel Guest List app listening at http://localhost:%s",  port)

})
//reload(server, app);
function updateGuest(){


}
