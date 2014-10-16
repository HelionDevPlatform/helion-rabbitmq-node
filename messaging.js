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

var amqp = require('amqp')
  , amqpHelper = require('./amqpHelper');

exports.sendMessage = function (newMessage, sent, errorhandler) {
  var connectionString = process.env.RABBITMQ_URL || "amqp://localhost";
  //Connect to RabbitMQ.
  var rabbitMqConnection = amqp.createConnection({ url: connectionString });

  rabbitMqConnection.on('error', function(error) {
    if(errorhandler) {
      errorhandler(error);
    }
  });

  rabbitMqConnection.once('ready', function() {
    rabbitMqConnection.queue('msg-queue', {} , function(queue) {
      rabbitMqConnection.publish('msg-queue', { message: newMessage });

      //Close the connection to rabbitMQ.
      amqpHelper.safeEndConnection(rabbitMqConnection);
      if(sent) {
        sent();
      }
    });
  });

};

exports.recieveMessage = function(onMessageRecieved, errorhandler) {

  var connectionString = process.env.RABBITMQ_URL || "amqp://localhost";

  //Connect to RabbitMQ.
  var rabbitMqConnection = amqp.createConnection({ url: connectionString });

  rabbitMqConnection.on('error', function(error) {
    if(errorhandler) {
      errorhandler(error);
    }
  });

  rabbitMqConnection.once('ready', function() {
    rabbitMqConnection.queue('msg-queue', {} , function(queue) {
      queue.subscribe(function(msg) {
        var message = msg.message;

        //Close the connection to rabbitMQ.
        amqpHelper.safeEndConnection(rabbitMqConnection);
        if(onMessageRecieved) {
          onMessageRecieved(message);
        }
      });
    });
  });

};
