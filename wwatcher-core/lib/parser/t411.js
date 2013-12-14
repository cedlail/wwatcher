
"use strict";

var T411_CAT,
    SECONDE = 1000,
    MINUTE = SECONDE * 60,
    HOURE = MINUTE * 60,
    DAY = HOURE * 24,

    url = require("url"),
    fs = require("fs"),
    __ = require("../i18n"),

    forms = {};


/**
 * Page parser
 *
 * @param result
 * @param options
 * @param callback
 */
function parsePage(result, options, callback) {

    var $ = result.$, limitDate,resultItems = [], trItems;

    // Last check date
    if (options.lastExec !== undefined) {
        limitDate = new Date(options.lastExec) - DAY;
    } else {
        limitDate = new Date() - (DAY * 365); // Default 1 year
        //limitDate = new Date() - (DAY * 10); // Default 1 year
    }

    // Extract result list items
    trItems = $("table.results>tbody>tr");
    trItems.each(
        function (index, item) {

            var resultItem = parseResultRow($, item);

            if (options.noDateFilter === true || resultItem.date >= limitDate) {
                //requestDescription(resultItem, options, progressCallback);
                resultItems.push(resultItem);
            }

            callback("progress", index + 1, trItems.length);
        }
    );

    // Download descriptions pages

    // End
    callback("done", options, resultItems);

}

/**
 * Parse table row result.
 *
 * @param $
 * @param tr
 * @returns {{}}
 */
function parseResultRow($, tr) {

    var resultItem = {};

    $(tr).children("td").each(
        function (index, item) {
            var td = $(item), obj;

            switch (index) {
            case 0:
                // Catégorie
                obj = td.find("img");
                resultItem.catId = obj.attr("class").substr(4);
                resultItem.catLabel = obj.attr("alt");
                break;
            case 1:
                // Libellé
                obj = td.find("a:first");
                resultItem.label = obj.attr("title"); //cleanFileName(obj.attr("title"));
                resultItem.url = "http:" + obj.attr("href");
                obj = td.find("dl>dd:first");
                resultItem.date = new Date(Date.parse(obj.text()));
                break;
            case 2:
                // Info
                //resultItem.info = td.find("a").attr("href");
                resultItem.id = url.parse(td.find("a").attr("href"), true).query.id;
                break;
            case 3:
                // Commentaires
                break;
            case 4:
                // Age
                resultItem.age = td.text();
                break;
            case 5:
                // Taille
                obj = td.text();
                resultItem.size = parseFloat(obj);
                switch (obj.substr(obj.length-2)) {
                case "GB":
                    resultItem.size = resultItem.size * 1000;
                    break;
                case "KB":
                    resultItem.size = resultItem.size / 1000;
                    break;
                }
                resultItem.size = Math.round(resultItem.size);
                break;
            case 6:
                // Complété
                resultItem.completed = td.text();
                break;
            case 7:
                // Seeders
                resultItem.seeders = td.text();
                break;
            case 8:
                // Leechers
                resultItem.leechers = td.text();
                break;
            }
        }
    );

    return resultItem;

}

function parseSearch(args) {
    // exemple : http://www.t411.me/torrents/search/?search=superman&cat=210&submit=Recherche&order=added&type=desc
    var url = "http://www.t411.me/torrents/search/?", urlArgs = [];

    if (args.q !== "") {
        urlArgs.push("search=" + args.q);
    }
    if (args.s !== undefined && args.s !== "") {
        urlArgs.push("subcat=" + args.s);
    } else if (args.c !== undefined && args.c !== "") {
        urlArgs.push("cat=" + args.c);
    }
    url += urlArgs.join("&") + "&submit=Recherche&order=added&type=desc";

    return url;
}

/******************************************************************************
 ****   Load externals ressources
 ******************************************************************************/

T411_CAT = JSON.parse(fs.readFileSync(__dirname + "/t411_cat.json", {encoding: "utf8"}));
function getCatOptionsList() {
    var catId, datas = [];
    for (catId in T411_CAT) {
        if (T411_CAT.hasOwnProperty(catId)) {
            datas.push(
                {
                    value: catId,
                    label: T411_CAT[catId].label,
                    subcat:  T411_CAT[catId].subcat
                }
            );
        }
    }
    return datas;
}
forms.search = {
    path: __dirname + "/t411_searchForm.hbs",
    data: { categs: getCatOptionsList() }
};
forms.searchResult = {
    path: __dirname + "/t411_searchResult.hbs",
    data: {}
};
forms.listItem = {
    template: "<div id='{{id}}' class='item itemState{{state}}'>" +
        "<span>{{label}}</span><br/>" +
        "{{size}}Mo - {{{toDate date}}} - C:{{completed}} S:{{seeders}} L:{{leechers}}" +
        "</div>"
};

/******************************************************************************
 ****   Exports
 ******************************************************************************/
exports.defaultUrl = "";
exports.label = __("parser.t411.label");
exports.description = __("parser.t411.description");
exports.entryPageType = "jquery";
exports.parsePage = parsePage;
exports.parseSearch = parseSearch;
exports.forms = forms;
exports.viewContentSelector = "div.block.description article";
exports.actions = {
    "view": "Afficher",
    "download": "Lancer",
    "mark.read": "Marqué comme vu",
    "mark.unread": "Marqué comme non vu"
};