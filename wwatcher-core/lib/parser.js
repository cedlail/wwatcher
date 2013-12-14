/**
 * Manage parser update processes
 */

"use strict";

var util = require("util"),
    fs = require("fs"),
    path = require("path"),
    Q = require("q"),
    Handlebars = require('handlebars'),
    requestq = require("./requestq"),
    ut = require("./utils"),
    parsers = {},
    parserList,
    DEFAULT_FORMS;

//Handlebars.registerHelper('list', function(items, options) {});
//Handlebars.registerHelper('select', function(items, options) {});
Handlebars.registerHelper('option', function() {});
Handlebars.registerHelper('toDate', function() {});
Handlebars.registerHelper('toDateTime', function() {});

/**
 * List parsers (Bundled and user's)
 */
function getParserList() {

    if (parserList === undefined) {

        var bundleParsers = [], files, bundlePath;

        // Application bundled
        bundlePath = path.resolve(path.join(__dirname, "parser"));
        files = fs.readdirSync(bundlePath);
        files.forEach(
            function (fileName) {

                var parser, parserPath;

                if (path.extname(fileName) === ".js") {

                    parserPath = path.join(bundlePath, fileName);
                    try {
                        parser = require(parserPath);
                    } catch(ex) {
                        console.error("Could not find parser %s. File not found or open error", ex);
                    }
                    if (parser !== undefined && parser.disabled !== true && typeof parser.parsePage === "function") {

                        fileName = path.basename(fileName, ".js");
                        parsers[fileName] = parser;

                        bundleParsers.push(
                            {
                                name: fileName,
                                label: parser.label,
                                description: parser.description,
                                isBundled: true
                            }
                        );
                    }
                }
            }
        );

        // User
        // TODO : Charger les parsers du dossier utilisateur


        parserList = bundleParsers;
    }

    return parserList;
}

/**
 * Return a parser by his name.
 *
 * @param name
 * @returns {*}
 */
function getParser(name) {
    if (typeof name === "object") {
        return name;
    }
    getParserList();
    return parsers[name];
}

/**
 * Return true if a parser name exist.
 *
 * @param name
 * @returns {boolean}
 */
function parserExist(name) {
    return getParser(name) !== undefined;
}

/**
 * Call the page parser.
 *
 * @param name
 * @param options
 * @param callback
 * @returns {*}
 */
function executeParser(name, options, callback) {   // TODO : Passer en promise (avec progress), supression du callback

    var parser = getParser(name), requestFunction;

    if (parser === undefined) {
        throw ut.newEx("UNKNOW_PARSER");
    }

    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    options = options || {};

    switch(parser.entryPageType) {
    case "jquery":
        requestFunction = requestq.appQueue.requestToJQuery;
        break;
    default:
        requestFunction = requestq.appQueue.request;
    }
    //requestFunction = requestFunction || requestq.appQueue.requestToJQuery;

    return requestFunction(options.url || parser.defaultUrl)
        .then(
            function ok(page) {
                try {
                    parser.parsePage(page, options, callback);
                } catch(ex) {
                    callback("error", ex);
                }
            },
            function err(error) {
                console.error("Error request page for parser %s and url : %s", name, util.inspect(options.url));
                callback("error", error);
            }
        );

}

function getParserForm(name, formName) {

    var parser = getParser(name), form, formReturn;

    form = DEFAULT_FORMS[formName];

    if (parser !== undefined) {
        if (parser.forms !== undefined && parser.forms[formName] !== undefined) {
            form = parser.forms[formName];
        }
    }

    formReturn = {};

    if (form.path !== undefined ) {
        formReturn.template = fs.readFileSync(form.path, form.pathOptions || { encoding : "utf8" });
    } else {
        formReturn.template = form.template;
    }
    formReturn.template = compileTemplate(formReturn.template);

    if (form.data !== undefined) {
        formReturn.data = form.data;
    }

    return formReturn;
}

function compileTemplate(src) {

    var compiled;

    try {
        compiled =
            Handlebars.precompile(
                src,
                {
                    min: true ,
                    namespace: "Handlebars.compiled",
                    known: "toDateTime,toDateTime"
                }
            );
        return "Handlebars.template("+compiled+")";
    } catch (e) {
        console.error("Handlebars failed to compile", e);
    }

    return src;
}

function callSearchParser(name, args) {

    var parser = getParser(name), deferred = Q.defer(), url;

    if (parser !== undefined) {
        // Parse search url
        url = parser.parseSearch(args);
        console.log("Search url", url);
        executeParser(
            parser,
            {
                url: url,
                noDateFilter: true
            },
            function (event, arg, result) {
                if (event === "done") {
                    deferred.resolve(
                        {
                            url: url,
                            form: getParserForm(name, "searchResult"),
                            results: result
                        }

                    );
                }
                if (event === "error") {
                    deferred.reject(arg);
                }
            }
        );
    }

    return deferred.promise;
}

function callActionParser(name, action, args) {

    if (parser !== undefined && action === "search" ) {
        return callSearchParser(name, args);
    }

    var parser = getParser(name), deferred = Q.defer();

    if (parser !== undefined && action !== undefined ) {
        deferred.reject("NOT_IMPLEMENTED"); // TODO : NOT_IMPLEMENTED
    } else {
        deferred.reject("ARGUMENT_EXCEPTION");
    }
    return deferred.promise;
}

function getView(parserName, url) {

    var parser = getParser(parserName), deferred = Q.defer();

    console.log("get parser %s view : %s", parserName, url);

    requestq.appQueue.requestToJQuery(url)
        .then(
            function (page) {
                deferred.resolve(page.$(parser.viewContentSelector).html());
            },
            function (err) {
                deferred.reject(err);
            }
        );

    return deferred.promise;
}

DEFAULT_FORMS = {
    search: {
        template: "<label for='search'>Rechercher</label><input type='text' id='search' value=''{{searchText}}' placeholder='Rechercher' size='100'/>",
        data: {}
    },
    listItem : {
        template: "<div id='{{id}}' class='item itemState{{state}}'>" +
            "<span>{{label}}</span><br/>" +
            "Date : {{{toDate date}}}" +
            "</div>",
        data: {}
    }
};

/******************************************************************************
 ***    EXPORTS
 ******************************************************************************/
exports.get = getParser;
exports.list = getParserList;
exports.getForm = getParserForm;
exports.getView = getView;
exports.exist = parserExist;
exports.execute = executeParser;
exports.callSearch = callSearchParser;
exports.callAction = callActionParser;