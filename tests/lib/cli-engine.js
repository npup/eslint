/**
 * @fileoverview Tests for cli.
 * @author Ian Christian Myers
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    CLIEngine = require("../../lib/cli-engine"),
    path = require("path");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("CLIEngine", function() {

    describe("executeOnFiles", function() {

        var engine;

        afterEach(function() {
            process.eslintCwd = null;
        });

        it("should report zero messages when given a config file and a valid file", function() {

            engine = new CLIEngine({
                configFile: path.join(__dirname, "..", ".eslintrc")
            });

            var report = engine.executeOnFiles(["lib/cli.js"]);

            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 0);
        });

        it("should return one error message when given a config with rules with options and severity level set to error", function() {

            engine = new CLIEngine({
                configFile: "tests/fixtures/configurations/quotes-error.json",
                reset: true
            });

            var report = engine.executeOnFiles(["tests/fixtures/single-quoted.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 1);
            assert.equal(report.results[0].messages[0].ruleId, "quotes");
            assert.equal(report.results[0].messages[0].severity, 2);
        });

        it("should return two messages when given a config file and a directory of files", function() {

            engine = new CLIEngine({
                configFile: "tests/fixtures/configurations/semi-error.json",
                reset: true
            });

            var report = engine.executeOnFiles(["tests/fixtures/formatters"]);
            assert.equal(report.results.length, 2);
            assert.equal(report.results[0].messages.length, 0);
            assert.equal(report.results[1].messages.length, 0);
        });

        it("should return zero messages when given a config with environment set to browser", function() {

            engine = new CLIEngine({
                configFile: "tests/fixtures/configurations/env-browser.json",
                reset: true
            });

            var report = engine.executeOnFiles(["tests/fixtures/globals-browser.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 0);
        });

        it("should return zero messages when given a config with environment set to Node.js", function() {

            engine = new CLIEngine({
                configFile: "tests/fixtures/configurations/env-node.json",
                reset: true
            });

            var report = engine.executeOnFiles(["tests/fixtures/globals-node.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 0);
        });

        it("should not return results from previous call when calling more than once", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                rules: {
                    semi: 2
                }
            });

            var report = engine.executeOnFiles(["tests/fixtures/missing-semicolon.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "tests/fixtures/missing-semicolon.js");
            assert.equal(report.results[0].messages.length, 1);
            assert.equal(report.results[0].messages[0].ruleId, "semi");
            assert.equal(report.results[0].messages[0].severity, 2);


            report = engine.executeOnFiles(["tests/fixtures/passing.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "tests/fixtures/passing.js");
            assert.equal(report.results[0].messages.length, 0);

        });

        it("should return zero messages when given a directory with eslint excluded files in the directory", function() {

            engine = new CLIEngine({
                ignorePath: "tests/fixtures/.eslintignore"
            });

            var report = engine.executeOnFiles(["tests/fixtures/"]);
            assert.equal(report.results.length, 0);
        });

        it("should return zero messages when given a file in excluded files list", function() {

            engine = new CLIEngine({
                ignorePath: "tests/fixtures/.eslintignore"
            });

            var report = engine.executeOnFiles(["tests/fixtures/passing"]);
            assert.equal(report.results.length, 0);

        });

        it("should return two messages when given a file in excluded files list while ignore is off", function() {

            engine = new CLIEngine({
                ignorePath: "tests/fixtures/.eslintignore",
                ignore: false,
                reset: true,
                rules: {
                    "no-undef": 2
                }
            });

            var report = engine.executeOnFiles(["tests/fixtures/undef.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "tests/fixtures/undef.js");
            assert.equal(report.results[0].messages[0].ruleId, "no-undef");
            assert.equal(report.results[0].messages[0].severity, 2);
            assert.equal(report.results[0].messages[1].ruleId, "no-undef");
            assert.equal(report.results[0].messages[1].severity, 2);
        });

        it("should return zero messages when executing a file with a shebang", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true
            });

            var report = engine.executeOnFiles(["tests/fixtures/shebang.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 0);
        });


        it("should thrown an error when loading a custom rule that doesn't exist", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                rulesPaths: ["./tests/fixtures/rules/wrong"],
                configFile: "./tests/fixtures/rules/eslint.json"
            });


            assert.throws(function() {
                engine.executeOnFiles(["tests/fixtures/rules/test/test-custom-rule.js"]);
            }, /Definition for rule 'custom-rule' was not found/);

        });

        it("should thrown an error when loading a custom rule that doesn't exist", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                rulePaths: ["./tests/fixtures/rules/wrong"],
                configFile: "./tests/fixtures/rules/eslint.json"
            });


            assert.throws(function() {
                engine.executeOnFiles(["tests/fixtures/rules/test/test-custom-rule.js"]);
            }, /Error while loading rule 'custom-rule'/);
        });

        it("should return one message when a custom rule matches a file", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                rulePaths: ["./tests/fixtures/rules/"],
                configFile: "./tests/fixtures/rules/eslint.json"
            });

            var report = engine.executeOnFiles(["tests/fixtures/rules/test/test-custom-rule.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "tests/fixtures/rules/test/test-custom-rule.js");
            assert.equal(report.results[0].messages.length, 2);
            assert.equal(report.results[0].messages[0].ruleId, "custom-rule");
            assert.equal(report.results[0].messages[0].severity, 1);
        });

        it("should return messages when multiple custom rules match a file", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                rulePaths: [
                    "./tests/fixtures/rules/dir1",
                    "./tests/fixtures/rules/dir2"
                ],
                configFile: "./tests/fixtures/rules/multi-rulesdirs.json"
            });

            var report = engine.executeOnFiles(["tests/fixtures/rules/test-multi-rulesdirs.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "tests/fixtures/rules/test-multi-rulesdirs.js");
            assert.equal(report.results[0].messages.length, 2);
            assert.equal(report.results[0].messages[0].ruleId, "no-literals");
            assert.equal(report.results[0].messages[0].severity, 2);
            assert.equal(report.results[0].messages[1].ruleId, "no-strings");
            assert.equal(report.results[0].messages[1].severity, 2);
        });

        it("should return zero messages when executing with reset flag", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                useEslintrc: false
            });

            var report = engine.executeOnFiles(["./tests/fixtures/missing-semicolon.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "./tests/fixtures/missing-semicolon.js");
            assert.equal(report.results[0].messages.length, 0);
        });

        it("should return zero messages when executing with reset flag in Node.js environment", function() {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                useEslintrc: false,
                envs: ["node"]
            });

            var report = engine.executeOnFiles(["./tests/fixtures/process-exit.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "./tests/fixtures/process-exit.js");
            assert.equal(report.results[0].messages.length, 0);
        });


        it("should return zero messages and ignore local config file when executing with no-eslintrc flag", function () {

            engine = new CLIEngine({
                ignore: false,
                reset: true,
                useEslintrc: false,
                envs: ["node"]
            });

            var report = engine.executeOnFiles(["./tests/fixtures/eslintrc/quotes.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "./tests/fixtures/eslintrc/quotes.js");
            assert.equal(report.results[0].messages.length, 0);
        });

        it("should return zero messages when executing with local config file", function () {

            engine = new CLIEngine({
                ignore: false,
                reset: true
            });

            var report = engine.executeOnFiles(["./tests/fixtures/eslintrc/quotes.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].filePath, "./tests/fixtures/eslintrc/quotes.js");
            assert.equal(report.results[0].messages.length, 1);
        });

        // These tests have to do with https://github.com/eslint/eslint/issues/963

        // it("should return zero messages when executing with global node flag", function () {

        //     engine = new CLIEngine({
        //         ignore: false,
        //         reset: true,
        //         useEslintrc: false,
        //         configFile: "./conf/eslint.json",
        //         envs: ["node"]
        //     });

        //     var files = [
        //         "./tests/fixtures/globals-node.js"
        //     ];

        //     var report = engine.executeOnFiles(files);
        //     console.dir(report.results[0].messages);
        //     assert.equal(report.results.length, 1);
        //     assert.equal(report.results[0].filePath, files[0]);
        //     assert.equal(report.results[0].messages.length, 1);
        // });

        // it("should return zero messages when executing with global env flag", function () {

        //     engine = new CLIEngine({
        //         ignore: false,
        //         reset: true,
        //         useEslintrc: false,
        //         configFile: "./conf/eslint.json",
        //         envs: ["browser", "node"]
        //     });

        //     var files = [
        //         "./tests/fixtures/globals-browser.js",
        //         "./tests/fixtures/globals-node.js"
        //     ];

        //     var report = engine.executeOnFiles(files);
        //     console.dir(report.results[1].messages);
        //     assert.equal(report.results.length, 2);
        //     assert.equal(report.results[0].filePath, files[0]);
        //     assert.equal(report.results[0].messages.length, 1);
        //     assert.equal(report.results[1].filePath, files[1]);
        //     assert.equal(report.results[1].messages.length, 1);

        // });

        // it("should return zero messages when executing with env flag", function () {
        //     var files = [
        //         "./tests/fixtures/globals-browser.js",
        //         "./tests/fixtures/globals-node.js"
        //     ];

        //     it("should allow environment-specific globals", function () {
        //         cli.execute("--reset --no-eslintrc --config ./conf/eslint.json --env browser,node --no-ignore " + files.join(" "));

        //         assert.equal(console.log.args[0][0].split("\n").length, 9);
        //     });

        //     it("should allow environment-specific globals, with multiple flags", function () {
        //         cli.execute("--reset --no-eslintrc --config ./conf/eslint.json --env browser --env node --no-ignore " + files.join(" "));
        //         assert.equal(console.log.args[0][0].split("\n").length, 9);
        //     });
        // });

        // it("should return zero messages when executing without env flag", function () {
        //     var files = [
        //         "./tests/fixtures/globals-browser.js",
        //         "./tests/fixtures/globals-node.js"
        //     ];

        //     it("should not define environment-specific globals", function () {
        //         cli.execute("--reset --no-eslintrc --config ./conf/eslint.json --no-ignore " + files.join(" "));
        //         assert.equal(console.log.args[0][0].split("\n").length, 12);
        //     });
        // });

        // it("should return zero messages when executing with global flag", function () {
        //     it("should default defined variables to read-only", function () {
        //         var exit = cli.execute("--global baz,bat --no-ignore ./tests/fixtures/undef.js");

        //         assert.isTrue(console.log.calledOnce);
        //         assert.equal(exit, 1);
        //     });

        //     it("should allow defining writable global variables", function () {
        //         var exit = cli.execute("--reset --global baz:false,bat:true --no-ignore ./tests/fixtures/undef.js");

        //         assert.isTrue(console.log.notCalled);
        //         assert.equal(exit, 0);
        //     });

        //     it("should allow defining variables with multiple flags", function () {
        //         var exit = cli.execute("--reset --global baz --global bat:true --no-ignore ./tests/fixtures/undef.js");

        //         assert.isTrue(console.log.notCalled);
        //         assert.equal(exit, 0);
        //     });
        // });

        it("should return zero messages when supplied with rule flag and severity level set to error", function() {

            engine = new CLIEngine({
                configFile: "tests/fixtures/configurations/env-browser.json",
                reset: true,
                rules: {
                    quotes: [2, "double"]
                }
            });

            var report = engine.executeOnFiles(["tests/fixtures/single-quoted.js"]);
            assert.equal(report.results.length, 1);
            assert.equal(report.results[0].messages.length, 1);
            assert.equal(report.results[0].messages[0].ruleId, "quotes");
            assert.equal(report.results[0].messages[0].severity, 2);
        });





    });



});
