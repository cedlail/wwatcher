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
var request = require("../lib/requestq");
var testSuite = {};

testSuite.setUp =
    function(done) {
        config.setConfig("test");
        done();
    };


testSuite.requestWithJsDomJquery =
    function (test) {

        test.expect(1);
        console.log("\n");

        var requestsCount = 0, i,
            responsesCount = 0,
            ok = 0,
            requestUrls, testCount, iterCount;

        iterCount = 1;
        requestUrls = [
            "http://www.google.fr",
            "http://www.t411.me/top/100/",
            "http://sequelizejs.com/",
            "https://npmjs.org/package/connect",
            "http://nodejs.org/api/globals.html",
            "http://www.infoworld.com/",
            "https://github.com/",
            "http://yeoman.io/community-generators.html",
            "http://knockoutjs.com/",
            "http://browserify.org/"
        ];
        testCount = requestUrls.length * iterCount;

        function testUrl(url) {
            requestsCount += 1;
            //console.log("\t%s/%s Add request for %s", requestsCount, testCount, url);
            request.appQueue
                .requestToJQuery(url)
                .then(
                    function responseOk(result) {
                        if (result !== undefined && result.window !== undefined) {
                            if (result.$ !== undefined && typeof result.$ === "function") {
                                if (result.$("script").length > 0) {
                                    ok += 1;
                                    //console.log("==> OK");
                                }
                            }
                            if (typeof result.window.close === "function") {
                                result.window.close();
                            }
                        }
                    },
                    function error(err) {
                        console.error("ERROR ** ", err);
                    }
                )
                .done(
                    function () {
                        responsesCount += 1;
                        //console.log("Done %s/%s", responsesCount, testCount);
                        if (requestsCount === testCount &&
                            responsesCount === testCount) {
                            console.log("Test complete with %s/%s\n", ok, testCount);
                            test.ok(ok === testCount, "Some requests where loosed.");
                            test.done();
                        }
                    }
                );
        }

        console.log("Start %s requests", testCount);
        request.appQueue.setMaxRequest(5);
        for (i = 1; i <= iterCount; i += 1) {
            requestUrls.forEach(testUrl);
        }

    };

testSuite.requestNodeJsVersion =
    function (test) {

        request.appQueue
            .requestToJQuery("http://nodejs.org/")
            .then(
                function responseOk(result) {
                    if (result !== undefined && result.window !== undefined) {
                        if (result.$ !== undefined && typeof result.$ === "function") {

                            var $ = result.$, version;

                            version = $("div#intro p:contains('Current Version:')").text().substr(17);

                            console.log("Node js version : ", version);
                            test.ok(
                                version !== undefined && version !== "",
                                "Node js index page version read is undefined or empty.\n" + result.page
                            );
                            test.done();

                        }
                        if (typeof result.window.close === "function") {
                            result.window.close();
                        }
                    }
                },
                function error(err) {
                    console.error("ERROR ** ", err);
                }
            );
    };

exports.requestTestSuite = testSuite;