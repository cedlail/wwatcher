/**
 *  Http/Rest server
 */

// TODO : getstatus => sans keep-alive (http => request.connection.destroy();)
// TODO : server.start => Stockage / env du port... ex : ${envFolder}\server.json


"use strict";

var // Constants
    DEFAULT_SERVER_PORT = process.env.PORT || 3000,
    DEFAULT_SERVER_IP = process.env.IP || "0.0.0.0",
    DEBUG_ENABLE = false,
    DEBUG_VERBOSE = false,
    // Node Modules
    http = require("http"),
    util = require("util"),
    path = require("path"),
    // External modules
    connect = require("connect"),
    rest = require("connect-rest"),
    // Lib modules
    __ = require("./i18n"),
    // Module vars
    server,      // Http server instance
    app,         // Connect app instance
    restOptions,
    // Exposed services
    ServerService;


/******************************************************************************
 ***    HELPERS
 ******************************************************************************/

function getRequestSummary(req) {
    return {
        headers: req.headers,
        methode: req.methode,
        url: req.url,
        statusCode: req.statusCode,
        originalUrl: req.originalUrl,
        query: req.query
    };
}

function pathCombine(path1, path2) {
    var combine = path1 + "/" + path2;
    combine = combine.replace(/\/\/\//g, "/"); // Tripple
    combine = combine.replace(/\/\//g, "/"); // Double
    return combine;
}

function bindApiMethod(api) {

    // Browse module Object/Function
    function bindObject(source, sourceUrl, doRecurse) {
        var componentName, component;
        for (componentName in source) {
            if (source.hasOwnProperty(componentName)) {
                component = source[componentName];
                if (typeof component === "object" && component._rest !== undefined) {
                    if (doRecurse === true) {
                        bindObject(
                            component,
                            pathCombine(sourceUrl, component._rest.url),
                            false
                        );
                    }
                }
                if (typeof component === "function") {
                    if (component._rest !== undefined) {
                        bindApiFunction(component, sourceUrl, source);
                    }
                }
            }
        }
    }
    api.forEach(
        function (item) {
            var sourceUrl = "";
            if (item._rest !== undefined) {
                sourceUrl = item._rest.url || "";
            }
            bindObject(item, sourceUrl, true);
        }
    );

    /**
     * Bind request handler to api function
     * @param {Function}    apiFunction     Api function to bind
     * @param {String}      sourceUrl       Url paterne
     * @param {Object}      source          Api object that contains the function
     */
    function bindApiFunction(apiFunction, sourceUrl, source) {

        var restDefine, restOptions, custumTagParser, hasTagParser;

        restOptions = apiFunction._rest;
        custumTagParser = restOptions.custumTagParser || source._rest.custumTagParser;
        hasTagParser = typeof custumTagParser === "function";

        switch (restOptions.methode || "get" ) {
        case "get":
            restDefine = rest.get;
            break;
        case "post":
            restDefine = rest.post;
            break;
        case "put":
            restDefine = rest.put;
            break;
        case "delete":
            restDefine = rest.del;
            break;
        //case "update": => pas géré par connect-rest
        default:
            restDefine = rest.get;
        }

        restOptions.path = pathCombine(sourceUrl, restOptions.url);
        console.log(__("server.add.restroute"), restOptions.methode.toUpperCase(), restOptions.path);
        restDefine(
            [
                {
                    path: restOptions.path,
                    unprotected: true
                }
            ],
            function autoBind (request, content, callback) {

                var args, i, len, value, argName;

                len = apiFunction._rest.args.length;
                args = [];

                for (i = 0; i < len; i += 1) {
                    argName = apiFunction._rest.args[i];
                    value = undefined;
                    if (argName[0] === "#") {      // TODO : Ajouter possibilité de passer des constantes pour l'appel rest ex: #const(true:boolean)
                        // CustumTag Parser can override
                        if (hasTagParser) {
                            value = custumTagParser(argName, request, content, callback);
                        }
                        if (value === undefined) {
                            switch (argName) {
                            case "#qs":
                                value = request.parameters;
                                break;
                            case "#post-data":
                                value = content;
                                break;
                            }
                        }
                    } else {
                        value = request.parameters[argName];
                    }
                    args.push(value);
                }

                //console.log( 'Rest api call => parameters:' + util.inspect( request.parameters, {colors: true} ) );
                //console.log( 'Rest api call => query:' + util.inspect( request, {colors: true} ) );
                //console.log( 'Api arguments => ', util.inspect(args));

                // TODO : Stocker le retour, et si Promise ceci, sinon a voir... callback(undefined, retour, 200)
                apiFunction
                    .apply(undefined, args)
                    .then(
                        function successApiCall(result) {
                            callback(undefined, result);
                        },
                        function errorApiCall(errorDetail) {
                            var reqError;
                            reqError = {
                                status: "failed",
                                cause: "Rest api call return an error.",
                                apiErrorType: ""+errorDetail,
                                apiError: errorDetail,
                                statusCode: 500
                            };
                            console.log(util.inspect(reqError, {colors: true}));
                            callback(undefined, reqError, {statusCode: 500});
                        }
                    );

            }
        );
    }
}

/******************************************************************************
 ***    SERVER MANAGEMENT INTERFACE
 ******************************************************************************/

/**
 * Server management rest service
 * @type {{start: Function, stop: Function, getStatus: Function}}
 */
ServerService = (function () {

    var statusEnum = {
            NOT_STARTED: "NotStarted",
            STARTED: "Started",
            CLOSE_REQUESTED: "CloseRequested",
            CLOSING: "Closing",
            CLOSED: "Closed"
        },
        status = statusEnum.NOT_STARTED;

    function getRequest(options, action, callback) {
        var url, req;

        url = "http://localhost:" + options.port +
            options.restContext + "/server/" + action +
            "?api_key=" + options.restKey;
        //console.log("Request server => ", url);

        req = http.get(
                url,
                function(res) {
                    //console.log("Reponse du serveur:");
                    //console.log("    STATUS: " + res.statusCode);
                    //console.log("    HEADERS: " + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on("data", function (chunk) {
                        //console.log("    BODY: " + chunk);
                        if (typeof callback === "function") {
                            callback(chunk);
                        }
                    });
                }
            )
            .on("error", function(e) {
                console.error("Erreur du serveur.", e.message);
            })
			.on("socket", function (socket) {
				socket.setKeepAlive(false);
			})
            .end();

        return req;
    }

    function sendStopRequest(force, options, callback) {

        console.log(__("server.stop.sendrequest"));
        getRequest(
            options,
            "stop" + (force === true ? "/force" : ""),
            callback
        );

    }


    /**************************************************************************
     ****   PUBLIC
     **************************************************************************/

    function start(options) {

        if (server !== undefined) {
            return;
        }

        /******************************************************************************
         ***    HTTP SERVER COMMON CONFIG
         ******************************************************************************/

        app = connect()
            .use(connect.favicon(path.join(options.staticPath, "favicon.ico")))
            .use(connect.logger("dev"))
            .use(connect.compress())
            .use(connect.responseTime())
            .use(connect.query())
            .use(connect.bodyParser())
            //.use(connect.directory('public'))
            //.use(connect.cookieParser())
            //.use(connect.session({ secret: 'my secret here' }))
        ;

        /******************************************************************************
         ***    STATIC HTTP SERVER
         ******************************************************************************/

        if (options.staticPath !== undefined) {
            app.use(connect.static(options.staticPath));
            console.log(__("server.static.init"), options.staticPath);
        }

        /******************************************************************************
         ***    DEBUG LOGGER
         ******************************************************************************/

        if (DEBUG_ENABLE) {
            app.use(
                function(req, res, next){
                    if (DEBUG_VERBOSE) {
                        console.log(
                            "Full Request :\n" +
                                util.inspect(req, {colors: true}) + "\n"
                        );
                    }
                    console.log(
                        "Request summmary :\n" +
                            util.inspect(getRequestSummary(req), {colors: true}) + "\n"
                    );
                    next();
                }
            );
        }

        /******************************************************************************
         ***    ENABLE CROSS DOMAINE
         ******************************************************************************/

        app.use(
            function(req, res, next){
                res.setHeader("access-control-allow-origin", "*");
                next();
            }
        );

        /******************************************************************************
         ***    REST
         ******************************************************************************/

        restOptions = {
            discoverPath: "discover",
            //protoPath: "proto",
            logger: { info: function () {}, debug: function () {} }, // 'connect-rest',
            logLevel: "info", // debug / info
            context: options.restContext
        };
        if (options.restKey !== undefined) {
            restOptions.apiKeys = [ options.restKey ];
        }
        app.use(rest.rester(restOptions));

        /******************************************************************************
         ***    REST - SERVER MANGEMENT API
         ******************************************************************************/

         console.log(__("server.mngt.restinit"));
        // Register server management
        rest.get(
            [ { path: "/server/stop/?force" } ],
            stopRequest
        );
        rest.get(
            [ { path: "/server/status" } ],
            statusRequest
        );

        /******************************************************************************
         ***    REST - API BRIDGE
         ******************************************************************************/

        if (options.rest !== undefined) {
            bindApiMethod(options.rest);
        }

        /******************************************************************************
         ***    START
         ******************************************************************************/

        // Start the server
        options.port = options.port || DEFAULT_SERVER_PORT;
        options.ip = options.ip || DEFAULT_SERVER_IP;
        server = http.createServer(app).listen(options.port, options.ip);

        status = statusEnum.STARTED;
        console.log(__("server.start.message"), options.ip, options.port);
    }

    function stop(force, options, callback) {
        var timeout = 30; /* timeout en s */

        if (server === undefined) {
            sendStopRequest(force, options, callback);
            return;
        }

        if (force !== undefined) {
            if (force === 0 || force === true) {
                console.log(__("server.stop.force"));
                status = statusEnum.CLOSED;
                process.exit(0);
            }
            if (typeof force === "number") {
                timeout = force;
            }
        }
        // Start soft closing
        server.listen(
            function () {
                status = statusEnum.CLOSING;
                console.log(__("server.stop.request"));
                server.close(
                    function () {
                        console.log(__("server.stop.ok"));
                        status = "Closed";
                        server = undefined;
                        app = undefined;
                    }
                );
            }
        );
        // Wait closing
        function waitShutdown (timerCountDown) {
            //console.log("Wait server shutdown.", timerCountDown);
            if (server !== undefined) {
                timerCountDown -= 1;
                if (timerCountDown > 0) {
                    setTimeout(function () { waitShutdown(timerCountDown); }, 500);
                    if (timerCountDown % 10 === 0) {
                        console.log(__("server.stop.countdown"), timerCountDown/2);
                    }
                } else {
                    // Kill after timeout
                    console.log(__("server.stop.force"));
                    status = statusEnum.CLOSED;
                    process.exit(0);
                }
            }
        }
        setTimeout(function () { waitShutdown(timeout * 2); }, 500);
    }

    function getStatus(options, callback) {

        if (server === undefined) {
            getRequest(options, "status", callback);
            return;
        }
        callback( {serverStatus: status} );

    }

    /**************************************************************************
     ****   REST EXPOSED
     **************************************************************************/

    function stopRequest(request, content, callback) {

        status = statusEnum.CLOSE_REQUESTED;
        callback(undefined, {serverStatus: status});

        if (request.parameters.force) {
            stop(0);
        } else {
            stop();
        }

    }

    function statusRequest(request, content, callback) {

        callback(undefined, {serverStatus: status});

    }

    return {
        start: start,
        stop: stop,
        getStatus: getStatus
    };
}());

/******************************************************************************
 ***    MODULE EXPORTS
 ******************************************************************************/
module.exports = {
    start: ServerService.start,
    stop: ServerService.stop,
    getStatus: ServerService.getStatus
};