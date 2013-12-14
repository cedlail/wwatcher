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

var util = require("util");
var config = require("../lib/config");
var parser = require("../lib/parser");
var testSuite = {};

testSuite.setUp =
    function(done) {
        config.setConfig("test");
        done();
    };


testSuite.loadModule =
    function (test) {
        test.expect(1);
        test.ok(parser !== undefined, "Parser module is undefined");
        test.done();
    };

testSuite.callParserNodeJsVersion =
    function (test) {

        test.expect(1);

        parser.execute(
            "NodeJSVersion",
            undefined,
            function (event, arg, result) {

                if (event === "error") {
                    console.error("Error => ", arg);
                    test.ok(
                        false,
                        "Parser NodeJsVersion emit an error event : \n" +
                            util.inspect(arg)
                    );
                }
                if (event === "progress") {
                    console.log("event => ", event);
                }
                if (event === "done") {
                    console.log(
                        "OK => ",
                        util.inspect(result)
                    );
                    test.ok(true);
                    test.done();
                }
            }
        );

    };

testSuite.callT411ParserTop100 = function (test) {

    var options = {
            url: "http://www.t411.me/top/100/",
            noDateFilter: true
        };

    parser.execute(
        "t411",
        options,
        function (event, arg, result) {
            if (event === "error") {
                console.error("Error => ", arg);
                test.ok(
                    false,
                    "Parser t411 emit an error event : \n" +
                        util.inspect(arg)
                );
            }
//            if (event === "progress") {
//                console.log("Progress => %s/%s", arg, result);
//            }
            if (event === "done") {
                console.log(
                    "OK => ",
                    util.inspect(result)
                );
                test.ok(true);
                test.done();
            }
        }
    );



};

exports.parserTestSuite = testSuite;