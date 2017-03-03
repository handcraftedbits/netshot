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

var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var fs = require("fs");
var getPort = require("get-port");
var path = require("path");
var rimraf = require("rimraf");
var server = require("../lib/server");
var tmp = require("tmp");
var utils = require("../lib/utils");

//
// Global variables
//

var host;

//
// Functions
//

function createAnyScreenshot(format, callback) {
     createScreenshot({ "url": host + "/networks", "width": 1024, "format": format }, function(error, response) {
          var screenshot;

          expect(error).to.be.null;
          expect(response).to.have.status(201);
          expect(response).to.be.json;

          expect(response.body).to.exist;
          expect(response.body).to.be.an("array");
          expect(response.body.length).to.equal(1);

          screenshot = response.body[0];

          expect(screenshot).to.be.an("object");
          expect(screenshot).to.have.property("id");
          expect(screenshot.id.endsWith("." + format)).to.be.true;
          expect(screenshot).to.have.property("href");
          expect(screenshot.href).to.equal(host + "/" + screenshot.id);

          callback(screenshot);
     });
}

function createScreenshot(body, callback) {
     chai.request(host)
          .post("/")
          .set("Content-Type", "application/json")
          .send(body)
          .end(callback);
}

function deleteScreenshot(id, callback) {
     chai.request(host)
          .delete("/" + id)
          .end(callback);
}

function deleteScreenshotExists(id, callback) {
     deleteScreenshot(id, function(error, response) {
          expect(error).to.be.null;
          expect(response).to.have.status(204);
          
          callback(error, response);
     });
}

function getScreenshot(id, callback) {
     chai.request(host)
          .get("/" + id)
          .end(callback);
}

