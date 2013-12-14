/**
 * Helper tools module
 */

"use strict";

var //util = require("util"),
    Q = require("q"),
    __ = require("./i18n");

function exceptionLogger(ex) {
    ex = ex || "No_Throw_Exception";
    if (typeof ex === "string") {
        console.error(__("ex.error.title"), ex, __("ex.error." + ex.toLowerCase()));
    } else {
        console.error(__("ex.error.title"), ex.stack);
        //console.log(util.inspect(ex));
    }
}
console.ex = exceptionLogger;

function Exception(code) {
    this.code = code;
    this.message = __("ex.error." + code.toLowerCase());
}
function newEx(exCode) {
    return new Exception(exCode);
}

function cleanFileName(source) {
    var cleaned = source;

    cleaned = cleaned.replace(/:/g, " ");
    cleaned = cleaned.replace(/\//g, " ");
    cleaned = cleaned.replace(/\\/g, " ");

    return cleaned;
}

function failedPromise() {

    var deferred = Q.defer(), args;

    args = Array.prototype.slice.call(arguments);
    deferred.reject.apply(this, args);
    return deferred.promise;
}

function extend(base, ext) {
    var propName;
    for (propName in ext) {
        if (ext.hasOwnProperty(propName) && !base.hasOwnProperty(propName)) {
            base[propName] = ext[propName];
        }
    }
}

module.exports = {
    dumpEx: console.ex,
    extend: extend,
    cleanFileName: cleanFileName,
    Exception: Exception,
    newEx: newEx,
    failedPromise: failedPromise
};