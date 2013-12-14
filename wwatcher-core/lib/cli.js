/**
 *  Command line interface module
 */

"use strict";

var domain = require('domain'),
    optimist = require("optimist"),
    __ = require("./i18n"),
    util = require("./utils"),
    api = require("./api"),
    args,
    command,
    commandArgs;

/******************************************************************************
 ***    COMMAND LINE PARSE AND HELP
 ******************************************************************************/

function showHelp() {
    var helpHeader;
    // Extend help items
    helpHeader = [
        __("cli.help.title"),
        __("cli.help.usage"),
        __("cli.help.command.title"),
        __("cli.help.command.list"),
        __("cli.help.command.update")
    ].join("\n");
    optimist
        .usage(helpHeader)
        .describe("e", __("cli.help.options.env"))
        .describe("h", __("cli.help.options.help"))
        .describe("f", __("cli.help.options.force"));
    // Display in console
    console.log(optimist.help());
}
function processArguments() {
    // Define options
    optimist
        .string("e")
        .alias("e", "env")
        .boolean("h")
        .alias("h", "help")
        .boolean("f")
        .alias("f", "force");
    // Parse options
    args = optimist.argv;
    // Extract command
    if (args._.length > 0) {
        command = args._[0];
        commandArgs = args._.slice(1);
    }
    // Help ?
    if (args.h || args.help) {
        showHelp();
    } else {
        if (command === undefined) {
            console.error(__("cli.error.nocommand"));
            showHelp();
        }
    }
}


/******************************************************************************
 ***    COMMAND IMPLEMENT
 ******************************************************************************/

var funcs = {

    list: function list() {
        api.parser.get().then(
            function (parsers) {
                if (parsers.length === 0) {
                    console.log(__("cli.parser.list.noparser"));
                } else {
                    parsers.forEach(
                        function (parser) {
                            console.log("\t %s \t %s \t %s", parser.id, parser.name, parser.description);
                        }
                    );
                }
            }
        );
    },

    server: function server(subCommand) {
        if (subCommand === undefined) {
            // Get status is default sub-command
            subCommand = "status";
        }
        subCommand = subCommand.toLowerCase();
        switch (subCommand) {
        case "start":
            api.server.start();
            break;
        case "stop":
            api.server.stop(args.f || args.force || 30);
            break;
        case "status":
            api.server.getStatus(
                function (response) {
                    console.log(
                        __("cli.server.status"),
                        response
                    );
                }
            );
            break;
        }
    }

};



/******************************************************************************
 ***    CLI ENTRY POINT
 ******************************************************************************/

function invokeCommande(command, commandArgs) {
    var functionName;

    functionName = command.trim().toLowerCase();

    if (funcs.hasOwnProperty(functionName) && typeof funcs[functionName] === "function" ) {
        funcs[functionName].apply(undefined, commandArgs);
    } else {
        throw "CLI_UNKNOW_COMMAND";
    }

}

function main() {

    // Parse command line arguments
    processArguments();

    // Run command
    if (command !== undefined) {

        console.log("----------------------------------------------");
        console.log(__("cli.help.title"));
        console.log("----------------------------------------------");
        console.log("Commande : ", command);
        console.log("Commande arguments : ", commandArgs);
        console.log("Options : ", JSON.stringify(args));
        console.log("----------------------------------------------");

        // Select environement
        if (args.e || args.env) {
            console.log(__("cli.env.select"), args.e || args.env);
        }

        invokeCommande(command, commandArgs);
    }
}

// Start cli in new domain
var d = domain.create();
d.on("error", function(er) {
    //util.dumpEx(er);
    console.log("Erreur", er);
    console.ex(er);
});
d.run(main);