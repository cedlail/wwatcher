/* global window */

// TODO : i18n cotés browser (vue + module)
// TODO : Vue composite
// TODO : Application Events
// TODO : Binding auto
// TODO : Un module pour ui (séparateur et autres goodies)

/**
 * Application start point
 */
(function ($, window) {
    "use strict";

    console.log("main app start");

    window.requireNw = function(moduleName) {
        var extRequire = window.require, nwGuiResponse;
        if (moduleName === "nw.gui") {
            window.require = window.requireNode;
            nwGuiResponse = require("nw.gui");
            //nwGuiResponse = window.nwDispatcher.requireNwGui;
            window.require = extRequire;
            return nwGuiResponse;
        }
        return window.requireNode(moduleName);
    };

    // RequireJs configuration (almondJs)
    //require.config();

    // Defined external library
    //define("jquery", [], function () {return $;});
    define("handlebars", [], function () { return Handlebars; });
    define("window", [], function () {return window;});

    // Start application
    $(window.document).ready(
        function () {
            require("app").init();
        }
    );

}(jQuery, window));