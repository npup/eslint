/**
 * @fileoverview Rule to enforce the number of spaces after certain keywords
 * @author Nick Fisher
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var eslint = require("../../../lib/eslint"),
    ESLintTester = require("eslint-tester");

var eslintTester = new ESLintTester(eslint);
eslintTester.addRuleTest("lib/rules/space-after-keywords", {
    valid: [
        { code: "switch (a){ default: break; }", args: [1] },
        { code: "if (a) {}", args: [1] },
        { code: "if (a) {} else {}", args: [1] },
        { code: "for (;;){}", args: [1] },
        { code: "while (true) {}", args: [1]},
        { code: "do {} while (true);", args: [1]},
        { code: "try {} catch (e) {}", args: [1]},
        { code: "with (a) {}", args: [1]},
        { code: "if(a) {}", args: [1, "never"]},
        { code: "if(a){}else{}", args: [1, "never"]}
    ],
    invalid: [
        { code: "if (a) {} else if(b){}", args: [1], errors: [{ message: "Keyword \"if\" must be followed by whitespace.", type: "IfStatement" }] },
        { code: "if (a) {} else{}", args: [1], errors: [{ message: "Keyword \"else\" must be followed by whitespace." }] },
        { code: "switch(a){ default: break; }", errors: [{ message: "Keyword \"switch\" must be followed by whitespace.", type: "SwitchStatement" }] },
        { code: "if(a){}", errors: [{ message: "Keyword \"if\" must be followed by whitespace.", type: "IfStatement" }] },
        { code: "do{} while (true);", args: [1], errors: [{ message: "Keyword \"do\" must be followed by whitespace.", type: "DoWhileStatement" }]},
        { code: "if (a) {}", args: [1, "never"], errors: [{ message: "Keyword \"if\" must not be followed by whitespace.", type: "IfStatement" }]},
        { code: "if(a){}else {}", args: [1, "never"], errors: [{ message: "Keyword \"else\" must not be followed by whitespace." }]}
    ]
});
