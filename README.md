# cloudant-timeseries

The *cloudant-timeseries* library is an abstraction that allows multiple monthly databases to be treated as a single database. 

Imagine you are storing web traffic events in a single, ever-growing Cloudant/CouchDB database with documents like this:

```js
{
  "_id": "someid",
  "year": 2018,
  "month", 1,
  "day": 24,
  "hour": 20,
  "minute": 59,
  "second": 0,
  "event_type": "click",
  "browser": "chrome",
  "page_speed": 1.042
}
```

and using Cloudant's MapReduce views to aggregate the data, grouping by year, month, day etc. This works great until you come to archive your old data. How do you archive the data from 2015 if all the data is in the same ever-growing database? It turns out you can't. You can delete individual documents but that's impractical when you want to remove a year's worth of data. Deletion also leaves a stub document hanging around so you don't get all of your disk space back.

The only way to cleanly delete data is to delete a whole database. This is where *cloudant-timeseries* comes in.

You interact with library as if you are talking to a single ever-growing database, but under-the-hood it is a collection of monthly databases.

![schematic](images/schematic.png)

It is built on top of the the [cloudant-quickstart](https://www.npmjs.com/package/cloudant-quickstart) library which handles the aggregation API.

## Pre-requisites

- [Node.js & npm](https://nodejs.org/en/)
- an Apache CouchDB or IBM Cloudant instance

## Installation

Build `cloudant-timeseries` into your own Node.js project with:

    npm install --save cloudant-timeseries

## Creating a database

Given a URL which contains your Cloudant or CouchDB service's admin credentials

    var url = "https://user:pass@myaccount.cloudant.com"

You can import the library into your code, passing the url and your database name:

    var db = require('cloudant-timeseries')(url, 'analytics')

or you can combine the two:

    var url = "https://user:pass@myaccount.cloudant.com/analytics"
    var db = require('cloudant-timeseries')(url)

We can then go ahead and do the one-off setup of our database:

    db.setup.create().then( () => {
        return db.setup.count('browser',['year','month','day']) 
      }).then( () => { 
        return db.setup.count('year')
      }).then( () => {
        return db.setup.stats('page_speed',['year','month','day']) 
      }).then( () => {
        return db.setup.done() 
      }).catch(console.error);

or in a slightly more compact form:

    db.setup.create()
      .then( () => db.setup.count('browser',['year','month','day']) )
      .then( () => db.setup.count('year')
      .then( () => db.setup.stats('page_speed',['year','month','day']) )
      .then( () => db.setup.done() )
      .catch(console.error);

This instructs *cloudant-timeseries* to

- create the database
- setup a design document to count instances of the 'browser' field by year, month and day
- setup a design document to count documents by year
- setup a design document to get stats on the 'page_speed' field
- commits this change (the call to setup.done()), which actually does the writing to Cloudant

This takes a little while because 2 years of monthly databases are created with the correct design documents.

## Just add data

Now we're set up, we can start adding data, a document at a time:

    var obj = { 
      event_type: 'click',
      browser: 'chrome',
      page_speed: 1.5
    }
    db.insert(obj).then(console.log)

or in bulk:

    var obj1 = { 
      event_type: 'click',
      browser: 'chrome',
      page_speed: 1.5
    }
    var obj2 = { 
      event_type: 'click',
      browser: 'safari',
      page_speed: 1.2
    }
    db.insert([obj1, obj2]).then(console.log)

You don't need to provide the `year`, `month`, `day`, `hour`, `minute`, `second` fields - they are added automatically. Data is added with a timestamp of *now* unless you supply a second parameter containing a custom timestamp:

    ts = '2017-06-24 10:22:44'
    db.insert([obj1, obj2], ts).then(console.log)

The *cloudant-timeseries* library uses the timestamp to decide which *under-the-hood* database the data will be stored in.

## Querying the data set

Once we have data in a one or more monthly collection we can query the data 

    // get the counts of browsers grouped by year, month and day
    db.count('browser',['year','month','day'])).then(console.log)

    // get document counts by year
    db.count('year').then(console.log)

    // get stats on the page_speed, grouped by year, month and day
    db.stats('page_speed',['year','month','day']).then(console.log)

These were the three queries we set up at the beginning. We can add new ones if we like:

    // get stats on the page_speed, grouped by year
    db.stats('page_speed','year').then(console.log)

and the library will create any design documents required.

## How does this all work?

## Running setup again

