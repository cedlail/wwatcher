/**
 * Http request manager
 */

// TODO : Notion de queue / domaine

"use strict";

// NODE IMPORTS
var //url = require("url"),
    fs = require("fs"),
    path = require("path"),

// MODULES IMPORTS
    Q = require("q"),
    request = require("request"),
    jsdom = require("jsdom"),
    iconv = require('iconv-lite'),
    //jsdom = require("jsdom-nocontextifiy"),
    //jquery = require("jquery"),

// CONSTANTS
    DEFAULT_MAX_REQUEST = 5,
    SYS_MAX_REQUEST = 20,
    DEFAULT_TIMEOUT = 60000,
    DEFAULT_MAX_RETRY = 5,
    USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36",
// PRIVATE VARS
    //jQueryUrl = "http://code.jquery.com/jquery.min.js",
    jQuerySource,
    httpProxy,
    httpsProxy,
// EXPOSED
    sessionRequestCount = 0,
    appQueue;

/**
 * Class to manage multi async http request.
 * @param maxRequest
 * @constructor
 */
function RequestQueue(maxRequest) {

    /**************************************************************************
     **** QUEUE MANAGEMENT
     **************************************************************************/

    var that = this, queue = [], requestCount = 0, lock = false;


    function startRequest(req) {

        process.nextTick(

            function () {
                if (typeof req.filePath === "string") {
                    // Request
                    request(
                            req.options,
                            createRequestCallback(req)
                        ).pipe(
                            fs.createWriteStream(req.filePath)
                        );
                } else {
                    // Request
                    request(
                        req.options,
                        createRequestCallback(req)
                    );
                }
            }
        );
    }

    function tryRequest() {
        var req;
        lock = true;
        while (requestCount < maxRequest && queue.length > 0) {
            req = queue.shift();
            requestCount += 1;
            startRequest(req);
        }
        lock = false;
    }

    function createRequestCallback(requestItem) {

        return function (error, response, page) {

            if (error) {
                // Max 3 retry
                if (requestItem.retryCount === undefined) {
                    requestItem.retryCount = 1;
                } else {
                    requestItem.retryCount += 1;
                }
                if (requestItem.retryCount > DEFAULT_MAX_RETRY) {
                    requestItem.deferred.reject(error);
                } else {
                    // Retry
                    startRequest(requestItem);
                    return;
                }
            } else {
                requestItem.deferred.resolve(forceUtf8(response, page));
            }

            // Enqueu request
            requestCount -= 1;

            if (!lock) {
                tryRequest();
            }
        };
    }

    function forceUtf8(response, page) {
        var pageEncoding;

        // Detect encoding from header
        response.headers["content-type"].split("; ").forEach(
            function (contentType) {
                var value = contentType.split("=");
                if (value.length === 2 && value[0] === "charset") {
                    pageEncoding = value[1].toLowerCase();
                    return false;
                }
                return true;
            }
        );
        // TODO : Detect encoding from meta head tag ex : <meta charset="windows-1252"/>
        if (pageEncoding !== undefined && pageEncoding !== "utf-8") {
            return iconv.decode(page, pageEncoding);
        } else {
            return page.toString();
        }
    }

    function createItem(options, filePath) {
        var deferred = Q.defer(),
            item;

        // TODO : request = request.defaults(options)

        if (typeof options === "string") {
            options = { url: options };
        }
        if (options.url === undefined) {
            throw { code: "BAD_PARAMETER_EXCEPTION", message: "url parameter is missing." };
        }
        options.encoding = null;
        options.timeout = options.timeout || DEFAULT_TIMEOUT;
        options.strictSSL = options.strictSSL || false;
        if (httpProxy !== undefined && options.url.substr(0, 7) === "http://") {
            options.proxy = httpProxy;
        }
        if (httpsProxy !== undefined && options.url.substr(0, 8) === "https://") {
            options.proxy = httpProxy;
        }
        options.headers = {
            "User-Agent": USER_AGENT
        };
        item = {
                options: options,
                deferred: deferred
            };

        if (filePath !== undefined) {
            item.filePath = filePath;
        }
        return item;
    }

    /**************************************************************************
     **** PUBLIC INTERFACE
     **************************************************************************/

    /**
     * Perform http request and call the call back.
     *
     * @param options
     * @param toFilePath
     * @returns {Function|promise|promise|Q.promise|Function|Function}
     */
    this.request = function (options, toFilePath) {

        var item = createItem(options, toFilePath);

        // add to queue
        queue.push(item);
        sessionRequestCount += 1;
        tryRequest();

        return item.deferred.promise;
    };

    /**
     * Request the page, and return a window context with jquery
     *
     * @param options
     * @returns {Function|promise|promise|Q.promise|Function|Function}
     */
    this.requestToJQuery = function (options) {

        var deferred = Q.defer();

        that.request(options)
            .then(
                function (page) {

                    // TODO : Tester avec cheerio (https://github.com/MatthewMueller/cheerio)

                    var jsDomOptions = {
                        html: page,
                        src: [jQuerySource],
                        done:
                            function (error, window) {
                                //console.log("JsDom ok");
                                if (error) {
                                    deferred.reject(error);
                                } else {
                                    deferred.resolve(
                                        {
                                            page: page,
                                            window: window,
                                            $: window.$
                                        }
                                    );
                                }
                            }
                    };

                    process.nextTick(
                        function () { jsdom.env(jsDomOptions); }
                    );

                },
                function (error) {
                    deferred.reject(error);
                }
            );

        return deferred.promise;
    };

    this.setMaxRequest = function (newMax) {
        maxRequest = Math.min(newMax, SYS_MAX_REQUEST);
    };

    this.getMaxRequest = function () {
        return maxRequest;
    };

}


/******************************************************************************
 ***    MODULE INIT
 ******************************************************************************/

// Configure sockets pooler (default value 5)
require("http").globalAgent.maxSockets = SYS_MAX_REQUEST;

jQuerySource = fs.readFileSync(path.join(__dirname, "ext/jquery.min.js"));

if (process.platform === "win32") {
    httpProxy = process.env.HTTP_PROXY;
    httpsProxy = process.env.HTTPS_PROXY;
}
// TODO : Détection proxy sous linux/osx ??

appQueue = new RequestQueue(DEFAULT_MAX_REQUEST);

/******************************************************************************
 ***    EXPORTS
 ******************************************************************************/

exports.RequestQueue = RequestQueue;
exports.appQueue = appQueue;
exports.getSessionRequestCount = function () { return sessionRequestCount; };