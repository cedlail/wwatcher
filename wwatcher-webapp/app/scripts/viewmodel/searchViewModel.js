/**
 * Search view Page : Quick search using server parsers
 */
define(
    "viewmodel/search",
    [ "window", "jquery", "api", "utils" ],
    function (window, $, api, utils) {
        "use strict";

        var templateName = "view/search",
            template = require(templateName),
            dataContext,
            pageContainer,
            view = {};

        function initDataContext(args) {

            var deferred = $.Deferred();

            if (dataContext === undefined) {
                // Start value
                dataContext = {
                    userData: {
                        parser: undefined
                    },
                    data: {}
                };

            }

            if (args !== undefined) {
                $.extend(dataContext.userData, args);
                if (dataContext.userData.q !== undefined) {
                    dataContext.userData.q = dataContext.userData.q.replace(/\+/g, " ");
                }
            }

            if (dataContext.data.parsers === undefined) {
                api.parser.get()
                    .then(
                        function (parsers) {
                            dataContext.data.parsers = parsers;
                            deferred.resolve(dataContext);
                        }
                    );

            } else {
                deferred.resolve(dataContext);
            }

            return deferred.promise();
        }

        function open(domContainer, args) {

            pageContainer = domContainer;

            // Restaure view
            if (view !== undefined && view.content !== undefined) {
                if (view.state === undefined || args === "" || $.param(args) === view.state) {
                    pageContainer.empty().append(view.content);
                    bindView();
                    updateHash();
                    return;
                }
            }

            // New view
            initDataContext(args).then(
                function () {

                    //setArguments(args);
                    var tplData = $.extend({}, dataContext.data, dataContext.userData);
                    view.content = $(template(tplData));
                    pageContainer.empty().append(view.content);

                    bindView();

                    // Set view start state
                    view.parserSelect.change();
                    view.searchCriteria.children(".container").slideDown(200);

                }
            );
        }

        function updateHash() {
            var hashParams, newHash;
            hashParams = $.param($.extend({}, dataContext.userData));
            newHash = "search" + (hashParams !== "" ? "?" + hashParams : "");
            view.state = hashParams;
            require("nav").updateHash(newHash);
        }

        function bindView() {

            view.searchCriteria = pageContainer.find(".search-criteria");
            view.parserSelect = pageContainer.find("#selectParser").unbind().change(selectParserChanged);
            view.searchButton = pageContainer.find("#search-start").unbind().click(buttonSearchClicked);
            view.searchFormDisplay = pageContainer.find(".parserSearchForm");
            view.searchForm = pageContainer.find("#parserSearchForm").unbind().submit(buttonSearchClicked);

            view.sep = pageContainer.find(".hsep");

            view.result = pageContainer.find(".search-result");
            view.resultContainer = pageContainer.find(".search-result-container");
            view.resultSave = pageContainer.find("#search-save").unbind().click(buttonSaveClicked);
        }

        function selectParserChanged(event) {

            //console.log("Parser selection changed", event);

            var parserSelected = $(event.target).val();

            if (parserSelected !== "") {

                // Raz the dataContext
                if (parserSelected !== dataContext.userData.parser) {
                    dataContext.userData = {
                            run: dataContext.userData.run && dataContext.userData.parser === ""
                        };
                    view.sep.hide();
                    view.resultContainer.hide();
                }
                dataContext.userData.parser = parserSelected;

                // Get the search form of the parser and inject him
                api.search.getForm(dataContext.userData.parser, "search")
                    .then(
                        function (parserForm) {

                            // TODO : Possibilité de création de vue
                            var form = parserForm.template, tplData;
                            if (typeof form === "string") {
                                form = utils.compile(form);
                            }

                            tplData = $.extend({}, dataContext.data, dataContext.userData, parserForm.data);
                            view.searchForm
                                .empty()
                                .append(
                                    form(tplData)
                                );

                            view.searchFormDisplay.show();

                            if (dataContext.userData.run) {
                                view.searchButton.click();
                            }
                        }
                    );

            } else {
                view.searchFormDisplay.hide();
                view.sep.hide();
                view.resultContainer.hide();
            }
            updateHash();
        }

        function buttonSearchClicked(event) {

            var formData, args;

            if (view.searchButton.hasClass("green")) {

                view.searchButton.removeClass("green");
                view.sep.hide();
                view.resultContainer.hide();

                formData = view.searchForm.serializeArray();
                args = {};
                $.each(
                    formData,
                    function (index, item) {
                        args[item.name] = item.value;
                    }
                );
                $.extend(dataContext.userData, args);
                updateHash();

                api.search.callSearch(dataContext.userData.parser, args)
                    .then(
                        function (searchResult) {

                            var resultForm = searchResult.form.template, tplData;
                            if (typeof resultForm === "string") {
                                resultForm = utils.compile(resultForm);
                            }

                            $.extend(
                                dataContext.data,
                                searchResult.form.data,
                                { url: searchResult.url, results: searchResult.results }
                            );
                            tplData = $.extend(
                                {},
                                dataContext.userData,
                                dataContext.data
                            );

                            view.result
                                .empty()
                                .append(resultForm(tplData));

                            view.sep.show();
                            view.resultContainer.show().slideDown();
                            view.resultSave.show();

                            dataContext.userData.run = true;
                            updateHash();

                            view.searchButton.addClass("green");

                            bindView();

                        },
                        function () {
                            view.searchButton.addClass("green");
                        }
                    );
            }

            // Cancel submit
            event.preventDefault();
        }

        function buttonSaveClicked(event) {

            console.log("Save clicked...");

            var template, tplData, saveDialog;

            saveDialog = $("#saveSearch");
            if (saveDialog.length > 0) {
                saveDialog.remove();
            }
            template = require("view/saveSearch");
            tplData = $.extend(
                { label: dataContext.userData.q },
                dataContext.userData,
                dataContext.data
            );
            pageContainer.append(template(tplData));
            saveDialog = $("#saveSearch");

            function setError(errors) {
                var errorContainer = saveDialog.find(".errorContainer"),
                    fields = saveDialog.find(".inputForm"),
                    textErrors = "";
                if (errors === undefined) {
                    errorContainer.hide();
                    fields.removeClass("errorState");
                } else {
                    $.each(
                        errors,
                        function (index, err) {
                            textErrors += err.message + "\n";
                            err.field.addClass("errorState");
                        }
                    );
                    errorContainer.find(".errorMessage").text(textErrors);
                    errorContainer.show();
                }
            }
            function validate() {

                var label, errors = [];

                // Clear errors
                setError();

                // Check label
                label = saveDialog.find("#searchLabel");
                if (label.val() === "") {
                    errors.push(
                        {
                            field: label,
                            message: "Veuillez renseigner le libellé"
                        }
                    );
                }

                // Call the api
                if (errors.length === 0) {
                    // Save
                    api.url
                        .add({
                            parser : dataContext.userData.parser,
                            label: label.val(),
                            url: dataContext.data.url
                        })
                        .then(
                            function saveSuccess() {

                                // Close popup
                                saveDialog.dialog("close");
                            },
                            function saveError(err) {
                                // TODO : Gestion erreur unicité du libellé
                                setError(
                                    [
                                        {
                                            field: label,
                                            message: "Erreur lors de la création de la surveillance de la recherche" + err
                                        }
                                    ]
                                );
                            }
                        );
                } else {
                    setError(errors);
                }
            }

            saveDialog.dialog({ modal: true, width: Math.min($(window).width()-10, 480) });
            saveDialog
                .find("input")
                .keypress(function (event) { if (event.which === 13) { validate(); }});
            saveDialog
                .find("#btnValidate")
                .click(validate);
            saveDialog
                .find("#btnCancel")
                .click( function () { saveDialog.dialog("close"); });

            // Cancel submit
            event.preventDefault();
        }


        return {
            open: open,
            //setArguments: setArguments,
            layout: "search"
        };
    }
);