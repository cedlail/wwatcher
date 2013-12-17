/**
 * Exposed application interface
 */


// TODO : Créer un service pour UrlItems qui ne retourne pas le champ data => args status + list UrlIds


"use strict";

var // CONSTANTS
    DEFAULT_PAGE_SIZE = 100,
    MAX_PAGE_SIZE = 1000,

    // NODE IMPORTS
    path = require("path"),
    //util = require("util"),

    // MODULES IMPORTS
    Q = require("q"),

    // LIB IMPORTS
    config = require("./config"),
    parser = require("./parser"),
    db,
    server = require("./server"),
    //ut = require("./utils"),

    // Exposed Api
    ServerApi,
    ParserApi,
    UrlApi,
    UrlItemApi,
    DbInfoApi;


/******************************************************************************
 ***    SERVER MANAGEMENT
 ******************************************************************************/

// TODO : Ajout emission d'event onStatusChange, onStart, onClose ...

/**
 * Server management api
 */
ServerApi = (function (){

    /**
     * Return Http configuration
     * @returns {{port: *, staticPath: *, restKey: *, restContext: *, rest: Array}}
     */
    function getOptions() {
        var options, httpConf = config.getHttp(), staticPath;

        staticPath = path.resolve(path.join(__dirname, httpConf.staticPath));

        options = {
            port: httpConf.port,
            staticPath: staticPath,
            restKey : httpConf.restKey,
            restContext: httpConf.restContext,
            rest: [ module.exports ]
        };

        return options;
    }

    /**************************************************************************
     ****   PUBLIC
     **************************************************************************/

    /**
     * Start the http server
     */
    function start() {
        var options = getOptions();
        server.start(options);
    }

    /**
     * Stop the http server
     */
    function stop(force) {
        var options = getOptions();
        server.stop(force, options);
    }

    /**
     * Get the actual http server status
     * @param callback
     */
    function getStatus(callback) {
        var options = getOptions();
        server.getStatus(options, function (status) {
            callback(JSON.parse(status).serverStatus);
        });
    }

    /**
     * Service public interface
     */
    return {
        start: start,
        stop: stop,
        getStatus: getStatus
    };
}());

/******************************************************************************
 ***    MODEL API
 ******************************************************************************/

db = require("./db").create(
    function (db, created) {

        if (created) {
            console.log("Api new database initialized, create parsers...");
        }

        // TODO : Créer une serie Promise => Pb d'exposer le module avant la fin de ca => liste parser incomplete
        parser.list().forEach(
            function (parser) {
                // Check exist in base, create if not
                db.Parser.findOrCreate(
                    { name: parser.name },
                    {
                        name: parser.name,
                        label: parser.label,
                        description: parser.description,
                        isBundled: parser.isBundled
                    }
                ).then(
                    function (parser, created) {
                        if (created) {
                            console.log("Parser %s registered", parser.name);
                        }
                    },
                    function (error) {
                        console.error("Error registering parser %s : \n\t%s", parser.name, error);
                    }
                );
            }
        );

    }
);

