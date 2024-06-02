const input = require('input');

console.clear();

let ops = {};

async function main() {
    console.log('> Welcome!');
    
    var mode = await input.select('What would you like to do:', [
        {
            name: 'Nodes',
            value: null,
            disabled: true
        },
        {
            name: 'Add node with ports',
            value: 'addportnode',
            disabled: false
        },
        {
            name: 'Add node without ports',
            value: 'addnode',
            disabled: false
        },

        {
            name: 'Ports',
            value: null,
            disabled: true
        },
        {
            name: 'Add ports to node',
            value: 'addport',
            disabled: false
        },
    ]);

    try {
        ops[mode]();
    } catch(e) {
        console.log('Failed:', String(e))
    } finally {
        console.log('> Bye!');
    }
}

ops.addnode = async () => {
    console.log('add node no port')
}
ops.addportnode = async () => {
    console.log('add node with port')
}
ops.addport = async () => {
    console.log('add port to node')
}
main();