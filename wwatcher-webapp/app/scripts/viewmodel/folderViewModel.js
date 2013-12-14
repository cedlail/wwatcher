/**
 * Folder view Page : Management of watches
 */
define(
    "viewmodel/folder",
    [ "window", "jquery", "api", "utils" ],
    function (window, $, api, utils) {
        "use strict";

        var templateName = "view/folder",
            template,
            parserTemplateList = {},
            dataContext,
            pageContainer,
            view = {};

        function initDataContext(args) {

            var deferred = $.Deferred();

            if (dataContext === undefined) {
                // Start value
                dataContext = {
                    data: {}
                };

            }

//            if (args !== undefined) {
//                $.extend(dataContext.userData, args);
//                if (dataContext.userData.q !== undefined) {
//                    dataContext.userData.q = dataContext.userData.q.replace(/\+/g, " ");
//                }
//            }

            if (dataContext.data.urls === undefined) {
                api.url
                    .summary()
                    .then(
                        function (result) {
                            dataContext.data.urls = result;
                            deferred.resolve(dataContext);
                        }
                    );
            } else {
                deferred.resolve(dataContext);
            }

            return deferred.promise();
        }


        function getTemplate() {
            if (template === undefined) {
                template = require(templateName);
            }
            return template;
        }

        function open(domContainer, args) {
            if (view.content !== undefined) {
                pageContainer.empty().append(view.content);
                bindView();
                return;
            }
            pageContainer = domContainer || pageContainer;
            initDataContext(args).done(updateView);
        }

        function setArguments(args) {
            console.log("Folder view arguments", args);
        }

        function updateView(ctx) {
            var tpl = getTemplate();
            ctx = ctx || dataContext;
            view.content = $(tpl(ctx.data));
            pageContainer.empty().append(view.content);
            bindView();
            $("header>.stateNav, #page").addClass("initState");
        }

        function bindView() {
            // Main refresh button
            view.content.find("#btnUpdateAll").unbind().click(btnUpdateClick);
            // Url
            view.content.find(".urlItem").unbind().click(selectUrl);
            view.content.find(".urlItem>.actionBar>.update").unbind().click(updateUrl);
            view.content.find(".urlItem>.actionBar>.edit").unbind().click(editUrl);
            view.content.find(".urlItem>.actionBar>.enable").unbind().click(enableUrl);
            view.content.find(".urlItem>.actionBar>.remove").unbind().click(removeUrl);
            // Item
            view.content.find(".item").unbind().click(itemSelectHandler);
            view.content.find("#filterState").change(selectStateChange);

            $(".stateNav>.stateBack").unbind().click(btnBack);
            $(".stateNav>.stateNext").unbind().click(btnNext);
        }

        function btnBack() {
            var page;
            page = $("header>.stateNav, #page");
            if (page.hasClass("listState")) {
                page.removeClass("listState").addClass("initState");
            } else if (page.hasClass("docState")) {
                page.removeClass("docState").addClass("listState");
            }
        }
        function btnNext() {
            var page;
            page = $("header>.stateNav, #page");
            if (page.hasClass("initState")) {
                page.removeClass("initState").addClass("listState");
            } else if (page.hasClass("listState")) {
                page.removeClass("listState").addClass("docState");
            }
        }

        /**
         * Refresh button
         * @param event
         */
        function btnUpdateClick(event) {
            var btnUpd = view.content.find("#btnUpdateAll");
            btnUpd.css("visibility", "hidden");
            api.url
                .refresh("all")
                .then(
                    function () {
                        dataContext.data.urls = undefined;
                        initDataContext().done(updateView);
                        btnUpd.css("visibility", "");
                    }
                );
            event.preventDefault();
        }

        /**
         * Url select handler
         * @param event
         */
        function selectUrl(event) {
            if (event !== undefined) {
                var item = $(event.target);
                item.toggleClass("selected");
            }
            updateUrlItem();
        }

        function updateUrl(event) {
            console.log("updateUrl");

        }

        function editUrl(event) {
            console.log("editUrl");

            var popup, itemDiv, item, itemId;

            itemDiv = $(event.target).parents("div.urlItem:first");
            itemId = parseInt(itemDiv.attr("id").split("_")[1], undefined);
            item = getUrl(itemId);
            template = require("view/saveSearch");
            popup = $(template(item));
            pageContainer.append(popup);

            function validate() {

                popup.dialog("close");
            }

            popup.dialog({
                title: "Modifier " + item.label,
                modal: true,
                width: Math.min($(window).width()-10, 480),
                close: function () { popup.remove(); }
            });
            popup
                .find("input")
                .keypress(function (event) { if (event.which === 13) { validate(); }});
            popup
                .find("#btnValidate")
                .click(validate);
            popup
                .find("#btnCancel")
                .click( function () { popup.dialog("close"); });

        }

        function enableUrl(event) {
            console.log("enableUrl");
        }

        function removeUrl(event) {

            var popup, itemDiv, item, itemId;

            itemDiv = $(event.target).parents("div.urlItem:first");
            itemId = parseInt(itemDiv.attr("id").split("_")[1], undefined);
            item = getUrl(itemId);

            popup = $(
                "<div title='Confirmez la suppression' class='confirmDialog'>" +
                "<span>Confirmez la suppression ou le vidage de :</span><br/>" +
                "<h4>" + item.label + "</h4>" +
                "</div>"
            );

            pageContainer.append(popup);
            popup.dialog(
                {
                    modal: true,
                    width: 480,
                    buttons: {
                        "Tous Vu" : function () { console.log("Vider"); },
                        "Tous Suppr." : function () { console.log("Vider"); },
                        "Vider" : function () { console.log("Vider"); },
                        "Supprimer" : function () { console.log("Supprimer", event); },
                        "Annuler" : function () { console.log("Annuler"); $(this).dialog("close"); }
                    },
                    close: function () {
                        popup.remove();
                    }
                }
            );
        }

        //function setUrlState(id, newState) {}

        function getUrl(id) {
            var foundUrl;
            $.each(
                dataContext.data.urls,
                function (index, url) {
                    if (url.id === id) {
                        foundUrl = url;
                        return false;
                    }
                    return true;
                }
            );
            return foundUrl;
        }

        function selectStateChange() {

            // Filter urls
            //updateView();
            // TODO : Filtrer la liste des dossier, sauvegarder la sélection, réafichage de la vue

            // Update items list
            updateUrlItem();
        }

        /**
         * UrlItems display
         */
        function updateUrlItem() {
            var urlListId = [], urlParserId = {}, states = $("#filterState").val().split(",");
            // Selection list
            view.content
                .find(".urlItem.selected")
                .each(function (index, url) {
                    var urlId = parseInt($(url).attr("id").split("_")[1], undefined);
                    urlListId.push(urlId);
                    urlParserId[urlId] = getUrl(urlId).ParserId;
                });
            if (urlListId.length === 0) {
                dataContext.itemList = [];
                updateItemList();
            } else {
                api.urlItem
                    .get(undefined,
                        {
                            w: "UrlId,in," + urlListId.join(","),// + "and,state,in" + ,
                            o: "createdAt desc,date desc"
                        }
                    )
                    .then(
                    function (urlItems) {

                        var itemList = [];

                        $.each(
                            urlItems,
                            function (index, item) {
                                if (states.indexOf(item.state) >= 0) {  // TODO : Inclure dans la requête
                                    //console.log(item);
                                    var attributs;
                                    attributs = JSON.parse(item.attributs);
                                    item.parserId = urlParserId[item.UrlId];
                                    delete item.attributs;
                                    item = $.extend(attributs, item);
                                    itemList.push(item);
                                }
                            }
                        );

                        dataContext.itemList = itemList;
                        updateItemList();
                    }
                );
            }
        }

        function getTemplateForParserId(parserId) {
            var deferred = $.Deferred();
            if (parserTemplateList.hasOwnProperty(parserId)) {
                deferred.resolve(parserTemplateList[parserId]);
            } else {
                // Get name
                api.parser
                    .get(parserId)
                    .then(
                        function (parser) {
                            api.search
                                .getForm(parser.name, "listItem")
                                .then(
                                    function (template) {
                                        if (typeof template.template === "string") {
                                            template.template =
                                                utils.compile(template.template);
                                        }
                                        parserTemplateList[parserId] = template;
                                        deferred.resolve(template);
                                    }
                                );
                        }
                    );
            }
            return deferred.promise();
        }

        function updateItemList() {

            var listContainer = view.content.filter(".list").find("div");

            listContainer
                .empty()
                .css({left: 20, opacity: 0});

            $.each(
                dataContext.itemList,
                function (index, item) {
                    // TODO : Charger les template avant itération (en global ??)
                    getTemplateForParserId(item.parserId)
                        .then(
                            function (tpl) {
                                listContainer.append(tpl.template(item));
                            }
                        );
                }
            );

            //listContainer.parent().show();
            listContainer.animate({left: 2, opacity: 1}, 200);
            //setTimeout(bindView, 100);
            setTimeout(bindView, 500);

            if (dataContext.itemList.length > 0) {
                $("header>.stateNav, #page").removeClass("initState").addClass("listState");
            }
        }

        function getUrlItem(id) {
            var urlItem;
            $.each(
                dataContext.itemList,
                function (index, item) {
                    if (item.id === id) {
                        urlItem = item;
                        return false;
                    }
                    return true;
                }
            );
            return urlItem;
        }

        function itemSelectHandler(event) {

            view.content.find(".item").removeClass("selected");
            var item = $(event.currentTarget), itemId, urlItem;
            item.addClass("selected");

            itemId = item.attr("id");
            urlItem = getUrlItem(itemId);
            if (urlItem.data === undefined || urlItem.data === "") {
                api.urlItem.getView(itemId)
                    .then(
                        function (data) {
                            urlItem.data = data;
                            displayView(urlItem);
                            if (item.hasClass("itemStateN")) {
                                item.removeClass("itemStateN").addClass("itemStateV");
                            }
                        }
                    );
            } else {
                displayView(urlItem);
            }

        }

        function displayView(urlItem) {
            var torrentUrl, pageUrl, id = urlItem.id.split(".")[1];
            torrentUrl = "http://www.t411.me/torrents/download/?id=" + id;
            pageUrl = urlItem.viewUrl;
            pageContainer
                .find(".document div.container")
                .hide()
                .empty()
                .append(
                    "<div class='docBar'>" +
                    "<a class='docButton docRemove' target='_blank' href='#'><div class='button red'>Supprimer</div></a>" +
                    "<a class='docButton' target='_blank' href='" + torrentUrl + "'><div class='button green'>Torrent</div></a>" +
                    "<a class='docButton' target='_blank' href='" + pageUrl + "'><div class='button green'>Page</div></a>" +
                    "</div>" +
                    urlItem.data
                )
                .show(400);

            $("header>.stateNav, #page").removeClass("listState").addClass("docState");

            // Remove handler
            $(".docRemove").click(
                function removeItem(event) {
                    api.urlItem
                        .remove(urlItem.id)
                        .then(function () {
                            console.log("Remove OK");
                            updateUrlItem();
                            pageContainer.find(".document div.container").empty();
                        });
                    event.preventDefault();
                }
            );
        }

        return {
            open: open,
            setArguments: setArguments,
            layout: "folder"
        };
    }
);