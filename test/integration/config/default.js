module.exports = {
    // app configuration:
    key: {nested: 'value'}

    /*testInfrastructure: {
        // fudd configuration example
        cluster: {
            port: 5672,
            vhost: '/',
            login: 'user',
            heartbeat: 10,
            password: 'password',
            host: 'host.com'
        },
        exchanges: {
            'fanout.fx': {
                type: 'fanout'
            },
            'topic.tx': {
                type: 'topic'
            }
        },
        queues: {
            'queue1': {}
        },
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
                bindingKeys: ['#']
            }
        ]
    }*/
};