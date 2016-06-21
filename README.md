# fudd

simple rabbit mq infrastructure setup/teardown utility

[![npm version](https://badge.fury.io/js/fudd.svg)](https://badge.fury.io/js/fudd)
[![Build Status](https://travis-ci.org/GannettDigital/fudd.svg?branch=master)](https://travis-ci.org/GannettDigital/fudd)
[![Coverage Status](https://coveralls.io/repos/github/GannettDigital/fudd/badge.svg?branch=master)](https://coveralls.io/github/GannettDigital/fudd?branch=master)

## Installation
```
npm install fudd
```

## Test

```
npm run test
```
This will run both unit tests & integration tests. To successfully run integration tests, you must have a rabbitmq instance 
available & configured. See Configuration for examples

## Coverage 

```
npm run cover-html
```

## Usage

```
var fudd = require('fudd');

fudd.setup(config, function(err){
    if(err) throw err;
    
    // do your thing with rabbitmq
});

fudd.teardown(config, function(err){
    if(err) throw err;
    
    // all things torn
});
```

## Configuration

Configuration should look like the following: 
```javascript
{
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
}
```
