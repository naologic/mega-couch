import axios, { AxiosRequestConfig } from 'axios';
import { isNumber, merge } from 'lodash';
import { Couch2Db } from './couch2.db';
import { logg } from '../../system/utils';
import { MegaCouchServerConfig, MegaCouchDatabaseInfo, MegaCouchDocument } from './couchdb.interface';



export class Couch2Server {
  public readonly config;

  constructor(config?: MegaCouchServerConfig, options?) {
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
  public async dbInfo(dbName: string): Promise<MegaCouchDatabaseInfo> {
    // -->Check: db name
    dbName = this.checkDatabaseName(dbName);

    try {
      // -->Get: rev limit
      return await this.get<MegaCouchDatabaseInfo>(`${dbName}`);
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

  public async head<T>(requestUrl: string, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'HEAD';

    return this.sendRequest<T>(requestUrl, config, true);
  }
  public async checkConnection(): Promise<boolean> {
    try{
      await this.checkConnectionOrThrow();
      return true;
    }
    catch(err){
      return false;
    }
  }
  public async checkConnectionOrThrow(): Promise<string> {
    const config = {method: 'GET'};
    try {
      await this.sendRequest('', config, false);
      return 'ok';
    } catch (err) {
        if (!err.response) {
          Promise.reject('Connection to the server could not be established. Please check that the server is running and your config is correct');
        } else if (err.reponse.status === 401) {
          Promise.reject('Unauthorized, please check credentials');
        } else {
          Promise.reject('An unexpected error occured');
        }
    }
  }

  public async get<T>(requestUrl: string, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'GET';

    return this.sendRequest<T>(requestUrl, config, false);
  }

  public async post<T>(requestUrl: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'POST';
    config.data = data;

    return this.sendRequest<T>(requestUrl, config, false);
  }

  public async put<T>(requestUrl: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'PUT';
    config.data = data;

    return this.sendRequest<T>(requestUrl, config, false);
  }

  public async delete<T>(requestUrl: string, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'DELETE';

    return this.sendRequest<T>(requestUrl, config, false);
  }

  public async copy<T>(requestUrl: string, config: AxiosRequestConfig = {}): Promise<T> {
    // -->Set: method
    config.method = 'COPY';

    return this.sendRequest<T>(requestUrl, config, false);
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
      baseURL: `${this.config.url}/`,
      url: requestUrl
    };

    // -->Make: config
    const requestConfig: AxiosRequestConfig = merge<AxiosRequestConfig, AxiosRequestConfig>(defaultConfig, config || {});

    logg(requestConfig, requestUrl);

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
   * Get UUID from the couch server
   */
  public async getUUID(): Promise<string> {
    return this.getUUIDs(1)
      .then(d => {
        if (Array.isArray(d)) {
          return d[0];
        }
      });
  }

  /**
   * Get UUIDs from the couch server
   * @param count
   */
  public async getUUIDs(count = 1): Promise<string[]> {
    return this.get<{uuids: string[]}>(`_uuids`, {params: {count}})
      .then(uuids => {
        if (uuids && Array.isArray(uuids.uuids)) {
          return uuids.uuids;
        }
        return null;
      });
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