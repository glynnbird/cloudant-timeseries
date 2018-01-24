var assert = require('assert');
var utils = require('../lib/utils.js');

describe('utils', function() {

  it('should expose four functions', function() {
    assert(typeof utils.isArray, 'function');
    assert(typeof utils.pad, 'function');
    assert(typeof utils.calculateDBName, 'function');
    assert(typeof utils.sequence, 'function');
  });

  it('should detect an array', function() {
      assert(utils.isArray([]));
      assert(utils.isArray([1,2,3]));
      assert(utils.isArray(['1','2','3']));
      assert(utils.isArray([{},{},{}]));
      assert(utils.isArray([[],[],[]]));
      assert(utils.isArray([false,false,false]));
  });

  it('should return false for everything else', function() {
      assert.equal(utils.isArray({}), false);
      assert.equal(utils.isArray(true), false);
      assert.equal(utils.isArray(1), false);
      assert.equal(utils.isArray(), false);
      assert.equal(utils.isArray(null), false);
      assert.equal(utils.isArray('oh my'), false);
  });

  it('should pad single digit numbers', function() {
    assert.equal(utils.pad(0),'00');
    assert.equal(utils.pad(9),'09');
  });

  it('should leave double digit numbers', function() {
    assert.equal(utils.pad(11),'11');
    assert.equal(utils.pad(31),'31');
  });

  it('should calculate database names correctly', function() {
    assert.equal(utils.calculateDBName('xxx',2015,1),'xxx_2015_01');
    assert.equal(utils.calculateDBName('xxx_yyy',2015,12),'xxx_yyy_2015_12');
  });

  it('should run a sequence of promises', function() {
    var order = []
    var promises = [
      function() {
        return new Promise(function(resolve, reject) {
          order.push(1);
          resolve()
        });
      },
      function() {
        return new Promise(function(resolve, reject) {
          order.push(2);
          resolve()
        });
      },
      function() {
        return new Promise(function(resolve, reject) {
          order.push(3);
          resolve(3)
        });
      }
    ];
    return utils.sequence(promises).then(function(data) {
      assert.deepEqual(order, [1,2,3]);
      return;
    })
  });

  it('should run a queue of promises', function() {
    var order = []
    var promises = [
      function() {
        return new Promise(function(resolve, reject) {
          order.push(1);
          resolve()
        });
      },
      function() {
        return new Promise(function(resolve, reject) {
          order.push(2);
          resolve()
        });
      },
      function() {
        return new Promise(function(resolve, reject) {
          order.push(3);
          resolve(3)
        });
      }
    ];
    return utils.queue(promises, 1, 3).then(function(data) {
      assert.deepEqual(order, [1,2,3]);
      return;
    })
  });

  it('should find the first property of an object', function() {
    var obj = {
      a: 1,
      b: 2,
      c: 3
    };
    assert.equal(utils.first(obj), 1);
  })

  it('should combine objects correctly', function() {
    var r1 = { 
      sum: 10,
      count: 5,
      min: 1,
      max: 20,
      mean: 10,
      variance: 1.39,
      stddev: 1.18,
      sumsqr: 50
    };
    var r2 = { 
      sum: 15,
      count: 6,
      min: 2,
      max: 19,
      mean: 15,
      variance: 4.75,
      stddev: 2.18,
      sumsqr: 100
    };
    var answer = { 
      sum: 25,
      count: 11,
      min: 1,
      max: 20,
      sumsqr: 150,
      mean: 2.272727272727273,
      variance: 8.471074380165287,
      stddev: 2.910511017014931 
    };
    var r = utils.combineObject(r1,r2);
    assert.deepEqual(r, answer);
  });

  it('should combine aggregations correctly - numbers', function() {
    var r1 = 100;
    var r2 = 50;
    var answer = 150;
    var r = utils.combine(r1,r2);
    assert.deepEqual(r, answer);
  });

  it('should combine aggregations correctly - single objects', function() {
    var r1 = { 
      sum: 10,
      count: 5,
      min: 1,
      max: 20,
      mean: 10,
      variance: 1.39,
      stddev: 1.18,
      sumsqr: 50
    };
    var r2 = { 
      sum: 15,
      count: 6,
      min: 2,
      max: 19,
      mean: 15,
      variance: 4.75,
      stddev: 2.18,
      sumsqr: 100
    };
    var answer = { 
      sum: 25,
      count: 11,
      min: 1,
      max: 20,
      sumsqr: 150,
      mean: 2.272727272727273,
      variance: 8.471074380165287,
      stddev: 2.910511017014931 
    };
    var r = utils.combineObject(r1,r2);
    assert.deepEqual(r, answer);
  });

  it('should combine aggregations correctly - single objects', function() {
    var r1 = { 
      sum: 10,
      count: 5,
      min: 1,
      max: 20,
      mean: 10,
      variance: 1.39,
      stddev: 1.18,
      sumsqr: 50
    };
    var r2 = { 
      sum: 15,
      count: 6,
      min: 2,
      max: 19,
      mean: 15,
      variance: 4.75,
      stddev: 2.18,
      sumsqr: 100
    };
    var answer = { 
      sum: 25,
      count: 11,
      min: 1,
      max: 20,
      sumsqr: 150,
      mean: 2.272727272727273,
      variance: 8.471074380165287,
      stddev: 2.910511017014931 
    };
    var r = utils.combine(r1,r2);
    assert.deepEqual(r, answer);
  });

  it('should combine aggregations correctly - compound objects', function() {
    var r1 = { 'temperature': { 
      sum: 10,
      count: 5,
      min: 1,
      max: 20,
      mean: 10,
      variance: 1.39,
      stddev: 1.18,
      sumsqr: 50
    }};
    var r2 = {'temperature': { 
      sum: 15,
      count: 6,
      min: 2,
      max: 19,
      mean: 15,
      variance: 4.75,
      stddev: 2.18,
      sumsqr: 100
    }};
    var answer = {'temperature':{ 
      sum: 25,
      count: 11,
      min: 1,
      max: 20,
      sumsqr: 150,
      mean: 2.272727272727273,
      variance: 8.471074380165287,
      stddev: 2.910511017014931 
    }};
    var r = utils.combine(r1,r2);
    assert.deepEqual(r, answer);
  });

  it('should combine aggregations correctly - arrays of compound objects', function() {
    var r1 = { '2018': { 
                    'temperature': { 
                      sum: 10,
                      count: 5,
                      min: 1,
                      max: 20,
                      mean: 10,
                      variance: 1.39,
                      stddev: 1.18,
                      sumsqr: 50
                    },
                    'cost': {
                      sum: 20,
                      count: 7,
                      min: 2, 
                      max: 19,
                      variance: 1.5,
                      stddev: 1.3,
                      sumsqr: 88
                    }     
                }
            };
    var r2 = {
                 '2018': {
                    'temperature': { 
                      sum: 15,
                      count: 6,
                      min: 2,
                      max: 19,
                      mean: 15,
                      variance: 4.75,
                      stddev: 2.18,
                      sumsqr: 100
                    },
                    'cost': {
                      sum: 18,
                      count: 6,
                      min: 3, 
                      max: 17,
                      variance: 1.6,
                      stddev: 1.4,
                      sumsqr: 89
                    } 
                  }
              };
    var answer =  { '2018': 
                      { temperature: { 
                          sum: 25,
                          count: 11,
                          min: 1,
                          max: 20,
                          sumsqr: 150,
                          mean: 2.272727272727273,
                          variance: 8.471074380165287,
                          stddev: 2.910511017014931 },
                        cost: { 
                          sum: 38,
                          count: 13,
                          min: 2,
                          max: 19,
                          sumsqr: 177,
                          mean: 2.923076923076923,
                          variance: 5.071005917159765,
                          stddev: 2.251889410508377 } } };
    var r = utils.combine(r1,r2);
    assert.deepEqual(r, answer);
  });


});