module.exports = class Environment {
    constructor(parent) {
        this.vars = new Map();
        this.parent = parent;
    }

    declare(identifer, value) {
        if (this.vars.has(identifer)) {
            this.assign(identifer, value);
        } else {
            this.vars.set(identifer, value);
            return value;
        }
    }

    assign(variable, value) {
        const env = this.search(variable);
        env.vars.set(variable, value);
        return value;
    }

    search(variable) {
        if (this.vars.has(variable)) {
            return this;
        }

        if (this.parent === undefined) {
            throw `REFERROR: ${variable} is not defined.`;
        }

        return this.parent.search(variable);
    }

    get(variable) {
        const env = this.search(variable);
        return env.vars.get(variable);
    }
}