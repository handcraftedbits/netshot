/**
 * Copyright (C) 2017 HandcraftedBits
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

var restify = require("restify");
var routes = require("../lib/routes");
var utils = require("../lib/utils");

//
// Functions
//

function start(port, dir, log) {
     var server;

     utils.initialize(dir);

     //
     // Create server and listen for connections.
     //

     server = restify.createServer({
          name: utils.appName,
          log: utils.logger
     });

     server.use(restify.bodyParser());

     if (log) {
          server.on("after", restify.auditLogger({
               log: utils.logger
          }));
     }

     server.pre(restify.pre.userAgentConnection());

     server.get("/devices", routes.listDevices);
     server.get("/networks", routes.listNetworks);
     server.get("/", routes.listScreenshots);
     server.post("/", routes.createScreenshot);
     server.get("/:id", routes.getScreenshot);
     server.del("/:id", routes.deleteScreenshot);

     server.listen(port, function() {
          if (log) {
               utils.logger.info("listening on port " + port);
               utils.logger.info("saving screenshots to " + utils.getImagesDir());
          }
     });
}

//
// Exports
//

module.exports = {
     start: start
};