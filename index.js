#!/usr/bin/env node
// Service to render a Vega specification to PNG/SVG

var express = require('express'),
    vega = require("vega"),
    fs = require('fs'),
    util = require('util'),
    hash = require('quick-hash');

const { exec } = require('child_process');
var port = process.argv[2] || 5000;

var app = express();
var svgHeader =
'<?xml version="1.0" encoding="utf-8"?>\n' +
'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

app.use(function(req, res, next) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
   });

  req.on('end', function() {
    if (data) {
      req.body = data;
    }
    next();
  });
});

app.get('/', function (req,res) {
    res.sendFile(__dirname + '/demo.html');
});

app.post('/svg/', function (req, res, next) {
    var spec = JSON.parse(req.body),
    header = req.params.header === "true";

    res.set('Content-Type', 'image/svg+xml');

    new vega.View(vega.parse(spec), {
        loader: vega.loader(),
        renderer: 'none'
    })
    .initialize()
    .finalize()
    .toSVG()
    .then(svg => { res.send(header ? svgHeader + svg : svg); })
    .catch(err => { console.error(err); });
});

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port);
});
