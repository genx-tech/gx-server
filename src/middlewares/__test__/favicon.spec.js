'use strict';

const path = require('path');
const request = require('supertest');
const { fs } = require('@genx/sys');
const WebServer = require('../../../lib/WebServer');

const WORKING_DIR = path.resolve(__dirname, '../../../test/temp');

describe('unit:middleware:favicon', function () {
    let webServer;

    before(async function () {
        fs.emptyDirSync(WORKING_DIR);
        let publicPath = path.join(WORKING_DIR, 'public');
        fs.ensureDirSync(publicPath);
        fs.copyFileSync(path.resolve(__dirname, '../../../test/fixtures/files/favicon.ico'), path.join(publicPath, 'favicon.ico'));

        webServer = new WebServer('test server', { 
            workingPath: WORKING_DIR
        });

        webServer.once('configLoaded', () => {
            webServer.config = {
                "koa": {                    
                },
                "middlewares": {
                    "favicon": "public/favicon.ico"
                }
            };
        });

        return webServer.start_();
    });

    after(async function () {        
        await webServer.stop_();    
        fs.removeSync(WORKING_DIR);
    });

    describe('middleware:favicon', function () {
        it('should return status ok', function (done) {            
            request(webServer.httpServer)
                .get('/favicon.ico')
                .expect(200)
                .end(done);
        });
    });
});