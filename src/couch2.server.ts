import { Injectable } from '@nestjs/common';
import { DocumentScope } from 'nano';
import { join } from 'path';
import axios, { AxiosRequestConfig } from 'axios';
import { isNumber, merge } from 'lodash';
import { throwError } from 'rxjs';
import { Couch2Db } from './couch2.db';
import { logg } from '../../system/utils';
import { MegaDatabaseInfo } from './couchdb.interface';

/**
 * Using the CouchDB provider
 *
 *    @app.module
 *      DatabaseModule.forRoot([
 *         { db: 'CouchDb' }
 *      ])
 *
 *    @provider
 *    {
 *       provide: 'couchDb',
 *       useFactory: async () => {
 *         const conn = new CouchDb();
 *         return await conn.init();
 *       }
 *    }
 *
 *    @.env
 *         COUCH_URL_1=xxxxxx:5984
 *         COUCH_USER=xxxxxxx
 *         COUCH_PASSWORD=xxxxxxxxx
 *
 */

export class Couch2Server {
  public readonly config;

  constructor(config?, options?) {
    let url = '';
    if (config) {
      url = `${config.host}://${config.user}:${config.password}@${config.url}:${config.port}`;
    }

    // -->Set: config
    this.config = {
      url,
      // requestDefaults: { "proxy" : "http://someproxy" },
      // log: (id, args) => {
      //   console.log(id, args);
      // }
    };

  }

  /**
   * Init the db
   * @returns {Promise<CouchDb>}
   */
  public async init(): Promise<Couch2Server> {
    return await this;
  }

  /**
   * Init the db
   * @returns {Promise<CouchDb>}
   */
  public async initLocal(): Promise<Couch2Server> {
    // -->Set: local db
    this.config.url = `${process.env.COUCH_PROTOCOL}://${process.env.COUCH_USER}:${process.env.COUCH_PASSWORD}@${process.env.COUCH_URL_1}:${process.env.COUCH_URL_1_PORT}`;
    return await this;
  }

  public use(dbName: string): Couch2Db {
    return new Couch2Db(dbName, this);
  }

  /**
   * Check if a database exists
   */
  public async dbExists(dbName: string): Promise<boolean> {
    // -->Check: db name
    dbName = this.checkDatabaseName(dbName);

    try {
      // -->Get: rev limit
      const exists = await this.head<boolean>(`${dbName}`);

      return await true;
    } catch (error) {
      return await false;
    }
  }


  /**
   * Check if a database exists
   */
  public async dbInfo(dbName: string): Promise<MegaDatabaseInfo> {
    // -->Check: db name
    dbName = this.checkDatabaseName(dbName);

    try {
      // -->Get: rev limit
      return await this.get<MegaDatabaseInfo>(`${dbName}`);
    } catch (error) {
      return null;
    }
  }


  /**
   * Check if a database exists
   */
  public async dbDestroy(dbName: string): Promise<boolean> {
    // -->Check: db name
    dbName = this.checkDatabaseName(dbName);

    try {
      // -->Get: rev limit
      const exists = await this.delete<boolean>(`${dbName}`);

      return await true;
    } catch (error) {
      return await false;
    }
  }

  /**
   * Create a new database
   * @param dbName
   * @param q (integer) – Shards, aka the number of range partitions. Default is 8, unless overridden in the cluster config.
   * @param n (integer) – Replicas. The number of copies of the database in the cluster. The default is 3, unless overridden in the cluster config .
   */
  public async dbCreate(dbName: string, q?: number, n?: number): Promise<boolean> {
    // -->Check: db name
    dbName = this.checkDatabaseName(dbName);

    try {
      // -->Get: rev limit
      const exists = await this.put<boolean>(`${dbName}`);

      return await true;
    } catch (error) {
      return await false;
    }
  }

  public async get<T>(requestUrl: string, config?: AxiosRequestConfig): Promise<T> {
    return this.sendRequest<T>(requestUrl, {
      method: 'GET'
    }, false);
  }

  public async post<T>(requestUrl: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.sendRequest<T>(requestUrl, {
      method: 'POST',
      data
    }, false);
  }

  public async delete<T>(requestUrl: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.sendRequest<T>(requestUrl, {
      method: 'DELETE'
    }, false);
  }

  public async put<T>(requestUrl: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.sendRequest<T>(requestUrl, {
      method: 'PUT',
      data
    }, false);
  }

  public async head<T>(requestUrl: string, config?: AxiosRequestConfig): Promise<T> {
    return this.sendRequest<T>(requestUrl, {
      method: 'HEAD'
    }, false);
  }

  /**
   * Send a request to the server
   */
  public async sendRequest<T>(requestUrl: string, config?: AxiosRequestConfig, returnRaw = false): Promise<T> {
    // -->Set: url
    // const url = `${this.config.url}/${requestUrl}`;

    // todo-->Set: a JOI Validator here for `config`
    // -->Set: default request params
    const defaultConfig: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      baseURL: `${this.config.url}/`
    };

    // -->Make: config
    const requestConfig: AxiosRequestConfig = merge<AxiosRequestConfig, AxiosRequestConfig, AxiosRequestConfig, AxiosRequestConfig>({}, defaultConfig, config || {}, {url: requestUrl});

    logg(requestConfig.method, requestUrl);

    try {
      // -->Make: request
      return axios(requestConfig)
        .then(response => {

          return returnRaw ? response : response.data;
        })
        .catch(err => {

          return Promise.reject(err);
        });
    } catch (error) {
      return Promise.reject(error);
    }
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

    // -->Set: url
    const url = `${this.config.url}/${dbName}/_revs_limit`;
    try {
      // -->Get: rev limit
      const rev_limit = await axios.get(url);

      // -->Current: limit
      if (rev_limit && rev_limit.data && rev_limit.data === limit) {
        return await true;
      }

      const response = await axios({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        responseType: 'string',
        data: `${limit}`,
        url
      });
      const res = response.data;

      return await res && res.ok;
    } catch (error) {
      return await false;
    }
  }


  /**
   * Check the syntax of the db name
   * @param name
   */
  private checkDatabaseName(name: string): string {
    if (!name) {
      throw Error(`Invalid database name`);
    }

    const reg = new RegExp(/^[a-z][a-z0-9_$()+/-]*$/);
    if (!reg.test(name)) {
      throw Error(`Invalid datbaase name`);
    }

    return name;
  }
}