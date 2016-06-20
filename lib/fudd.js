'use strict';
var amqp = require('amqplib/callback_api');
var formatAmqpUrl = require('./amqp-config-utils.js');
var series = require('palinode').series;
var mapEach = require('palinode').mapEach;

var Fudd = {
    setup: function(config, finalCallback) {

        var establishChannel = [Fudd._connect.bind(null, config), Fudd._createChannel];

        series(establishChannel, function(error, connection, channel) {
            if (error) return finalCallback(error);
            var infrastructure = [];

            config.exchanges.reduce(function(series, exchangeDefinition) {
                series.push(Fudd._createExchange.bind(null, channel, exchangeDefinition));
                return series;
            }, infrastructure);

            config.queues.reduce(function(series, queueDefinition) {
                series.push(Fudd._createQueue.bind(null, channel, queueDefinition));
                return series;
            }, infrastructure);

            config.bindings.reduce(function(series, bindingDefinition) {
                series.push(Fudd._createBindings.bind(null, channel, bindingDefinition));
                return series;
            }, infrastructure);

            series(infrastructure, function(error) {
                if (error) return finalCallback(error);
                Fudd._disconnect(connection, finalCallback);
            });
        });
    },
    teardown: function(config, finalCallback) {
        var establishChannel = [Fudd._connect.bind(null, config), Fudd._createChannel];

        series(establishChannel, function(error, connection, channel) {
            if (error) return finalCallback(error);
            var infrastructure = [];

            config.exchanges.reduce(function(series, exchangeDefinition) {
                infrastructure.push(Fudd._deleteExchange.bind(null, channel, exchangeDefinition));
            }, infrastructure);

            config.queues.reduce(function(series, queueDefinition) {
                series.push(Fudd._deleteQueue.bind(null, channel, queueDefinition));
                return series;
            }, infrastructure);

            series(infrastructure, function(error) {
                if (error) return finalCallback(error);
                Fudd._disconnect(connection, finalCallback);
            });
        });
    },
    _createExchange: function(channel, exchangeDefinition, callback) {
        channel.assertExchange(exchangeDefinition.name, exchangeDefinition.type, exchangeDefinition.options, function(error) {
            callback(error);
        });
    },
    _createQueue: function(channel, queueDefinition, callback) {
        channel.assertQueue(queueDefinition.name, queueDefinition.options, function(error) {
            callback(error);
        });
    },
    _createBindings: function(channel, bindingDefinition, callback) {
        var boundCreateBinding = Fudd._createBinding.bind(null, channel, bindingDefinition);
        mapEach(bindingDefinition.bindingKeys, boundCreateBinding, function(error) {
            callback(error);
        });
    },
    _createBinding: function(channel, bindingDefinition, bindingKey, callback) {
        if (bindingDefinition.bindingType === 'queue') {
            channel.bindQueue(bindingDefinition.to, bindingDefinition.from, bindingKey, bindingDefinition.options, callback);
        } else {
            channel.bindExchange(bindingDefinition.to, bindingDefinition.from, bindingKey, bindingDefinition.options, callback);
        }
    },
    _deleteExchange: function(channel, exchangeDefinition, callback) {
        channel.deleteExchange(exchangeDefinition.name, {}, function(error) { callback(error);});
    },
    _deleteQueue: function(channel, queueDefinition, callback) {
        channel.deleteQueue(queueDefinition.name, {}, function(error) { callback(error);});
    },
    _connect: function(config, callback) {
        var url = formatAmqpUrl(config.cluster);
        amqp.connect(url, callback);
    },
    _createChannel: function(connection, callback) {
        connection.createChannel(function(error, channel) {
            if (error) return callback(error);
            callback(null, connection, channel);
        });
    },
    _disconnect: function(connection, callback) {
        connection.close(callback);
    }
};

module.exports = Object.create(Fudd);
