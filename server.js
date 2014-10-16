/* ============================================================================
 (c) Copyright 2014 Hewlett-Packard Development Company, L.P.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge,publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
============================================================================ */

var PORT = (process.env.PORT || 3000)
  , HOST = (process.env.VCAP_APP_HOST || 'localhost');

var express = require('express')
    , app = express.createServer()
    , amqp = require('amqp')
    , amqpHelper = require('./amqpHelper')
    , messaging = require('./messaging');

app.configure(function(){
  app.use(express.bodyParser());
});

var inputForm = "<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<html><body><p>RabbitMQ for Node.js</p><form action='send' method='post'>Message to send: <input type='text' name='message'><br><input type='submit' value='Send Message'></form></body></html>";

//Handle the initial page load and display the message form.
app.get('/', function(req, res) {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(inputForm, 'utf-8');
});

app.get('/recieve' , function (req, res) {
  messaging.recieveMessage(function (message) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end("Message received: " +message, 'utf-8');
  },
  function(error) {
      console.log('read error occured');
      console.dir(error);
  });
});

	//Handle the POST response from the form.
app.post('/send', function(req, res) {
  //Get the message from the input form and publish it to the exchange.
  var newMessage = req.body.message;
  messaging.sendMessage(newMessage,
    function () {
      res.redirect('/recieve');
    },
    function (error) {
      console.log('send error occured');
      console.dir(error);
    });
});

if (!module.parent) {
  app.listen(PORT);
  console.log('App started on port: ' + PORT);
}

module.exports = app;
