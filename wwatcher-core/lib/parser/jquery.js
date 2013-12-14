/**
 * Basic jQuery parser
 */

/*

"use strict";

var __ = require("../i18n");

function parsePage(page, options, callback) {

    var $ = page.$, resultItems = [], versionTag;

    versionTag = $("div#intro p:contains('Current Version:')");

    if (versionTag.length > 0) {
        resultItems.push(
            {
                id: (new Date()).getTime(),
                value: versionTag.text().substr(17)
            }
        );
    }

    callback(options, resultItems);
}

exports.name = __("parser.jquery.name");


exports.parsePage = parsePage;
exports.formOptions = {
    type: "object",
    xtype: "form",
    content: {
        contentSelector: {
            label: __("parser.jquery.form.contentselector") ,
            type: "string"
        },
        idField: {
            label: __("parser.jquery.form.idField"),
            type: "object",
            xtype: "div",
            content: {
                selector: { label: __("parser.jquery.form.item.selector"), type:"string" },
                fnValue: { label: __("parser.jquery.form.item.fn"), type:"select", choice: "text,html,attr" },
                fnArg: { label: __("parser.jquery.form.item.fnArg"), type:"string", optional: true }
            }
        },
        itemFields: {
            label: __("parser.jquery.form.itemFields"),
            type: "array",
            tag: "ul",
            itemTemplate: {
                type: "object",
                tag: "li",
                content: {
                    name: { label: __("parser.jquery.form.item.name"), type:"string" },
                    selector: { label: __("parser.jquery.form.item.selector"), type:"string" },
                    fnValue: { label: __("parser.jquery.form.item.fn"), type:"select", choice: "text,html,attr" },
                    fnArg: { label: __("parser.jquery.form.item.fnArg"), type:"string", optional: true }
                }
            }
        }
    }
};

*/