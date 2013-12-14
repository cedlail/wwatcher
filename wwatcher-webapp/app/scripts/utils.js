/**
 * Utils module
 */
define(
    "utils",
    [ "window" ],
    function (window) {
        "use strict";

        var store = window.localStorage,
            doc = window.document;
            //errorLogger = console.error || console.log || function () {};

        function isPromise(obj) {
            return typeof obj === "object" &&
                typeof typeof obj.promise === "function";
        }

        function logErr() {
            var i = -1, l = arguments.length, args = [], fn = 'console.error(args);';
            while(++i<l){
                args.push('args[' + (i + 1) + ']');
            }
            fn = new Function('args',fn.replace(/args/,args.join(',')));
            fn(arguments);
        }

        function ajaxError() {
            var msgArgs = arguments;
            return function ajaxErrorHandler() {

                var args, deferred;

                args = Array.prototype.slice.call(msgArgs);
                if (args.length > 0 && isPromise(args[0])) {
                    deferred = args.shift();
                }
                args.push(arguments[1]);
                args.push(arguments[2]);
                args.push(JSON.stringify(arguments[0]));
                args[0] += "\n" +
                    "Status  : %s\n" +
                    "Message : %s\n" +
                    "jqXHR   : %s";

                logErr.apply(null, args);

                if (deferred !== undefined) {
                    deferred.reject.apply(null, args);
                }
            };
        }

        function errorHandler() {
            var msgArgs = arguments;
            return function errorHandler() {

                var args, deferred, errorArgs;

                args = Array.prototype.slice.call(msgArgs);
                if (args.length > 0 && isPromise(args[0])) {
                    deferred = args.shift();
                }
                errorArgs = Array.prototype.slice.call(arguments);
                Array.prototype.push.apply(args, errorArgs);

                logErr.apply(null, args);

                if (deferred !== undefined) {
                    deferred.reject.apply(null, args);
                }

            };
        }

        function parseUrl(url) {
            // If pb use more advanced solution like purl library
            var qs = {},
                query = decodeURIComponent(url || window.location.search.substring(1)),
                vars = query.split("&"),
                pair;

            for (var i = 0; i < vars.length; i+= 1) {
                pair = vars[i].split("=");
                // If first entry with this name
                if (qs[pair[0]] === undefined) {
                    qs[pair[0]] = pair[1];
                    // If second entry with this name
                } else if (typeof qs[pair[0]] === "string") {
                    qs[pair[0]] = [ qs[pair[0]], pair[1] ];
                    // If third or later entry with this name
                } else {
                    qs[pair[0]].push(pair[1]);
                }
            }
            return qs;
        }

        function formatDate(date) { // TODO : pas i18n
            function format2digit(src) {
                return src >= 10 ? "" + src : "0" + src;
            }
            var output, srcDate;
            srcDate = new Date(date);
            output = format2digit(srcDate.getDate()) + "/" + format2digit(srcDate.getMonth()+1) + "/" + srcDate.getFullYear();
            return output;
        }

        function formatDateTime(date) { // TODO : pas i18n
            function format2digit(src) {
                return src >= 10 ? "" + src : "0" + src;
            }
            var output, srcDate;
            srcDate = new Date(date);
            output = format2digit(srcDate.getDate()) + "/" + format2digit(srcDate.getMonth()+1) + "/" + srcDate.getFullYear();
            output += " " + format2digit(srcDate.getHours()) + ":" + format2digit(srcDate.getMinutes()) + ":" + format2digit(srcDate.getSeconds());
            return output;
        }

        // TODO : Gestion séparateurs horizontaux, a externaliser
        function layoutFolder() {

            var curSep;

            $(doc)
                .on(
                "mousedown",
                ".vsep",
                function (event) {
                    curSep = $(event.target);
                    $(".page, .page *").css("cursor", "ew-resize!important");
                }
            );

            $(doc)
                .mousemove(
                    function (event) {
                        var folder, list, doc, newWidth;

                        if (curSep !== undefined) {

                            folder = $(".page.folder>.folder");
                            list = $(".page.folder>.list");
                            doc = $(".page.folder>.document");

                            if (curSep.is(".sepFolder")) {
                                folder.width(event.pageX);
                                newWidth = folder.width() + list.width() + 20;
                                doc.width("calc(100% - " + newWidth + "px)");

                            }
                            if (curSep.is(".sepList")) {
                                list.width(event.pageX - list.position().left - 8);
                                newWidth = folder.width() + list.width() + 20;
                                doc.width("calc(100% - " + newWidth + "px)");
                            }

                        }
                    }
                )
                .mouseup(
                    function () {
                        if (curSep !== undefined) {
                            curSep = undefined;
                            $(".page, .page .pagePart").css("cursor", "");
                            saveLayout();
                        }
                    }
                );

            function saveLayout() {
                var layoutData;
                layoutData = {
                    //x: window.x,
                    //y: window.y,
                    width: $(window).width,
                    height: $(window).height,
                    folderWidth: $(".page.folder>.folder").width(),
                    listWidth: $(".page.folder>.list").width(),
                    docWidth: $(".page.folder>.document").width()
                };
                store.setItem("layout", JSON.stringify(layoutData));
            }

            function restaureLayout() {
                var layout = store.getItem("layout"), newWidth;
                if (layout !== null) {
                    layout = JSON.parse(layout);
                    $(".page.folder>.folder").width(layout.folderWidth);
                    $(".page.folder>.list").width(layout.listWidth);
                    newWidth = layout.folderWidth + layout.listWidth + 20;
                    $(".page.folder>.document").width("calc(100% - " + newWidth + "px)");
                }
            }

            // Restaure layout on page load
            restaureLayout();
        }

        function compile(functionSource) {

            return (new Function("return " + functionSource + ";"))();
        }

        function init() {
            layoutFolder();
        }


        return {
            init: init,
            ajaxError: ajaxError,
            defaultError: errorHandler,
            parseUrl: parseUrl,
            formatDate: formatDate,
            formatDateTime: formatDateTime,
            layoutFolder: layoutFolder,
            compile: compile
        };
    }
);
