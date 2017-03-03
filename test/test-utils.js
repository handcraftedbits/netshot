/**
 * Copyright (C) 2015-2017 HandcraftedBits
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// Imports
//

var expect = require("chai").expect;
var utils = require("../lib/utils");

//
// Tests
//

describe("utils", function() {
     describe("getArgsFromBody", function() {
          var defaultArgsArray = function(arr) {
               arr.push(undefined);
               arr.push("undefined");

               return arr;
          }

          it("should add the 'cookie' argument correctly", function() {
               expect(utils.getArgsFromBody({ "cookie": "a" })).to.eql(defaultArgsArray([ "--cookie", "a" ]));
               expect(utils.getArgsFromBody({ "cookie": [ "a", "b" ] })).to.eql(defaultArgsArray([ "--cookie", "a",
                    "--cookie", "b" ]));
          });

          it("should add the 'css' argument correctly", function() {
               expect(utils.getArgsFromBody({ "css": "a.css" })).to.eql(defaultArgsArray([ "--css", "a.css" ]));
               expect(utils.getArgsFromBody({ "css": [ "a.css", "b.css" ] })).to.eql(defaultArgsArray([ "--css", "a.css",
                    "--css", "b.css" ]));
          });

          it("should add the 'delay' argument correctly", function() {
               expect(utils.getArgsFromBody({ "delay": 1000 })).to.eql(defaultArgsArray([ "--delay", "1000" ]));
               expect(utils.getArgsFromBody({ "delay": [ 1000, 2000 ] })).to.eql(defaultArgsArray([ "--delay", "1000",
                    "--delay", "2000" ]));
          });

          it("should add the 'device' argument correctly", function() {
               expect(utils.getArgsFromBody({ "device": { "name": "device" } })).to.eql(defaultArgsArray([ "--device",
                    "{\"name\":\"device\"}" ]));
          });

          it("should add the 'download' argument correctly", function() {
               expect(utils.getArgsFromBody({ "network": { "download": 1000 } })).to.eql(defaultArgsArray([
                    "--download", "1000" ]));
          });

          it("should add the 'emulate-network' argument correctly", function() {
               expect(utils.getArgsFromBody({ "network": "network" })).to.eql(defaultArgsArray([ "--emulate-network",
                    "network" ]));
          });

          it("should add the 'filename' argument correctly", function() {
               expect(utils.getArgsFromBody({ "filename": "test.png" })).to.eql(defaultArgsArray([ "--filename",
                    "test.png" ]));
          });

          it("should add the 'format' argument correctly", function() {
               expect(utils.getArgsFromBody({ "format": "jpg" })).to.eql(defaultArgsArray([ "--format", "jpg" ]));
          });

          it("should add the 'js' argument correctly", function() {
               expect(utils.getArgsFromBody({ "js": "a.js" })).to.eql(defaultArgsArray([ "--js", "a.js" ]));
               expect(utils.getArgsFromBody({ "js": [ "a.js", "b.js" ] })).to.eql(defaultArgsArray([ "--js", "a.js",
                    "--js", "b.js" ]));
          });

          it("should add the 'latency' argument correctly", function() {
               expect(utils.getArgsFromBody({ "network": { "latency": 500 } })).to.eql(defaultArgsArray([ "--latency",
                    "500" ]));
          });

          it("should add the 'pdf-background' argument correctly", function() {
               expect(utils.getArgsFromBody({ "pdf": { "background": true } })).to.eql(defaultArgsArray([
                    "--pdf-background", "true" ]));
          });

          it("should add the 'pdf-margin' argument correctly", function() {
               expect(utils.getArgsFromBody({ "pdf": { "margin": "0.5in" } })).to.eql(defaultArgsArray([ "--pdf-margin",
                    "0.5in" ]));
          });

          it("should add the 'pdf-orientation' argument correctly", function() {
               expect(utils.getArgsFromBody({ "pdf": { "orientation": "landscape" } })).to.eql(defaultArgsArray([
                    "--pdf-orientation", "landscape" ]));
          });

          it("should add the 'pdf-page-size' argument correctly", function() {
               expect(utils.getArgsFromBody({ "pdf": { "page-size": "letter" } })).to.eql(defaultArgsArray([
                    "--pdf-page-size", "letter" ]));
          });

          it("should add the 'quality' argument correctly", function() {
               expect(utils.getArgsFromBody({ "jpg": { "quality": 75 } })).to.eql(defaultArgsArray([ "--quality",
                    "75" ]));
          });

          it("should add the 'selector' argument correctly", function() {
               expect(utils.getArgsFromBody({ "selector": "div.any" })).to.eql(defaultArgsArray([ "--selector",
                    "div.any" ]));
          });

          it("should add the 'upload' argument correctly", function() {
               expect(utils.getArgsFromBody({ "network": { "upload": 1000 } })).to.eql(defaultArgsArray([ "--upload",
                    "1000" ]));
          });

          it("should add the 'user-agent' argument correctly", function() {
               expect(utils.getArgsFromBody({ "user-agent": "chrome" })).to.eql(defaultArgsArray([ "--user-agent",
                    "chrome" ]));
          });

          it("should add the 'zoom-factor' argument correctly", function() {
               expect(utils.getArgsFromBody({ "zoom-factor": 2.1 })).to.eql(defaultArgsArray([ "--zoom-factor",
                    "2.1" ]));
          });

          it("should work with just a URL and a width", function() {
               expect(utils.getArgsFromBody({ "url": "http://www.test.com", "width": 1920 })).to.eql([
                    "http://www.test.com", "1920" ]);
          });

          it("should properly format a URL, width, and height", function() {
               expect(utils.getArgsFromBody({ "url": "http://www.test.com", "width": 1920, "height": 1080 })).to.eql([
                    "http://www.test.com", "1920x1080" ]);
          });

          it("should work with multiple options", function() {
               expect(utils.getArgsFromBody({
                    "url": "http://www.test.com",
                    "width": 1920,
                    "height": 1080,
                    "format": "png",
                    "cookie": [ "a", "b" ]
               })).to.eql([
                    "--cookie", "a",
                    "--cookie", "b",
                    "--format", "png",
                    "http://www.test.com", "1920x1080"
               ]);
          });
     });

     describe("validateBody", function() {
          var populateObject = function(name, value) {
               var obj;
               var original = { };
               var splitName = name.split(".");

               obj = original;

               for (var i = 0; i < splitName.length; ++i) {
                    original[splitName[i]] = (i == splitName.length - 1) ? value : { };
                    original = original[splitName[i]];
               }

               return obj;
          }

          var validateProperty = function(name, validValues, invalidValues, alternateName) {
               validValues.forEach(function(value) {
                    var obj = populateObject(name, value);

                    expect(utils.validateBody(obj)).to.not.have.property(alternateName || name);
               });

               invalidValues.forEach(function(value) {
                    var obj = populateObject(name, value);

                    expect(utils.validateBody(obj)).to.have.property(alternateName || name);
               });
          };

          it("should fail if no body is provided", function() {
               expect(utils.validateBody()).to.have.property("body");
          });

          it("should require a URL", function() {
               expect(utils.validateBody({ "width": 1920 })).to.have.property("body", "requires property \"url\"");
          });

          it("should require a width", function() {
               expect(utils.validateBody({ "url": "http://www.test.com" })).to.have.property("body",
                    "requires property \"width\"");
          });

          it("should pass if URL and width are specified", function() {
               expect(utils.validateBody({ "url": "http://www.test.com", "width": 1920 })).to.be.undefined;
          });

          it("should validate the 'cookie' property correctly", function() {
               validateProperty("cookie", [ "a", [ "a" ], [ "a", "b" ] ], [ 1, "", [ ], [ 1 ] ]);
          });

          it("should validate the 'css' property correctly", function() {
               validateProperty("css", [ "a", [ "a" ], [ "a", "b" ] ], [ 1, "", [ ], [ 1 ] ]);
          });

          it("should validate the 'delay' property correctly", function() {
               validateProperty("delay", [ 0, [ 0 ], [ 0, 1 ] ], [ "", 1.1, -1, [ ], [ "" ], [ 1.1 ], [ -1 ] ]);
          });

          it("should validate the 'device' property correctly", function() {
               validateProperty("device", [ { }, { "name": "device" } ], [ true, 1, "", [ ] ]);
          });

          it("should validate the 'format' property correctly", function() {
               validateProperty("format", [ "jpg", "png", "pdf" ], [ true, 1, "", "JPG", "PNG", "PDF" ]);
          });

          it("should validate the 'height' property correctly", function() {
               validateProperty("height", [ 1, "iPhone" ], [ 0, 1.1, "" ]);
          });

          it("should validate the 'jpg' property correctly", function() {
               validateProperty("jpg", [ { } ], [ true, 1, "" ]);
          });

          it("should validate the 'jpg.quality' property correctly", function() {
               validateProperty("jpg.quality", [ 0, 50, 100 ], [ true, -1, 1.1, "" ]);
          });

          it("should validate the 'js' property correctly", function() {
               validateProperty("js", [ "a", [ "a" ], [ "a", "b" ] ], [ 1, "", [ ], [ 1 ], [ "" ] ]);
          });

          it("should validate the 'network' property correctly", function() {
               validateProperty("network", [ "a", "network" ], [ true, 1, "" ]);
          });

          it("should validate the 'network.download' property correctly", function() {
               validateProperty("network.download", [ 1, 1000 ], [ true, 0, 1.1, "" ], "network");
          });

          it("should validate the 'network.latency' property correctly", function() {
               validateProperty("network.latency", [ 1, 1000 ], [ true, 0, 1.1, "" ], "network");
          });

          it("should validate the 'network.upload' property correctly", function() {
               validateProperty("network.upload", [ 1, 1000 ], [ true, 0, 1.1, "" ], "network");
          });

          it("should validate the 'pdf' property correctly", function() {
               validateProperty("pdf", [ { } ], [ true, 1, "" ]);
          });

          it("should validate the 'pdf.background' property correctly", function() {
               validateProperty("pdf.background", [ true, false ], [ "", 1, { } ]);
          });

          it("should validate the 'pdf.orientation' property correctly", function() {
               validateProperty("pdf.orientation", [ "landscape", "portrait" ], [ "", 1, true ]);
          });

          it("should validate the 'selector' property correctly", function() {
               validateProperty("selector",[ "a", "ab" ], [ true, 1, "", { } ]);
          });

          it("should validate the 'url' property correctly", function() {
               validateProperty("url",[ "a", "ab" ], [ true, 1, "", { } ]);
          });

          it("should validate the 'user-agent' property correctly", function() {
               validateProperty("user-agent",[ "a", "ab" ], [ true, 1, "", { } ]);
          });

          it("should validate the 'width' property correctly", function() {
               validateProperty("width", [ 1, 1000, "a" ], [ true, "", { }, 0, -1 ]);
          });

          it("should validate the 'zoom-factor' property correctly", function() {
               validateProperty("zoom-factor",[ 1, 1.0, 1.01, 2.99, 3.00 ], [ true, 0, 3.01, 0.99, -1.00, "", { } ]);
          });
     });
});
