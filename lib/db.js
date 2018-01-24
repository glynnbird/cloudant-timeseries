var silverlining = require('../../silverlining/index.js')
var utils = require('./utils.js');

module.exports = function(url, dbname) {

  var coredb = silverlining(url, dbname);
  var coredbname = dbname;
  var coreurl = url;

  // create the database (without the Lucene index)
  var create = function() {
    return coredb.create({indexAll: false});
  };

  // create many future monthly databases
  // parameters:
  // opts - object { date , num_dbs }
  var setupDone = function(opts) {

    if (!opts) {
      otps = {
        date: new Date(), // now
        num_dbs: 24
      };
    }

    var now = opts.date;
    var y = now.getUTCFullYear();
    var m = now.getUTCMonth() + 1;
    var i = 0;
    var fs = [];
    var ddocs = [];

    // create an array of x promises
    for (var i = 0; i < opts.num_dbs; i++) {
      (function(year, month) { 
        fs[i] = function() {
          var name = utils.calculateDBName(coredbname, year, month);
          var db = silverlining(coreurl, name);
          return db.create({indexAll: false}).then(function(data) {
            if (ddocs.length == 0) {
              return null;
            }
            return db.insert(ddocs);
          });
        }
      })(y, m);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    // load the core database's design docs
    return coredb.designdocs().then(function(data) {
      ddocs = data;
      // create each new database in sequence
      return utils.sequence(fs);
    });
  };

  // insert documents singly or in bulk
  var insert = function(data, time) {
    if (!data) return;

    // if no time is supplied us 'now'
    if (!time) {
      time = (new Date()).getTime();
    }

    // calculate the y/m/d/h/m/s
    var now = new Date(time);
    var y = now.getUTCFullYear();
    var m = now.getUTCMonth() + 1;
    var d = now.getUTCDate();
    var h = now.getUTCHours();
    var min = now.getUTCMinutes();
    var s = now.getUTCSeconds();

    // add time info to each incoming doc
    if (!utils.isArray(data)) {
      data = [data];
    }
    for(var i in data) {
      var obj = data[i];
      obj.year = y;
      obj.month = m;
      obj.day = d;
      obj.hour = h;
      obj.min = min;
      obj.second = s;
    }

    // decide which database name to write to
    var name = utils.calculateDBName(coredbname, y, m);

    // write
    var s = silverlining(coreurl, name);
    return s.insert(data);
  }

  var getDbNames = function() {
    return coredb.dbs().then(function(data) {
      var retval = [];
      for (var i in data) {
        var d = data[i];
        if (d.indexOf(coredbname + '_') === 0) {
          retval.push(d);
        }
      }
      return retval;
    });
  }

  var sum = function(val, field) { 
    return getDbNames().then(function (databases) {
 
      var work = [];
      for(var i in databases) {
        (function(dbname) {
          work[i] = function() {
            var db = silverlining(coreurl, dbname);
            return db.sum(val, field);
          }
        })(databases[i]);
      }

      return utils.queue(work, 1, 3);
    }).then(function(results) {
      var retval = {};
      for(var i in results) {
        retval = Object.assign(retval, results[i])
      }
      return retval;
    });
  };

  var count = function(field) {
    return getDbNames().then(function (databases) {
 
      var work = [];
      for(var i in databases) {
        (function(dbname) {
          work[i] = function() {
            var db = silverlining(coreurl, dbname);
            return db.count(field);
          }
        })(databases[i]);
      }

      return utils.queue(work, 1, 3);
    }).then(function(results) {
      var retval = {};
      for(var i in results) {
        retval = Object.assign(retval, results[i])
      }
      return retval;
    });
  };

  var stats = function(val, field) {
    return getDbNames().then(function (databases) {
 
      var work = [];
      for(var i in databases) {
        (function(dbname) {
          work[i] = function() {
            var db = silverlining(coreurl, dbname);
            return db.stats(val, field);
          }
        })(databases[i]);
      }

      return utils.queue(work, 1, 3);
    }).then(function(results) {
      var retval = {};
      for(var i in results) {
        for(var j in results[i]) {
          if (retval[j]) {
            retval[j] = utils.combine(retval[j], results[i][j]);
          } else {
            retval[j] = results[i][j];
          }
        }

      }
      return retval;
    });
  };

  return {
    setup: {
      create: create,
      count: coredb.count,
      sum: coredb.sum,
      stats: coredb.stats,
      done: setupDone
    },
    insert: insert,
    count: count,
    sum: sum,
    stats: stats
  };

};