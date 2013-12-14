/* global window */
/**
 * Specific platform integration start (could be overide at build time
 */
(function (window) {
    "use strict";

    // Webapp

    // Node webkit
    if (window.process !== undefined) {
        //console.log("Save window.require instance...");
        window.requireNode = window.require;
        window.require = undefined;
    }

    // Cordova


    // All
    var nop = function () {};
    window.console = window.console || {
        log: nop,
        error: nop,
        debug: nop,
        info: nop,
        trace: nop,
        warn: nop
    };

}(window));