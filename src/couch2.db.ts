import { Injectable } from '@nestjs/common';
import { DocumentScope } from 'nano';
import { join } from 'path';
import axios from 'axios';
import { isNumber } from 'lodash';
import { Couch2Server } from './couch2.server';
import { CouchOK, MegaDatabaseAllDocs, MegaDatabaseBulkGetDoc, MegaDatabaseInfo, MegaDocument, MegaDocumentCreated, MegaQueryFind, MegaQueryFindResponse } from './couchdb.interface';
import { logg } from '../../system/utils';


export class Couch2Db {

  constructor(
    public readonly name: string,
    public readonly server: Couch2Server
  ) {

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
  public async info(): Promise<MegaDatabaseInfo> {
    return this.server.dbInfo(this.name);
  }

  /**
   * Fetch _all_docs view
   * @param keys
   */
  public async allDocs(keys?: string[]): Promise<MegaDatabaseAllDocs> {
    if (Array.isArray(keys) && keys.length > 0) {
      return this.server.post(`${this.name}/_all_docs`, keys);
    }

    return this.server.get(`${this.name}/_all_docs`);
  }

  /**
   * Fetch _all_docs view except the _ system docs
   * @param keys
   */
  public async allUserDocs(keys?: string[]): Promise<MegaDatabaseAllDocs> {
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
  public async bulkGetRaw(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false): Promise<{results: MegaDatabaseBulkGetDoc[]}> {
    const params = {params: {revs: listAllRevs}};
    return this.server.post(`${this.name}/_bulk_get`, {docs}, {params});
  }

  /**
   * Get documents in bulk
   * @param docs
   * @param listAllRevs
   * @param removeSystemDocs
   */
  public async bulkGet(docs?: {id: string, rev?: string, atts_since?: string}[], listAllRevs = false, removeSystemDocs = false): Promise<MegaDocument[]> {
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


  public async bulkInsertRaw(docs?: MegaDocument[]): Promise<MegaDocumentCreated[]> {
    return this.server.post(`${this.name}/_bulk_docs`, {docs});
  }

  public async bulkUpdatetRaw(docs?: MegaDocument[]): Promise<MegaDocumentCreated[]> {
    return this.server.post(`${this.name}/_bulk_docs`, {docs});
  }

  public async findRaw(req: MegaQueryFind): Promise<MegaQueryFindResponse> {
    return this.server.post(`${this.name}/_find`, req);
  }

  /**
   * Destroy this db
   */
  public async destroy(): Promise<boolean> {
    return this.server.dbDestroy(this.name);
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