'use strict';

/**
 * Module dependencies.
 */

const path = require('path');
const request = require('supertest');
const sh = require('shelljs');
const WebServer = require('../lib/WebServer');

const WORKING_DIR = path.resolve(__dirname, 'fixtures/example');

describe('Example', function () {
    let webServer;

    before(async function () {
        webServer = new WebServer('example', {
            workingPath: WORKING_DIR,
            logger: {
                level: 'verbose'
            }
        });

        return webServer.start_();
    });

    describe('Base routing test', () => {
        it('find', async () => {
            const response = await request('http://127.0.0.1:1001').get('/user');
            response.body.status.should.be.eql('success');

        });

        it('find with query', async () => {
            const response = await request('http://127.0.0.1:1001').get('/user?id=1&name=2');
            response.body.should.containEql({
                status: 'success',
                result: {
                    status: 'success',
                    query: { id: '1', name: '2' },
                    method: 'find()'
                }
            });

        });

        it('post', async () => {
            const response = await request('http://127.0.0.1:1001')
                .post('/user')
                .send({ id: 1, name: 2 });
            response.body.should.containEql({
                status: 'success',
                result: { status: 'success', data: { id: 1, name: 2 }, method: 'post' }
            });

        });


        it('updateById', async () => {
            const response = await request('http://127.0.0.1:1001')
                .put('/user/1')
                .send({ id: 1, name: 2 });

            response.body.should.containEql({
                status: 'success',
                result: {
                    status: 'success',
                    param: '1',
                    body: { id: 1, name: 2 },
                    method: 'updateById'
                }
            });
        });

        it('deleteById', async () => {
            const response = await request('http://127.0.0.1:1001')
                .delete('/user/1')

            response.body.should.containEql({
                status: 'success',
                result: { status: 'success', param: '1', method: 'deleteById' }
            });
        });
    });


    describe('Get server setting', () => {
        it('find', async () => {
            const response = await request('http://127.0.0.1:1001').get('/setting');

            response.body.should.containEql({
                status: 'success',
                result: {
                    status: 'success',
                    data: { secret: '123', password: '456' },
                    method: 'find()'
                }
            });

        });
    })

    after(async function () {
        await webServer.stop_();
        sh.rm('-rf', path.join(WORKING_DIR, '*.log'));
    });


});