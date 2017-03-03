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

var fs = require("fs");
var path = require("path");
var restify = require("restify");
var short = require("short-uuid");
var utils = require("./utils");

//
// Functions
//

/**
 * POST /screenshots
 */

function createScreenshot(request, response, next) {
     var args = [ ];
     var format;
     var id = short().new();
     var validationErrors;

     if (!request.is("application/json")) {
          return next(new restify.errors.UnsupportedMediaTypeError());
     }

     // Validate the provided body and massage the response.

     validationErrors = utils.validateBody(request.body);

     if (validationErrors) {
          response.send(400, validationErrors);

          return next();
     }

     format = request.body.format || "png";

     request.body.filename = path.join(utils.getImagesDir(), utils.imagePrefix + id + "." + format);

     // Populate the commandline arguments.

     args = utils.getArgsFromBody(request.body, args);

     // Run electroshot.

     utils.runElectroshot(args, function(error) {
          var images = [ ];

          if (error) {
               return next(error);
          }

          // If multiple delays were specified, we'll have to create -1, -2, etc. hrefs.

          if (request.body.delay) {
               if ((request.body.delay instanceof Array) && (request.body.delay.length > 1)) {
                    for (var i = 0; i < request.body.delay.length; ++i) {
                         images.push({
                              "id": id + "-" + (i + 1) + "." + format,
                              "href": utils.getCurrentEndpoint(request, id + "-" + (i + 1) + "." + format)
                         });
                    }
               }

               else {
                    images.push({
                         "id": id + "." + format,
                         "href": utils.getCurrentEndpoint(request, id + "." + format)
                    });
               }
          }

          else {
               images.push({
                    "id": id + "." + format,
                    "href": utils.getCurrentEndpoint(request, id + "." + format)
               });
          }

          response.send(201, images);

          next();
     });
}

/**
 * DELETE /screenshots/:id
 */

function deleteScreenshot(request, response, next) {
     var file = path.join(utils.getImagesDir(), utils.imagePrefix + request.params.id);

     fs.unlink(file, function(error) {
          if (error) {
               return next(new restify.errors.NotFoundError("screenshot with ID '" + request.params.id +
                    "' not found"));
          }

          response.send(204);

          next();
     });
}

/**
 * GET /screenshots/:id
 */

function getScreenshot(request, response, next) {
     var file = path.join(utils.getImagesDir(), utils.imagePrefix + request.params.id);

     // Stat the file to figure out its size.

     fs.stat(file, function(err, stats) {
          var mimeType;

          if (err || !stats.isFile()) {
               return next(new restify.errors.NotFoundError("screenshot with ID '" + request.params.id +
                    "' not found"));
          }

          // Figure out the correct MIME type based on the filename extension.

          switch (request.params.id.substring(request.params.id.lastIndexOf(".") + 1)) {
               case "jpg": {
                    mimeType = "image/jpeg";

                    break;
               }

               case "png": {
                    mimeType = "image/png";

                    break;
               }

               default: {
                    mimeType = "application/pdf";
               }
          }

          response.writeHead(200, {
               "Content-Length": stats.size,
               "Content-Type": mimeType
          });

          fs.createReadStream(file).pipe(response);

          //response.end();

          next();
     });
}

/**
 * GET /devices
 */

function listDevices(request, response, next) {
     response.send(200, utils.mappedDevices);

     next();
}

/**
 * GET /networks
 */

function listNetworks(request, response, next) {
     response.send(200, utils.mappedNetworks);

     next();
}

/**
 * GET /screenshots
 */

function listScreenshots(request, response, next) {
     fs.readdir(utils.getImagesDir(), { }, function (error, files) {
          var screenshots;

          if (error) {
               return next(new restify.errors.InternalServerError("" + error));
          }

          screenshots = files.reduce(function(result, value) {
               if (value.startsWith(utils.imagePrefix)) {
                    result.push({
                         "id": value.substring(utils.imagePrefix.length),
                         "href": utils.getCurrentEndpoint(request, value.substring(utils.imagePrefix.length))
                    });
               }
          
               return result;
          }, [ ]);

          response.send(200, screenshots);

          next();
     });
}

//
// Exports
//

module.exports = {
     createScreenshot: createScreenshot,
     deleteScreenshot: deleteScreenshot,
     getScreenshot: getScreenshot,
     listDevices: listDevices,
     listNetworks: listNetworks,
     listScreenshots: listScreenshots
};