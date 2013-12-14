/**
 * Application main module
 */
define(
    "app",
    [ "jquery", "window" ],
    function ($, window) {
        "use strict";

        var /**
             * Default app config
             */
            config = {
                startLayout: "layout",
                startPage: "",
                platform: "browser"
            };


        function configure() {

            var arg0, arg1;

            switch (arguments.length) {
            case 0:
                return config;
            case 1:
                arg0 = arguments[0];
                if (typeof arg0 === "string") {
                    return config[arg0];
                }
                if ($.isPlainObject(arg0)) {
                    $.extend(config, arg0);
                    return config;
                }
                break;
            case 2:
                if (typeof arg0 !== "string") {
                    console.error("Invalide app.configure argument 0");
                } else {
                    arg1 = arguments[1];
                    config[arg0] = arg1;
                    return config;
                }
                break;
            }

            throw "ARGUMENT_EXCEPTION";
        }

        function init() {

            console.log("app.init start");

            var deferred = $.Deferred();

            // Detect platform
            if (window.process) {
                config.platform = "nw";
            }

            require("view").init()
                .pipe(require("nav").init)
                .done(
                    function () {
                        require("utils").init();
                        require("api");
                    }
                );

            return deferred.promise();
        }

        return {
            init: init,
            configure: configure,
            config: config
        };
    }
);