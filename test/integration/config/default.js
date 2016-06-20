'use strict';
var os = require('os');
module.exports = {
    cluster: {
        port: 5672,
        vhost: '/',
        login: 'guest',
        heartbeat: 10,
        password: 'guest',
        host: 'rabbit'
    },
    exchanges: [
        {
            name: 'fanout.fx',
            type: 'fanout',
            options: {}
        },
        {
            name: 'topic.tx',
            type: 'topic',
            options: {}
        }
    ],
    queues: [
        {
            name: 'queue1',
            options: {durable: true}
        },
        {
            name: 'queue2',
            options: {durable: false}
        }
    ],

    bindings: [
        {
            bindingType: 'queue',
            from: 'fanout.fx',
            to: 'queue1',
            bindingKeys: ['#']
        },
        {
            bindingType: 'exchange',
            from: 'fanout.fx',
            to: 'topic.tx',
            bindingKeys: ['#'],
            options: {}
        },
        {
            bindingType: 'queue',
            from: 'topic.tx',
            to: 'queue2',
            bindingKeys: ['#.topic1', '#.topic2']
        }
    ]
};
