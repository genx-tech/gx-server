'use strict';

const path = require('path');
const { fs } = require('@genx/sys');
const WebServer = require('../../../src/WebServer');

const WORKING_DIR = path.resolve(__dirname, '../../../test/temp');

const WelcomeMessage = "What's up?";

describe('unit:features:socketServer', function () {
    let webServer;

    before(async function () {
        fs.emptyDirSync(WORKING_DIR);
        let controllerPath = path.join(WORKING_DIR, 'server/events');
        fs.ensureDirSync(controllerPath);
        fs.copyFileSync(path.resolve(__dirname, '../../../test/fixtures/files/heartbeat.js'), path.join(controllerPath, 'heartbeat.js'));
        fs.copyFileSync(path.resolve(__dirname, '../../../test/fixtures/files/welcome.js'), path.join(controllerPath, 'welcome.js'));

        webServer = new WebServer('test server', { 
            workingPath: WORKING_DIR
        });

        webServer.once('configLoaded', () => {
            webServer.config = {                
                "koa": {                    
                },
                "socketServer": {
                    "path": "/ws-api",                    
                    "routes": {    
                        "/heartbeat": {
                            "controller": "heartbeat",
                            "onConnect": "welcome.send"
                        }
                    }        
                }
            };
        });

        return webServer.start_();
    });

    after(async function () {        
        await webServer.stop_();    
        fs.removeSync(WORKING_DIR);
    });

    it('welcome message', function (done) {              
        const { Manager } = require('socket.io-client');
        const mgr = new Manager('http://'+ webServer.host, { path: '/ws-api' });
        let heartbeatWs = mgr.socket('/heartbeat')

        heartbeatWs.on('welcome', data => {
            data.should.be.equal(WelcomeMessage);

            heartbeatWs.emit('echo', 'hello', (echo) => {                    
                echo.should.be.equal('hello');
                heartbeatWs.close();
                done();
            });                    
        });

        heartbeatWs.on('connect_error', (error) => {
            console.error(error);
        });
    });
});