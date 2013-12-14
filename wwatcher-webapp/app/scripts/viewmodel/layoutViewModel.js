/**
 *  Footer fragment view
 */
define(
    "viewmodel/layout",
    [ "window" ],
    function (window) {
        "use strict";

        function open(container) {

            var template, model;

            template = require("view/layout");

            model = {
                title: "WWatcher",
                label: "Web content watcher 0.0.1",
                versionLabel: ""
            };
            if (window.process !== undefined) {
                model.versionLabel =
                    " - Node " + window.process.versions.node +
                        " - nw " + window.process.versions["node-webkit"];
            }

            container.append(template(model));

        }

        return {
            open: open,
            setArguments: function () {},
            layout: undefined
        };
    }
);