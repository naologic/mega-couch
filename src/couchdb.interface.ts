
export interface CouchOK {
  ok: boolean;
}

export interface MegaCreateDBRequest {
  // nada
}

export interface MegaCouchServerConfig {
  host: string;
  user: string;
  password: string;
  url: string;
  port: number;
  localPort?: number; // only needed for clusters
}

export interface MegaCouchDocument {
  _id?: string; // (string) – Document ID
  _rev?: string; // (string) – Revision MVCC token
  _deleted?: boolean; // (boolean) – Deletion flag. Available if document was removed
  _attachments?: any; // (object) – Attachment’s stubs. Available if document has any attachments todo: replace any with correct interface
  _conflicts?: any[]; // (array) – List of conflicted revisions. Available if requested with conflicts=true query parameter todo: replace any with correct interface
  _deleted_conflicts?: any[]; // (array) – List of deleted conflicted revisions. Available if requested with deleted_conflicts=true query parameter todo: replace any with correct interface
  _local_seq?: string; // (string) – Document’s update sequence in current database. Available if requested with local_seq=true query parameter
  _revs_info?: any[]; // (array) – List of objects with information about local revisions and their status. Available if requested with open_revs query parameter todo: replace any with correct interface
  _revisions?: MegaCouchDocumentRevisionList; // (object) – List of local revision tokens without. Available if requested with revs=true query parameter todo: replace any with correct interface

  [index: string]: any;
}

export interface MegaCouchDocumentInfo {
  status: number;
  statusText: string; // 'OK';
  headers:{
    'cache-control': string; // 'must-revalidate';
    connection: string; // 'close';
    'content-length': string; // '92';
    'content-type': string; // 'application/json';
    date: string; // 'Sun; 06 Jan 2019 13:40:14 GMT';
    etag: string; // '"2-0d2e30d5d91ff4059add4c701a4e6861"';
    server: string; // 'CouchDB/2.3.0 (Erlang OTP/19)';
    'x-couch-request-id': string; // '28bbb9e455';
    'x-couchdb-body-time': string; // '0'
  };
  _id?: string;
  _rev?: string;
}

export interface MegaDocumentCreated {
  id: string;
  rev: string;
  ok: boolean;
  error?: string; // "error" : "conflict",
  reason?: string; // "reason" : "Document update conflict."
  note?: string; // a note regarding the save
}

export interface MegaCouchDocumentOptions {
  full_commit?: boolean; // custom option: set the full commit flag to override the internal policy
}

export interface MegaCouchDocumentGetParams {
  attachments?: boolean; // (boolean) – Includes attachments bodies in response. Default is false
  att_encoding_info?: boolean; // (boolean) – Includes encoding information in attachment stubs if the particular attachment is compressed. Default is false.
  atts_since?: string[]; // (array) – Includes attachments only since specified revisions. Doesn’t includes attachments for specified revisions. Optional
  conflicts?: boolean; // (boolean) – Includes information about conflicts in document. Default is false
  deleted_conflicts?: boolean; // (boolean) – Includes information about deleted conflicted revisions. Default is false
  latest?: boolean; // (boolean) – Forces retrieving latest “leaf” revision, no matter what rev was requested. Default is false
  local_seq?: boolean; // (boolean) – Includes last update sequence for the document. Default is false
  meta?: boolean; // (boolean) – Acts same as specifying all conflicts, deleted_conflicts and revs_info query parameters. Default is false
  open_revs?: 'all'|string[]; // (array) – Retrieves documents of specified leaf revisions. Additionally, it accepts value as all to return all leaf revisions. Optional
  rev?: string; // (string) – Retrieves document of specified revision. Optional
  revs?: boolean; // (boolean) – Includes list of all known document revisions. Default is false
  revs_info?: boolean; // (boolean) – Includes detailed information for all known document revisions. Default is false
}

