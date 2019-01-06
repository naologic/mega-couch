import { isNumber } from 'lodash';
import { Couch2Server } from './couch2.server';
import {
  CouchOK,
  MegaCouchDocumentGetParams,
  MegaCouchDatabaseAllDocs,
  MegaCouchDatabaseBulkGetDoc,
  MegaCouchDatabaseInfo,
  MegaCouchDocument,
  MegaDocumentCreated,
  MegaQueryExplainFindResponse,
  MegaQueryFind,
  MegaQueryFindResponse,
  MegaCouchDocumentInfo, MegaCouchDocumentPutParams,
} from './couchdb.interface';
import { Couch2Doc } from './couch2.doc';
import { logg } from '../../system/utils';
import { AxiosResponse } from 'axios';


export class Couch2Db {
  private readonly url: string;

  constructor(
    public readonly name: string,
    public readonly server: Couch2Server,
    options?
  ) {
  }

  public use<T>(docId = null): Couch2Doc<T> {
    return new Couch2Doc<T>(docId, this);
  }

  /**
   * Create only if it doesn't exist
   */
  public async createIfNotExists(): Promise<boolean> {
    const exists = await this.exists();
    if (!exists) {
      return this.createOrThrow();
    }
  }

  /**
   * Create the db or throw an error
   */
  public async createOrThrow(): Promise<boolean> {
    return this.server.dbCreate(this.name);
  }

  /**
   * Check if this database exists
   */
  public async exists(): Promise<boolean> {
    return this.server.dbExists(this.name);
  }

  /**
   * Get info on the current database
   */
  public async info(): Promise<MegaCouchDatabaseInfo> {
    return this.server.dbInfo(this.name);
  }

  /**
   * Fetch _all_docs view
   * @param keys
   */
  public async allDocs(keys?: string[]): Promise<MegaCouchDatabaseAllDocs> {
    if (Array.isArray(keys) && keys.length > 0) {
      return this.server.post(`${this.name}/_all_docs`, keys);
    }

    return this.server.get(`${this.name}/_all_docs`);
  }

  /**
   * Fetch _all_docs view except the _ system docs
   * @param keys
   */
  public async allUserDocs(keys?: string[]): Promise<MegaCouchDatabaseAllDocs> {
    return this.allDocs(keys)
      .then(res => {
        if (res && res.total_rows > 0) {
          res.rows = res.rows.filter(doc => !doc.id.startsWith('_'));
          res.total_rows = res.rows.length;
        }
        return res;
      });
  }

  /**
   * Get documents in bulk
   * @param docs
   * @param listAllRevs
   */
  public async bulkGetRaw(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false): Promise<{results: MegaCouchDatabaseBulkGetDoc[]}> {
    const params = {params: {revs: listAllRevs}};
    return this.server.post(`${this.name}/_bulk_get`, {docs}, {params});
  }

  /**
   * Get documents in bulk
   * @param docs
   * @param listAllRevs
   * @param removeSystemDocs
   */
  public async bulkGet(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false, removeSystemDocs = false): Promise<MegaCouchDocument[]> {
    return this.bulkGetRaw(docs, listAllRevs)
      .then(d => {
        if (removeSystemDocs) {
          d.results = d.results.filter(doc => !doc.id.startsWith('_'));
        }

        if (d && d.results) {
          return d.results
            .filter(rootDoc => Array.isArray(rootDoc.docs))
            .map(docss => docss.docs[0].ok);
        }
        return [];
      });
  }


  public async bulkInsertRaw(docs?: MegaCouchDocument[]): Promise<MegaDocumentCreated[]> {
    return this.server.post(`${this.name}/_bulk_docs`, {docs});
  }

  public async bulkUpdatetRaw(docs?: MegaCouchDocument[]): Promise<MegaDocumentCreated[]> {
    return this.server.post(`${this.name}/_bulk_docs`, {docs});
  }

  /**
   * Get info on the current database
   */
  public async docInfo(docId: string): Promise<MegaCouchDocumentInfo> {
    return this.server.head<AxiosResponse>(`${this.name}/${docId}`)
      .then(ress => {
        if (ress) {
          // --Get: rev
          const _rev = ress.headers && ress.headers.etag ? JSON.parse(ress.headers.etag) : null;
          return {
            exists: ress.status === 200,
            status: ress.status,
            statusText: ress.statusText,
            headers: ress.headers,
            _id: docId,
            _rev
          };
        }
        return null;
        // return Promise.reject(`Error in docinfo`);
      })
      .catch(err => {
        if (err) {
          return {
            exists: false,
            status: err.response.status,
            statusText: err.response.statusText,
            headers: err.response.headers,
            _id: docId,
            _rev: null
          };
        }
      });
  }

