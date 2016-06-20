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
    });

    after('disable mockery', mockery.disable);

    describe('setup and teardown', function() {
        var callbackSpy;
        var connectBindStub;
        var disconnectStub;
        var boundConnect = function connectBindResult() {
        };

        before('setup mocks', function() {
            mockery.deregisterAll();
            mockery.resetCache();
            mockery.registerAllowable('../../lib/fudd.js');
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
        });

        after('restore stubbed methods', function() {
            Fudd._connect.bind.restore();
        });

        beforeEach('reset stubs', function() {
            callbackSpy.reset();
            connectBindStub.reset();
            disconnectStub.reset();
            seriesStub.reset();
            mapEachStub.reset();
        });

        describe('setup', function() {
            var createExchangeBindStub;
            var createQueueBindStub;
            var createBindingsBindStub;
            var boundCreateExchange = function createExchangeBindResult() {
            };
            var boundCreateQueue = function createQueueBindResult() {
            };
            var boundCreateBindings = function createBindingsBindResult() {
            };

            before('setup stubs', function() {
                createExchangeBindStub = sinon.stub(Fudd._createExchange, 'bind').returns(boundCreateExchange);
                createQueueBindStub = sinon.stub(Fudd._createQueue, 'bind').returns(boundCreateQueue);
                createBindingsBindStub = sinon.stub(Fudd._createBindings, 'bind').returns(boundCreateBindings);
            });

            after('restore stubs', function() {
                Fudd._createExchange.bind.restore();
                Fudd._createQueue.bind.restore();
                Fudd._createBindings.bind.restore();
            });

            beforeEach('reset stubs & invoke', function() {
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

        describe('teardown', function() {
            var deleteExchangeBindStub;
            var deleteQueueBindStub;
            var boundDeleteExchange = function deleteExchangeBindResult() {
            };
            var boundDeleteQueue = function deleteQueueBindResult() {
            };

            before('setup stubs', function() {
                deleteExchangeBindStub = sinon.stub(Fudd._deleteExchange, 'bind').returns(boundDeleteExchange);
                deleteQueueBindStub = sinon.stub(Fudd._deleteQueue, 'bind').returns(boundDeleteQueue);
            });

            after('restore stubs', function() {
                Fudd._deleteExchange.bind.restore();
                Fudd._deleteQueue.bind.restore();
            });

            beforeEach('reset stubs & invoke', function() {
                deleteExchangeBindStub.reset();
                deleteQueueBindStub.reset();
                Fudd.teardown(config, callbackSpy);
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

            it('should call _deleteExchange.bind for each exchange in the config', function() {
                seriesStub.callArgWith(1, null, 'connection', 'channel');
                expect(deleteExchangeBindStub.callCount).to.equal(config.exchanges.length);
            });

            it('should call _deleteExchange.bind for each queue in the config', function() {
                seriesStub.callArgWith(1, null, 'connection', 'channel');
                expect(deleteQueueBindStub.callCount).to.equal(config.queues.length);
            });

            it('should invoke series again with a sequence of functions derived from the config', function() {
                seriesStub.callArgWith(1, null, 'connection', 'channel');
                expect(seriesStub.args[1][0]).to.eql([
                    boundDeleteExchange,
                    boundDeleteQueue
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

    describe('_createExchange', function() {
        var assertExchangeStub;
        var mockChannel;
        var callbackStub;
        var error;
        var exchangeDefinition;

        beforeEach(function() {
            mockChannel = {assertExchange: assertExchangeStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            exchangeDefinition = {name: 'na.me', type: 'fanout', options: {opt: 'ion'}};
        });

        it('should call assertExchange with exchange definition & options', function() {
            Fudd._createExchange(mockChannel, exchangeDefinition, callbackStub);
            expect(assertExchangeStub.calledWith(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options)).to.equal(true);
        });

        it('should callback with error if assertExchange calls back with error', function() {
            assertExchangeStub.callsArgWith(3, error);
            Fudd._createExchange(mockChannel, exchangeDefinition, callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_createQueue', function() {
        var assertQueueStub;
        var mockChannel;
        var callbackStub;
        var error;
        var queueDefinition;

        beforeEach(function() {
            mockChannel = {assertQueue: assertQueueStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            queueDefinition = {name: 'na.me', options: {opt: 'ion'}};
        });

        it('should call assertQueue with queue definition & options', function() {
            Fudd._createQueue(mockChannel, queueDefinition, callbackStub);
            expect(assertQueueStub.calledWith(queueDefinition.name, queueDefinition.options)).to.equal(true);
        });

        it('should callback with error if assertQueue calls back with error', function() {
            assertQueueStub.callsArgWith(2, error);
            Fudd._createQueue(mockChannel, queueDefinition, callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_deleteExchange', function() {
        var deleteExchangeStub;
        var mockChannel;
        var callbackStub;
        var error;
        var exchangeDefinition;

        beforeEach(function() {
            mockChannel = {deleteExchange: deleteExchangeStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            exchangeDefinition = {name: 'na.me', options: {opt: 'ion'}};
        });

        it('should call deleteExchange with exchange name', function() {
            Fudd._deleteExchange(mockChannel, exchangeDefinition, callbackStub);
            expect(deleteExchangeStub.calledWith(exchangeDefinition.name, {})).to.equal(true);
        });

        it('should callback with error if deleteExchange calls back with error', function() {
            deleteExchangeStub.callsArgWith(2, error);
            Fudd._deleteExchange(mockChannel, exchangeDefinition, callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_deleteQueue', function() {
        var deleteQueue;
        var mockChannel;
        var callbackStub;
        var error;
        var queueDefinition;

        beforeEach(function() {
            mockChannel = {deleteQueue: deleteQueue = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            queueDefinition = {name: 'na.me', options: {opt: 'ion'}};
        });

        it('should call deleteQueue with queue name', function() {
            Fudd._deleteQueue(mockChannel, queueDefinition, callbackStub);
            expect(deleteQueue.calledWith(queueDefinition.name, {})).to.equal(true);
        });

        it('should callback with error if deleteQueue calls back with error', function() {
            deleteQueue.callsArgWith(2, error);
            Fudd._deleteQueue(mockChannel, queueDefinition, callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_createBindings', function() {
        var createBindingBindStub;
        var boundCreateBinding = function() {
        };
        var bindingDefinition;
        var callbackSpy;

        before('setup stubs', function() {
            createBindingBindStub = sinon.stub(Fudd._createBinding, 'bind').returns(boundCreateBinding);
            bindingDefinition = {bindingKeys: ['#', '#.#'], bindingType: 'queue', to: 'x', from: 'y'};
            callbackSpy = sinon.spy();
        });

        after('restore stubs', function() {
            Fudd._createBinding.bind.restore();
        });

        beforeEach('reset stubs & invoke', function() {
            createBindingBindStub.reset();
            callbackSpy.reset();
            Fudd._createBindings({}, bindingDefinition, callbackSpy);
        });

        it('should call mapEach with all bindingKeys and a bound createBinding call', function() {
            expect(mapEachStub.calledWith(bindingDefinition.bindingKeys, boundCreateBinding)).to.eql(true);
        });

        it('should callback with error if mapEach calls back with error', function() {
            var error = new Error('boo');
            mapEachStub.callsArgWith(2, error);
            Fudd._createBindings({}, bindingDefinition, callbackSpy);
            expect(callbackSpy.calledWith(error)).to.eql(true);
        });
    });

    describe('_createBinding (queue)', function() {
        var bindQueueStub;
        var mockChannel;
        var callbackStub;
        var error;
        var bindingDefinition;

        beforeEach(function() {
            mockChannel = {bindQueue: bindQueueStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            bindingDefinition = {to: 'y', from: 'x', options: {opt: 'ion'}, bindingType: 'queue'};
        });

        it('should call bindQueue with queue name & source exchange', function() {
            Fudd._createBinding(mockChannel, bindingDefinition, '#', callbackStub);
            expect(bindQueueStub.calledWith(bindingDefinition.to, bindingDefinition.from, '#', bindingDefinition.options)).to.equal(true);
        });

        it('should callback with error if bindQueue calls back with error', function() {
            bindQueueStub.callsArgWith(4, error);
            Fudd._createBinding(mockChannel, bindingDefinition, '#', callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_createBinding (exchange)', function() {
        var bindExchangeStub;
        var mockChannel;
        var callbackStub;
        var error;
        var bindingDefinition;

        beforeEach(function() {
            mockChannel = {bindExchange: bindExchangeStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            bindingDefinition = {to: 'y', from: 'x', options: {opt: 'ion'}, bindingType: 'exchange'};
        });

        it('should call bindExchange with exchange name & source exchange', function() {
            Fudd._createBinding(mockChannel, bindingDefinition, '#', callbackStub);
            expect(bindExchangeStub.calledWith(bindingDefinition.to, bindingDefinition.from, '#', bindingDefinition.options)).to.equal(true);
        });

        it('should callback with error if bindExchange calls back with error', function() {
            bindExchangeStub.callsArgWith(4, error);
            Fudd._createBinding(mockChannel, bindingDefinition, '#', callbackStub);
            expect(callbackStub.calledWith(error));
        });
    });

    describe('_createBinding (unsupported)', function() {
        var bindExchangeStub;
        var mockChannel;
        var callbackStub;
        var error;
        var bindingDefinition;

        beforeEach(function() {
            mockChannel = {bindExchange: bindExchangeStub = sinon.stub()};
            callbackStub = sinon.stub();
            error = new Error('something broke');
            bindingDefinition = {to: 'y', from: 'x', options: {opt: 'ion'}, bindingType: 'exhcabge'};
        });

        it('should callback with error if bindExchange calls back with error', function() {
            var message = 'unsupported binding type: ' + bindingDefinition.bindingType;
            Fudd._createBinding(mockChannel, bindingDefinition, '#', function(err) {
                expect(err.message).to.equal(message);
            });
        });
    });

    describe('_disconnect & createChannel', function() {

        before(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.registerAllowable('../../lib/fudd.js');
            mockery.registerMock('amqplib/callback_api', {});
            mockery.registerMock('palinode', {});
            mockery.registerMock('./amqp-config-utils.js', {});
            Fudd = require('../../lib/fudd.js');
        });

        var callbackSpy = sinon.spy();
        var connection = {
            close: sinon.spy(),
            createChannel: sinon.stub()
        };

        beforeEach(function() {
            connection.close.reset();
            connection.createChannel.reset();
            callbackSpy.reset();
        });

        describe('_disconnect', function() {
            it('should call close on the provided connection', function() {
                Fudd._disconnect(connection, callbackSpy);
                expect(connection.close.callCount).to.equal(1);
            });
        });

        describe('_createChannel', function() {
            it('should call back with the error from createChannel', function() {
                var expectedError = new Error('connection is borked');
                Fudd._createChannel(connection, callbackSpy);
                connection.createChannel.callArgWith(0, expectedError);
                expect(callbackSpy.args[0]).to.eql([expectedError]);
            });

            it('should call back with the originating connection and the channel from createChannel', function() {
                Fudd._createChannel(connection, callbackSpy);
                connection.createChannel.callArgWith(0, null, 'this is a fake channel');
                expect(callbackSpy.args[0]).to.eql([null, connection, 'this is a fake channel']);
            });
        });
    });
});
