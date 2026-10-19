const tokenize = require("./lexer.js");

const tokens = [{value: "", type: ""}];
tokens.pop();

function notEof() {
	return tokens[0].type !== "EOF";
}

function at() {
	return tokens[0];
}

function next() {
	return tokens.shift();
}

function expect(type, msg) {
	const prev = tokens.shift();
		if (!prev || prev.type !== type) {
			throw new Error(`${msg}`);
		}
	return prev;
}

function parseStatement() {
	switch (at().type) {
		case "Variable":
			return parseVarDeclaration();
		case "Function":
			return parseFuncDeclaration();
		case "If":
			return parseIfStatement();
		case "While":
			return parseWhileStatement();
		case "Repeat":
			return parseRepeatStatement();
		case "Print":
			return parsePrintStatement();
		case "Main":
			return parseMainBody();
		case "Match":
			return parseMatchStatement();
		case "Return":
			return parseReturnStatement();
		default:
			return parseExpr();
	}
}

function parseIfStatement() {
	next(); // move past if keyword

	const condition = parseExpr();

	const ifBody = parseBlock();
	// use this to store potential else if statements
	let elseIfBlocks = [];
	// stores the final else statement if it exists
	let elseBlock = null;

	// now we check for elseIf blocks
	while (notEof() && at().type === "ElseIf") {
		next();

		// parse conditional
		const elseIfCondition = parseExpr();

		const elseIfBody = parseBlock();
		elseIfBlocks.push({ condition: elseIfCondition, body: elseIfBody });
	}

	// check for else block
	if (at().type === "Else") {
		next();
		elseBlock = parseBlock();
	}

	return {
		type: "IfStatement",
		condition,
		ifBody,
		elseIfBlocks,
		elseBlock,
	};
}

function parseBlock() {
	expect("{", "Missing curly brace to define block body");

	if (at().type === "}") {
		throw "Missing block body";
	}

	const statements = [];

	while (notEof() && at().type !== "}") {
		statements.push(parseStatement());
	}
	expect(
		"}",
		"Missing closing curly brace for block statement"
	);

	return statements;
}

function parseWhileStatement() {
	next();
	const condition = parseExpr();
	const body = parseBlock();
	return {
		type: "WhileStatement",
		condition,
		body
	};
}

function parseRepeatStatement() {
	next();
	const times = parseExpr();
	const body = parseBlock();
	return {
		type: "RepeatStatement",
		times,
		body
	};
}

function parseFuncDeclaration() {
	next(); // move past the fn keyword
	const name = expect(
		"Identifier",
		"Invalid function name. Function name must be a valid identifier"
	).value;

	const parameters = parseParams();
	expect(
		")",
		"Missing close parentheses after parameters list"
	);

	const body = parseBlock();

	const fn = {
		type: "FuncDeclaration",
		name,
		parameters,
		body,
	};

	return fn;
}

function parseParams() {
	expect(
	"(",
	"Missing parameter list after function declaration"
	);
	let params;
	// if the next token is ')' we know there are no parameters
	if (at().type == ")") {
		
	} else {
		params = [parseExpr()];
		// loop until we no longer have any ,s, therefore there are no more parameters and we are likely at a ')'
		while (notEof() && at().type == ",") {
			next(); // move past ,
			params.push(parseExpr());
		}
	}
	return params;
}

function parseFuncBody() {
	expect(
		"{",
		"Missing open curly brace to define function body"
	);
	if (at().type === "}") {
		throw "Missing function body";
	}
	const body = [];
	while (notEof() && at().type !== "}") {
		body.push(parseFuncStatement());
	}
	expect(
		"}",
		"Missing closing curly brace after function body"
	);
	return body;
}

function parseReturnStatement() {
	next();
	const value = parseExpr();
	expect(";", "Expected semicolon to end statement");
	return {
		type: "Return",
		value
	};
}

function parseVarDeclaration() {
	// after a let/const there needs to be a variable identifier
	next();
	const identifier = expect(
		"Identifier",
		`Expected identifier after a variable declaration statement`
	).value;

	if (at().type === ";") {
		next(); // Move past ;
		return {
			type: "VariableDeclaration",
			identifier,
			value: undefined,
		};
	}
	expect(
		"=",
		"Expected '=' after identifier in variable declaration"
	);
	const value = parseExpr();
	expect(";", "Expected semicolon to end statement");
	return {
		type: "VariableDeclaration",
		value,
		identifier,
	};
}

function parsePrintStatement() {
	next();
	const value = parseExpr();
	expect(";", "Expected semicolon to end statement");
	return {
		type: "Print",
		value
	};
}

function parseMainBody() {
	next();
	const body = parseBlock();
	if (notEof()) {
		console.warn("Statements after main body are unreachable.");
	}
	return {
		type: "Main",
		body
	};
}

