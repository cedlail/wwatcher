/**
 * Database module
 */

"use strict";

var DB_VERSION = "0.0.1";

var Sequelize = require("sequelize"),
    config = require("./config"),
    Db,
    envDb = {},
    URL_ITEM_STATE = {
        NEW: { short: "N", label: "urlitem.state.new" },
        VIEW: { short: "V", label: "urlitem.state.view" },
        ARCHIVED: { short: "A", label: "urlitem.state.archived" },
        FOLLOW: { short: "F", label: "urlitem.state.follow" }
    };

/**
 * Model definition
 *
 * @param sequelize
 * @param instance
 * @returns {*}
 */
function defineModel(sequelize, instance) {

    /**
     * DbInfo TABLE
     * @type {*}
     */
    var DbInfo = sequelize.define(
        "DbInfo",
        {
            name: { type: Sequelize.STRING(50), allowNull: false, primaryKey: true , comment: "Database options" },
            value: { type: Sequelize.STRING, allowNull: false, comment: "Database options value" }
        },
        {
            comment: "Database parameters",
            tableName: 'DbInfos'
        }
    );

    /**
     * UrlItem TABLE
     * @type {*}
     */
    var UrlItem = sequelize.define(
        "UrlItem",
        {
            id: { type: Sequelize.STRING(50), primaryKey: true , comment: "Id" },
            label: { type: Sequelize.STRING(250), allowNull: false, comment: "Label"  },
            date: { type: Sequelize.DATE, allowNull: true, comment: "Date" },
            attributs: { type: Sequelize.TEXT, comment: "Attributs" },
            state: { type: Sequelize.STRING(1), allowNull: false, default: "N", comment: "Etat" },
            viewUrl: { type: Sequelize.TEXT, allowNull: false, comment: "View page url" },
            data: { type: Sequelize.TEXT, allowNull: false, comment: "Data" }
        },
        {
            comment: "Catched items on an url"
        }
    );

    /**
     * Url TABLE
     * @type {*}
     */
    var Url = sequelize.define(
        "Url",
        {
            label: { type: Sequelize.STRING(100), allowNull: false, comment: "Watched url label"},
            url: { type: Sequelize.STRING(2048), allowNull: false, comment: "Watched url"},
            enable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, comment: "Watch is enable" },
            lastExec: { type: Sequelize.DATE, comment: "Last execution date" }
        },
        {
            comment: "Watched url"
        }
    );
    Url.hasMany(UrlItem, {as: "Items"});
    UrlItem.belongsTo(Url);

    /**
     * Parser TABLE
     * @type {*}
     */
    var Parser = sequelize.define(
        "Parser",
        {
            name: { type: Sequelize.STRING(100), allowNull: false, unique: true, comment: "Name" },
            label: { type: Sequelize.STRING(100), allowNull: false, unique: true, comment: "Label" },
            description: { type: Sequelize.STRING, comment: "Description" },
            isBundled: { type: Sequelize.BOOLEAN, allowNull: false, comment: "Is bundled with application"}
        },
        {
            comment: "Parser for web content"
        }
    );
    Parser.hasMany(Url, {as: "Urls"});
    Url.belongsTo(Parser);

    instance = instance || {};
    instance.Parser = Parser;
    instance.Url = Url;
    instance.UrlItem = UrlItem;
    instance.DbInfo = DbInfo;

    return instance;
}


/******************************************************************************
 ***    DAO
 *******************************************************************************/

Db = (function () {

    /**
     * Create db model accessor.
     *
     * @param callback
     * @param database
     * @param user
     * @param password
     * @param options
     * @constructor
     */
    function Db(callback, database, user, password, options) {

        var that = this,
            sequelize,
            version,
            argCount = arguments.length;

        function ctor() {

            var dbConfig;

            // Set connection config
            if (argCount <= 2) {
                // Database is defined in config file
                dbConfig = config.getDatabase(database);
                sequelize = new Sequelize(
                    dbConfig.name,
                    dbConfig.username,
                    dbConfig.password,
                    dbConfig.options
                );
                console.log("Config used " + (database || "default") + " = " , JSON.stringify(dbConfig));
            } else {
                switch (argCount) {
                    case 3:
                        sequelize = new Sequelize(database, user);
                        break;
                    case 4:
                        sequelize = new Sequelize(database, user, password);
                        break;
                    default:
                        sequelize = new Sequelize(database, user, password, options);
                }
            }

            // Define the model
            initModel();

        }

        /*****************************************************************************************
         ***    MODEL
         *****************************************************************************************/

        function initModel() {

            defineModel(sequelize, that);

            // Init db
            sequelize
                .sync()
                .done(
                    function () {
                        // Check version
                        that.DbInfo
                            .findOrCreate(
                                { name: "dbVersion" },
                                { value: DB_VERSION }
                            )
                            .success(
                                function (dbInfo, created) {

                                    version = dbInfo.value;

                                    if (created) {
                                        console.log("Empty database initialized to dbVersion %s", DB_VERSION);
                                    } else {
                                        if (version !== DB_VERSION) {
                                            console.error("Current dbVersion %s is not the reference one %s", version, DB_VERSION);
                                        }
                                    }

                                    if (typeof callback === "function") {
                                        callback(that, created);
                                    }

                                }
                            )
                            .error(
                                function (error) {
                                    console.error("Error check db version.", error);
                                }
                            );
                    }
                );

        }

        /*****************************************************************************************
         ***    PUBLIC
         *****************************************************************************************/

        this.getVersion = function () {
            return version;
        };

        this.query = function (sqlQuery) {
            return sequelize.query(sqlQuery);
        };


        // Instance Initialization
        ctor();
    }

    // ----------------------------------------------------------------------
    //    Prototype members -------------------------------------------------

    Db.prototype.DB_VERSION = DB_VERSION;


    // ----------------------------------------------------------------------
    //    Expose the class constructor  -------------------------------------

    return Db;
}());


// ---------------------------------------------------------------------------
//    PUBLIC -----------------------------------------------------------------
exports.create = function (callback, database, user, password, options) {
    var dbInstance, env;

    env = database || config.getConfig().env;

    if (envDb[env] !== undefined) {
        dbInstance = envDb[env];
        if (typeof callback === "function") {
            callback.call(undefined, dbInstance);
        }
    } else {

        switch (arguments.length) {
        case 0:
            dbInstance = new Db();
            break;
        case 1:
            dbInstance =  new Db(callback);
            break;
        case 2:
            dbInstance =  new Db(callback, database);
            break;
        case 3:
            dbInstance =  new Db(callback, database, user);
            break;
        case 4:
            dbInstance =  new Db(callback, database, user, password);
            break;
        default:
            dbInstance =  new Db(callback, database, user, password, options);
        }

        dbInstance.URL_ITEM_STATE = URL_ITEM_STATE;

        envDb[env] = dbInstance;
    }

    return dbInstance;
};