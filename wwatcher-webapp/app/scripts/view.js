/* global Handlebars */

// TODO : Extraction du nom du template permettre plusieurs points dans le nom du fichier
// TODO : Gestion i18n


/**
 * Module for templates modules initialisation at startup or at runtime
 */
define(
    "view",
    [ "jquery", "utils", "handlebars" ],
    function ($, utils, handlebars) {
        "use strict";

        var isReady = false,
            useCompiled = true,
            /**
             * Templates loaded at app startup
             */
            templates = ["layout.hbs", "search.hbs", "folder.hbs", "saveSearch.hbs"],
            readyCallbacks = [];

        function getTemplate(name) {
            return require("view/"+name).get();
        }

        function ready(cb) {
            if (isReady) {
                cb();
            } else {
                readyCallbacks.push(cb);
            }
        }

        /*******************************************
         **** Auto loading template on app startup
         *******************************************/

        (function () {

            var templatesCount, templatesDone;

            templatesCount = templates.length;
            templatesDone = 0;

            $.each(
                templates,
                function (index, templateFileName) {

                    var template,
                        templateUrl,
                        templateName;

                    templateName = "view/" + templateFileName.split(".")[0];

                    if (useCompiled && handlebars.compiled !== undefined && handlebars.compiled[templateName] !== undefined) {

                        // Create template module
                        define(
                            templateName,
                            [],
                            function () {
                                return handlebars.compiled[templateName];
                            }
                        );
                        templateReady();

                    } else {

                        // TODO : Utilisation localStorage pour éviter les aller retour serveur 304

                        templateUrl = "/scripts/view/" + templateFileName;

                        // Get template from server
                        $.ajax(
                            {
                                url: templateUrl,
                                dataType: "text",
                                cache: true
                            }
                        ).then(
                            function (result) {
                                //console.log("Template %s succefully loaded.", templateName);
                                template = result;
                            },
                            utils.ajaxError("Error loading template %s url => %s", templateFileName, templateUrl)
                        ).done(templateReady);

                        // Create template module
                        define(
                            templateName,
                            [],
                            function () {
                                return handlebars.compile(template);
                            }
                        );
                    }
                }
            );

            function templateReady() {
                templatesDone += 1;
                if (templatesDone === templatesCount) {
                    isReady = true;
                    $.each(
                        readyCallbacks,
                        function (index, cb) {
                            cb();
                        }
                    );
                }
            }

        }());

        function init() {

            var deferred = $.Deferred();

            ready(function () { deferred.resolve(); });

            return deferred.promise();
        }



        return {
            //define: defineViewModel,
            getTemplate: getTemplate,          // TODO : getView
            init: init
        };
    }
);