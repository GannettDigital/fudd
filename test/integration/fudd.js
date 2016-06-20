'use strict';

var expect = require('chai').expect;
var fudd = require('../../index.js');
var config = require('config');
var series = require('palinode').series;

describe('fudd integration test', function() {
    this.timeout(5000);

    var verificationChannel;
    var verificationConnection;
    var messageCounter = 0;

    it('should setup the infrastructure without error', function(done) {
        fudd.setup(config, done);
    });

    config.exchanges.forEach(function(exchangeDefinition){
        it('should verify the exchange ' + exchangeDefinition.name + ' exists', function(done){
            var establishChannel = [fudd._connect.bind(null, config), fudd._createChannel];
            series(establishChannel, function(err, connection, channel){
                if(err) return done(err);

                channel.checkExchange(exchangeDefinition.name, function(err){
                    if(err) return done(err);

                    fudd._disconnect(connection, done);
                });


            })
        })
    });

    config.queues.forEach(function(queueDefinition){
        it('should verify the queue ' + queueDefinition.name + ' exists', function(done){
            var establishChannel = [fudd._connect.bind(null, config), fudd._createChannel];
            series(establishChannel, function(err, connection, channel){
                if(err) return done(err);

                channel.checkQueue(queueDefinition.name, function(err){
                    if(err) return done(err);

                    fudd._disconnect(connection, done);
                });
            })
        })
    });

    it('should establish channel for messages', function(done){
        var establishChannel = [fudd._connect.bind(null, config), fudd._createChannel];
        series(establishChannel, function(err, connection, channel) {
            if (err) return done(err);

            verificationChannel = channel;
            verificationConnection = connection;

            done();
        });
    });

    // specific tests
    it('should publish messages to the fanout', function(){
        verificationChannel.publish('fanout.fx', 'some.key', new Buffer('message1'));
        verificationChannel.publish('fanout.fx', 'key.topic1', new Buffer('message1'));
        verificationChannel.publish('fanout.fx', 'key.topic2', new Buffer('message1'));
    });

    config.queues.forEach(function(queueDefinition){
        it('should purge the ' + queueDefinition.name + ' queue', function(done){
            verificationChannel.purgeQueue(queueDefinition.name, function(err, ok){
                messageCounter += ok.messageCount;
                done();
            })
        });
    });

    it('should have come across corret number of messages', function(){
        // msg -  route
        // 1   - fanout to queue1
        // 2   - fanout to queue1
        // 3   - fanout to queue1
        // 2   - fanout to topic to queue2
        // 3   - fanout to topic to queue2
        expect(messageCounter).to.equal(5);
    });

    it('should teardown the infrastructure without error', function(done) {
        fudd.teardown(config, done);
    });
});
