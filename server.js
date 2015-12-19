var fs = require('fs');
var child = require('child_process');
var express = require('express');
var app = express();
var uuid = require('uuid');
var winston = require('winston');

winston.add(winston.transports.File, { filename: 'app.log' });

app.get('/', function(req, res) {
  res.json({
    ok: true,
    host: process.env.HOSTNAME
  });
});

app.get('/command/:command', function (req, res) {
  var command = req.params.command;
  var jobId = uuid.v4();
  var response = {
    ok: true,
    jobId: jobId,
    task: command,
    host: process.env.HOSTNAME,
    time: +new Date()
  };

  process.nextTick(function asyncJob() {
    var script = __dirname + '/bin/' + command;
    var isWin = /^win/.test(process.platform);
    var ext = '.sh';
    if (isWin) {
      ext = '.bat';
    }

    script += ext;
    child.exec(script, function doAsync(err, result) {
      delete response.q;
      if (err) {
        // Something went wrong.
        response.err = err;
          winston.log('info', '/command/' + command, response);
          return console.log(response);
      }

      response.result = result;
      winston.log('info', '/command/' + command, response);
      console.log(response);
    });
  });

  response.q = true;
  winston.log('info', '/command/' + command, response);
  res.json(response);
});


app.listen(81, function() {
  console.log('[Server] is listening at 81');
});
