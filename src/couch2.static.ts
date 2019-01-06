import { isPlainObject } from 'lodash';

/**
 * Check if an object contains CouchDB system keys
 *    Object keys that start with _ are considered system keys
 * @param obj
 */
const containsSystemIndex = (obj: any): boolean => {
  if (isPlainObject(obj)) {
    return Object.keys(obj).filter(k => k.startsWith('_')).length > 0;
  }
  return false;
};

export {
  containsSystemIndex
}