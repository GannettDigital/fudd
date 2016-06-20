'use strict';
var amqp = require('amqplib/callback_api');
var formatAmqpUrl = require('./amqp-config-utils.js');
var palinode = require('palinode');

var Fudd = {
    setup: function(config, finalCallback) {
        Fudd._connect(config, function(connection, channel) {
            //TODO: re-write using palinode.series

            palinode.mapEach(config.exchanges, Fudd._createExchange.bind(null, channel), function(err) {
                if (err) return finalCallback(err);

                palinode.mapEach(config.queues, Fudd._createQueue.bind(null, channel), function(err) {
                    if (err) return finalCallback(err);

                    palinode.mapEach(config.bindings, Fudd._createBindings.bind(null, channel), function(err) {
                        if (err) return finalCallback(err);
                        finalCallback();
                    });
                });
            });
        });
    },
    teardown: function(callback) {
        callback();
    },
    _createExchange: function(channel, exchangeDefinition, callback) {
        channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options, callback);
    },
    _createQueue: function(channel, queueDefinition, callback) {
        channel.assertQueue(queueDefinition.name, queueDefinition.options, callback);
    },
    _createBindings: function(channel, bindingDefinition, callback) {
        var boundCreateBinding = Fudd._createBinding.bind(null, channel, bindingDefinition);
        palinode.mapEach(bindingDefinition.bindingKeys, boundCreateBinding, callback);
    },
    _createBinding: function(channel, bindingDefinition, bindingKey, callback) {
        if (bindingDefinition.bindingType === 'queue') {
            channel.bindQueue(bindingDefinition.to, bindingDefinition.from, bindingKey, bindingDefinition.options, callback);
        } else {
            channel.bindExchange(bindingDefinition.to, bindingDefinition.from, bindingKey, bindingDefinition.options, callback);
        }
    },
    _connect: function(config, callback) {
        var url = formatAmqpUrl(config.cluster);
        amqp.connect(url, function(error, connection) {
            if (error) return callback(error);

            connection.createChannel(function(error, channel) {
                if (error) return callback(error);

                callback(connection, channel);
            });
        });
    }
};

module.exports = Object.create(Fudd);