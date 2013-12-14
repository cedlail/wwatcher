/**
 * App configuration management
 */

// TODO : getConfig ne devrait pas changer la config en cours, revoir initConfig getDatabase getHttp..., et setConfig

"use strict";

var fs = require("fs");
var path = require("path");

var APP_CONFIG_FILENAME = "config.json",
    APP_NAME = "WWatcher",// TODO : A lire dans package.json
    DEFAULT_SERVER_PORT = 80,
    DEFAULT_REST_KEY = "6581064-654645-9879790654-1087601",
    DEFAULT_REST_CONTEXT = "/rest",

    appConfigFile = "",

    appConfig = {
        name: APP_NAME,
        env: "prod",
        isDevMode: false,
        userFolder: "",
        database: {
            prod: {
                database: "",
                user: "",
                password: "",
                options: {
                    dialect: "sqlite",
                    storage: "database.db"
                }
            }
        },
        http: {
            prod: {
                port: DEFAULT_SERVER_PORT,
                staticPath: "../www",
                restKey: DEFAULT_REST_KEY,
                restContext: DEFAULT_REST_CONTEXT
            }
        }
    },
    configReady = false;

/**
 * Check if configuration is loaded.
 * @param env
 */
function initConfig(env) {
    if (!configReady) {
        setConfig(env);
    }
}

/**
 * Select and return the configuration for specified environnement.
 *
 * @param env
 * @returns {{name: string, env: string, isDevMode: boolean, userFolder: string, database: {prod: {database: string, user: string, password: string, options: {dialect: string, storage: string}}}, http: {prod: {port: number, apiKey: string, staticPath: string}}}}
 */
function setConfig(env) {   // Env selection in dev mode

    var config;

    if (configReady && (env === undefined || appConfig.env === env)) {
        return appConfig;
    }

    // Check app.config file in app folder
    appConfigFile = path.join(process.cwd(), APP_CONFIG_FILENAME);  // Developpement mode
    if (fs.existsSync(appConfigFile)) {

        // Dev mode
        appConfig.isDevMode = true;
        appConfig.userFolder = path.join(process.cwd(), "data");
        if (!fs.existsSync(appConfig.userFolder)) {
            fs.mkdirSync(appConfig.userFolder);
        }
        appConfig.userFolder = path.join(appConfig.userFolder, env || appConfig.env);

    } else {

        // Create app user folder
        switch (process.platform) {
            case "win32":
                appConfig.userFolder = process.env.USERPROFILE;
                break;
            default: // linux / osx
                appConfig.userFolder = process.env.HOME;
                break;
        }
        appConfig.userFolder = path.join(appConfig.userFolder || __dirname, "." + APP_NAME.toLowerCase());

        // Config file
        appConfigFile = path.join(appConfig.userFolder, APP_CONFIG_FILENAME);

    }

    // Folder structure
    if (!fs.existsSync(appConfig.userFolder)) {
        fs.mkdirSync(appConfig.userFolder);
        fs.mkdir(path.join(appConfig.userFolder,"parser"));
        fs.mkdir(path.join(appConfig.userFolder,"log"));
    }

    // Config file
    if (fs.existsSync(appConfigFile)) {
        config =  require(appConfigFile);
        appConfig.env = env || config.env;
        appConfig.database = config.database;
        appConfig.http = config.http;
    } else {
        updateConfig();
    }

    configReady = true;
    return appConfig;
}

/**
 * Return the specified config environnement.
 *
 * @param env
 * @returns {*}
 */
function getConfig(env) {
    initConfig(env);
    if (env === undefined || env === appConfig.env) {
        return appConfig;
    }
    return setConfig(env);
}

/**
 * Update application  configuration file.
 */
function updateConfig() {
    var savConf = {};
    savConf.env = appConfig.env;
    savConf.database = appConfig.database;
    savConf.http = appConfig.http;
    fs.writeFile(appConfigFile, JSON.stringify(savConf));
}

/**
 * Get the Database config.
 *
 * @param env
 * @returns {*}
 */
function getDatabase(env) {
    initConfig(env);
    var dbConf = appConfig.database[env || appConfig.env], folder;
    if (dbConf.options.storage !== undefined) {
        // Make db path relative to user app folder
        if (dbConf.options.storage.substr(0,1) !== "/" &&   // Linux complete path
            dbConf.options.storage.substr(1,1) !== ":" &&   // Windows complete path
            dbConf.options.storage.substr(0,1) !== ":"      // :memory: sqlite
            ) {
            dbConf.options.storage = path.join(appConfig.userFolder, dbConf.options.storage);
        }
        // Create db folder if not exist
        folder = path.dirname(dbConf.options.storage);
        if (!fs.existsSync(folder)) {
            fs.mkdir(folder);
        }
    }

    return dbConf;
}

/**
 * Get the http config.
 *
 * @param env
 * @returns {*}
 */
function getHttp(env) {
    initConfig(env);
    return appConfig.http[env || appConfig.env];
}

//select();
exports.setConfig = setConfig;
exports.getConfig = getConfig;
exports.getDatabase = getDatabase;
exports.getHttp = getHttp;