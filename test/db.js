var assert = require('assert');

var SERVER = 'https://myaccount.cloudant.com';
var url = SERVER + '/mydb';
var db = require('../index.js')(url);
var nosql = db;
var nock = require('nock');

describe('db', function() {

  it('should be an object', function() {
    assert(typeof db, 'object');
  });

  it('should have the requisite functions', function() {
    console.log(db);
    assert.equal(typeof db.setup, 'object');
    assert.equal(typeof db.setup.create, 'function');
    assert.equal(typeof db.setup.sum, 'function');
    assert.equal(typeof db.setup.count, 'function');
    assert.equal(typeof db.setup.stats, 'function');
    assert.equal(typeof db.setup.done, 'function');
    assert.equal(typeof db.insert, 'function');
    assert.equal(typeof db.sum, 'function');
    assert.equal(typeof db.count, 'function');
    assert.equal(typeof db.stats, 'function');                    
  });

  it('setup create - should create a database with no indexes if asked for', function() {
    var mocks = nock(SERVER)
      .put('/mydb').reply(200, {ok:true});
    return nosql.setup.create().then(function() {
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('setup sum - should setup a sum design doc', function() {
    var mocks = nock(SERVER)
      .get('/mydb/_design/cd458dd29b26234e54f194e3e41db2534f51865c').reply(404, {ok: false, err: 'not_found',reason:'missing'})
      .post('/mydb').reply(200, {ok:true, id:'_design/cd458dd29b26234e54f194e3e41db2534f51865c', rev:'1-123'})
      .get('/mydb/_design/cd458dd29b26234e54f194e3e41db2534f51865c/_view/cd458dd29b26234e54f194e3e41db2534f51865c?group=true').reply(200, {rows:[{key:null, value:52 }]});

    return nosql.setup.sum('price').then(function(data) {
      assert.equal(data, 52);
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('setup count - should setup a count design doc', function() {
    var mocks = nock(SERVER)
      .get('/mydb/_design/fc6b1f69427a0b83fb8317752a1e386a7c03c40b').reply(404, {ok: false, err: 'not_found',reason:'missing'})
      .post('/mydb').reply(200, {ok:true, id:'_design/fc6b1f69427a0b83fb8317752a1e386a7c03c40b', rev:'1-123'})
      .get('/mydb/_design/fc6b1f69427a0b83fb8317752a1e386a7c03c40b/_view/fc6b1f69427a0b83fb8317752a1e386a7c03c40b?group=true').reply(200, {rows:[{key:null, value:5}]});

    return nosql.setup.count().then(function(data) {
      assert.equal(data, 5)
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('setup stats - should setup a stats design doc', function() {
    var mocks = nock(SERVER)
      .get('/mydb/_design/55e12c8b9c4372e1aa7f054c5c0f66ce6a80a40d').reply(404, {ok: false, err: 'not_found',reason:'missing'})
      .post('/mydb').reply(200, {ok:true, id:'_design/55e12c8b9c4372e1aa7f054c5c0f66ce6a80a40d', rev:'1-123'})
      .get('/mydb/_design/55e12c8b9c4372e1aa7f054c5c0f66ce6a80a40d/_view/55e12c8b9c4372e1aa7f054c5c0f66ce6a80a40d?group=true').reply(200, {rows:[{key:null, value:{ sum: 281, count: 4, min: 45, max: 102, sumsqr: 21857 } }]});

    return nosql.setup.stats('price').then(function(data) {
      assert.equal(typeof data, 'object');
      assert.equal(typeof data.mean, 'number');
      assert.equal(typeof data.stddev, 'number');
      assert.equal(typeof data.variance, 'number');
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('setup done - should setup a number of databases (no design docs)', function() {
    var mocks = nock(SERVER)
      .get('/mydb/_all_docs?include_docs=true&startkey=%22_design%22&endkey=%22_design0%22&inclusive_end=false').reply(200, {total_rows:0, rows:[]})
      .put('/mydb_2018_01').reply(200, {ok:true})
      .put('/mydb_2018_02').reply(200, {ok:true})
      .put('/mydb_2018_03').reply(200, {ok:true})
      .put('/mydb_2018_04').reply(200, {ok:true})
      .put('/mydb_2018_05').reply(200, {ok:true})
      .put('/mydb_2018_06').reply(200, {ok:true})
      .put('/mydb_2018_07').reply(200, {ok:true})
      .put('/mydb_2018_08').reply(200, {ok:true})
      .put('/mydb_2018_09').reply(200, {ok:true})
      .put('/mydb_2018_10').reply(200, {ok:true})
      .put('/mydb_2018_11').reply(200, {ok:true})
      .put('/mydb_2018_12').reply(200, {ok:true})
      .put('/mydb_2019_01').reply(200, {ok:true});

    // create 13 databases from 2018_01 onwards
    return nosql.setup.done({ date: new Date('2018-01-01 10:10:00'), num_dbs:13}).then(function(data) {
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('setup done - should setup a number of databases (with design docs)', function() {
    var reply = {"total_rows":3,"offset":0,"rows":[
      {"id":"_design/46ad5de846aae8a91b9b454853ee2efc975b3971","key":"_design/46ad5de846aae8a91b9b454853ee2efc975b3971","value":{"rev":"1-bfb1b308fcbe4238a4f9556d6f72cf49"},"doc":{"_id":"_design/46ad5de846aae8a91b9b454853ee2efc975b3971","_rev":"1-bfb1b308fcbe4238a4f9556d6f72cf49","views":{"46ad5de846aae8a91b9b454853ee2efc975b3971":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } \n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var values = [\"cost\"];\n      var key = [];\n      var value = [];\n      var i = null;\n      if (fields) {\n        for(i in fields) {\n          var field = fields[i];\n          var f = extract(field);\n          key.push( f ? f : null);\n        }\n      }\n      if (value) {\n        for(i in values) {\n          var v = extract(values[i]);\n          if (!v) {\n            return;\n          }\n          value.push( v ? v : 0);\n        }\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      if (value.length ==1) {\n        value = value[0];\n      }\n      emit(key, value);\n    }","reduce":"_stats"}}}},
      {"id":"_design/633c7b84cdc7942d4194d22eb4192c63a2dab18a","key":"_design/633c7b84cdc7942d4194d22eb4192c63a2dab18a","value":{"rev":"1-c18694c90a888875b9e3761ab0b5557a"},"doc":{"_id":"_design/633c7b84cdc7942d4194d22eb4192c63a2dab18a","_rev":"1-c18694c90a888875b9e3761ab0b5557a","views":{"633c7b84cdc7942d4194d22eb4192c63a2dab18a":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } \n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var values = [\"weight\"];\n      var key = [];\n      var value = [];\n      var i = null;\n      if (fields) {\n        for(i in fields) {\n          var field = fields[i];\n          var f = extract(field);\n          key.push( f ? f : null);\n        }\n      }\n      if (value) {\n        for(i in values) {\n          var v = extract(values[i]);\n          if (!v) {\n            return;\n          }\n          value.push( v ? v : 0);\n        }\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      if (value.length ==1) {\n        value = value[0];\n      }\n      emit(key, value);\n    }","reduce":"_sum"}}}},
      {"id":"_design/6ea675f028013ca73a408fc00d3a242a7c2e1a36","key":"_design/6ea675f028013ca73a408fc00d3a242a7c2e1a36","value":{"rev":"1-dd8bd9b6bbeb5bd9dd515a2b54bd3ef4"},"doc":{"_id":"_design/6ea675f028013ca73a408fc00d3a242a7c2e1a36","_rev":"1-dd8bd9b6bbeb5bd9dd515a2b54bd3ef4","views":{"6ea675f028013ca73a408fc00d3a242a7c2e1a36":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } else {\n          return null;\n        }\n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var key = [];\n      for(var i in fields) {\n        var field = fields[i];\n        var f = extract(field);\n        key.push( f ? f : null);\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      emit(key, null);\n    }","reduce":"_count"}}}}
    ]};
    var bulk = {"docs":[
      {"_id":"_design/46ad5de846aae8a91b9b454853ee2efc975b3971","views":{"46ad5de846aae8a91b9b454853ee2efc975b3971":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } \n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var values = [\"cost\"];\n      var key = [];\n      var value = [];\n      var i = null;\n      if (fields) {\n        for(i in fields) {\n          var field = fields[i];\n          var f = extract(field);\n          key.push( f ? f : null);\n        }\n      }\n      if (value) {\n        for(i in values) {\n          var v = extract(values[i]);\n          if (!v) {\n            return;\n          }\n          value.push( v ? v : 0);\n        }\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      if (value.length ==1) {\n        value = value[0];\n      }\n      emit(key, value);\n    }","reduce":"_stats"}}},
      {"_id":"_design/633c7b84cdc7942d4194d22eb4192c63a2dab18a","views":{"633c7b84cdc7942d4194d22eb4192c63a2dab18a":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } \n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var values = [\"weight\"];\n      var key = [];\n      var value = [];\n      var i = null;\n      if (fields) {\n        for(i in fields) {\n          var field = fields[i];\n          var f = extract(field);\n          key.push( f ? f : null);\n        }\n      }\n      if (value) {\n        for(i in values) {\n          var v = extract(values[i]);\n          if (!v) {\n            return;\n          }\n          value.push( v ? v : 0);\n        }\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      if (value.length ==1) {\n        value = value[0];\n      }\n      emit(key, value);\n    }","reduce":"_sum"}}},
      {"_id":"_design/6ea675f028013ca73a408fc00d3a242a7c2e1a36","views":{"6ea675f028013ca73a408fc00d3a242a7c2e1a36":{"map":"function (doc) {\n\n      var extract = function(f) {\n        if (f) {\n          return doc[f];\n        } else {\n          return null;\n        }\n      };\n\n      var fields = [\"year\",\"month\",\"day\"];\n      var key = [];\n      for(var i in fields) {\n        var field = fields[i];\n        var f = extract(field);\n        key.push( f ? f : null);\n      }\n      if (key.length == 1) {\n        key = key[0];\n      }\n      emit(key, null);\n    }","reduce":"_count"}}}
    ]};
    
    var mocks = nock(SERVER)
      .get('/mydb/_all_docs?include_docs=true&startkey=%22_design%22&endkey=%22_design0%22&inclusive_end=false').reply(200, reply)
      .put('/mydb_2018_01').reply(200, {ok:true})
      .post('/mydb_2018_01/_bulk_docs', bulk ).reply(200, {ok:true})
      .put('/mydb_2018_02').reply(200, {ok:true})
      .post('/mydb_2018_02/_bulk_docs', bulk ).reply(200, {ok:true})
      .put('/mydb_2018_03').reply(200, {ok:true})
      .post('/mydb_2018_03/_bulk_docs', bulk ).reply(200, {ok:true});

    // create 3 databases from 2018_01 onwards, with design docs
    return nosql.setup.done({ date: new Date('2018-01-01 10:10:00'), num_dbs:3}).then(function(data) {
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

  it('insert - should add a document', function() {
    var d = new Date('2018-01-02 03:04:05');
    var docsend = { x:6 }
    var docsave = { x:6, year: 2018, month:1, day: 2, hour:3, min:4, second: 5}
 
    var mocks = nock(SERVER)
      .log(console.log)
      .post('/mydb_2018_01/_bulk_docs',{docs: [docsave]} ).reply(200, {ok:true, id:'mydoc', rev: '1-123' });

    return nosql.insert(docsend, d.getTime()).then(function(data) {
      assert(mocks.isDone());
    }).catch(function(err) {
      assert(false);
    });
  });

});