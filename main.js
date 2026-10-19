const parse = require('./parser');
const Environment = require('./env');
const compile = require('./compiler');
const fs = require('fs');

const env = new Environment();

function getFilesSync(directoryPath) {
    try {
        return fs.readdirSync(directoryPath);
    } catch (err) {
        console.error('Error reading directory:', err);
        return [];
    }
}

const scriptsFolder = getFilesSync('./scripts');
scriptsFolder.forEach(file => {
    compile(parse(fs.readFileSync("./scripts/"+file, "utf-8")), env);
});