  /**
   * Get a document from the database
   * @param docId
   * @param params
   */
  public async docGet<T>(docId: string, params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & T> {
    return this.server.get<T>(`${this.name}/${docId}`, {params})
      .catch(err => {
        return null;
      });
  }

  /**
   * Get a document or throw an error if you can't find it
   * @param docId
   * @param params
   */
  public async docGetOrThrow<T>(docId: string, params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & T> {
    return this.server.get<MegaCouchDocument & T>(`${this.name}/${docId}`, {params})
      .catch(err => {
          throw new Error(err);
      });
  }

  /**
   * Check if a document exists
   * @param docId
   */
  public async docExists(docId: string): Promise<boolean> {
    return this.server.head<boolean>(`${this.name}/${docId}`)
      .then(ok => {
        return true;
      })
      .catch(err => {
        return false;
      });
  }

  /**
   * Create a document
   * @param data
   * @param params
   */
  public async docCreate(data: MegaCouchDocument, params?: MegaCouchDocumentPutParams): Promise<MegaDocumentCreated> {
    return this.server.post<MegaDocumentCreated>(`${this.name}`, data, {params});
  }

  /**
   * Create a document with a fixed ID
   * @param docId
   * @param data
   * @param params
   */
  public async docCreateWithId(docId: string, data: MegaCouchDocument, params?: MegaCouchDocumentPutParams): Promise<MegaDocumentCreated> {
    data._id = docId;

    return await this.docCreate(data);
  }

  /**
   * Update an existing document
   *
   * @param docId
   * @param data
   * @param params
   */
  public async docUpdate(docId: string, data: MegaCouchDocument, params?: MegaCouchDocumentPutParams): Promise<MegaDocumentCreated> {
    // todo -->Check: rev (needs revision number to update)

    return this.server.post<MegaDocumentCreated>(`${this.name}`, data,  {params});
  }

  /**
   * Delete a specific revision of a document
   *
   * @param docId
   * @param rev
   * @param params
   */
  public async docDelete(docId: string, rev: string, params?: {batch?: 'ok', rev?: string}): Promise<MegaDocumentCreated> {
    // -->Set: params
    params = params ? {rev, batch: params.batch} : {rev};

    return this.server.delete<MegaDocumentCreated>(`${this.name}/${docId}`, {params});
  }

  // todo
  public async docCopy<T>(docId: string): Promise<T> {
    return this.server.copy(`${this.name}/${docId}`);
  }





  public async findRaw(req: MegaQueryFind): Promise<MegaQueryFindResponse> {
    return this.server.post(`${this.name}/_find`, req);
  }

  public async explainFind(req: MegaQueryFind): Promise<MegaQueryExplainFindResponse> {
    return this.server.post(`${this.name}/_explain`, req);
  }





  /**
   * Destroy this db
   */
  public async destroy(): Promise<boolean> {
    return this.server.dbDestroy(this.name);
  }

  /**
   * Replicate from local to remote
   *
   * @param db
   * @param _id
   * @param createTarget
   * @param continuous
   */
  public async replicateTo(db: Couch2Db, _id?: string, createTarget = true, continuous = false): Promise<MegaDocumentCreated> {
    // -->Gen: id
    if (!_id) {
      _id = await this.server.getUUID();
    }

    // -->Set: config
    const repl = {
      _id,
      source: `${this.server.config.url}/${this.name}`,
      target:  `${db.server.config.url}/${db.name}`,
      create_target:  !!createTarget,
      continuous: !!continuous
    };
    // -->Put: replication
    return this.server.put(`_replicator/${_id}`, repl);
  }

  /**
   * Replicate from remote to local
   *
   * @param db
   * @param _id
   * @param createTarget
   * @param continuous
   */
  public async replicateFrom(db: Couch2Db, _id?: string, createTarget = true, continuous = false) {
    // -->Gen: id
    if (!_id) {
      _id = await this.server.getUUID();
    }

    // -->Set: config
    const repl = {
      _id,
      source: `${db.server.config.url}/${db.name}`,
      target:  `${this.server.config.url}/${this.name}`,
      create_target:  !!createTarget,
      continuous: !!continuous
    };
    // -->Put: replication
    return db.server.put(`_replicator/${_id}`, repl);
  }

  /**
   * Set db revs limit
   * @param dbName
   * @param limit
   */
  public async setRevsLimit(dbName: string, limit: number): Promise<boolean> {
    if (!dbName) {
      throw Error(`No database name supplied`);
    }
    if (!limit && !(isNumber(limit) && limit < 1)) {
      throw Error(`Rev limit needs to be a number between 1 and 10000`);
    }

    try {
      // -->Get: rev limit
      const rev_limit = await this.server.get<number>(`${this.name}/_revs_limit`);

      // -->Current: limit
      if (rev_limit && rev_limit === limit) {
        return await true;
      }

      // -->Change: limit
      const res = await this.server.put<CouchOK>(`${this.name}/_revs_limit`, `${limit}`);

      return await res && res.ok;
    } catch (error) {
      return await false;
    }
  }
}