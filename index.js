#!/usr/bin/env node
// Service to render a Vega specification to PNG/SVG

var express = require('express'),
    vega = require("vega"),
    fs = require('fs'),
    util = require('util'),
    hash = require('quick-hash');

const { exec } = require('child_process');
var port = process.argv[2] || 8888;
var image_root = "images/";
var spec_root = "specs/";
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


app.get('/', function (req, res, next) {
    res.send(hash('fiddledeedeooe'));
});

app.post('/svg/', function (req, res, next) {
    var spec = JSON.parse(req.body),
    header = req.params.header === "true";

    console.log("Rendering an SVG");
    res.set('Content-Type', 'image/svg+xml');

    new vega.View(vega.parse(spec), {
        loader: vega.loader(),
        renderer: 'none'
    })
    .initialize()
    .finalize()
    .toSVG()
    .then(svg => { res.send(svg); })
    .catch(err => { console.error(err); });
    
    /*
    var spec_hash = hash(spec);
    var image_path = image_root + spec_hash + '.svg';
    var spec_path = spec_root + spec_hash + '.json';

    if (fs.existsSync(image_path)) {
        fs.readFile(image_path, 'utf8', function(err, contents) {
            res.send(contents);
        });
    } else {
        fs.writeFileSync(spec_path,spec);
        exec('node_modules/.bin/vg2svg ', (err) => {
            if (err) {
              // node couldn't execute the command
              res.send("<error></error>");
            }
            fs.readFile(image_path, 'utf8', function(err, contents) {
                res.send(contents);
            });
          });
    }
    */
});

app.post('/png/', function (req, res, next) {
    var spec = JSON.parse(req.body);
    res.set('Content-Type', 'image/png');

    vg.headless.render(
      {spec: spec, renderer: "canvas"},
      function(err, data) {
        if (err) return next(err);
        var stream = data.canvas.createPNGStream();
        stream
          .on("data", function(chunk) { res.write(chunk); })
          .on("end", function() { res.end(); });
      }
    );
});

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port);
});
