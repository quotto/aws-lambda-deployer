'use strict';

const fs = require('fs');
let CONFIG = {};

const loadConfig = (region,funcname)=>{
    const configfile = JSON.parse(fs.readFileSync('./.aldeployrc.json'));

    const zipname = configfile.zipname ? configfile.zipname : 'skill.zip';
    CONFIG =  {
        rootdir: configfile.rootdir ? configfile.rootdir : '.',
        zipname: zipname,
        deletezip: typeof(configfile.deletezip) != undefined ? configfile.deletezip : true,
        exclude: configfile.exclude ? configfile.exclude.concat(zipname) : [zipname],
        region: region ? region : configfile.region,
        funcname: funcname ? funcname : configfile.function
    };

    if(typeof(CONFIG.region) === 'undefined' || typeof(CONFIG.funcname) === 'undefined') {
        throw new Error('Error: Missing Region or Lambda function name');
    }
};

const initConfig = ()=>{
    const filename = '.aldeployrc.json';
    const defaultconfig = {
        rootdir: '.',
        zipname: 'skill.zip',
        deletezip: true,
        exclude: [filename]
    };
    const file = fs.createWriteStream(filename);
    return new Promise((resolve,reject)=>{
        try {
            file.write(JSON.stringify(defaultconfig,undefined,4),'UTF-8',()=>{
                console.log(`Create ${filename}` );
                resolve();
            });
            file.end();
        } catch (err) {
            reject(err);
        }
    });
};

const deploy = ()=>{
    return new Promise((resolve,reject) => {
        const archiver = require('archiver');
        const output = fs.createWriteStream(CONFIG.zipname);
        const archive = archiver.create('zip');

        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            try {
                const aws_cmd = 'aws lambda update-function-code ' +
                            `--region ${CONFIG.region} ` +
                          `--function-name ${CONFIG.funcname} ` +
                          `--zip-file fileb://${CONFIG.zipname}`;
                const result = require('child_process').execSync(aws_cmd);
                console.log(aws_cmd);
                console.log(result.toString());
                deployEnd();
                resolve();
            } catch(err) {
                console.log('error!!!!');
                reject(err);
            }
        });

        archive.on('error',(err)=>{
            reject(err);
        });

        archive.pipe(output);

        archive.glob('**/*',{ignore:CONFIG.exclude,dot:true,cwd:CONFIG.rootdir});

        archive.finalize();
    });
};

const deployEnd = ()=> {
    if(CONFIG.deletezip) {
        fs.unlinkSync(CONFIG.zipname);
    }
};

module.exports = {
    loadConfig: loadConfig,
    initConfig: initConfig,
    deploy: deploy
};
