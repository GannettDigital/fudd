'use strict';
var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('fudd', function() {

    var fudd;
    var configUtilsStub;

    before('enable mockery', function() {
        mockery.enable({useCleanCache: true});
    });

    beforeEach('setup mocks', function() {
        mockery.registerAllowable('../../lib/fudd.js');
        mockery.registerAllowable('util');

        mockery.registerMock('amqplib/callback_api', {});
        mockery.registerMock('palinode', {});
        mockery.registerMock('./amqp-config-utils.js', configUtilsStub = sinon.stub().returns('amqp://some.host'));

        fudd = require('../../lib/fudd.js');
    });

    after('disable mockery', mockery.disable);

    describe('setup', function() {
        it('should call connect with supplied config', function() {
            var connectSpy = sinon.spy();
            fudd.__proto__._connect = connectSpy;
            var config = {key: 'value'};
            fudd.setup(config);
            expect(connectSpy.calledWith(config)).to.equal(true);
        });

        it('should call connect with supplied config', function() {
            var connectSpy = sinon.spy();
            fudd.__proto__._connect = connectSpy;
            var config = {key: 'value'};
            fudd.setup(config);
            expect(connectSpy.calledWith(config)).to.equal(true);
        });
    });
});
