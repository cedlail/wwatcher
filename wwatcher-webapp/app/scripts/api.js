/**
 * Api client interface
 */
define(
    "api",
    [ "window", "utils" ],
    function (window, utils) {
        "use strict";

        var apiLibPath = "../lib/api", parserList;

        function wrapNodeNativeApi(nodeApi) {

            console.log("NodeJs api module load %s", nodeApi !== undefined ? "Success" : "FAILED !!!");

            var config = requireNw("../lib/config"),
                dbConfig = config.getDatabase("prod");

            console.log("dbConfig", dbConfig);

            /*
            var api, fn;
            for (api in nodeApi) {
                console.log("=> ", api);
                for (fn in nodeApi[api]) {
                    if (nodeApi[api][fn]._rest !== undefined) {
                        console.log("   => ", api + "." + fn);
                    }
                }
            }
            */


            return {
                parser: {
                    get: nodeApi.parser.get
                },
                search: {
                    callSearch: nodeApi.search.callSearch,
                    getForm: nodeApi.search.getForm,
                    callAction: nodeApi.search.callAction
                },
                url: {
                    add: nodeApi.url.add,
                    get: function (id, data) {
                        if (data !== undefined) {
                            data = nodeApi.customRequestTagParser("#data-query", { parameters: data });
                        }
                        return nodeApi.url.get(id, data);
                    },
                    refresh: nodeApi.url.refresh,
                    summary: nodeApi.url.summary
                },
                urlItem: {
                    get: function (id, data) {
                        if (data !== undefined) {
                            data = nodeApi.customRequestTagParser("#data-query", { parameters: data });
                        }
                        return nodeApi.urlItem.get(id, data);
                    },
                    getView: nodeApi.urlItemExt.getView,
                    remove: nodeApi.urlItem.remove
                }
            };
            //return nodeApi;
        }

        // On node-webkit we can use node module api directly
        if (window.process !== undefined) {
            console.log("Using NodeJs api version...");
            return wrapNodeNativeApi(window.requireNw(apiLibPath));
        }

        function getApiUrl(serviceName) {
            return window.location.protocol + "//" + window.location.host + window.location.pathname + "rest/" + serviceName;
        }

        /**********************************************************************
         ****   Parser API
         **********************************************************************/

        function getParser(id) {
            var deferred = $.Deferred(), url;

            if (id !== undefined) {

                getParser()
                    .then(
                        function (parsers) {
                            var parser;
                            $.each(
                                parsers,
                                function (index, parserItem) {
                                    if (parserItem.id === id) {
                                        parser = parserItem;
                                        return false;
                                    }
                                    return true;
                                }
                            );
                            if (parser !== undefined) {
                                deferred.resolve(parser);
                            } else {
                                deferred.reject();
                            }
                        }
                    );
                return deferred.promise();
            }

            if (parserList !== undefined) {
                deferred.resolve(parserList);
            } else {

                url = getApiUrl("parser");

                $.getJSON(getApiUrl("parser"))
                    .then(
                        function getParserListSuccess(parsers) {
                            parserList = parsers;
                            deferred.resolve(parserList);
                        },
                        utils.ajaxError(deferred)
                    );

            }

            return deferred.promise();
        }

        /**********************************************************************
         ****   Url API
         **********************************************************************/

        function addUrl(data) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("url/add");
            $.post(url, data)
                .then(
                    function getParserFormSuccess(form) {
                        form.template = utils.compile(form.template);
                        deferred.resolve(form);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        function getUrl(id, data) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("url");
            if (id !== undefined) {
                url += "/" + id;
            }
            $.get(url, data)
                .then(
                function getUrlSuccess(urls) {
                    deferred.resolve(urls);
                },
                utils.ajaxError(deferred)
            );

            return deferred.promise();

        }

        function summaryUrl() {

            var deferred = $.Deferred(), url;

            url = getApiUrl("url/summary");
            $.get(url)
                .then(
                    function getUrlSuccess(urls) {
                        deferred.resolve(urls);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        function refreshUrl(id) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("url/refresh");
            if (id !== undefined) {
                url += "/" + id;
            }
            $.get(url)
                .then(
                    function getUrlSuccess(urls) {
                        deferred.resolve(urls);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        /**********************************************************************
         ****   UrlItem API
         **********************************************************************/

        function getUrlItem(id, data) {

            var deferred = $.Deferred(), url;
            url = getApiUrl("urlitem");
            if (id !== undefined) {
                url += "/" + id;
            }
            $.get(url, data)
                .then(
                    function getUrlItemSuccess(urls) {
                        deferred.resolve(urls);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        function getViewUrlItem(id) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("urlitemext/getview/" + id);

            $.get(url)
                .then(
                    function getUrlItemSuccess(urls) {
                        deferred.resolve(urls);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        function removeUrlItem(id) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("urlitem/" + id);

            $.ajax(url, {type: "DELETE"})
                .then(
                    function getUrlItemSuccess() {
                        deferred.resolve(true);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }


        /**********************************************************************
         ****   Search API
         **********************************************************************/

        function getParserForm(name, form) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("search/form/" + name + "/" + form);

            $.get(url)
                .then(
                    function getParserFormSuccess(form) {
                        form.template = utils.compile(form.template);
                        deferred.resolve(form);
                    },
                    utils.ajaxError(deferred)
                );

            return deferred.promise();
        }

        function callSearch(name, args) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("search/" + name + "?" + $.param(args));

            $.get(url)
                .then(
                function callSearchSuccess(result) {
                    result.form.template = utils.compile(result.form.template);
                    deferred.resolve(result);
                },
                utils.ajaxError(deferred)
            );

            return deferred.promise();
        }

        function callAction(name, action, args) {

            var deferred = $.Deferred(), url;

            url = getApiUrl("search/action/" + name + "/" + action + "?" + args);

            $.get(url)
                .then(
                function callActionSuccess(result) {
                    deferred.resolve(result);
                },
                utils.ajaxError(deferred)
            );

            return deferred.promise();
        }


        return {
            parser: { get: getParser },
            search: { callSearch: callSearch, getForm: getParserForm, callAction: callAction },
            url: { add: addUrl, get: getUrl, refresh: refreshUrl, summary: summaryUrl },
            urlItem: { get: getUrlItem, getView: getViewUrlItem, remove: removeUrlItem }
        };
    }
);