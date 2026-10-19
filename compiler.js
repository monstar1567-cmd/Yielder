const Environment = require('./env');

function compProgram(ast, env) {
    lastEval = null;

    for (const stmt of ast.body) {
        lastEval = compile(stmt, env);
    }

    return lastEval;
}

function compBinary(ast, env) {
    const left = compile(ast.left, env);
    const right = compile(ast.right, env);
    if (typeof left === "number" && typeof right === "number") {
        return compNumBinary(left, right, ast.operator);
    } else if (typeof left === "string" || typeof right === "string") {
        return compStrBinary(left, right, ast.operator);
    } else {
        return null;
    }
}

function compStrBinary(l, r, o) {
    l = l.toString();
    r = r.toString();
    if (o === "+") {
        return l + r;
    } else {
        return null;
    }
}

function compNumBinary(l, r, o) {
    if (o === "+") {
        return l + r;
    } else if (o === "-") {
        return l - r;
    } else if (o === "*") {
        return l * r;
    } else if (o === "/") {
        if (r == 0) {
            return NaN;
        }
        return l / r;
    } else if (o === "mod") {
        if (r == 0) {
            return NaN;
        }
        return l % r;
    } else if (o === "^") {
        return l ** r;
    } else {
        return null;
    }
}

function compNot(ast, env) {
    const operand = compile(ast.operand, env);
    return !operand;
}

function compIdentifier(ast, env) {
    const symb = env.get(ast.symbol);

    return symb;
}

function compVarDec(ast, env) {
    const value = ast.value
        ? compile(ast.value, env)
        : null

    return env.declare(ast.identifier, value);
}

function compAssignment(ast, env) {
    if (ast.assignee.type !== "Identifier") {
        throw "assignment error";
    }
    const value = compile(ast.value, env);
    return env.assign(ast.assignee.symbol, value);
}

function compTable(ast, env) {
    const props = new Map();

    for (const {key, value} of ast.items) {
        const rtValue = compile(value, env);
        props.set(key, rtValue);
    }

    return props;
}

function compMember(ast, env) {
    let table = compile(ast.table, env);
    if (typeof table !== "object") {
        throw "table error";
    }

    const member = ast.property.value;

    if (!table.has(member)) {
        throw "ref error";
    }

    return table.get(member);
}

function compFunction(ast, env) {
    const fn = {
        type: "Function",
        name: ast.name,
        parameters: ast.parameters,
        body: ast.body,
        env
    };

    env.declare(ast.name, fn);
}

function compCall(ast, env) {
    const args = ast.args.map((arg) => compile(arg, env));
    const fn = compile(ast.caller, env);

    if (fn.type == "BuiltIn") {
        const res = fn.call(args, env);
        return res;
    }

    if (fn.type == "Function") {
        const scope = new Environment(fn.env);

        for (let i = 0; i < fn.parameters.length; i++) {
            const name = fn.parameters[i];
            scope.declare(name.symbol, args[i]);
        }

        let res = undefined;

        for (const stmt of fn.body) {
            if (stmt.type == "Return") {
                res = compile(stmt.value, scope);
            } else {
                compile(stmt, scope);
            }
        }

        return res;
    }

    throw "call error";
}

function compLogic(ast, env) {
    const left = compile(ast.left, env);
    const right = compile(ast.right, env);
    if (ast.operator === "or") {
        return left || right;
    } else if (ast.operator === "and") {
        return left && right;
    } else if (ast.operator === "xor") {
        if (left) {
            if (right) {
                return false;
            } else {
                return true;
            }
        } else {
            if (right) {
                return true;
            } else {
                return false;
            }
        }
    } else if (ast.operator === "nor") {
        return !(left || right);
    } else if (ast.operator === "nand") {
        return !(left && right);
    } else if (ast.operator === "xnor") {
        if (left) {
            if (right) {
                return true;
            } else {
                return false;
            }
        } else {
            if (right) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        return null;
    }
}

function compCompare(ast, env) {
    const left = compile(ast.left, env);
    const right = compile(ast.right, env);

    if (ast.operator === "==") {
        return left === right;
    } else if (ast.operator === "!=") {
        return left !== right;
    } else if (ast.operator === ">") {
        return left > right;
    } else if (ast.operator === "<") {
        return left < right;
    } else if (ast.operator === ">=") {
        return left >= right;
    } else if (ast.operator === "<=") {
        return left <= right;
    } else {
        return null;
    }
}

function compIfStatement(ast, env) {
    let cond = compile(ast.condition, env);

    if (cond) {
        return compBody(ast.ifBody, env);
    }

    for (const elseif of ast.elseIfBlocks) {
        const eicond = compile(elseif.condition, env);

        if (eicond) {
            return compBody(elseif.body, env);
        }
    }

    if (ast.elseBlock) {
        return compBody(ast.elseBlock, env);
    }

    return undefined;
}

function compWhileStatement(ast, env) {
    let cond = compile(ast.condition, env);
    let body = compBody(ast.body, env);
    if (cond) {
        return compWhileStatement(ast, env);
    }
    return body;
}

function compRepeatStatement(ast, env) {
    let times = compile(ast.times, env);
    let res;
    for (let i = 0; i < times; i++) {
        res = compBody(ast.body, env);
    }
    return res;
}

function compBody(ast, env) {
    const scope = new Environment(env);

    let res;

    for (const stmt of ast) {
        res = compile(stmt, scope);
    }

    return res;
}

function compPrint(ast, env) {
    let value = compile(ast.value, env);
    if (value === null) {
        value = "none";
    }
    console.log(value);
}

function compMain(ast, env) {
    return compBody(ast.body, env);
}

function compMatch(ast, env) {
    const value = compile(ast.value, env);

    for (const scase of ast.cases) {
        let cvalue = compile(scase.value, env);
        if (value === cvalue) {
            return compBody(scase.body, env);
        }
    }

    if (ast.fails !== null) {
        return compBody(ast.fails.body, env);
    }

    return null;
}

function compile(ast, env) {
    switch (ast.type) {
        case "NumberLiteral":
        case "StringLiteral":
        case "BooleanLiteral":
        case "None":
            return ast.value;
        
        case "Identifier":
            return compIdentifier(ast, env);

        case "BinaryExpr":
            return compBinary(ast, env);
        
        case "LogicExpr":
            return compLogic(ast, env);

        case "CompareExpr":
            return compCompare(ast, env);

        case "NotExpr":
            return compNot(ast, env);

        case "VariableDeclaration":
            return compVarDec(ast, env);
        
        case "TableLiteral":
            return compTable(ast, env);

        case "MemberExpr":
            return compMember(ast, env);

        case "AssignmentExpr":
            return compAssignment(ast, env);

        case "FuncDeclaration":
            return compFunction(ast, env);
        
        case "CallExpr":
            return compCall(ast, env);
        
        case "IfStatement":
            return compIfStatement(ast, env);

        case "WhileStatement":
            return compWhileStatement(ast, env);

        case "RepeatStatement":
            return compRepeatStatement(ast, env);

        case "Print":
            return compPrint(ast, env);

        case "Main":
            return compMain(ast, env);

        case "Match":
            return compMatch(ast, env);

        case "Program":
            return compProgram(ast, env);

        default:
            throw "node error";
    }
}

module.exports = compile;