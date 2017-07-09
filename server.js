'use strict';

// Module imports
var express = require('express')
  , restify = require('restify')
  , http = require('http')
  , bodyParser = require('body-parser')
  , util = require('util')
  , log = require('npmlog-ts')
  , _ = require('lodash')
;

const DBHOST  = "https://new.apex.digitalpracticespain.com";
const GET     = 'GET';
const POST    = 'POST';
const PUT     = 'PUT';
const DELETE  = 'DELETE';
//const restURI = '/apex/pdb1';
const restURI = '/ords/pdb1';
const ALLOWEDVERBS = [GET,POST,PUT,DELETE];

log.stream = process.stdout;
log.timestamp = true;
log.level = 'verbose';

// Instantiate classes & servers
var app    = express()
  , router = express.Router()

  , routerOSA = express.Router()
  , restOSA = '/rth/pulse'

  , server = http.createServer(app)
  , dbClient = restify.createStringClient({
    url: DBHOST,
    rejectUnauthorized: false
  })
;

// ************************************************************************
// Main code STARTS HERE !!
// ************************************************************************

// Main handlers registration - BEGIN
// Main error handler
process.on('uncaughtException', function (err) {
  log.error("","Uncaught Exception: " + err);
  log.error("","Uncaught Exception: " + err.stack);
});
// Detect CTRL-C
process.on('SIGINT', function() {
  log.error("","Caught interrupt signal");
  log.error("","Exiting gracefully");
  process.exit(2);
});
// Main handlers registration - END

// REST engine initial setup
const PORT = 9997;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// REST stuff - BEGIN
router.use(function(_req, _res, next) {
  if (!_.includes(ALLOWEDVERBS, _req.method)) {
    _res.status(405).end();
    return;
  }
  if ( _req.method === GET) {
    dbClient.get(restURI+_req.url, (err, req, res, data) => {
      if (err) {
        log.error("","[GET] Error from DB call: " + err.statusCode);
        log.error("", "URI: " + restURI+_req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === POST) {
    dbClient.post(restURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[POST] Error from DB call: " + err.statusCode);
        log.error("", "URI: " + restURI+_req.url);
        log.error("", "Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === PUT) {
    dbClient.put(restURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[PUT] Error from DB call: " + err.statusCode);
        log.error("", "URI: " + restURI+_req.url);
        log.error("", "Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === DELETE) {
    dbClient.del(restURI+_req.url, (err, req, res) => {
      if (err) {
        log.error("","[DELETE] Error from DB call: " + err.statusCode);
        log.error("", "URI: " + restURI+_req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.status(res.statusCode).send();
    });
  }
});

routerOSA.use(function(req, res, next) {
//  console.log(util.inspect(req, true, null));
  console.log(req);
  res.status(200).send();
});


app.use(restURI, router);

app.use(restOSA, routerOSA);

// REST stuff - END

server.listen(PORT, () => {
  _.each(router.stack, (r) => {
    log.info("","Listening for any '%s' request at http://localhost:%s%s/*", ALLOWEDVERBS, PORT, restURI);
  });
});
