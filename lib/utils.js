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

var bunyan = require("bunyan");
var child_process = require("child_process");
var devices = require("chromium-emulated-devices");
var fs = require("fs");
var jsonschema = require("jsonschema");
var networks = require("chromium-emulated-networks");
var os = require("os");
var path = require("path");
var process = require("process");
var restify = require("restify");
var schema = require("./schema.json");
var url = require("url");

//
// Global variables
//

var appName = "netshot";
var electroshotPath = path.join(__dirname, "..", "node_modules", ".bin", "electroshot");
var imagePrefix = appName + "-";
var imagesDir = path.join(os.tmpdir(), "__netshot");

var logger = new bunyan({
     name: appName,
     streams: [
          {
               stream: process.stdout,
               level: "info"
          }
     ],
     serializers: {
          req: bunyan.stdSerializers.req
     }
});

var mappedDevices = devices.extensions.reduce(function(result, value) {
     result[value.device.title] = {
          "type": value.device.type,
          "width": value.device.screen.vertical.width,
          "height": value.device.screen.vertical.height,
          "pixel-ratio": value.device.screen["device-pixel-ratio"],
          "user-agent": value.device["user-agent"]
     };

     result["horizontal " + value.device.title] = {
          "type": value.device.type,
          "width": value.device.screen.horizontal.width,
          "height": value.device.screen.horizontal.height,
          "pixel-ratio": value.device.screen["device-pixel-ratio"],
          "user-agent": value.device["user-agent"]
     };

     return result;
}, { });

var mappedNetworks = networks.reduce(function(result, value) {
     result[value.title] = {
          "latency": value.value.latency,
          "download": value.value.throughput,
          "upload": value.value.throughput
     };

     return result;
}, { });

var validator = new jsonschema.Validator();

//
// Functions
//

function addMultiArg(argName, property, args) {
     if (property) {
          if (property instanceof Array) {
               for (var i = 0; i < property.length; ++i) {
                    args.push(argName);
                    args.push("" + property[i]);
               }
          }

          else {
               args.push(argName);
               args.push("" + property);
          }
     }
}

function addSimpleArg(argName, property, args) {
     if (property) {
          args.push(argName);
          args.push("" + property);
     }
}

function getArgsFromBody(body) {
     var args = [ ];

     // Optional properties

     addMultiArg("--cookie", body.cookie, args);
     addMultiArg("--css", body.css, args);
     addMultiArg("--delay", body.delay, args);

     if (body.device) {
          args.push("--device");
          args.push(JSON.stringify(body.device));
     }

     addSimpleArg("--filename", body.filename, args);
     addSimpleArg("--format", body.format, args);
     addMultiArg("--js", body.js, args);

     if (body.network) {
          if (typeof(body.network) == "string") {
               addSimpleArg("--emulate-network", body.network, args);
          }

          else {
               addSimpleArg("--download", body.network.download, args);
               addSimpleArg("--latency", body.network.latency, args);
               addSimpleArg("--upload", body.network.upload, args);
          }
     }

     if (body.pdf) {
          addSimpleArg("--pdf-background", body.pdf.background, args);
          addSimpleArg("--pdf-margin", body.pdf.margin, args);
          addSimpleArg("--pdf-orientation", body.pdf.orientation, args);
          addSimpleArg("--pdf-page-size", body.pdf["page-size"], args);
     }

     if (body.jpg) {
          addSimpleArg("--quality", body.jpg.quality, args);
     }

     addSimpleArg("--selector", body.selector, args);
     addSimpleArg("--user-agent", body["user-agent"], args);
     addSimpleArg("--zoom-factor", body["zoom-factor"], args);

     // Required properties

     args.push(body.url);

     if (body.height) {
          args.push(body.width + "x" + body.height);
     }

     else {
          args.push("" + body.width);
     }

     return args;
}

function getCurrentEndpoint(request, extra) {
     return url.resolve((request.isSecure() ? "https://" : "http://") + request.headers.host, request.url +
          (extra || ""));
}

function getImagesDir() {
     return imagesDir;
}

function initialize(dir) {
     imagesDir = dir;

     try {
          fs.statSync(imagesDir);
     }

     catch (err) {
          fs.mkdirSync(imagesDir);
     }
}

function readStream(readable, callback) {
     var result = "";

     readable.on("data", function(data) {
          result += data;
     });

     readable.on("end", function() {
          callback(result);
     });
}

function runElectroshot(args, callback) {
     var process = child_process.spawn(electroshotPath, args);

     process.on("error", function() {
          callback(new restify.errors.InternalServerError("unable to start electroshot"));
     });

     process.on("exit", function(code, signal) {
          readStream(process.stdout, function(result) {
               // Major hack.  Electroshot always returns 0, even if electron failed with some other code.  So until
               // that's fixed we need to grep for "Electron exited with code..." and return an error in that case and
               // success otherwise.

               if (result.startsWith("Electron exited with code")) {
                    callback(new restify.errors.InternalServerError(result.trim()));

                    return;
               }

               callback();
          });
     });
}

function validateBody(body) {
     var errorMap = { };
     var errors;
     
     if (!body) {
          return { "body": "no request body provided" };
     }

     errors = validator.validate(body, schema).errors;

     if (errors.length == 0) {
          return;
     }

     for (var i = 0; i < errors.length; ++i) {
          var propertyName = errors[i].property.replace("instance.", "").replace("instance", "body");

          errorMap[propertyName] = errors[i].message;
     }

     return errorMap;
}

//
// Exports
//

module.exports = {
     addMultiArg: addMultiArg,
     addSimpleArg: addSimpleArg,
     appName: appName,
     getArgsFromBody: getArgsFromBody,
     getCurrentEndpoint: getCurrentEndpoint,
     getImagesDir: getImagesDir,
     imagePrefix: imagePrefix,
     initialize: initialize,
     logger: logger,
     mappedDevices: mappedDevices,
     mappedNetworks: mappedNetworks,
     readStream: readStream,
     runElectroshot: runElectroshot,
     validateBody
};