export interface MegaCouchDocumentPutParams {
  id: string;
  rev: string; // (string) – Document’s revision if updating an existing document. Alternative to If-Match header or document key. Optional
  batch?: string; // (string) – Stores document in batch mode. Possible values: ok. Optional
  new_edits?: boolean; // (boolean) – Prevents insertion of a conflicting document. Possible values: true (default) and false. If false, a well-formed _rev must be included in the document. new_edits=false is used by the replicator to insert documents into the target database even if that leads to the creation of conflicts. Optional
}

export interface MegaDatabaseBulkGetRaw {
  results: MegaCouchDatabaseBulkGetDoc[];
}

export interface MegaCouchDatabaseBulkGetDoc {
  id: string;
  docs: {
    ok: MegaCouchDocument // OK is the content of the doc
  }[];
}

export interface MegaCouchDatabaseAllDocs {
  total_rows: number;
  rows: {
    value: {
      rev: string;
    };
    id: string;
    key: string;
  }[];
  offset: string;
}

export interface MegaCouchDatabaseInfo {
  cluster: {
    n: number; // (number) – Replicas. The number of copies of every document.
    q: number; // (number) – Shards. The number of range partitions.
    r: number; // (number) – Read quorum. The number of consistent copies of a document that need to be read before a successful reply.
    w: number; // (number) – Write quorum. The number of copies of a document that need to be written before a successful reply.
  };
  compact_running: boolean; //  (boolean) – Set to true if the database compaction routine is operating on this database.

  db_name: string; // (string) – The name of the database.

  disk_format_version: number; // (number) – The version of the physical format used for the data when it is stored on disk.

  data_size: number; // (number) – Deprecated. Use sizes.active instead.

  disk_size: number; // disk_size (number) – Deprecated. Use sizes.file instead.

  doc_count: number; // (number) – A count of the documents in the specified database.

  doc_del_count: number; //  (number) – Number of deleted documents

  instance_start_time: string; // (string) – Always "0". (Returned for legacy reasons.)

  purge_seq: string; // (string) – An opaque string that describes the purge state of the database. Do not rely on this string for counting the number of purge operations.

  sizes: {
    active: number; // (number) – The size of live data inside the database, in bytes.
    external: number; // (number) – The uncompressed size of database contents in bytes.
    file: number; // (number) – The size of the database file on disk in bytes. Views indexes are not included in the calculation.
  };

  update_seq: string; // (string) – An opaque string that describes the state of the database. Do not rely on this string for counting the number of updates.
}

/**
 *
 * "_revisions": {
 *    "start": 4,
 *    "ids": [
 *      "753875d51501a6b1883a9d62b4d33f91",
 *      "efc54218773c6acd910e2e97fea2a608",
 *      "2ee767305024673cfb3f5af037cd2729",
 *      "4a7e4ae49c4366eaed8edeaea8f784ad"
 *    ]
 *  }
 *
 *
 *
 */
export interface MegaCouchDocumentRevisionList {
  start: number;
  ids: string[];
}

export type MegaQuerySelectorValue = number | string | Date | boolean;
export type MegaQueryOperator = '$eq' | '$gt' | '$gte' | '$lt' | '$lte';
export type MegaQuerySortOrder = string | string[] | { [key: string]: 'asc' | 'desc' };


export interface MegaQuerySelector {
  [index: string]: MegaQuerySelector | MegaQuerySelectorValue | MegaQuerySelectorValue[] | {
    [key: string]: MegaQuerySelector | MegaQuerySelectorValue | MegaQuerySelectorValue[]
  };
}

/**
 *
 *  @example
 *      {
 *          "selector": {
 *              "year": {"$gt": 2010}
 *          },
 *          "fields": ["_id", "_rev", "year", "title"],
 *          "sort": [{"year": "asc"}],
 *          "limit": 2,
 *          "skip": 0,
 *          "execution_stats": true
 *      }
 *
 *
 */
export interface MegaQueryFind {
  // http://docs.couchdb.org/en/2.3.0/api/database/find.html#find-selectors
  selector: MegaQuerySelector; // (json) – JSON object describing criteria used to select documents. More information provided in the section on selector syntax. Required

