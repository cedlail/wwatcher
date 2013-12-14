/**
 * Basic i18n string ressources manager
 */

// TODO : Détection du langage au runtime ??

"use strict";

var fs = require("fs");

var DEFAULT = "fr";
var msg = require("./i18n/" + DEFAULT + ".json");

function loadBundle(name) {
    var bundleFile = "./i18n/" + name + "json";
    if (fs.existsSync(bundleFile)) {
        msg = require(bundleFile);
        return true;
    }
    return false;
}

function select(lang) {
    if (!loadBundle(lang)) {
        if (!loadBundle(lang.split("-")[0])) {
            console.error("No i18n bundle for language ", lang);
            return undefined;
        }
    }
    return msg;
}

function getMessage(key) {
    var message = msg[key];
    return message || "???" + key + "???" ;
}

var exports = module.exports = getMessage;
exports.all = msg;
exports.select = select;