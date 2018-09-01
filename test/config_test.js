'use strict';

const _ = require('lodash');
const rewire = require('rewire');
const assert = require('assert');
const config = require('../lib/config.js');
const config_filename = '.aldeployrc.json';
const default_zipname = 'lambda.zip';
const defaultconfig = {
    rootdir: '.',
    zipname: default_zipname,
    deletezip: true,
    exclude: [config_filename]
};

describe('config.js',function(){
    const fs = require('fs');
    describe('initConfig',function(){
        it('normal end',async function(){
            await config.initConfig();
            try {
                fs.accessSync(config_filename);
                const configfile = require('../'+config_filename);
                assert(configfile,
                    {
                        rootdir:'.',
                        zipname: default_zipname,
                        dletezip: true,
                        exclude: [config_filename]
                    }
                );
                fs.unlinkSync(config_filename);
            } catch(err) {
                console.log(err.message);
                assert(false);
            }
        });
    });
    describe('loadConfig',function(){
        describe('file exists',function(){
            it('region,function use parameter',function(){
                try {
                    const configJS =rewire('../lib/config.js');
                    fs.appendFileSync(config_filename,JSON.stringify(defaultconfig));
                    configJS.loadConfig('ap-north-east2','test');
                    const actualConfig = configJS.__get__('CONFIG');
                    assert(actualConfig.rootdir,defaultconfig.rootdir);
                    assert(actualConfig.zipname,defaultconfig.zipname);
                    assert(actualConfig.deletezip,defaultconfig.deletezip);
                    assert(actualConfig.exclude,defaultconfig.exclude);
                    assert(actualConfig.region,'ap-north-east2');
                    assert(actualConfig.function,'test');
                } catch(err) {
                    console.log(err);
                    assert(false);
                } finally {
                    fs.unlinkSync(config_filename);
                }
            });
            it('region,function use configfile',function(){
                let changed_config = _.clone(defaultconfig);
                changed_config.region = 'test';
                changed_config.function = 'test';
                const configJS =rewire('../lib/config.js');
                fs.appendFileSync(config_filename,JSON.stringify(changed_config));
                try {
                    configJS.loadConfig('ap-north-east2','aaaaaa');
                    const actualConfig = configJS.__get__('CONFIG');
                    assert(actualConfig.rootdir,defaultconfig.rootdir);
                    assert(actualConfig.zipname,defaultconfig.zipname);
                    assert(actualConfig.deletezip,defaultconfig.deletezip);
                    assert(actualConfig.exclude,defaultconfig.exclude);
                    assert(actualConfig.region,changed_config.region);
                    assert(actualConfig.function,changed_config.function);
                } catch(err) {
                    console.log(err);
                    assert(false);
                } finally {
                    fs.unlinkSync(config_filename);
                }
            });
        });
        it('file not exists',function(){
            try {
                config.loadConfig();
            } catch(err) {
                assert(true);
            }
        });
        it('Missing region',function(){
            const configJS =rewire('../lib/config.js');
            configJS.__set__('CONFIG',defaultconfig);
            try {
                config.loadConfig(undefined,undefined);
            } catch(err) {
                assert('Error: Missing Region or Lambda function name',err.message);
            }
        });
        it('Missing function',function(){
            const configJS =rewire('../lib/config.js');
            configJS.__set__('CONFIG',defaultconfig);
            try {
                configJS.loadConfig('ap-north-east2',undefined);
            } catch(err) {
                assert('Error: Missing Region or Lambda function name',err.message);
            }
        });
    });
    describe('deploy',function(){
        it('Wrong region',function(done){
            const configJS =rewire('../lib/config.js');
            const changed_config = _.clone(defaultconfig);
            changed_config.region='aaaaaaaaaaaaaaaaaaa';
            changed_config.function='test';
            configJS.__set__('CONFIG',changed_config);

            configJS.deploy().then(()=>{
                assert(false);
                done();
            }).catch((err)=>{
                console.log(err.message);
                fs.access(default_zipname,(err)=>{
                    if(err) {
                        assert(false);
                    } else {
                        assert(true);
                        fs.unlinkSync(default_zipname);
                    }
                    done();
                });
            });
        });
    });
    describe('deployEnd',function(){
        const configJS = rewire('../lib/config.js');
        const deployEnd = configJS.__get__('deployEnd');
        it('delete file when finished',function(done){
            try {
                configJS.__set__('CONFIG',{deletezip:true,zipname:default_zipname});
                fs.appendFileSync(default_zipname,'test');
                deployEnd();
                fs.access(default_zipname,(err)=>{
                    err ? assert(true) : assert(false);
                    done();
                });
            } catch(err) {
                console.log(err.message);
                assert(false);
            }
        });
        it('exist file when finished',function(done){
            try {
                const test_zipname = 'test.zip';
                configJS.__set__('CONFIG',{deletezip:false,zipname:'test.zip'});
                fs.appendFileSync(test_zipname,'test');

                deployEnd();
                fs.access(test_zipname,(err)=>{
                    err ? assert(false) : assert(true);
                    fs.unlinkSync(test_zipname);
                    done();
                });
            } catch(err){
                console.log(err.message);
                assert(false);
            }
        });
    });
});
