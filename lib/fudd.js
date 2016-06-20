'use strict';
var amqp = require('amqplib/callback_api');
var formatAmqpUrl = require('./amqp-config-utils.js');

module.exports = Fudd;

function Fudd(config) {
    this.config = config;
}

Fudd.prototype.setup = function(callback) {
    var config = JSON.parse(JSON.stringify(this.config));

    connect(config, function(connection, channel) {
        createExchanges(channel, Object.keys(config.exchanges), function(err) {
            if (err) return callback(err);

            createQueues(channel, Object.keys(config.queues), function(err){
                if (err) return callback(err);

                doBindings(channel, config.bindings, callback);
            })
        });
    });

    function doBindings(channel, bindings, callback){
        if (bindings.length === 0) return callback();

        var binding = bindings.pop();

        var boundBindings = doBindings.bind(this, channel, bindings, callback);
        bindAllKeys(channel, binding, binding.bindingKeys, boundBindings);
    }

    function bindAllKeys(channel, binding, keys, callback){
        if (keys.length === 0) return callback();


        var key = keys.pop();
        var onBound = bindAllKeys.bind(this, channel, binding, keys, callback);
        console.log('binding');
        if (binding.bindingType === 'queue') {
            channel.bindQueue(binding.to, binding.from, key, {}, onBound);
        } else {
            channel.bindExchange(binding.to, binding.from, key, {}, onBound);
        }
    }

    function createQueues(channel, queueKeys, callback){
        if (queueKeys.length === 0) return callback();
        var queueKey = queueKeys.pop();

        console.log('asserting Q');
        var exchangeAsserted = createQueues.bind(this, channel, queueKeys, callback);
        channel.assertQueue(queueKey, {durable: true}, exchangeAsserted);
    }

    function createExchanges(channel, exchangeKeys, callback) {
        if (exchangeKeys.length === 0) return callback();
        var exchangeKey = exchangeKeys.pop();

        console.log('asserting');
        var exchangeAsserted = createExchanges.bind(this, channel, exchangeKeys, callback);
        channel.assertExchange(exchangeKey, config.exchanges[exchangeKey].type, {}, exchangeAsserted);
    }
};

Fudd.prototype.teardown = function(callback){
    callback();
};

function connect(config, callback) {
    var url = formatAmqpUrl(config.cluster);
    amqp.connect(url, function(error, connection) {
        if (error) throw error;
        connection.createChannel(function(error, channel) {
            if (error) throw error;
            callback(connection, channel);
        });
    });
}
