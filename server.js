var fs = require('fs');
var child = require('child_process');
var express = require('express');
var app = express();
var uuid = require('uuid');
var winston = require('winston');
var request = require('request');

var CONTROLLER_HOST = '52.24.82.65:81';
var HTTP_PROTOCOL = 'http://';
var AUTH_KEY = 'f8b37652-4c12-4b64-8936-67097298f11b';

winston.add(winston.transports.File, { filename: 'app.log' });

app.get('/', function(req, res) {
  res.json({
    ok: true,
    host: process.env.HOSTNAME
  });
});

app.get('/command/:command', function (req, res) {
  var command = req.params.command;
  var query =  req.query || {};
  var authKey = query.authKey;
  var jobId = uuid.v4();
  var response = {
    ok: true,
    jobId: jobId,
    task: command,
    host: process.env.HOSTNAME,
    time: +new Date(),
    params: query,
    q: true
  };

  // unset authKey from query.
  delete query.authKey;

  if (authKey !== AUTH_KEY) {
    delete response.q;  // Haven't queued yet.
    response.ok = false;
    response.reason = 'INVALID_AUTH_KEY';
    winston.log('error', '/command/' + command, response);
    return res.json(response);
  }

  process.nextTick(function asyncJob() {
    var script = __dirname + '/bin/' + command;
    var isWin = /^win/.test(process.platform);
    var ext = '.sh';
    if (isWin) {
      ext = '.bat';
    }

    /// $ say_hello.sh -param1 hello -param2 world
    script += ext;  // command.ext i.e say_hello.sh
    var url = toScriptURL(script, query);
    child.exec(url, function doAsync(err, result) {
      delete response.q;
      if (err) {
        // Something went wrong.
        response.ok = false;
        response.err = err;
        winston.log('error', '/command/' + command, response);
        return false;
      }

      response.result = result;
      winston.log('info', '/command/' + command, response);
      // Acknowledge the callback.
      var callbackUrl = HTTP_PROTOCOL + CONTROLLER_HOST + '?result=' + JSON.stringify(response);
      request(callbackUrl, function(error, $resp, body) {
        body = typeof body == 'string' ? JSON.parse(body) : body;
        if (error || !body.ok) {
          response.ok = false;
          response.reason = 'CALLBACK_ERROR';
          return winston.log('error', '/command/' + command, response);
        }

        response.delivered = true;
        winston.log('info', '/command/' + command, response);
      });
    });
  });

  winston.log('info', '/command/' + command, response);
  res.json(response);
});

function toScriptURL(path, params) {
  path = path || '';
  params = params || {};

  // pad white space with path.
  path += ' ';
  Object.keys(params).forEach(function(p) {
    path += ['-', p, ' ', params[p], ' '].join('');
  });

  return path;
}


app.listen(81, function() {
  console.log('[Server] is listening at 81');
});
