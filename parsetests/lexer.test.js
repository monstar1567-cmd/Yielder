const tokenize = require('../lexer');

const src = `if i == 2 {
    print "B";
}`;

console.table(tokenize(src));