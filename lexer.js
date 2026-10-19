// quake lexer/tokenizer


// define keywords
const keywords = {
    var: "Variable",
    func: "Function",
    main: "Main",
    if: "If",
    elseif: "ElseIf",
    else: "Else",
    print: "Print",
    rtn: "Return",
    match: "Match",
    case: "Case",
    fails: "Fails",
    while: "While",
    repeat: "Repeat",

    not: "UnaryOperator",
    or: "LogicOperator",
    and: "LogicOperator",
    xor: "LogicOperator",
    nor: "LogicOperator",
    nand: "LogicOperator",
    xnor: "LogicOperator",

    mod: "BinaryOperator",

    true: "BooleanLiteral",
    false: "BooleanLiteral",
    none: "NoneLiteral"
}


// with a string, produce an array of tokens
/**
 * @param {string} sourceCode 
 */
module.exports = function tokenize(sourceCode) {
    const tokens = [];
    // split the string into single-character strings
    const src = sourceCode.split("");

    // get the lines and columns
    let line = 1;
    let column = 1;

    // make a function to increase the column count and remove a letter
    function next() {
        column++;
        return src.shift();
    }
    
    // parse until theres no more letters
    Main: while (src.length > 0) {
        // skippable characters

        if (src[0] == "#") {
            src.shift();
            while (src[0] != "\n") {
                src.shift();
            }
            src.shift();
            continue Main;
        }

        else if (src[0] == " " || src[0] == "\n" || src[0] == "\t" || src[0] == "\r") {
            if (src[0] == "\n") {
                // if the letter is a ln character, increase line count and reset column count
                line++;
                column = 1;
            }
            next();
            continue Main;
        }

        // binary operators ( + - * / )
        else if (
            src[0] == "+" ||
            src[0] == "-" ||
            src[0] == "*" ||
            src[0] == "/" ||
            src[0] == "^"
        ) {
            tokens.push({value: next(), type: "BinaryOperator"});
            continue Main;
        }

        // comparison operators ( == <= >= < > !=)
        else if (
            (src[0] == "=" && src[1] == "=") ||
            (src[0] == "<" && src[1] == "=") ||
            (src[0] == ">" && src[1] == "=") ||
            (src[0] == "!" && src[1] == "=")
        ) {
            tokens.push({value: next() + next(), type: "CompareOperator"});
            continue Main;
        }

        else if (
            src[0] == ">" || src[0] == "<"
        ) {
            tokens.push({value: next(), type: "CompareOperator"});
            continue Main;
        }

        // single character misc operators
        else if (
            src[0] == "(" ||
            src[0] == ")" ||
            src[0] == "{" ||
            src[0] == "}" ||
            src[0] == "," ||
            src[0] == "." ||
            src[0] == ":" ||
            src[0] == ";" ||
            src[0] == "="
        ) {
            const s = next();;
            tokens.push({value: s, type: s});
            continue Main;
        }

        else {
            // identifiers
            if (src[0].toUpperCase() != src[0].toLowerCase()) {
                let id = "";
                while (src.length > 0 && src[0].toUpperCase() != src[0].toLowerCase()) {
                    id += next();
                }

                /**
                 * @type {string}
                 */
                const reserved = keywords[id];
                if (reserved != undefined) {
                    tokens.push({value: id, type: reserved});
                } else {
                    tokens.push({value: id, type: "Identifier"});
                }
                continue Main;
            }

            // strings (double quotes)
            else if (src[0] == '"') {
                let str = next();
                while (src.length > 0 && src[0] != '"') {
                    str += next();
                }

                if (src.length > 0) {
                    str += next();
                } else {
                    console.error(`SYNTAXERROR: Unterminated string literal. [${line}:${column}]`);
                    process.exit(1);
                }
                tokens.push({value: str, type: "StringLiteral"});
                continue Main;
            }

            // strings (single quotes)
            else if (src[0] == "'") {
                let str = next();
                while (src.length > 0 && src[0] != "'") {
                    str += next();
                }

                if (src.length > 0) {
                    str += next();
                } else {
                    console.error(`SYNTAXERROR: Unterminated string literal. [${line}:${column}]`);
                    process.exit(1);
                }
                tokens.push({value: str, type: "StringLiteral"});
                continue Main;
            }

            // numbers (specifically integers)
            else if (!isNaN(parseInt(src[0]))) {
                let num = ''
                while (src.length > 0 && !isNaN(parseInt(src[0]))) {
                    num += next();
                }

                tokens.push({value: num, type: "NumberLiteral"});
                continue Main;
            }

            // if all else fails, throw an error
            else {
                throw `SYMBOLERROR: Unrecognized symbol "${src[0]}" [${line}:${column}]`;
            }
        }
    }

    tokens.push({value: "<eof>", type: "EOF"});
    return tokens;
}