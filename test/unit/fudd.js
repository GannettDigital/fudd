'use strict';
var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

var config = {
    exchanges: [
        {
            name: 'fanout.fx',
            type: 'fanout',
            options: {}
        }
    ],
    queues: [
        {
            name: 'queue1',
            options: {durable: true}
        }
    ],
    bindings: [
        {
            bindingType: 'queue',
            from: 'fanout.fx',
            to: 'queue1',
            bindingKeys: ['#']
        }
    ]
};

describe('fudd', function() {
    var Fudd;
    var mapEachStub;
    var seriesStub;

    before('enable mockery', function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../lib/fudd.js');
    });

    after('disable mockery', mockery.disable);

    describe('setup', function() {
        var callbackSpy;
        var connectBindStub;
        var disconnectStub;
        var createExchangeBindStub;
        var createQueueBindStub;
        var createBindingsBindStub;
        var boundConnect = function connectBindResult() {};
        var boundCreateExchange = function createExchangeBindResult() {};
        var boundCreateQueue = function createQueueBindResult() {};
        var boundCreateBindings = function createBindingsBindResult() {};

        before('setup mocks', function() {
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.registerMock('amqplib/callback_api', {});
            mockery.registerMock('palinode', {
                series: seriesStub = sinon.stub(),
                mapEach: mapEachStub = sinon.stub()
            });
            mockery.registerMock('./amqp-config-utils.js', {});
            Fudd = require('../../lib/fudd.js');
        });

        before('setup stubs', function() {
            callbackSpy = sinon.spy();
            connectBindStub = sinon.stub(Fudd._connect, 'bind').returns(boundConnect);
            Fudd.__proto__._disconnect = disconnectStub = sinon.spy();
            createExchangeBindStub = sinon.stub(Fudd._createExchange, 'bind').returns(boundCreateExchange);
            createQueueBindStub = sinon.stub(Fudd._createQueue, 'bind').returns(boundCreateQueue);
            createBindingsBindStub = sinon.stub(Fudd._createBindings, 'bind').returns(boundCreateBindings);
        });

        after('restore stubbed methods', function() {
            Fudd._connect.bind.restore();
            Fudd._createExchange.bind.restore();
            Fudd._createQueue.bind.restore();
            Fudd._createBindings.bind.restore();
        });

        beforeEach('reset stubs', function() {
            callbackSpy.reset();
            connectBindStub.reset();
            disconnectStub.reset();
            seriesStub.reset();
            mapEachStub.reset();
            createExchangeBindStub.reset();
            createQueueBindStub.reset();
            createBindingsBindStub.reset();
            Fudd.setup(config, callbackSpy);
        });

        it('should bind config to the _connect function', function() {
            expect(connectBindStub.args[0]).to.eql([
                null, config
            ]);
        });

        it('should invoke series with the bound _connect and Fudd._create channel functions', function() {
            expect(seriesStub.args[0][0]).to.eql([boundConnect, Fudd._createChannel]);
        });

        it('should call the finalCallback if the first series call calls back with an error', function() {
            var expectedError = new Error('things happened');
            seriesStub.callArgWith(1, expectedError);
            expect(callbackSpy.args[0]).to.eql([expectedError]);
        });

        it('should call _createExchange.bind for each exchange in the config', function() {
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            expect(createExchangeBindStub.callCount).to.equal(config.exchanges.length);
        });

        it('should call _createExchange.bind for each queue in the config', function() {
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            expect(createQueueBindStub.callCount).to.equal(config.queues.length);
        });

        it('should call _createExchange.bind for each binding in the config', function() {
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            expect(createBindingsBindStub.callCount).to.equal(config.bindings.length);
        });

        it('should invoke series again with a sequence of functions derived from the config', function() {
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            expect(seriesStub.args[1][0]).to.eql([
                boundCreateExchange,
                boundCreateQueue,
                boundCreateBindings
            ]);
        });

        it('should call the final callback with the error returned from creating the infrastructure', function() {
            var expectedError = new Error('error creating infrastructure');
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            seriesStub.callArgWith(1, expectedError);
            expect(callbackSpy.args[0]).to.eql([expectedError]);
        });

        it('should invoke Fudd._disconnect wtih the connection and callback', function() {
            seriesStub.callArgWith(1, null, 'connection', 'channel');
            seriesStub.callArgWith(1, null);
            expect(disconnectStub.args[0]).to.eql([
                'connection', callbackSpy
            ]);
        });
    });
});
