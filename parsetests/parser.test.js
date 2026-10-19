const parse = require('../parser');

const s = `

match 12^2 {
    case 144 {
        print "OK";
    }
    case "144" {
        print "No";
    }
    fails {
        print "What";
    }
}

`;

parse(s).body.forEach(e => {
    console.log(JSON.stringify(e));
});