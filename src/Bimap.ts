/**
 * BIDIRECTIONAL MAP
 *
 * Adapted from https://github.com/ThomasRooney/typed-bi-directional-map
 */
export interface IBimap<K, V> extends Map<K, V> {
  readonly size: number; // returns the total number of elements
  get: (key: K) => V | undefined; // returns a specified element
  getKey: (value: V) => K | K[] | undefined; // returns a specified element
  getValue: (key: K) => V | undefined; // returns a specified element
  set: (key: K, value: V) => this; // adds or updates the value of an element looked up via the specified key
  setValue: (key: K, value: V) => this; // adds or updates the key of an element looked up via the specified value
  setKey: (value: V, key: K) => this; // adds or updates the value of an element looked up via the specified key
  clear: () => void; // removes all elements
  delete: (key: K) => boolean; // Returns true if an element existed and has been removed, or false if the element does not exist.
  deleteKey: (key: K) => boolean; // Returns true if an element existed and has been removed, or false if the element does not exist.
  deleteValue: (value: V) => boolean; // Returns true if an element existed and has been removed, or false if the element does not exist.
  forEach: (
    callbackfn: (value: V, key: K, map: IBimap<K, V>) => void,
    thisArg?: any
  ) => void; // executes the provided callback once for each key of the map
  has: (key: K) => boolean; // Returns true if an element with the specified key exists; otherwise false.
  hasKey: (key: K) => boolean; // Returns true if an element with the specified key exists; otherwise false.
  hasValue: (value: V) => boolean; // Returns true if an element with the specified value exists; otherwise false.
  [Symbol.toStringTag]: 'Map'; // Anything implementing Map must always have toStringTag declared to be 'Map'. I consider this a little silly.
  inspect: () => string; // A utility function to inspect current contents as a string
}

/**
 * Bimap without duplicates.
 */
export class Bimap<K, V> implements IBimap<K, V> {
  protected keyValueMap: Map<K, V> = new Map<K, V>();
  protected valueKeyMap: Map<V, K> = new Map<V, K>();

  get size() {
    return this.keyValueMap.size;
  }

  /* tslint:disable member-ordering */
  public [Symbol.toStringTag]: 'Map';
  public [Symbol.iterator]: () => IterableIterator<[K, V]> = this.keyValueMap[Symbol.iterator];
  /* tslint:enable */

  public entries = () => this.keyValueMap.entries();
  public keys = () => this.keyValueMap.keys();
  public values = () => this.keyValueMap.values();

  public get = (a: K): V | undefined => this.keyValueMap.get(a);
  public getKey = (b: V): K | undefined => this.valueKeyMap.get(b);
  public getValue = (a: K): V | undefined => this.get(a);
  public set = (key: K, value: V) => {
    // Make sure no duplicates. Our conflict scenario is handled by deleting potential duplicates, in favour of the current arguments
    this.delete(key);
    this.deleteValue(value);

    this.keyValueMap.set(key, value);
    this.valueKeyMap.set(value, key);

    return this;
  };
  public setKey = (value: V, key: K) => this.set(key, value);
  public setValue = (key: K, value: V) => this.set(key, value);
  public clear = () => {
    this.keyValueMap.clear();
    this.valueKeyMap.clear();
  };
  public delete = (key: K) => {
    if (this.has(key)) {
      const value = this.keyValueMap.get(key) as V;
      this.keyValueMap.delete(key);
      this.valueKeyMap.delete(value);
      return true;
    }
    return false;
  };
  public deleteKey = (key: K) => this.delete(key);
  public deleteValue = (value: V) => {
    if (this.hasValue(value)) {
      return this.delete(this.valueKeyMap.get(value) as K);
    }
    return false;
  };
  public forEach = (
    callbackfn: (value: V, key: K, map: IBimap<K, V>) => void,
    thisArg?: any
  ) => {
    this.keyValueMap.forEach((value, key) => {
      callbackfn.apply(thisArg, [value, key, this]);
    });
  };
  public has = (key: K) => this.keyValueMap.has(key);
  public hasKey = (key: K) => this.has(key);
  public hasValue = (value: V) => this.valueKeyMap.has(value);
  public inspect = () => {
    let str = 'Bimap {';
    let entry = 0;
    this.forEach((value, key) => {
      entry++;
      str += '' + key.toString() + ' => ' + value.toString() + '';
      if (entry < this.size) {
        str += ', ';
      }
    });
    str += '}';
    return str;
  };
}

/**
 * Bimap with multiple values per key.
 */
export class Multimap<K, V> implements IBimap<K, V> {
  protected keyValueMap: Map<K, V> = new Map<K, V>();
  protected valueKeyMap: Map<V, K[]> = new Map<V, K[]>();

  get size() {
    return this.keyValueMap.size;
  }

  /* tslint:disable member-ordering */
  public [Symbol.toStringTag]: 'Map';
  public [Symbol.iterator]: () => IterableIterator<[K, V]> = this.keyValueMap[Symbol.iterator];
  /* tslint:enable */

  public entries = () => this.keyValueMap.entries();
  public keys = () => this.keyValueMap.keys();
  public values = () => this.keyValueMap.values();

  public get = (a: K): V | undefined => this.keyValueMap.get(a);
  public getKey = (b: V): K[] | undefined => this.valueKeyMap.get(b);
  public getValue = (a: K): V | undefined => this.get(a);
  public set = (key: K, value: V) => {
    this.delete(key);
    this.keyValueMap.set(key, value);

    const keys = this.valueKeyMap.get(value) || [];
    this.valueKeyMap.set(value, [...keys, key]);

    return this;
  };
  public setKey = (value: V, key: K) => this.set(key, value);
  public setValue = (key: K, value: V) => this.set(key, value);
  public clear = () => {
    this.keyValueMap.clear();
    this.valueKeyMap.clear();
  };
  public delete = (key: K) => {
    if (this.has(key)) {
      const value = this.keyValueMap.get(key) as V;
      this.keyValueMap.delete(key);
      const keys = this.valueKeyMap.get(value).filter(k => k !== key);
      if (keys.length > 0) {
        this.valueKeyMap.set(value, keys);
      } else {
        this.valueKeyMap.delete(value);
      }
      return true;
    }
    return false;
  };
  public deleteKey = (key: K) => this.delete(key);
  public deleteValue = (value: V) => {
    if (this.hasValue(value)) {
      this.valueKeyMap.get(value).forEach(key => { this.delete(key); });
      return true;
    }
    return false;
  };
  public forEach = (
    callbackfn: (value: V, key: K, map: IBimap<K, V>) => void,
    thisArg?: any
  ) => {
    this.keyValueMap.forEach((value, key) => {
      callbackfn.apply(thisArg, [value, key, this]);
    });
  };
  public has = (key: K) => this.keyValueMap.has(key);
  public hasKey = (key: K) => this.has(key);
  public hasValue = (value: V) => this.valueKeyMap.has(value);
  public inspect = () => {
    let str = 'Multimap {';
    let entry = 0;
    this.forEach((value, key) => {
      entry++;
      str += '' + key.toString() + ' => ' + value.toString() + '';
      if (entry < this.size) {
        str += ', ';
      }
    });
    str += '}';
    return str;
  };
}
