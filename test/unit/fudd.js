'use strict';
var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('fudd', function() {

    var Fudd;
    var configUtilsStub;

    before('enable mockery', function() {
        mockery.enable({useCleanCache: true});
    });

    after('disable mockery', mockery.disable);

    beforeEach('setup mocks', function(){
        mockery.registerAllowable('../../lib/fudd.js');
        mockery.registerAllowable('util');

        mockery.registerMock('amqplib/callback_api', {});
        mockery.registerMock('palinode', {});
        mockery.registerMock('./amqp-config-utils.js', configUtilsStub = sinon.stub().returns('amqp://some.host'));

        Fudd = require('../../lib/fudd.js');
    });

    describe('setup', function() {
        var config = {thisIs: 'config'};
        var connectBindStub;

        before('setup stubs', function() {
            connectBindStub
        })


    });
});