function getScreenshotExists(id, callback) {
     var mimeType;

     switch (id.substring(id.lastIndexOf(".") + 1)) {
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

     getScreenshot(id, function(error, response) {
          expect(error).to.be.null;
          expect(response).to.have.status(200);
          expect(response).to.have.header("Content-Length");
          expect(response).to.have.header("Content-Type", mimeType);

          callback(error, response);
     });
}

function listScreenshots(callback, expected) {
     chai.request(host)
          .get("/")
          .end(function(error, response) {
               expect(error).to.be.null;
               expect(response).to.have.status(200);
               expect(response).to.be.json;

               expect(response.body).to.exist;
               expect(response.body).to.be.an("array");
               expect(response.body.length).to.equal(expected ? expected.length : 0);

               if (expected) {
                    var actual = response.body;

                    for (var i = 0; i < actual.length; ++i) {
                         expect(actual[i]).to.eql(expected[i]);
                    }
               }

               callback(error, response);
          });
}

//
// Tests
//

describe("routes", function() {
     var dir;

     before(function(done) {
          chai.use(chaiHttp);

          // Get a temporary directory and unused port for the server to listen on.

          dir = tmp.dirSync().name;

          getPort().then(function(port) {
               server.start(port, dir);

               host = "http://localhost:" + port;

               done();
          });
     });

     after(function(done) {
          rimraf(dir, { }, done);
     });

     afterEach(function(done) {
          rimraf(path.join(dir, "*"), { }, done);
     });

     describe("GET /", function() {
          it("should return an empty array if there are no screenshots", function(done) {
               listScreenshots(function(error, response) {
                    done();
               });
          });

          it("should fail if the screenshot directory can't be read", function(done) {
               rimraf(dir, { }, function() {
                    chai.request(host)
                         .get("/")
                         .end(function(error, response) {
                              expect(error).to.not.be.null;
                              expect(error).to.have.status(500);
                              expect(response).to.be.json;

                              expect(response.body).to.exist;

                              fs.mkdirSync(dir);

                              done();
                         });
               });
          });
     });

     describe("POST /", function() {
          it("should fail if no body is provided", function(done) {
               createScreenshot("", function(error, response) {
                    expect(error).to.not.be.null;
                    expect(error).to.have.status(400);
                    expect(response).to.be.json;

                    expect(response.body).to.exist;

                    done();
               });
          });

          it("should fail if the Content-Type is not application/json", function(done) {
               chai.request(host)
                    .post("/")
                    .set("Content-Type", "text/plain")
                    .send("")
                    .end(function(error, response) {
                         expect(error).to.not.be.null;
                         expect(error).to.have.status(415);
                         expect(response).to.be.json;

                         expect(response.body).to.exist;

                         done();
                    });
          });

          it("should take a single screenshot with the minimal set of properties", function(done) {
               createAnyScreenshot("png", function(screenshot) {
                    done();
               });
          });

          it("should take a single screenshot if a single delay property is set", function(done) {
               createScreenshot({ "url": host + "/networks", "width": 1920, "delay": [ 0 ] },
                    function(error, response) {
                         expect(error).to.be.null;
                         expect(response).to.have.status(201);
                         expect(response).to.be.json;

                         expect(response.body).to.exist;
                         expect(response.body).to.be.an("array");
                         expect(response.body.length).to.equal(1);

                         done();
                    });
          });

          it("should take multiple single screenshots if multiple delay properties are set", function(done) {
               createScreenshot({ "url": host + "/networks", "width": 1920, "delay": [ 0, 0 ] },
                    function(error, response) {
                         var screenshot;

                         expect(error).to.be.null;
                         expect(response).to.have.status(201);
                         expect(response).to.be.json;

                         expect(response.body).to.exist;
                         expect(response.body).to.be.an("array");
                         expect(response.body.length).to.equal(2);

                         screenshot = response.body[0];

                         expect(screenshot).to.be.an("object");
                         expect(screenshot).to.have.property("id");
                         expect(screenshot.id.endsWith("-1.png")).to.be.true;

                         screenshot = response.body[1];

                         expect(screenshot).to.be.an("object");
                         expect(screenshot).to.have.property("id");
                         expect(screenshot.id.endsWith("-2.png")).to.be.true;

                         done();
                    });
          });

          it("should change the screenshot listing after a screenshot is taken", function(done) {
               createAnyScreenshot("png", function(screenshot) {
                    listScreenshots(function(error, response) {
                         done();
                    }, [ screenshot ]);
               });
          });
     });

     describe("GET /:id", function() {
          it("should fail if an invalid ID is given", function(done) {
               getScreenshot("xyz", function(error, response) {
                    expect(error).to.not.be.null;
                    expect(error).to.have.status(404);
                    expect(response).to.be.json;

                    expect(response.body).to.exist;

                    done();
               });
          });

          it("should correctly retrieve a JPEG screenshot", function(done) {
               createAnyScreenshot("jpg", function(screenshot) {
                    getScreenshotExists(screenshot.id, function(error, response) {
                         done();
                    });
               });
          });

          it("should correctly retrieve a PDF screenshot", function(done) {
               createAnyScreenshot("pdf", function(screenshot) {
                    getScreenshotExists(screenshot.id, function(error, response) {
                         done();
                    });
               });
          });

          it("should correctly retrieve a PNG screenshot", function(done) {
               createAnyScreenshot("png", function(screenshot) {
                    getScreenshotExists(screenshot.id, function(error, response) {
                         done();
                    });
               });
          });
     });

     describe ("DELETE /:id", function() {
          it("should fail if an invalid ID is given", function(done) {
               deleteScreenshot("xyz", function(error, response) {
                    expect(error).to.not.be.null;
                    expect(error).to.have.status(404);
                    expect(response).to.be.json;

                    expect(response.body).to.exist;

                    done();
               });
          });

          it("should correctly delete an existing screenshot", function(done) {
               createAnyScreenshot("png", function(screenshot) {
                    deleteScreenshotExists(screenshot.id, function(error, response) {
                         done();
                    });
               });
          });

          it("should change the screenshot listing after a screenshot is deleted", function(done) {
               listScreenshots(function() {
                    createAnyScreenshot("png", function(screenshot) {
                         listScreenshots(function() {
                              deleteScreenshot(screenshot.id, function() {
                                   listScreenshots(function() {
                                        done();
                                   });
                              });
                         }, [ screenshot ]);
                    });
               });
          });
     });

     describe("GET /devices", function() {
          it("should provide a list of devices", function(done) {
               chai.request(host)
                    .get("/devices")
                    .end(function(error, response) {
                         expect(error).to.be.null;
                         expect(response).to.have.status(200);
                         expect(response).to.be.json;

                         expect(response.body).to.exist;
                         expect(response.body["Apple iPhone 4"]).to.exist;

                         done();
                    });
          });
     });

     describe("GET /networks", function() {
          it("should provide a list of emulated networks", function(done) {
               chai.request(host)
                    .get("/networks")
                    .end(function(error, response) {
                         expect(error).to.be.null;
                         expect(response).to.have.status(200);
                         expect(response).to.be.json;

                         expect(response.body).to.exist;
                         expect(response.body["Offline"]).to.exist;

                         done();
                    });
          });
     });
});