  limit?: number; // (number) – Maximum number of results returned. Default is 25. Optional

  skip?: number; //  (number) – Skip the first ‘n’ results, where ‘n’ is the value specified. Optional

  // http://docs.couchdb.org/en/2.3.0/api/database/find.html#find-sort
  /**
   *  @example
   *      [{"fieldName1": "desc"}, {"fieldName2": "desc" }]
   *      ["fieldNameA", "fieldNameB"] // sort with defgault setting
   *
   *
   */
  sort?: MegaQuerySortOrder[]; // (json) – JSON array following sort syntax. Optional

  // http://docs.couchdb.org/en/latest/api/database/find.html#filtering-fields
  fields?: string[]; // (array) – JSON array specifying which fields of each object should be returned. If it is omitted, the entire object is returned. More information provided in the section on filtering fields. Optional

  // Instruct a query to use a specific index.
  // Specified either as "<design_document>" or ["<design_document>", "<index_name>"].
  use_index?: string | [string, string];

  r?: number; // (number) – Read quorum needed for the result. This defaults to 1,

  bookmark?: string; //  (string) – A string that enables you to specify which page of results you require. Default null

  update?: boolean; // (boolean) – Whether to update the index prior to returning the result. Default is true. Optional

  stable?: boolean; //  (boolean) – Whether or not the view results should be returned from a “stable” set of shards. Optional

  stale?: 'ok' | false; // (string) – Combination of update=false and stable=true options. Possible options: "ok", false (default). Optional

  // http://docs.couchdb.org/en/2.3.0/api/database/find.html#find-statistics
  execution_stats?: boolean; //  (boolean) – Include execution statistics in the query response. Optional, default: ``false``
}

export interface MegaQueryFindResponse {
  docs: MegaCouchDocument[];
  execution_stats: {
    total_keys_examined: number;
    total_docs_examined: number;
    total_quorum_docs_examined: number;
    results_returned: number;
    execution_time_ms: number;
  };
}

export interface MegaQueryExplainFindResponse {
  dbname: string;

  index: {
    ddoc: string;
    name: string;
    type: string;
    def: {
      fields: any[];
    }
  };

  selector: MegaQuerySelector; // (json) – JSON object describing criteria used to select documents. More information provided in the section on selector syntax. Required

  limit?: number; // (number) – Maximum number of results returned. Default is 25. Optional

  skip?: number; //  (number) – Skip the first ‘n’ results, where ‘n’ is the value specified. Optional

  fields: string[];

  range: {
    start_key: any[];
    end_key: any[];
  };
  opts: {
    use_index?: string | [string, string];

    bookmark?: string; //  (string) – A string that enables you to specify which page of results you require. Default null

    limit?: number; // (number) – Maximum number of results returned. Default is 25. Optional

    skip?: number; //  (number) – Skip the first ‘n’ results, where ‘n’ is the value specified. Optional

    sort?: MegaQuerySortOrder[]; // (json) – JSON array following sort syntax. Optional

    fields: string[];

    r: number[];

    conflicts: boolean;
  };
}


export interface IUserRole {
  names: string[];
  roles: string[];
}

export interface MegaCouchAuthorizationDocument {
  admins: IUserRole;
  members: IUserRole;

export  interface MegaCouchDesignDocumentFilter {
  ( doc: MegaCouchDocument, req: any ): boolean;
}

export  interface MegaCouchDesignDocumentList {
  ( head: {total_rows: number, offset: number}, req: any ): string;
}

export  interface MegaCouchDesignDocumentShow {
  ( doc: MegaCouchDocument, req: any ): string | any;
}

export  interface MegaCouchDesignDocumentUpdate {
  ( doc: MegaCouchDocument, req: any ): [];
}

export  interface MegaCouchDesignDocumentValidate {
  ( newDoc: MegaCouchDocument, oldDoc: MegaCouchDocument , userCtx: any, secObj: any ): void;
}

export interface MegaCouchDesignDocumentView {
  ( doc: MegaCouchDocument ): void;
}

export  interface MegaCouchDesignDocument {
    language?: string; // Defines Query Server key to process design document functions. Default is Javascript
    options?: any; // (object): View’s default options

