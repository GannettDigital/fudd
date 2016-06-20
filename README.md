[![Build Status](https://travis-ci.org/GannettDigital/fudd.svg?branch=master)](https://travis-ci.org/GannettDigital/fudd)
[![Coverage Status](https://coveralls.io/repos/github/GannettDigital/fudd/badge.svg?branch=master)](https://coveralls.io/github/GannettDigital/fudd?branch=master)

# fudd
simple rabbit mq infrastructure setup/teardown utility

## Installation
```
npm install fudd```

## Test

```npm run test```
This will run both unit tests & integration tests. To successfully run integration tests, you must have a rabbitmq instance 
available & configured. See Configuration for examples

## Coverage 

```npm run cover-html```

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