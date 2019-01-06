import { MangoSelector, MangoValue, SortOrder } from 'nano';

export interface CouchOK {
  ok: boolean;
}

export interface MegaCreateDBRequest {
  // nada
}

export interface MegaDocument {
  _id: string;
  _rev: string;
  _revisions?: MegaDocumentRevisionList;
  [index: string]: any;
}

export interface MegaDocumentCreated {
  id: string;
  rev: string;
  ok: boolean;
  error?: string; // "error" : "conflict",
  reason?: string; // "reason" : "Document update conflict."
}

export interface MegaDatabaseBulkGetRaw {
  results: MegaDatabaseBulkGetDoc[];
}

export interface MegaDatabaseBulkGetDoc {
  id: string;
  docs: {
    ok: MegaDocument // OK is the content of the doc
  }[];
}

export interface MegaDatabaseAllDocs {
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

export interface MegaDatabaseInfo {
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
export interface MegaDocumentRevisionList {
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
  docs: MegaDocument[];
  execution_stats: {
    total_keys_examined: number;
    total_docs_examined: number;
    total_quorum_docs_examined: number;
    results_returned: number;
    execution_time_ms: number;
  };
}