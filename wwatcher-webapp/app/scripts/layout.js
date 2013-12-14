/**
 * Layout management
 */
define(
    "layout",
    [ "window" , "jquery" ],
    function (window, $) {
        "use strict";

        var DEFAULT = "empty",
            initialized = false,
            currentLayout,
            doc = window.document;

        function globalLayout() {

            if (!initialized) {

                var body = $("body");

                require("viewmodel/layout").open(body);

                initialized = true;
                currentLayout = DEFAULT;

                setPlatform();
            }

        }

        function select(layout) {

            var body = $("body"), oldLayout;

            if (layout !== undefined && layout !== "" && currentLayout !== layout) {

                oldLayout = currentLayout;
                currentLayout = layout;

                body
                    .removeClass("layout-" + oldLayout)
                    .addClass("layout-" + currentLayout);
            }

            return body.children("section#page");
        }

        function setPlatform() {

            if (window.process !== undefined) {

                var body = $("body");

                // Add quit button
                body.find("#mmenuQuit")
                    .show()
                    .click(
                        function () {
                            var nwgui = window.requireNw("nw.gui");
                            nwgui.App.quit();
                        }
                    );

                // Open dev tools on footer click
                body.children("footer")
                    .click(
                        function () {
                            var nwgui = window.requireNw("nw.gui");
                            nwgui.Window.get().showDevTools("");
                        }
                    );

                //nwgui.Window.get().enterKioskMode();
                //nwgui.Window.get().showDevTools("");
            }
        }


        function init() {

            var deferred = $.Deferred();

            $(doc).ready(
                function () {

                    // First page layout
                    globalLayout();

                    deferred.resolve();
                }
            );

            return deferred.promise();
        }

        return {
            init: init,
            select: select,
            DEFAULT: DEFAULT
        };
    }
);