  /**
   * @param doc The document that is being processed
   * @param req – Request object
   * Returns:Boolean value: true means that doc passes the filter rules, false means that it does not.
   * @example
   *     function(doc, req){
   * // we need only `mail` documents
   * if (doc.type != 'mail'){
   *    return false;
   * }
   * // we're interested only in `new` ones
   * if (doc.status != 'new'){
   *     return false;
   * }
   * return true; // passed!
   * }
   */
    filters?: {[key: string]: MegaCouchDesignDocumentFilter} //  Filter functions mostly act like Show Functions and List Functions: they format, or filter the changes feed.

  /**
   * @param head // contains information about the view
   * example
   *  {total_rows:10, offset:0}
   * @param req – Request object
   * Returns:Last chunk(string)
   *
   * @example
   * // The following list function formats the view and represents it as a very simple HTML page:
   *     function(head, req) {
   * start({
   * 'headers': {
   *     'Content-Type': 'text/html'
   * }
   * });
   * send('<html><body><table>');
   * send('<tr><th>ID</th><th>Key</th><th>Value</th></tr>');
   * while(row = getRow()){
   *    send(''.concat(
   *        '<tr>',
   *        '<td>' + toJSON(row.id) + '</td>',
   *         '<td>' + toJSON(row.key) + '</td>',
   *         '<td>' + toJSON(row.value) + '</td>',
   *         '</tr>'
   *     ));
   * }
   * send('</table></body></html>');
   * }
   */
    lists?: {[key: string]: MegaCouchDesignDocumentList}; // While Show Functions are used to customize document presentation, List Functions are used for the same purpose, but on View Functions results.

    rewrites?: string | any[]; // (array or string): Rewrite rules definition

  /**
   * @param doc – The document that is being processed; may be omitted.
   * @param req – Request object
   * Returns: Response object (Object or string)
   *  @example
   *  function(doc, req){
   * if (doc) {
   *    return "Hello from " + doc._id + "!";
   * } else {
   *   return "Hello, world!";
   * }
   * }
   */
    shows?: {[key: string]: MegaCouchDesignDocumentShow}; // Show functions are used to represent documents in various formats, commonly as HTML pages with nice formatting. They can also be used to run server-side functions without requiring a pre-existing document.

  /**
   * @param doc – The document that is being processed; may be omitted.
   * @param req – Request object
   *  Returns: Two-element array: the first element is the (updated or new) document, which is committed to the database. If the first element is null no document will be committed to the database. If you are updating an existing document, it should already have an _id set, and if you are creating a new document, make sure to set its _id to something, either generated based on the input or the req.uuid provided. The second element is the response that will be sent back to the caller.
   *  @example
   * function(doc, req){
   * if (!doc){
   *    if ('id' in req && req['id']){
   *         // create new document
   *         return [{'_id': req['id']}, 'New World']
   *   }
   *     // change nothing in database
   *     return [null, 'Empty World']
   * }
   * doc['world'] = 'hello';
   * doc['edited_by'] = req['userCtx']['name']
   * return [doc, 'Edited World!']
   * }
   */

    updates?: {[key: string]: MegaCouchDesignDocumentUpdate}; // Update handlers are functions that clients can request to invoke server-side logic that will create or update a document

    // http://guide.couchdb.org/editions/1/en/validation.html
    validate_doc_update?: {[key: string]: MegaCouchDesignDocumentValidate}; //  Validate Document Update Functions prevent invalid or unauthorized document update requests from being stored

  /**
   * @param doc – The document that is being processed
   * function (doc) {
   *   if (doc.type === 'post' && doc.tags && Array.isArray(doc.tags)) {
   *     doc.tags.forEach(function (tag) {
   *       emit(tag.toLowerCase(), 1);
   *     });
   *  }
   * }
   */
    views?:  {[key: string]: MegaCouchDesignDocumentView } 
}
