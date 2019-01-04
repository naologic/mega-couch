# mega-couch
A Couchdb library for NodeJS written in typescript

Why?
**Because nano couch and nanoAsync are hard to work with in modern async/await syntax. CouchDB is a very powerful database at it must have a proper library to connect and consume**

Objectives
  + use only the axios library as dependency
  + user has the ability to abort, cancel a ongoing request
  + user has the ability to set a timeout
  + developer can run bulk commands on multiple databases
  + full support for sync, replicate, cluster commands
  + ability to migrate documents only by bulk writing
  + full support for design docs, view docs, update docs
  + ability to select couchdb or couchbase as a connector or connect to both
  
  
Publish to `npm` and create a `nestjs` plugin as well
  
Will be Made with :heart: by [naologic](https://naologic.com) in :us: San Francisco
