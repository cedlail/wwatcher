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
var api = require("../lib/api");
var serverStarted = false;
var testSuite = {};
var http = require("http");
var httpConf;

testSuite.setUp =
    function(done) {

        if (!serverStarted) {

            config.setConfig("test");
            httpConf = config.getHttp();

            // Start server
            api.server.start();
            serverStarted = true;

            // Wait 1s
            setTimeout(
                done,
                1000
            );

        } else {
            done();
        }

    };

function getUrl(service, params, isProtected) {

    var url;

    url = "http://localhost:" + httpConf.port + httpConf.restContext + "/" + service ;

    return url;
}

function testGetAll(test, serviceName) {

    http.get(
        getUrl(serviceName),
        function(res) {
            //console.log("Reponse du serveur:");
            //console.log("    STATUS: " + res.statusCode);
            //console.log("    HEADERS: " + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on("data", function (chunk) {
                console.log("    BODY: " + chunk);

                var response;

                try {
                    response = JSON.parse(chunk);
                } catch (ex) {
                    test.ok(false, serviceName + " rest service is not responding a json text : " + chunk);
                    test.done();
                    return;
                }

                test.ok(Array.isArray(response), serviceName + " rest service is not responding a json array");
                test.done();

            });
        })
        .on('error', function(e) {
            console.error("Erreur du serveur.", e.message);
            test.ok(false, serviceName + " rest service error " + e.message);
            test.done();
        })
        .end();

}

testSuite.parser_getall =
    function (test) {
        test.expect(1);
        testGetAll(test, "parser");
    };
testSuite.url_getall =
    function (test) {
        test.expect(1);
        testGetAll(test, "url");
    };
testSuite.urlitem_getall =
    function (test) {
        test.expect(1);
        testGetAll(test, "urlitem");
    };
testSuite.urldata_getall =
    function (test) {
        test.expect(1);
        testGetAll(test, "urldata");
    };
testSuite.urlparam_getall =
    function (test) {
        test.expect(1);
        testGetAll(test, "urlparameter");
    };


//testSuite.url_addd = function () {
//    test.expect(1);
//
//    test
//
//};


testSuite.dummy_test_for_stop_server =
    function (test) {
        test.expect(1);
        setTimeout(
            function () {
                api.server.stop();//true);
            },
            1000
        );
        test.ok(true, "Arret du server");
        test.done();
    };

exports.configTestSuite = testSuite;