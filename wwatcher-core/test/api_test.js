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

var api;
var util = require("util");
var testSuite = {};
var injectOK = false;

testSuite.setUp = function (done) {

    if (!injectOK) {

        config.setConfig("test");

        //done();
        require("../lib/db").create(
            function (db) {
                db.Parser
                    .bulkCreate(
                        [
                            {name: "Update1", label: "UnitTest parser Update1", isBundled: false },
                            {name: "Update2", label: "UnitTest parser Update2", isBundled: false }
                        ]
                    )
                    .then(
                        function () {
                            api = require("../lib/api");
                            injectOK = true;
                            done();
                        },
                        function (error) {
                            console.error("ERROR loading test data for api_test", error);
                    }
                );
            }
        );

    } else {
        done();
    }

};


testSuite.parser_get_all =
    function (test) {

        test.expect(1);

        api.parser
            .get()
            .then(
                function (parsers) {

                    test.ok(
                        parsers !== undefined && Array.isArray(parsers),
                        "Parser.get() must return an array => " + (typeof parsers)
                    );

                    test.done();
                },
                function (error) {
                    console.error(error);
                    test.ok(false, "Error in api.parser.get" + error);
                    test.done();
                }
            );

    };

testSuite.parser_create =
    function (test) {

        test.expect(1);

        api.parser
            .create(
                {
                    name: "Test_parser_create",
                    label: "Test_parser_create",
                    description: "descro",
                    isBundled: false
                }
            )
            .then(
                function (parser) {

                    test.ok(
                        parser !== undefined && parser.name === "Test_parser_create",
                        "Model Parser.create() must return the parser created => " + util.inspect(parser)
                    );

                    test.done();
                },
                function (err) {

                    test.ok(
                        false,
                        "Model Parser.create() error => " + util.inspect(err)
                    );

                    test.done();
                }
            );

    };

testSuite.parser_update =
    function (test) {

        test.expect(1);

        var id;

        api.parser
            .get(
                undefined,
                { where: { name: "Update1" } }
            )
            .then(
                function (parserForUpdate) {
                    id = parserForUpdate[0].id;
                    parserForUpdate[0].name = "Update1_Updated";
                    return api.parser.update(id, parserForUpdate[0]);
                }
            )
            .then(
                function () {
                    return api.parser.get(id);
                }
            )
            .then(
                function(parserUpdated) {
                    test.ok(
                        parserUpdated !== undefined &&
                            parserUpdated.id === id &&
                            parserUpdated.name === "Update1_Updated",
                        "Model get/update/get must return the parser with update => " +
                            util.inspect(parserUpdated || "undefined")
                    );
                    test.done();
                }
            );
    };

testSuite.parser_update2 =
    function (test) {

        test.expect(1);

        var id;

        api.parser
            .get(
                undefined,
                { where: { name: "Update2"  } }
            )
            .then(
                function (parser) {
                    id = parser[0].id;
                    return api.parser.update(
                        id,
                        { name: "Update2_Updated" }
                    );
                }
            )
            .then(
                function (updatedItem) {
                    console.log("Updated ", updatedItem.name);
                    return api.parser.get(id);
                },
                function error(err) {
                    console.error(err);
                }
            )
            .then(
                function (parserUpdated) {
                    test.ok(
                        parserUpdated !== undefined &&
                            parserUpdated.id === id &&
                            parserUpdated.name === "Update2_Updated",
                        "Model Parser update/get must return the parser with update => " +
                            util.inspect(parserUpdated || "undefined")
                    );
                    test.done();
                }
            );
    };

testSuite.url_add =
    function (test) {

        test.expect(1);

        api.url
            .add(
                {
                    parser: "update1",
                    label: "watch1",
                    url: "http://www.google.fr"
                }
            )
            .then(
                function addOk() {
                    test.ok(true, "");
                    test.done();
                },
                function addErr(err) {
                    test.ok(false, "Error " + util.inspect(err));
                    test.done();
                }
            );
    };

exports.apiTestSuite = testSuite;