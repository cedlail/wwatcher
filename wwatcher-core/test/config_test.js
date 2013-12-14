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
var testConfig;
var testSuite = {};

testSuite.setUp =
    function(done) {

        if (testConfig === undefined) {
            testConfig = config.setConfig("test");
        }

        done();
    };

testSuite.hello =
    function (test) {
        test.expect(1);
        test.ok(testConfig !== undefined && testConfig.env === "test", "Config module is undefined");
        test.done();

    };



exports.configTestSuite = testSuite;