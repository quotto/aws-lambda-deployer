#!/usr/bin/env node
'use strict';


const getArgv = ()=> {
    const argparse = require('argparse').ArgumentParser;
    const parser = new argparse({
        version: '0.0.1',
        addHelp: true,
        description: 'AWS Lambda Deployer for Node.js'
    });
    parser.addArgument(
        ['-r','--region'],
        {
            help: 'AWS Region'
        }
    );

    parser.addArgument(
        ['-f','--function'],
        {
            help: 'AWS Lambda Function Name'
        }
    );

    parser.addArgument(
        ['-i','--init'],
        {
            help: 'Create initial config file(.aldeployrc.json)',
            action: 'storeTrue'
        }
    );

    return parser.parseArgs();
};

const args = getArgv();
const config = require('../lib/config.js');

if(args.init) {
    config.initConfig();
} else {

    try {
        config.loadConfig(args.region,args.function);
        config.deploy();
    } catch(err) {
        console.log(err.message);
    }
}
