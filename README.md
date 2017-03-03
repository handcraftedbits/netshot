# Netshot [![npm](https://img.shields.io/npm/v/netshot.svg)](https://www.npmjs.com/package/netshot) [![Build Status](https://travis-ci.org/handcraftedbits/netshot.svg?branch=master)](https://travis-ci.org/handcraftedbits/netshot) [![Coverage Status](https://coveralls.io/repos/github/handcraftedbits/netshot/badge.svg)](https://coveralls.io/github/handcraftedbits/netshot)

A simple REST service for taking web page screenshots via [Electroshot](https://github.com/mixu/electroshot).

# Features

* Based on [Electron](https://electron.atom.io) so you get a recent version of
  [Chromium](https://www.chromium.org/Home) for web page rendering, including:
  * Webfonts
  * CSS and JavaScript injection
  * Device emulation
  * Network emulation
  * And more...
* A simple REST API for creating, retrieving, and deleting screenshots

# Usage

## Prerequisites

### Linux

You should make sure your Linux installation has a complete X11 distribution.  You may also want to install the
[Microsoft TrueType core fonts](https://en.wikipedia.org/wiki/Core_fonts_for_the_Web) as many web pages rely on these
fonts (or equivalents).

#### Headless Usage

When running netshot in a headless manner, you will also need to install
[Xvfb](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml) to provide an in-memory display for Electron.

On [Ubuntu](https://www.ubuntu.com) systems, the following command can be used to install the minimum set of
dependencies required to run netshot in a headless manner:

```bash
apt-get install libasound2 libgconf-2-4 libgtk2.0-0 libnss3 libxss1 libxtst6 ttf-mscorefonts-installer xvfb
```

If you are not using Ubuntu, consult your distribution's package repository for equivalent packages.

## Installation

Make sure you have [Node.js](https://nodejs.org) installed and then install netshot with `npm`:

```bash
npm install -g netshot
```

## Starting the netshot Server

The netshot server can be started by running

```bash
netshot <directory> <port>
```

Where `<directory>` is the directory where screenshots will be saved and `<port>` is the port used to listen for
incoming connections.  If not specified, `<directory>` will default to `%TEMP%\__netshot` on Windows (or
`/tmp/__netshot` on all other platforms) and `<port>` will default to `8000`.

# REST API

* [Retrieve a listing of all screenshots: `GET /`](#get-)
* [Create one or more screenshots: `POST /`](#post-)
* [Retrieve a screenshot: `GET /:id`](#get-id)
* [Delete a screenshot: `DELETE /:id`](#delete-id)
* [Retrieve a list of emulated devices: `GET /devices`](#get-devices)
* [Retrieves a list of emulated networks: `GET /networks`](#get-networks)

## `GET /`

Retrieve a listing of all screenshots.

### Response

#### Response Codes

* `200` if successful.
* `500` if an unexpected error occurs.

#### Headers

* `Content-Type`: `application/json`

#### Body

An array of objects containing information about all captured screenshots.

##### Schema

```javascript
[
  {
    // A unique identifier for the screenshot.
    "id": "string",
    // The URL used to retrieve or delete the screenshot.
    "href": "url"
  }
]
```

### Example

```bash
curl http://localhost:8000/
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Connection: close

[
  {
    "id": "mTjgVBRPNPswZe4TQV5wpe.png",
    "href": "http://localhost:8000/mTjgVBRPNPswZe4TQV5wpe.png"
  }
]
```

## `POST /`

Create one or more screenshots.

### Request

#### Headers

* `Content-Type`: `application/json`

#### Body

An object containing information about the screenshot(s) to capture.

##### Schema

```javascript
{
  // Optional. The cookie(s) that should be included when loading the webpage.
  "cookie": "string | [ string, ... ]",
  // Optional. The CSS rule(s) that should be injected into the webpage after it is loaded.
  "css": "string | [ string, ... ]",
  // Optional. The amount of time, in milliseconds, that should elapse before a screenshot is taken.  When multiple
  // delays are specified, multiple screenshots will be taken.
  "delay": "integer | [ integer, ... ]"
  // A JSON object describing an emulated device used to load the webpage.  See
  // https://github.com/mixu/chromium-emulated-devices/blob/master/index.json for an example of the object format.
  "device": "object",
  // Optional. The screenshot format to use. Default: png
  "format": "string(jpg | pdf | png)"
  // Optional, but required if width is not specified. The maximum height of the screenshot either in pixels or as a
  // device name.  By default, this will be the minimum height required to capture all the content on the webpage.
  "height": "integer | string",
  // Optional. Used to specify JPEG format settings. Only used if format=jpg.
  "jpg": {
    // Optional. JPEG quality level, expressed as an integer from 0 to 100. Default: 75.
    "quality": "integer"
  },
  // Optional. The JavaScript code that should be injected into the webpage after it is loaded.
  "js": "string | [ string,... ]",
  // Optional, can be either a string or an object.  If a string, this value denotes an emulated network preset (you
  // can find a complete listing of these presets by calling the /networks endpoint).  If an object, this value lets you
  // create a custom emulated network.
  "network": "string",
  "network": {
    // Optional.  The emulated network download speed, in Bps.
    "download": "integer",
    // Optional.  The emulated network latency, in ms.
    "latency": "integer",
    // Optional.  The emulated network upload speed, in Bps.
    "upload" : "integer"
  },
  // Optional. Used to specify PDF format settings. Only used if format=pdf.
  "pdf":
    // Optional. Whether or not CSS backgrounds should be captured.
    "background": "boolean",
    // Optional. The page margins to use.
    "margin": "string(default | minimum | none)",
    // Optional. The page orientation to use.
    "orientation": "string(landscape | portrait)",
    // Optional. The paper size to use.
    "page-size": "string(A3 | A4 | legal | letter | tabloid)"
  },
  // Optional. The CSS selector used to specify the DOM element that should be captured for the screenshot, instead of
  // the entire page.
  "selector": "string",
  // Required. The URL of the webpage to load.
  "url": "string",
  // Optional. The user agent to present when loading the webpage.
  "user-agent": "string",
  // Required, but optional if height is specified. The maximum width of the screenshot either in pixels or as a device
  // name.  By default, this will be the minimum width required to capture all the content on the webpage.
  "width": "integer | string",
  // Optional. The amount to zoom the webpage, expressed as a floating-point number from 1.0 to 3.0 (which corresponds
  // to 100% to 300% zoom).
  "zoom-factor": "number"
}
```

Consult the [Electroshot documentation](https://github.com/mixu/electroshot#usage) for additional information on these
parameters.

### Response

#### Response Codes

* `201` if successful.
* `500` if an unexpected error occurs.

#### Headers

* `Content-Type`: `application/json`

#### Body

An array of objects containing information about the captured screenshot(s).

##### Schema

```javascript
[
  {
    // A unique identifier for the screenshot.
    "id": "string",
    // The URL used to retrieve or delete the screenshot.
    "href": "url"
  }
]
```

### Examples

Take a single screenshot of `www.google.com` with the following settings:

* Width of `1920` pixels
* Minimum height required to capture all content
* PNG (default) format

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "url": "www.google.com", "width": 1920 }' http://localhost:8000
```

```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 91
Connection: close

[
  {
    "id": "fN9au2BsDfrLfc5Z8TVp9T.png",
    "href": "http://dev01:8000/fN9au2BsDfrLfc5Z8TVp9T.png"
  }
]
```

Take multiple screenshots of `www.google.com` with the following settings:

* iPhone 6 dimensions
* `500ms` delay before first screenshot and `1000ms` delay before second screenshot
* JPEG format, maximum quality

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "url": "www.google.com", "width": "Apple iPhone 6", "format": "jpg", "jpg": { "quality": 100 }, "delay": [ 500, 1000 ] }' http://localhost:8000
```

```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 197
Connection: close

[
  {
    "id":"sprYtfXc4p7yNzCc7nMmEb-1.jpg",
    "href":"http://localhost:8000/sprYtfXc4p7yNzCc7nMmEb-1.jpg"
  },
  {
    "id":"sprYtfXc4p7yNzCc7nMmEb-2.jpg",
    "href":"http://localhost:8000/sprYtfXc4p7yNzCc7nMmEb-2.jpg"
  }
]
```

Take a screenshot of `www.google.com` with the following settings:

* Width of `1920` pixels
* Minimum height required to capture all content
* PDF format
* No page margins, letter format

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "url": "www.google.com", "width": 1920, "format": "pdf", "pdf": { "margin": "none", "page-size": "letter" } }' http://localhost:8000
```

```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 95
Connection: close

[
  {
    "id":"mUaGfeAs4QAke5oQDm4kjU.pdf",
    "href":"http://localhost:8000/mUaGfeAs4QAke5oQDm4kjU.pdf"
  }
]
```

## `GET /:id`

Retrieve a screenshot.

### Request

#### Parameters

* `id`: the ID of the screenshot to retrieve.

### Response

#### Response Codes

* `200` if successful.
* `404` if the screenshot cannot be found.

#### Headers

* `Content-Type`: `application/pdf`, `image/jpeg`, or `image/png` depending on format; `application/json` if an error occurs.

#### Body

Raw binary data containing the screenshot.

### Example

```bash
curl -o screenshot.pdf http://localhost:8000/mUaGfeAs4QAke5oQDm4kjU.pdf
```

## `DELETE /:id`

Delete a screenshot.

### Request

#### Parameters

* `id`: the ID of the screenshot to delete.

### Response

#### Response Codes

* `204` if successful.
* `404` if the screenshot cannot be found.

#### Headers

* `Content-Type`: `application/json`

#### Example

```bash
curl -X DELETE http://localhost:8000/mUaGfeAs4QAke5oQDm4kjU.pdf
```

## `GET /devices`

Retrieve a list of emulated devices understood by netshot.  These devices can be referenced via the `height` and `width`
properties when creating a screenshot.

### Response

#### Response Codes

* `200` if successful.

#### Headers

`Content-Type`: `application/json`

#### Example

```bash
curl http://localhost:8000/devices
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 10365
Connection: close

{
  "Apple iPhone 4": {
    "type": "phone",
    "width": 320,
    "height": 480,
    "pixel-ratio": 2,
    "user-agent": "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5"
  },
  "horizontal Apple iPhone 4": {
    "type": "phone",
    "width": 480,
    "height": 320,
    "pixel-ratio": 2,
    "user-agent": "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5"
  },
  "Etc...": {
  }
}
```

## `GET /networks`

Retrieve a list of emulated networks understood by netshot.  These networks can by referenced via the `network` property
when creating a screenshot.

### Response

#### Response Codes

* `200` if successful.

#### Headers

`Content-Type`: `application/json`

#### Example

```bash
curl http://localhost:8000/networks
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 514
Connection: close

{
  "Offline": {
    "latency": 0,
    "download": 0,
    "upload": 0
  },
  "GPRS": {
    "latency": 500,
    "download": 6400,
    "upload": 6400
  },
  "Etc...": {
  }
}
```