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