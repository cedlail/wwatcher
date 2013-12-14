/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

"use strict";

var config = require("../lib/config");
var db;
var testSuite = {};

testSuite.setUp =
    function(done) {
        if (db === undefined) {
            config.setConfig("test");
            require("../lib/db").create(
                function (dbInstance) {
                    db = dbInstance;
                    done();
                }
            );
        } else {
            done();
        }
    };

/**
 * dbVersion is defined
 * @param test
 */
testSuite.dbVersion =
    function(test) {

        test.expect(1);

        var dbVersion = db.getVersion();
        var dbVersionOk = dbVersion !== undefined && dbVersion !== "";

        test.ok(dbVersionOk, "dbVersion expected to be defined. => " + dbVersion);
        test.done();
    };

/**
* getAllDbInfo without error
* @param test
*/
testSuite.getAllDbInfo =
    function(test) {

        test.expect(1);

        db.DbInfo
            .all()
            .success(
                function (infos) {
                    console.log("infos = " + JSON.stringify(infos));
                    test.ok(true, "infos = " + JSON.stringify(infos));
                    test.done();
                }
            );

    };

/**
* insertParser Create a parser row
* @param test
*/
testSuite.insertParser =
    function(test) {

        test.expect(3);

        var name = "Test_" + (new Date()).getTime(),
            label = "Parser pour les tests",
            description = "Parser pour les tests";

        db.Parser
            .build( { name: name, label: label, description: description, isBundled: false } )
            .save()
            .success(
                function (parser) {
                    console.log("inserted parser = " + JSON.stringify(parser));
                    test.equal(
                        parser.name,
                        name,
                        "Insert parser ok but name altered"
                    );
                    test.equal(
                        parser.label,
                        label,
                        "Insert parser ok but label altered"
                    );
                    test.equal(
                        parser.description,
                        description,
                        "Insert parser ok but description altered"
                    );
                    test.done();
                }
            );

    };

/**
* insertParserList Create a parser row
* @param test
*/
testSuite.insertParserList =
    function(test) {

        test.expect(2);

        var name = "Test_" + (new Date()).getTime();
        var parsers = [], i, insertSize = 100;

        for (i = 1; i <= insertSize; i += 1) {
            parsers.push(
                {
                    name: name + "_" + i,
                    label: name + "_" + i,
                    description: "Parser pour les tests",
                    isBundled: false
                }
            );
        }

        db.Parser
            .bulkCreate(parsers)
            .success(
                function () {

                    test.ok(true, "Insert parser list ok");

                    db.Parser.count().success(
                        function (count) {
                            test.ok(count >= insertSize, "Table count after insert < Insert count");
                            test.done();
                        }
                    );
                }
            );

    };

/**
* parserNameMustBeUnique Create a parser row
* @param test
*/
testSuite.parserNameMustBeUnique =
    function(test) {

        test.expect(1);

        var name = "Test_" + (new Date()).getTime();
        var parsers = [], i, insertSize = 10;

        for (i = 1; i <= insertSize; i += 1) {
            parsers.push(
                {
                    name: name ,
                    label: name,
                    description: "Parser pour les tests",
                    isBundled: false
                }
            );
        }

        db.Parser
            .bulkCreate(parsers)
            .success(
                function () {
                    test.ok(false, "Insert two parser with same name must produce an error");
                    test.done();
                }
            )
            .error(
                function () {

                    test.ok(true, "");
                    test.done();
                }
            );

    };


exports.dbTestSuite = testSuite;