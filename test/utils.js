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

});