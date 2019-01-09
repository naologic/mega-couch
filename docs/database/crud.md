# Database

Connect to database using `Couch2Server`.

```typescript
// -->Init: db
const couchServer = new Couch2Server({
    host: 'http',
    user: 'admin',
    password: 'admin',
    url: 'localhost',
    port: 5984
});
```

Connect to database using `Couch2Server` using credentials from `.env` variables.

```typescript
// -->Init: db
const couchServer = new Couch2Server();
await couchServer.initLocal();
```

## use
Use a database
> `use(dbname: string): Promise<Couch2Db>`

- `dbName` must by validated by `RegExp(/^[a-z][a-z0-9_$()+/-]*$/g)`

```typescript
const db$ = couchServer.use('superherodb');
```

## info()
Gets information about the specified database
> `info(): Promise<MegaDatabaseInfo>`

```typescript
const info = await db$.info();
console.log(info);
```

## createOrThrow()
Create a new database or throw an error if it already exists
> `createOrThrow(): Promise<boolean>`

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Create:
const worked = await newdb$.createOrThrow();
```

## createIfNotExists()
Create a new database if it doesn't exist
> `createIfNotExists(): Promise<boolean>`

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Create:
const worked = await newdb$.createIfNotExists();
```

## exists()
Check if a database exists
> `exists(): Promise<boolean>`

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Check: if it exists
const exists = await newdb$.exists();
```

## allDocs()
Returns all the documents in the database
> `allDocs(keys?: string[]): Promise<MegaCouchDatabaseAllDocs>`

- `keys` (array) – Return only documents that match the specified keys. Optional

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get all documents from databse
const allDocs = await newdb$.allDocs();
```

## allUserDocs()
Returns all the documents in the database except the `_` system docs
> `allUserDocs(keys?: string[]): Promise<MegaCouchDatabaseAllDocs>`

- `keys` (array) – Return only documents that match the specified keys. Optional

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get documents from databse
const allUserDocs = await newdb$.allUserDocs();
```

## bulkGetRaw()
Returns all the documents in bulk
> `bulkGetRaw(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false): Promise<{results: MegaCouchDatabaseBulkGetDoc[]}>`

- `docs` (array)
- `listAllRevs` (boolean)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get documents from databse
const allDocs = await newdb$.bulkGetRaw();
```

## bulkGet()
Returns all the documents in bulk
> `bulkGet(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false, removeSystemDocs = false): Promise<MegaCouchDocument[]>`

- `docs` (array)
- `listAllRevs` (boolean)
- `removeSystemDocs` (boolean)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get documents from databse
const allDocs = await newdb$.bulkGet();
```

## bulkInsertRaw()
Creates multiple documents at the same time within a single request

> `bulkInsertRaw(docs?: MegaCouchDocument[]): Promise<MegaDocumentCreated[]>`

- `docs` (array)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Insert documents in database
const insertDocs = await newdb$.bulkInsertRaw();
```

## bulkUpdateRaw()
Updates multiple documents at the same time within a single request

> `bulkUpdateRaw(docs?: MegaCouchDocument[]): Promise<MegaDocumentCreated[]>`

- `docs` (array)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Update documents in database
const updateDocs = await newdb$.bulkUpdateRaw();
```

## docInfo()
Gets information on the specified document

> `docInfo(docId: string): Promise<MegaCouchDocumentInfo>`

- `docId` (string)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get doc info
const docInfo = await newdb$.docInfo();
```

## docGet()
Gets a document from the database

> `docGet<T>(docId: string, params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & T>`

- `docId` (string)
- `params`

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get document
const doc = await newdb$.docGet();
```

## docGetOrThrow()
Gets a document from the database or throw an error if not found

> `docGetOrThrow<T>(docId: string, params?: MegaCouchDocumentGetParams):
> Promise<MegaCouchDocument & T>`

- `docId` (string)
- `params` Optional

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Get document
const doc = await newdb$.docGetOrThrow();
```

## exists()
Check if a document exists
> `docExists(docId: string): Promise<boolean>`

- `docId` (string)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Check: if it exists
const docExists = await newdb$.exists();
```

## docCreate()
Create a document
> `docCreate(data: MegaCouchDocument, params?: MegaCouchDocumentPutParams):Promise<MegaDocumentCreated>`

- `data`
- `params` Optional

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Create:
const newDoc = await newdb$.docCreate();
```

## docCreateWithId()
Create a document with a fixed ID
> `docCreateWithId(docId: string, data: MegaCouchDocument, params?: MegaCouchDocumentPutParams): Promise<MegaDocumentCreated>`

- `docId` (string)
- `data`
- `params` Optional

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Create:
const newDoc = await newdb$.docCreateWithId();
```

## docUpdate()
Update an existing document
> `docUpdate(data: MegaCouchDocument, params: MegaCouchDocumentPutParams): Promise<MegaDocumentCreated>`

- `data`
- `params` 

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Update:
const updatedDoc = await newdb$.docUpdate();
```

## docDelete()
 Delete a specific revision of a document
> `docDelete(docId: string, rev: string, params?: {batch?: 'ok', rev?: string}): Promise<MegaDocumentCreated>`

- `docId` (string)
- `rev` (string)
- `params` 

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// --Delete a document:
const deletedDoc = await newdb$.docDelete();
```
## docCopy()
  Copies an existing document to a new or existing document

## findRaw()
 Find documents using a declarative JSON querying syntax
> `findRaw(req: MegaQueryFind): Promise<MegaQueryFindResponse>`

 ```typescript
 MegaQueryFind example
    {
          "selector": {
              "year": {"$gt": 2010}
          },
          "fields": ["_id", "_rev", "year", "title"],
          "sort": [{"year": "asc"}],
          "limit": 2,
          "skip": 0,
          "execution_stats": true
    }
```


```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// --Find a document:
const foundDoc = await newdb$.findRaw();
```

## explainFind()
Shows which index is being used by the query. Parameters are the same as `findRaw()`
> `explainFind(req: MegaQueryFind): Promise<MegaQueryExplainFindResponse>`

- `req: MegaQueryFind`


```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Explain find:
const explainFind = await newdb$.explainFind();
```

## destroy()
Destroy this database
> `destroy(): Promise<boolean>`


```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Destroy:
const destroyDb = await newdb$.destroy();
```

## replicateTo()
Replicate from local to remote
> `replicateTo(db: Couch2Db, _id?: string, createTarget = true, continuous = false): Promise<MegaDocumentCreated>`

- `db`
- `_id`
- `continuous`
- `createTarget`


```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Replicate:
const replicateDb = await newdb$.replicateTo();
```

## replicateFrom()
Replicate from remote to local
> `replicateFrom(db: Couch2Db, _id?: string, createTarget = true, continuous = false): Promise<MegaDocumentCreated>`

- `db`
- `_id`
- `createTarget`
- `continuous`


```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Replicate:
const replicateDb = await newdb$.replicateFrom();
```

## setRevsLimit()
Sets the maximum number of document revisions that will be tracked by CouchDB, even after compaction has occurred.
> `setRevsLimit(dbName: string, limit: number): Promise<boolean>`

- `dbName` (string)
- `limit` (number)

```typescript
// -->Use: a new db
const newdb$ = couchServer.use('starbucksnew');
// -->Set rev limit:
const revisionsLimit = await newdb$.setRevsLimit();
```

 