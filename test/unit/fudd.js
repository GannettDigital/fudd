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
    var configUtilsStub;
    var mapEachStub;
    var seriesStub;

    before('enable mockery', function() {
        mockery.enable({useCleanCache: true});
    });

    after('disable mockery', mockery.disable);

    beforeEach('setup mocks', function() {
        mockery.registerAllowable('../../lib/fudd.js');

        mockery.registerMock('amqplib/callback_api', {});
        mockery.registerMock('palinode', {
            series: seriesStub = sinon.stub(),
            mapEach: mapEachStub = sinon.stub()
        });
        mockery.registerMock('./amqp-config-utils.js', configUtilsStub = sinon.stub().returns('amqp://some.host'));

        Fudd = require('../../lib/fudd.js');
    });

    describe('setup', function() {
        var config = {thisIs: 'config'};
        var callbackSpy;
        var connectBindStub;
        var boundConnect = function connectBindResult() {};

        before('setup stubs', function() {
            connectBindStub = sinon.stub(Fudd._connect, 'bind').returns(boundConnect);
        });

        after('restore stubbed methods', function() {
            Fudd._connect.bind.restore();
        });

        beforeEach('reset stubs', function() {
            callbackSpy = sinon.spy();
            connectBindStub.reset();
            seriesStub.reset();
            mapEachStub.reset();
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

        it('');
    });
});
