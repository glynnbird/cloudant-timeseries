
// detect an array
var isArray = Array.isArray || function(obj) {
  return obj && toString.call(obj) === '[object Array]';
};

// pad a 1 or 2 digit number with leading 0
var pad = function(v) {
  return ('0' + v).slice(-2);
}

// calculate the database name from the stub, year & month e.g. mydbname_2017_01
var calculateDBName = function(dbname, year, month) {
  return dbname + '_' + year + '_' + pad(month);
}

// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
// execute of sequence of (Promise) tasks in series
var sequence = function (tasks) {
  return tasks.reduce((p, task) => p.then(task), Promise.resolve())
}

module.exports = {
  isArray: isArray,
  pad: pad,
  calculateDBName: calculateDBName,
  sequence: sequence
}