function parseMatchStatement() {
	next();
	const testValue = parseExpr();
	expect("{", "Missing bracket for match body");
	const cases = [];
	let fails = null;
	while (notEof() && at().type === "Case" && at().type !== "Fails" && at().type !== "}") {
		expect("Case", "Missing case statement");
		const caseValue = parseExpr();
		expect("{", "Missing bracket for case body");
		const caseBody = [];
		while (notEof() && at().type !== "}") {
			caseBody.push(parseStatement());
		}
		expect("}", "Missing bracket to close case body"); 
		cases.push(
			{
				type: "Case",
				value: caseValue,
				body: caseBody
			}
		);
	}

	if (at().type === "Fails") {
		const failsBody = [];
		next();
		expect("{", "Missing bracket for fails body");
		while (notEof() && at().type !== "}") {
			failsBody.push(parseStatement());
		}
		expect("}", "Missing bracket to close fails body");
		fails = {
			type: "Fails",
			body: failsBody
		}
	}

	expect("}", "Missing bracket to close match body");

	return {
		type: "Match",
		value: testValue,
		cases,
		fails
	};
}

function parseExpr() {
	return parseAssignmentExpr();
}

function parseAssignmentExpr() {
	const left = parseTableExpr();
	if (at().type == "=") {
		next();
		const value = parseAssignmentExpr();
		expect(";", "Missing semicolon to end statement");
		return { value, type: "AssignmentExpr", assignee: left };
	}

	return left;
}

function parseTableExpr() {
	if (at().type !== "{") {
		return parseLogicalExpr();
	}
	next(); // move past '{'
	const properties = [];
	// {key: value, key1: value2}
	while (notEof() && at().type !== "}") {
		const key = expect(
			"Identifier",
			"Table key must be a string"
		).value;

		expect(":", "Missing colon in table key value pair");
		const value = parseExpr();
		properties.push({ type: "Property", value, key });

		if (at().type !== "}") {
			expect(",", "Missing comma separating key value pairs");
		}
	}
	expect("}", "Table literal missing closing curly brace");
	return { type: "TableLiteral", properties };
}

function parseLogicalExpr() {
	let left = parseCompareExpr();

	while (at().type == "LogicOperator") {
		const operator = next().value;
		const right = parseCompareExpr();
		left = {
				type: "LogicExpr",
				left,
				right,
				operator,
		};
	}

	return left;
}

function parseCompareExpr() {
	let left = parseAdditiveExpr();

	while (at().type == "CompareOperator") {
		const operator = next().value;
		const right = parseAdditiveExpr();
		left = {
				type: "CompareExpr",
				left,
				right,
				operator,
		};
	}

	return left;
}

function parseAdditiveExpr() {
	let left = parseMultiplicativeExpr();

	while (at().value == "+" || at().value === "-") {
		const operator = next().value;
		const right = parseMultiplicativeExpr();
		left = {
			type: "BinaryExpr",
			left,
			right,
			operator,
		};
	}

	return left;
}

function parseMultiplicativeExpr() {
	let left = parseNotExpr();

	while (
		at().value == "*" ||
		at().value == "/" ||
		at().value === "mod" ||
		at().value === "^"
	) {
		const operator = next().value;
		const right = parseNotExpr();
		left = {
			type: "BinaryExpr",
			left,
			right,
			operator,
		};
	}

	return left;
}

function parseNotExpr() {
	if (at().type === "UnaryOperator") {
		next();
		const operand = parseNotExpr(); // recursively parse operand for cases like !(x+1)
		return {
			type: "NotExpr",
			operand,
		};
	}
	return parseCallMemberExpr();
}

function parseCallMemberExpr() {
	const member = parseMemberExpr();

	if (at().type === "(") {
		return parseCallExpr(member);
	}

	return member;
}

function parseCallExpr(caller) {
	let callExpression = {
		type: "CallExpr",
		caller,
		args: parseArgs(),
	};

	if (at().type == "(") {
		callExpression = parseCallExpr(callExpression);
	}
	return callExpression;
}

function parseArgs() {
	expect("(", "Expected open parenthesis");
	const args = at().type == ")" ? [] : parseArgsList();
	expect(")", "Missing closing parentheses in function call");

	return args;
}

function parseArgsList() {
	const args = [parseExpr()];

	while (notEof() && at().type == ",") {
		next();
		args.push(parseExpr());
	}

	return args;
}

function parseMemberExpr() {
	let object = parsePrimitiveExpr();

	while (at().type == ".") {
		next();

		let property = parsePrimitiveExpr();
		if (property.type !== "Identifier") {
			throw "Cannot use dot operator without identifier";
		}
		object = { type: "MemberExpr", object, property };
	}

	return object;
}

function parsePrimitiveExpr() {
	const token = at().type;

	switch (token) {
		case "Identifier":
			return { type: "Identifier", symbol: next().value };
		case "NumberLiteral":
			return {
				type: "NumberLiteral",
				value: parseFloat(next().value),
			};
		case "StringLiteral":
			return {
				type: "StringLiteral",
				value: next().value.slice(1, -1), // get rid of quotation marks
			};
		case "(":
			next(); // move to the token after the '('
			const value = parseExpr();
			expect(")", "Missing closing parentheses"); // this is to move past the ')' token
			return value;
		case "BooleanLiteral":
			return {
				type: "BooleanLiteral",
				value: next().value == "true"
			}
		case "NoneLiteral":
			next()
			return {
				type: "None",
				value: null
			}
		default:
			throw new Error(
				`Unexpected token found during parsing ${JSON.stringify(at())}`
			);
	}
}

module.exports = function parse(sourceCode) {
    tokens.push(...tokenize(sourceCode));
    const program = { type: "Program", body: [] };

    // parse until end of the file is reached
    while (notEof()) {
		program.body.push(parseStatement());
    }

    return program;
}