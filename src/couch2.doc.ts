import { Couch2Db } from './couch2.db';
import { MegaCouchDocument, MegaCouchDocumentGetParams, MegaCouchDocumentInfo, MegaCouchDocumentPutParams, MegaDocumentCreated } from './couchdb.interface';
import { Couch2DocData } from './couch2.doc-data';
import { clone } from 'lodash';
import {randomHash} from "./utils";


export class Couch2Doc<D = any> {
  public params: { get: MegaCouchDocumentGetParams, set: MegaCouchDocumentPutParams } = {get: null, set: null};
  public data: Couch2DocData<D>;
  public _rev: string;
  private _id: string;

  get id(): string { return this._id; }
  set id(id: string) { this._id = id; }

  constructor(
    _id: string,
    public readonly db: Couch2Db,
    public readonly options = { full_commit: false },
  ) {
    this.id = _id;
    this.data = new Couch2DocData<D>();
  }

  public done(): void {
    this.params = {get: null, set: null};
  }

  public with_revisions() { this.params.get.revs_info = true; return this; }
  public with_attachments() { this.params.get.attachments = true; return this; }
  public with_attachments_info() { this.params.get.att_encoding_info = true; return this; }
  public with_attachments_since(revs: string[]) { this.params.get.atts_since = revs; return this; }
  public with_conflicts() { this.params.get.conflicts = true; return this; }
  public with_deleted_conflicts() { this.params.get.deleted_conflicts = true; return this; }
  public with_latest() { this.params.get.latest = true; return this; }
  public with_local_seq() { this.params.get.local_seq = true; return this; }
  public with_open_revs(revs: 'all'|string[]) { this.params.get.open_revs = revs; return this; }
  public with_rev(rev: string) { this.params.get.rev = rev; return this; }
  public with_meta() { this.params.get.meta = true; return this; }


  /**
   * Check if this database exists
   */
  public async exists(): Promise<boolean> {
    return this.db.docExists(this._id);
  }

  /**
   * Get info on the current database
   */
  public async info(): Promise<MegaCouchDocumentInfo> {
    return this.db.docInfo(this._id);
  }

  /**
   * Get a document from the database
   * @param params
   */
  public async get(params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & D> {
    return this.db.docGet<D>(`${this._id}`, params);
  }

  /**
   * Get a document or throw an error if you can't find it
   * @param params
   */
  public async getOrThrow(params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & D> {
    return this.db.docGetOrThrow<D>(`${this._id}`, params);
  }

  /**
   * Get a document with all revisions
   * @param params
   */
  public async getWithRevisions(params?: MegaCouchDocumentGetParams): Promise<MegaCouchDocument & D> {
    // -->Set: params
    params = params ? {...params, revs_info: true} : {revs_info: true};
    // -->Request
    return this.db.docGet<D>(`${this._id}`, params);
  }

  /**
   * Fetch data from db and update the data object
   */
  public async fetch(): Promise<Couch2Doc> {
    const data = await this.get();
    // -->Update:
    this.data.data.next(data);
    // -->Set: rev
    this._rev = data && data._rev;
    // -->Set: status
    this.data.status.changed = true;
    this.data.status.pristine = true;
    // -->Chain:
    return this;
  }

  /**
   * Fetch data from db if this document exists
   */
  public async fetchIfExists(): Promise<Couch2Doc> {
    // -->Exists
    const exists = await this.exists();
    // -->Chain:
    return exists ? await this.fetch() : this;
  }

  /**
   * Create this doc
   */
  public async create(): Promise<MegaDocumentCreated> {
    const data = this.data.value();

    return await this.id ? this.db.docCreateWithId(this.id, data) : this.db.docCreate(data);
  }

  /**
   * Save doc to disk
   */
  public async save(): Promise<MegaDocumentCreated> {
    // -->Check: if empty
    if (this.data.status.empty) {
      await this.fetchIfExists();
    }
    // -->Data: data
    const data = this.data.value();

    // ???????????????
    return this.db.docUpdate(this._id, data);
  }

  /**
   * Save doc to disk
   * @param rev
   */
  public async saveToRev(rev: string): Promise<MegaDocumentCreated> {
    // -->Check: if empty
    if (this.data.status.empty) {
      await this.fetchIfExists();
    }
    // -->Data: data
    const data = this.data.value();

    // ???????????????
    return this.db.docUpdate(this._id, data, {rev});
  }

  /**
   * Save doc to disk if something changed
   */
  public async saveIfChanged(): Promise<MegaDocumentCreated> {
    // -->Check: if something changed
    if (!this.data.status.changed) {
      return null;
    } else {
      // -->Update: in the db
      return this.save();
    }
  }


  /**
   * Delete a document
   */
  public async delete(): Promise<MegaDocumentCreated> {
    if (!this._rev || !this._id) {
      throw new Error(`To delete you need both _id and _rev`);
    }

    return this.db.docDelete(this._id, this._rev);
  }

  /**
   * Delete a specific revision of a document
   * @param _rev
   */
  public async deleteRev(_rev: string): Promise<MegaDocumentCreated> {
    if (!_rev || !this._id) {
      throw new Error(`To delete you need both _id and _rev`);
    }

    return this.db.docDelete(this._id, _rev);
  }


  /**
   * Delete the latest revision of a document
   */
  public async deleteLastRev(): Promise<MegaDocumentCreated> {
    // -->Get: last rev
    const doc = await this.info();

    return this.db.docDelete(this._id, doc._rev);
  }


  /**
   * Generate UUID from couch
   */
  public async generateUUID(): Promise<void> {
    this._id = await this.db.server.getUUID();
  }

  /**
   * Generate ID by prefix
   * @param prefixes
   */
  public async generateId(...prefixes: string[]): Promise<void> {
    this._id = randomHash(8,  ...prefixes);
  }

  private checkIdOrThrow() {
    if (!this._id) {
      throw new Error(`Document has no ID`);
    }
  }
}
