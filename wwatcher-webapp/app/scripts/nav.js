/**
 * Navigation management
 */
define(
    "nav",
    [ "window", "utils", "layout" ],
    function (window, utils, layout) {
        "use strict";

        var currentPage,
            currentLayout,
            EMPTY_PAGE_NAME = "empty_page",
            emptyPageView = {
                layout: layout.DEFAULT,
                open: function (pageDomContainer) { pageDomContainer.empty(); },
                setArguments: function () {}
            },
            updatedHash;


        function updateHash(newHash) {
            var urlHash = "#!" + newHash;
            if (urlHash !== window.location.hash) {
                updatedHash = newHash;
                window.location.hash = urlHash;
            }
        }

        function hashNavigationHandler() {

            //console.log("Hash changed to", window.location.hash);

            var vpath, vpage, vargs, argIndex;

            // Parse virtual path
            vpath = window.location.hash.substr(2); // remove "#!" start
            if (vpath === updatedHash) {
                updatedHash = undefined;
                return;
            }
            vpage = vpath;
            vargs = "";
            argIndex = vpage.indexOf("?");
            if (argIndex >= 0) {
                vargs = utils.parseUrl(vpage.substr(argIndex + 1));
                vpage = vpage.substr(0, argIndex);
            }

            // Display page
            navToPage(vpage, vargs);

        }

        function navToPage(pageName, args) {

            var page, pageContainer;

            // Get the page
            if (pageName === "") {
                page = emptyPageView;
                pageName = EMPTY_PAGE_NAME;
            } else {
                try {
                    page = require("viewmodel/" + pageName);
                } catch (ex) {
                    console.error("Unknow page %s", pageName);
                    page = emptyPageView;
                    pageName = EMPTY_PAGE_NAME;
                }
            }

            // Switch layout
            currentLayout = page.layout; // || layout.DEFAULT;
            pageContainer = layout.select(currentLayout);

            // Switch page
            currentPage = pageName;
            $("#page")
                .attr("class", "")
                .addClass("page")
                .addClass(currentPage);
            console.log("Open page %s", currentPage);
            page.open(pageContainer, args);   // ASYNC

        }

        function init() {

            // Handle current url hash changes
            $(window).on("hashchange", hashNavigationHandler);

            // Set initial/start layout
            return layout.init().pipe(hashNavigationHandler);

        }

        return {
            init: init,
            updateHash: updateHash
        };
    }
);