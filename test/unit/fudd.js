'use strict';
var expect = require('chai').expect;

describe('fudd', function() {

    var fudd;
    before(function() {
        var Fudd = require('../../lib/fudd.js');
        fudd = new Fudd();
    });

    describe('init', function() {
        it('should return true', function() {
            var result = fudd.init();
            expect(result).to.equal(true);
        });
    });
});
