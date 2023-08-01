/**
 * BIDIRECTIONAL MAP
 *
 * Adapted from https://github.com/ThomasRooney/typed-bi-directional-map
 */
export interface IBimap<K, V> extends Map<K, V> {
    readonly size: number;
    get: (key: K) => V | undefined;
    getKey: (value: V) => K | K[] | undefined;
    getValue: (key: K) => V | undefined;
    set: (key: K, value: V) => this;
    setValue: (key: K, value: V) => this;
    setKey: (value: V, key: K) => this;
    clear: () => void;
    delete: (key: K) => boolean;
    deleteKey: (key: K) => boolean;
    deleteValue: (value: V) => boolean;
    forEach: (callbackfn: (value: V, key: K, map: IBimap<K, V>) => void, thisArg?: any) => void;
    has: (key: K) => boolean;
    hasKey: (key: K) => boolean;
    hasValue: (value: V) => boolean;
    [Symbol.toStringTag]: 'Map';
    inspect: () => string;
}
/**
 * Bimap without duplicates.
 */
export declare class Bimap<K, V> implements IBimap<K, V> {
    protected keyValueMap: Map<K, V>;
    protected valueKeyMap: Map<V, K>;
    get size(): number;
    [Symbol.toStringTag]: 'Map';
    [Symbol.iterator]: () => IterableIterator<[K, V]>;
    entries: () => IterableIterator<[K, V]>;
    keys: () => IterableIterator<K>;
    values: () => IterableIterator<V>;
    get: (a: K) => V | undefined;
    getKey: (b: V) => K | undefined;
    getValue: (a: K) => V | undefined;
    set: (key: K, value: V) => this;
    setKey: (value: V, key: K) => this;
    setValue: (key: K, value: V) => this;
    clear: () => void;
    delete: (key: K) => boolean;
    deleteKey: (key: K) => boolean;
    deleteValue: (value: V) => boolean;
    forEach: (callbackfn: (value: V, key: K, map: IBimap<K, V>) => void, thisArg?: any) => void;
    has: (key: K) => boolean;
    hasKey: (key: K) => boolean;
    hasValue: (value: V) => boolean;
    inspect: () => string;
}
/**
 * Bimap with multiple values per key.
 */
export declare class Multimap<K, V> implements IBimap<K, V> {
    protected keyValueMap: Map<K, V>;
    protected valueKeyMap: Map<V, K[]>;
    get size(): number;
    [Symbol.toStringTag]: 'Map';
    [Symbol.iterator]: () => IterableIterator<[K, V]>;
    entries: () => IterableIterator<[K, V]>;
    keys: () => IterableIterator<K>;
    values: () => IterableIterator<V>;
    get: (a: K) => V | undefined;
    getKey: (b: V) => K[] | undefined;
    getValue: (a: K) => V | undefined;
    set: (key: K, value: V) => this;
    setKey: (value: V, key: K) => this;
    setValue: (key: K, value: V) => this;
    clear: () => void;
    delete: (key: K) => boolean;
    deleteKey: (key: K) => boolean;
    deleteValue: (value: V) => boolean;
    forEach: (callbackfn: (value: V, key: K, map: IBimap<K, V>) => void, thisArg?: any) => void;
    has: (key: K) => boolean;
    hasKey: (key: K) => boolean;
    hasValue: (value: V) => boolean;
    inspect: () => string;
}