function customRequestTagParser(custumTag, request) { //}, content) {

    function parseWhereQueryString(where) {

        // TODO : Parse where IS NULL, IS NOT NULL, LIKE, NOT LIKE, AND/OR, Groupe de test
        // Changer le split + => AND , * => OR

        var whereOpt = {},
            args = where.split(","),
            ope,
            parsed;

        if (args.length > 1) {
            ope = args[1];
            switch (ope) {
            case "eq":
                parsed = args[2];
                break;
            case "ne":
                parsed = { ne: args[2] };
                break;
            case "in":
                parsed = args.slice(2);
                break;
            //case "is": // IS NOT NULL
            //case "nis": // IS NULL
            // case "like":
            // case "nlike":
            case "gt":
                parsed = { gt: args[2] };
                break;
            case "gte":
                parsed = { gte: args[2] };
                break;
            case "lt":
                parsed = { lt: args[2] };
                break;
            case "lte":
                parsed = { lte: args[2] };
                break;
            case "between":
                parsed = { between: args.slice(2,4) };
                break;
            case "nbetween":
                parsed = { nbetween: args.slice(2,4) };
                break;
            }
        }

        whereOpt[args[0]] = parsed;

        return whereOpt;
    }

    function createOptions(request) {
        var page,
            size,
            select,
            order,
            group,
            where,
            include,
            options,
            offset;

        // Pagination
        page = request.parameters.p;
        size = request.parameters.s;
        page = Math.max(page || 0, 0);
        size = Math.min(size || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        offset = 0;
        if (page > 1) {
            offset = (page-1)*size;
        }
        options = { offset: offset, limit: size };

        // Select (attributs)
        select = request.parameters.a;
        if (select !== undefined) {
            options.attributes = select.split(",");
        }

        // Order
        order = request.parameters.o;
        if (order !== undefined) {
            options.order = order;
        }

        // Group
        group = request.parameters.g;
        if (group !== undefined) {
            options.group = group;
        }

        // Where
        where = request.parameters.w;
        if (where !== undefined) {
            options.where = parseWhereQueryString(where);
        }

        // Include
        include = request.parameters.i;
        if (include !== undefined) {
            options.include = include.split(",");
            options.include.forEach(
                function (ref, index) {
                    options.include[index] = db[ref];     // TODO : Contrôler ref existant
                }
            );
        }

        return options;
    }

    switch (custumTag) {
    case "#data-query":
        return createOptions(request);
    }

    return undefined;
}

/**
 * Create a service instance whith crud methods
 * @param name
 * @param model
 * @returns {{}}
 */
function modelApiFactory(name, model) {

    var modelApi = {};

    /**
     * Create instance and persist.
     *
     * @param item to create
     * @returns {Function|promise|promise|Q.promise}
     */
    function create(item) {

        var deferred = Q.defer();

        //console.log("Appel api ParserApi.create");

        model
            .create(item)
            .then(
                function createSuccess(createdItem) {
                    deferred.resolve(createdItem);
                },
                function createError(err) {
                    deferred.reject(err);
                }
            );

        return deferred.promise;
    }
    create._rest = {
        url: "",
        methode: "post",
        args: [ "#post-data" ]
    };
    modelApi.create = create;

    /**
     * Return all items from db or single one if id is not undefined.
     *
     * @returns {Function|promise|promise|Q.promise}
     */
    function get(id, queryArgs) {

        //console.log("Appel api " + name + ".all", id, queryArgs);

        var deferred = Q.defer();

        if (id !== undefined) {

            ( queryArgs === undefined ? model.find(id) : model.find(id, queryArgs))
                .then(
                    function getItemSuccess(item) {
                        deferred.resolve(item);
                    },
                    function getItemError(err) {
                        deferred.reject(err);
                    }
                );

        } else {

            model
                .all(queryArgs)
                .then(
                    function getAllItemSuccess(items) {
                        deferred.resolve(items);
                    },
                    function getAllItemError(err) {
                        deferred.reject(err);
                    }
                );

        }

        return deferred.promise;
    }
    get._rest = {
        url:"/?id",
        methode: "get",
        args: [ "id", "#data-query"]
    };
    modelApi.get = get;

    /**
     * Update an instance.
     *
     * @param id
     * @param item
     * @returns {Function|promise|promise|Q.promise}
     */
    function update(id, item) {

        var deferred = Q.defer();

        //console.log("Appel api " + name + ".update", item);

        if (item === undefined) {
            item = id;
            id = undefined;
        }

        if (item.daoFactoryName === model.name) {  // TODO : A revoir (spĂ©cifique Ă  sequelize)

            item
                .save()
                .then(
                    function updateSuccess(updatedItem) {
                        deferred.resolve(updatedItem);
                    },
                    function updateError(err) {
                        deferred.reject(err);
                    }
                );

        } else {

            model.find(id)
                .then(
                    function (upd) {

                        if (upd === null) {
                            deferred.reject("DB_UNKNOW_ID " + name + ".id : " + id);
                        }

                        var propName;

                        for (propName in item) {
                            if (item.hasOwnProperty(propName) &&
                                upd.hasOwnProperty(propName)) {
                                if (upd[propName] !== item[propName]) {
                                    upd[propName] = item[propName];
                                }
                            }
                        }

                        return upd.save();

                    },
                    function (err) {
                        deferred.reject(err);
                    }
                )
                .then(
                    function (updatedItem) {
                        deferred.resolve(updatedItem);
                    },
                    function error(err) {
                        deferred.reject(err);
                    }
                );

        }

        return deferred.promise;
    }
    update._rest = {
        url:"/:id",
        methode: "put",
        args: [ "id", "#post-data"]
    };
    modelApi.update = update;

    /**
     * Remove an instance
     * @param id
     * @returns {Function|promise|promise|Q.promise}
     */
    function remove(id) {

        var deferred = Q.defer();

        model.find(id)
            .then(
                function (item) {
                    return item.destroy();
                },
                function (err) {
                    deferred.reject(err);
                }
            )
            .then(
                function () {
                    deferred.resolve();
                },
                function (err) {
                    deferred.reject(err);
                }
            );

        return deferred.promise;
    }
    remove._rest = {
        url:"/:id",
        methode: "delete",
        args: [ "id" ]
    };
    modelApi.remove = remove;

    modelApi._rest = { url: name, custumTagParser: customRequestTagParser };

    return modelApi;
}

/**
 * Parser entity api
 */
ParserApi = modelApiFactory("parser", db.Parser);

/**
 * Url entity api
 */
UrlApi = modelApiFactory("url", db.Url);
UrlApi.add = function (item) {

    var deferred = Q.defer(), parserName = item.parser;

    console.log(
        "UrlApi.add call arguments",
        require("util").inspect(arguments)
    );

    // Get parser by label
    ParserApi
        .get(
            undefined,
            {
                where: {
                    name: parserName
                }
            }
        )
        .then(
            function getParserOk(parser) {

                if (parser.length === 0) {
                    deferred.reject(
                        {
                            err: "UNKONW_ENTITY",
                            message: "Can' t create url, Enable to find the parser with name " + parserName
                        }
                    );
                    return;
                }

                // Check label unicity


                var urlParser = parser[0];

                // Create Url with parser
                UrlApi
                    .create(
                        {
                            ParserId: urlParser.id,
                            label: item.label,
                            url: item.url
                        }
                    )
                    .then(
                        function createUrlSuccess(utlItem) {
                            deferred.resolve(utlItem.id);
                        },
                        function createUrlError(err) {
                            deferred.reject(err);
                        }
                    );

            },
            function getParserErr(err) {
                deferred.reject(
                    {
                        err: err,
                        message: "Can' t create url, Enable to find the parser with name " + parserName
                    }
                );
            }
        );

    return deferred.promise;
};
UrlApi.add._rest = {
    url:"/add",
    methode: "post",
    args: [ "#post-data" ]
};
UrlApi.summary = function () {

    var deferred = Q.defer();

    db.query(
            "Select u.id, u.ParserId, u.label, u.url, (select count(*) from UrlItems ui where ui.UrlId = u.id and ui.state = 'N' ) as unreadCount " +
            "From Urls as u " +
            "Group by u.id " + "Order by u.label "
        ).success(
            function (result) {
                deferred.resolve(result);
            }
        );

    return deferred.promise;
};
UrlApi.summary._rest = {
    url:"/summary",
    methode: "get",
    args: []
};
UrlApi._saveResult = function (parser, url, result) {

    result.forEach(
        function (item) {

            var itemId = parser.id + "." + item.id;

            UrlItemApi
                .get(itemId)
                .then(
                    function urlItemSuccess(urlItem) {

                        var attributs;

                        attributs = {
                            id: item.id,
                            catId: item.catId,
                            catLabel: item.catLabel,
                            //url: item.url,
                            age: item.age,
                            size: item.size,
                            completed: item.completed,
                            seeders: item.seeders,
                            leechers: item.leechers
                        };

                        if (urlItem === null || urlItem.id !== itemId ) {
                            // Insert
                            console.log("Create item " + itemId + " " + item.label + " date: " + item.date);
                            UrlItemApi.create(
                                 {
                                     UrlId: url.id,
                                     id: itemId,
                                     label: item.label,
                                     state: UrlItemApi.URL_ITEM_STATE.NEW.short,
                                     date: item.date,
                                     attributs: JSON.stringify(attributs),
                                     viewUrl: item.url,
                                     data: ""
                                }
                            );
                        } else {
                            // Update attributs
                            console.log("Update item " + url.id + " => " +
                                itemId + " " + item.label + " date: " + item.date);
                            urlItem.attributs = JSON.stringify(attributs);
                            UrlItemApi.update(urlItem);
                        }
                    },
                    function urlItemError(err) {
                        console.error("urlItemError ERROR8 ", err);
                    }
                );
        }
    );
};
UrlApi.refresh = function (id) {

    var deferred = Q.defer();

    if (id === undefined || id === "all") {
        return UrlApi._refreshAll();
    }

    UrlApi
        .get(id)
        .then(
            function getUrlSuccess(url) {

                if (url !== null) {
                    // Get the parser
                    ParserApi
                        .get(url.ParserId)
                        .then(
                            function getUrlSuccess(urlParser) {

                                console.log("Search url " + id, url.url);

                                try {
                                    parser.execute(
                                        urlParser.name,
                                        { url: url.url },
                                        function (event, arg, result) {
                                            if (event === "done") {

                                                // TODO : A passer en Promise
                                                UrlApi._saveResult(urlParser, url, result);
                                                url.lastExec = (new Date());
                                                UrlApi.update(url);

                                                deferred.resolve(result);

                                            }
                                            if (event === "error") {
                                                console.error("Search result " + id + " ERROR5 ", arg);
                                                deferred.reject(arg);
                                            }
                                        }
                                    );
                                } catch(ex) {
                                    console.error("Search result " + id + " ERROR4 ", ex);
                                    deferred.reject(ex);
                                }
                            },
                            function getUrlError(err) {
                                console.error("Search result ERROR3 ", err);
                                deferred.reject(err);
                            }
                        );
                } else {
                    console.error("Search result ERROR2 ", "UNKNOW_ENTITY Urls with " + id);
                    deferred.reject("UNKNOW_ENTITY Urls with " + id);
                }
            },
            function getUrlError(err) {
                console.error("Search result " + id + "ERROR1 ", err);
                deferred.reject(err);
            }
        );

    return deferred.promise;
};
UrlApi.refresh._rest = {
    url: "refresh/?id",
    methode: "get",
    args: []
};
UrlApi._refreshAll = function () {

    var deferred = Q.defer();

    UrlApi
        .get(
            undefined ,
            { where : { enable: true } }
        )
        .then(
            function getUrlSuccess(urls) {
                var pipe = [];
                urls.forEach(
                    function (url) {
                        pipe.push(UrlApi.refresh(url.id));
                    }
                );
                return Q.all(pipe);
            },
            function getUrlError(err) {
                deferred.reject(err);
            }
        )
        .then(
            function pipeSuccess() {
                deferred.resolve("ok");
            },
            function pipeError(err) {
                deferred.reject(err);
            }
        );

    return deferred.promise;
};


/**
 * UrlItem entity api
 */
UrlItemApi = modelApiFactory("urlitem", db.UrlItem);
UrlItemApi.URL_ITEM_STATE = db.URL_ITEM_STATE;
UrlItemApi.getParser = function (id) {

    var deferred = Q.defer();

    db.query(
        "select p.* " +
        "from UrlItems ui " +
        "inner join Urls u on (u.id = ui.UrlId ) " +
        "inner join Parsers p on (p.id = u.ParserId) " +
        "where ui.id = '" + id + "'",
        db.Parser
    ).then(
        function (parsers) {
            deferred.resolve(parsers[0]);
        },
        function (err) {
            deferred.reject(err);
        }
    );

    return deferred.promise;
};
//UrlItemApi.getParser._rest = {
//    url: "parser/:id",
//    methode: "get",
//    args: [ "id" ]
//};

var UrlItemExt = {};
UrlItemExt._rest = { url: "urlitemext", custumTagParser: customRequestTagParser  };
UrlItemExt.getView = function (id) {

    var deferred = Q.defer();

    UrlItemApi
        .get(id)
        .then(
            function (urlItem) {
                if (urlItem !== null) {
                    if (urlItem.data !== undefined && urlItem.data !== "") {
                        deferred.resolve(urlItem.data);
                    } else {
                        UrlItemApi
                            .getParser(urlItem.id)
                            .then(
                                function (parserInst) {
                                    parser
                                        .getView(parserInst.name, urlItem.viewUrl)
                                        .then(
                                            function (data) {
                                                urlItem.data = data;
                                                urlItem.state = UrlItemApi.URL_ITEM_STATE.VIEW.short;
                                                UrlItemApi.update(urlItem);
                                                deferred.resolve(urlItem.data);
                                            },
                                            function (err) {
                                                deferred.reject(err);
                                            }
                                        );
                                },
                                function (err) {
                                    deferred.reject(err);
                                }
                            );
                    }
                } else {
                    deferred.reject("UNKNOW_ENTITY " + id);
                }
            },
            function (err) {
                deferred.reject(err);
            }
        );

    return deferred.promise;

};
UrlItemExt.getView._rest = {
    url: "getview/:id",
    methode: "get",
    args: [ "id" ]
};
UrlItemExt.setState = function (qs) {
    //console.log("Call setState with args ", JSON.stringify(qs));

    var deferred = Q.defer();

    UrlItemApi.get(qs.id)
        .then(
        function (urlItem) {
            if (urlItem !== null) {

                urlItem.state = qs.state;

                UrlItemApi.remove(urlItem)
                    .then(
                    function (updated) {
                        deferred.resolve(updated);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );

            } else {
                deferred.reject("UNKNOW_ENTITY");
            }
        },
        function (err) {
            deferred.reject(err);
        }
    );

    return deferred.promise;
};
UrlItemExt.setState._rest = {
    url: "setstate/:id",
    methode: "get",
    args: [ "#qs" ]
};

/**
 * DbInfo entity api
 */
DbInfoApi = modelApiFactory("dbinfo", db.UrlParameter);

/******************************************************************************
 ***    PARSER API
 ******************************************************************************/

/**
 * Search using parsers
 */
var SearchApi = {};
SearchApi._rest = { url: "search" };
SearchApi.getForm = function getForm(name, formName) {
    var deferred = Q.defer(), form;
    form = parser.getForm(name, formName);
    deferred.resolve(form);
    return deferred.promise;
};
SearchApi.getForm._rest = {
    url:"/form/:name/:formName",
    methode: "get",
    args: [ "name", "formName" ]
};
SearchApi.callSearch =  function (parserName, args) {  // TODO : Supprimer le form de la réponse => passer le nom uniquement => 2 appels (getForm)
    return parser.callSearch(parserName, args);
};
SearchApi.callSearch._rest = {
    url:"/:name",
    methode: "get",
    args: [ "name" , "#qs" ]
};
SearchApi.callAction = function (name, action, args) {
    return parser.callAction(name, action, args);
};
SearchApi.callAction._rest = {
    url:"/action/:name/:action",
    methode: "get",
    args: [ "name" , "action", "#qs" ]
};

/******************************************************************************
 ***    EXPORTS
 ******************************************************************************/
// Server
exports.server = ServerApi;
// Model
exports.parser = ParserApi;
exports.search = SearchApi;
exports.url = UrlApi;
exports.urlItem = UrlItemApi;
exports.urlItemExt = UrlItemExt;
exports.dbinfo = DbInfoApi;
exports.customRequestTagParser = customRequestTagParser;