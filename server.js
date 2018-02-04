'use strict';

// Module imports
var express = require('express')
  , restify = require('restify')
  , http = require('http')
  , bodyParser = require('body-parser')
  , util = require('util')
  , log = require('npmlog-ts')
  , _ = require('lodash')
  , cors = require('cors')
;

const DBHOST  = "https://new.apex.digitalpracticespain.com";
const SOAHOST = "http://new.soa.digitalpracticespain.com";
const OSAHOST = 'http://new.soa.digitalpracticespain.com:9002';
const GET     = 'GET';
const POST    = 'POST';
const PUT     = 'PUT';
const DELETE  = 'DELETE';
//const dbURI = '/apex/pdb1';
const dbURI   = '/ords/pdb1';
const osbURI  = '/admin';
const soaURI  = '/soa-infra';
const osaURI  = '/rth/pulse';
const ALLOWEDVERBS = [GET,POST,PUT,DELETE];
const ALLOWEDVERBSSOA = [GET,POST];

log.stream = process.stdout;
log.timestamp = true;
log.level = 'verbose';

// Instantiate classes & servers
var app    = express()
  , routerAPEX = express.Router()
  , routerOSA = express.Router()
  , routerSOA = express.Router()
  , routerOSB = express.Router()
  , osaClient = restify.createJsonClient({
    url: OSAHOST,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  , server = http.createServer(app)
  , dbClient = restify.createStringClient({
    url: DBHOST,
    rejectUnauthorized: false
  })
  , soaClient = restify.createJsonClient({
    url: SOAHOST,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
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
app.use(cors());

/**
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
**/

// REST stuff - BEGIN
routerAPEX.use(function(_req, _res, next) {
  if (!_.includes(ALLOWEDVERBS, _req.method)) {
    log.error("","[APEX] Not supported verb: " +  _req.method);
    _res.status(405).end();
    return;
  }
  if ( _req.method === GET) {
    dbClient.get(dbURI+_req.url, (err, req, res, data) => {
      if (err) {
        log.error("","[APEX] [GET] Error from DB call: " + err.statusCode);
        log.error("", "[APEX] URI: " + dbURI+_req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === POST) {
    dbClient.post(dbURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[APEX] [POST] Error from DB call: " + err.statusCode);
        log.error("", "[APEX] URI: " + dbURI+_req.url);
        log.error("", "[APEX] Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === PUT) {
    dbClient.put(dbURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[APEX] [PUT] Error from DB call: " + err.statusCode);
        log.error("", "[APEX] URI: " + dbURI+_req.url);
        log.error("", "[APEX] Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === DELETE) {
    dbClient.del(dbURI+_req.url, (err, req, res) => {
      if (err) {
        log.error("","[APEX] [DELETE] Error from DB call: " + err.statusCode);
        log.error("", "[APEX] URI: " + dbURI+_req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.status(res.statusCode).send();
    });
  }
});

routerOSB.use(function(_req, _res, next) {
  if (!_.includes(ALLOWEDVERBS, _req.method)) {
    log.error("","[OSB] Not supported verb: " +  _req.method);
    _res.status(405).end();
    return;
  }
  if ( _req.method === GET) {
    soaClient.get(osbURI+_req.url, (err, req, res, data) => {
      if (err) {
        log.error("","[OSB] [GET] Error from OSB call: " + err.statusCode);
        log.error("", "[OSB] URI: " + osbURI + _req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === POST) {
    soaClient.post(osbURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[OSB] [POST] Error from OSB call: " + err.statusCode);
        log.error("", "[OSB] URI: " + osbURI + _req.url);
        log.error("", "[OSB] Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === PUT) {
    soaClient.put(osbURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[OSB] [PUT] Error from OSB call: " + err.statusCode);
        log.error("", "[OSB] URI: " + osbURI + _req.url);
        log.error("", "[OSB] Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === DELETE) {
    soaClient.del(osbURI+_req.url, (err, req, res) => {
      if (err) {
        log.error("","[OSB] [DELETE] Error from OSB call: " + err.statusCode);
        log.error("", "[OSB] URI: " + osbURI + _req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.status(res.statusCode).send();
    });
  }
});

routerSOA.use(function(_req, _res, next) {
  if (!_.includes(ALLOWEDVERBSSOA, _req.method)) {
    log.error("","[SOA] Not supported verb: " +  _req.method);
    _res.status(405).end();
    return;
  }
  if ( _req.method === GET) {
    soaClient.get(soaURI+_req.url, (err, req, res, data) => {
      if (err) {
        log.error("","[SOA] [GET] Error from SOA call: " + err.statusCode);
        log.error("", "[SOA] URI: " + soaURI + _req.url);
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  } else if ( _req.method === POST) {
    soaClient.post(soaURI+_req.url, _req.body, (err, req, res, data) => {
      if (err) {
        log.error("","[SOA] [POST] Error from SOA call: " + err.statusCode);
        log.error("", "[SOA] URI: " + soaURI + _req.url);
        log.error("", "[SOA] Body: " + JSON.stringify(_req.body));
        _res.status(err.statusCode).send(err.body);
        return;
      }
      _res.type('json');
      _res.send(data);
    });
  }
});

routerOSA.use(function(_req, _res, next) {

  console.log("request");
  console.log(util.inspect(_req, true, null));
  _res.status(200).send();

/**
  osaClient.post(osaURI, _req.body, (err, req, res, data) => {
    if (err) {
      _res.status(err.statusCode).send(err.body);
      return;
    }
    console.log(res);
    _res.status(200).send();
  });
**/
});

app.use(dbURI, routerAPEX);

app.use(osbURI, routerOSB);

app.use(soaURI, routerSOA);

app.use(osaURI, routerOSA);

// REST stuff - END

server.listen(PORT, () => {
  log.info("","Listening for any '%s' request at http://localhost:%s%s/*", ALLOWEDVERBS, PORT, dbURI);
  log.info("","Listening for any '%s' request at http://localhost:%s%s/*", ALLOWEDVERBS, PORT, osbURI);
  log.info("","Listening for any '%s' request at http://localhost:%s%s/*", ALLOWEDVERBSSOA, PORT, soaURI);
  log.info("","Listening for any '%s' request at http://localhost:%s%s/*", ALLOWEDVERBS, PORT, osaURI);
//  _.each(routerAPEX.stack, (r) => {
//  });
});
