/**
 * NodeJs page index version reader.
 */

"use strict";

var __ = require("../i18n");

function parsePage(result, options, callback) {

    var $ = result.$, resultItems = [], versionTag, pageBody, version, href;

    versionTag = $("div#intro p:contains('Current Version:')");
    pageBody = $("body");
    pageBody.find("script").remove();
    pageBody = pageBody.html();

    if (versionTag.length > 0) {

        version = versionTag.text().substr(17);

        href =
            (
                "http://nodejs.org/dist/" + version + "/" +
                    [
                        "node.exe",
                        "node.exp",
                        "node.lib",
                        "node.pdb",
                        "node-" + version + "-x86.msi",
                        "node-" + version + "-linux-x86.tar.gz",
                        "node-" + version + "-darwin-x86.tar.gz",
                        "node-" + version + ".tar.gz",
                        "x64/node.exe",
                        "x64/node.exp",
                        "x64/node.lib",
                        "x64/node.pdb",
                        "x64/node-" + version + "-x64.msi"
                    ].join("|http://nodejs.org/dist/" + version + "/")
            ).split("|");

        resultItems.push(
            {
                id: (new Date()).getTime(),
                label: "Version " + version,
                value: version,
                links: href,
                data: pageBody
            }
        );
    }

    callback("done", options, resultItems);
}

exports.defaultUrl = "http://nodejs.org";
exports.label = __("parser.nodejsversion.label");
exports.description = __("parser.nodejsversion.description");
exports.entryPageType = "jquery";
exports.parsePage = parsePage;
exports.parseSearch = function () { return exports.defaultUrl; };
//exports.formOptions = undefined;
exports.viewContentSelector = "body";
exports.forms = {
    "search": {
        template: "<p>La recherche est automatiquement faite sur l'url " + exports.defaultUrl + "</p>"
    },
    "searchResult": {
        path: __dirname + "/NodeJsVersion_searchResult.hbs",
        data: {}
    }
};
exports.actions = {};