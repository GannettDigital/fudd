'use strict';

var format = require('util').format;

module.exports = function formatAmqpUrl(urlComponents) {
    return format(
        'amqp://%s:%s@%s:%s/%s?heartbeat=%s',
        urlComponents.login,
        urlComponents.password,
        urlComponents.host,
        urlComponents.port,
        encodeURIComponent(urlComponents.vhost),
        urlComponents.heartbeat
    );
};
