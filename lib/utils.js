var qrate = require('qrate')

// detect an array
var isArray = Array.isArray || function (obj) {
  return obj && toString.call(obj) === '[object Array]'
}

var isEmpty = function (x) {
  if (isArray(x) && x.length === 0) {
    return true
  }
  if (typeof x === 'object' && Object.keys(x).length === 0) {
    return true
  }
  return false
}

// pad a 1 or 2 digit number with leading 0
var pad = function (v) {
  return ('0' + v).slice(-2)
}

// calculate the database name from the stub, year & month e.g. mydbname_2017_01
var calculateDBName = function (dbname, year, month) {
  return dbname + '_' + year + '_' + pad(month)
}

// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
// execute of sequence of (Promise) tasks in series
var sequence = function (tasks) {
  return tasks.reduce((p, task) => p.then(task), Promise.resolve())
}

// concurrent and rate-limited queue
var queue = function (tasks, concurrency, rateLimit) {
  return new Promise(function (resolve, reject) {
    var responses = []
    var worker = function (f, done) {
      f().then(function (response) {
        responses.push(response)
        done(response)
      }).catch(done)
    }
    var q = qrate(worker, concurrency, rateLimit)
    for (var i in tasks) {
      q.push(tasks[i])
    }
    q.drain = function () {
      q.kill()
      resolve(responses)
    }
  })
}

var enhance = function (doc) {
  // if it's an object (not an array)
  if (doc && typeof doc === 'object' && typeof doc.length === 'undefined') {
    doc.mean = doc.sum / doc.count
    doc.variance = (doc.sumsqr / doc.count) - doc.mean * doc.mean
    doc.stddev = Math.sqrt(doc.variance)
  }
  return doc
}

// combine two aggregation objects
var combineObject = function (r1, r2) {
  if (typeof r1 === 'object') {
    return enhance({
      sum: r1.sum + r2.sum,
      count: r1.count + r2.count,
      min: Math.min(r1.min, r2.min),
      max: Math.max(r1.max, r2.max),
      sumsqr: r1.sumsqr + r2.sumsqr
    })
  } else if (typeof r1 === 'number') {
    return r1 + r2
  }
}

var first = function (obj) {
  const k = Object.keys(obj)[0]
  return obj[k]
}

// combine aggregation results
var combine = function (r1, r2) {
  if (isEmpty(r2)) {
    return r1
  }
  if (isEmpty(r1)) {
    return r2
  }
  var f = first(r1)
  var i = null

  //  { '2018' : { 'weight: { sum: 1, count: 2, variance: 2 ... }, 'cost': { sum: 1, count: 2, variance: 2 ... }}

  if (typeof r1 === 'object' && typeof f === 'object' && typeof f.variance === 'undefined') {
    for (i in r2) {
      for (var j in r2[i]) {
        if (r1[i]) {
          r1[i][j] = enhance(combineObject(r1[i][j], r2[i][j]))
        } else {
          r1[i] = {}
          r1[i][j] = r2[i][j]
        }
      }
    }
    return r1
  } else //  { '2018' : { sum: 1, count: 2, variance: 2 ... }}
    if (typeof r1 === 'object' && typeof f === 'object' && f.variance !== 'undefined') {
      for (i in r2) {
        if (r1[i]) {
          r1[i] = enhance(combineObject(r1[i], r2[i]))
        } else {
          r1[i] = r2[i]
        }
      }
      return r1
    } else {
      return combineObject(r1, r2)
    }
}

module.exports = {
  isArray: isArray,
  pad: pad,
  calculateDBName: calculateDBName,
  sequence: sequence,
  queue: queue,
  first: first,
  combine: combine,
  combineObject: combineObject
}
