import { MegaCouchDocument } from './couchdb.interface';
import { BehaviorSubject, throwError } from 'rxjs';
import { merge, clone } from 'lodash';
import { cloneClass, logg } from '../../system/utils';
import { containsSystemIndex } from './couch2.static';

export class Couch2DocData<D = any> {
  public readonly status = {pristine: true, changed: false, empty: true};
  public data: BehaviorSubject<MegaCouchDocument & D>;

  constructor(
    data?: MegaCouchDocument & D,
  ) {
    // -->Init: with some or no data
    this.data = new BehaviorSubject<MegaCouchDocument & D>(data || null);

    if (data) {
      this.status.empty = false;
    }
  }

  /**
   * Set some new data
   * @param data
   */
  public set(data: Partial<MegaCouchDocument & D>): Couch2DocData {
    if (containsSystemIndex(data)) {
      throw new Error(`You cannot use object keys that start with _. Any key that starts with underscore is considered a system key`);
    }

    // -->Set: data
    this.data.next(data as MegaCouchDocument & D);
    // -->Set: status
    this.status.changed = true;
    this.status.pristine = true;
    // -->Chain
    return this;
  }

  /**
   * Merge some new data to existing data
   * @param data
   */
  public merge(data: Partial<MegaCouchDocument & D>): Couch2DocData {
    if (containsSystemIndex(data)) {
      throw new Error(`You cannot use object keys that start with _. Any key that starts with underscore is considered a system key`);
    }

    // -->Set: data
    this.data.next(merge(this.data.getValue() || {}, data as MegaCouchDocument & D));
    // -->Set: status
    this.status.changed = true;
    this.status.pristine = true;
    // -->Chain
    return this;
  }

  /**
   * Clear the data
   */
  public clear(): Couch2DocData {
    this.status.changed = !this.data;
    this.status.pristine = !this.data;
    this.data.next(null);
    this.status.empty = true;

    // -->Chain:
    return this;
  }

  /**
   * Just an empty lonely function
   */
  public done(): void {}

  /**
   * Get Value
   */
  public value(): MegaCouchDocument & D {
    return clone(this.data.getValue());
  }
}