'use strict';

var expect = require('chai').expect;
var fudd = require('../../index.js');
var config = require('config');

describe('fudd integration test', function(){
    this.timeout(5000);

    before('setup', function(done){
        fudd.setup(config, done);
    });

    it('should do stuff', function(done){
        done();
    });

    after('teardown', function(done){
        fudd.teardown(done);
    })
});
