import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { Bimap, Multimap } from '../src/utils/Bimap';

describe('Bimap: empty map', () => {
  const map = new Bimap();
  it('size', () => {
    assert.strictEqual(map.size, 0);
  });
  it('clear', () => {
    map.clear();
    assert.strictEqual(map.size, 0);
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(), 'Bimap {}');
  });
});

describe('Bimap: single item {"A": 1}', () => {
  const map = new Bimap<string, number>();
  beforeEach(() => {
    map.set('A', 1);
  });

  it('size', () => {
    assert.strictEqual(map.size, 1);
  });
  it('get', () => {
    assert.strictEqual(map.get('A'), 1);
  });
  it('getKey', () => {
    assert.strictEqual(map.getKey(1), 'A');
  });
  it('getValue', () => {
    assert.strictEqual(map.getValue('A'), 1);
  });
  it('set', () => {
    map.set('A', 2);
    assert.strictEqual(map.get('A'), 2);
  });
  it('setKey', () => {
    map.setKey(1, 'B');
    assert.strictEqual(map.get('B'), 1);
    assert.strictEqual(map.size, 1);
  });
  it('setValue', () => {
    map.setValue('A', 3);
    assert.strictEqual(map.get('A'), 3);
  });
  it('clear', () => {
    map.clear();
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('delete', () => {
    map.delete('A');
    assert.strictEqual(0, map.size);
    assert.strictEqual(undefined, map.get('A'));
  });
  it('deleteKey', () => {
    map.deleteKey('A');
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('deleteValue', () => {
    map.deleteValue(1);
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      assert.strictEqual(key, 'A');
      assert.strictEqual(value, 1);
      assert.strictEqual(mapRef.get(key), value);
    });
    assert.strictEqual(iterations, map.size);
  });
  it('has', () => {
    assert.ok(map.has('A'));
    assert.ok(!map.has('B'));
  });
  it('hasKey', () => {
    assert.ok(map.hasKey('A'));
    assert.ok(!map.hasKey('B'));
  });
  it('hasValue', () => {
    assert.ok(map.hasValue(1));
    assert.ok(!map.hasValue(2));
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(), 'Bimap {A => 1}');
  });
});

describe('Bimap: alphabet letter => index', () => {
  const map = new Bimap<string, number>();
  beforeEach(() => {
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i);
    }
  });

  it('size', () => {
    assert.strictEqual(map.size, 26);
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(),
      'Bimap {' +
        'A => 1, B => 2, C => 3, D => 4, E => 5, ' +
        'F => 6, G => 7, H => 8, I => 9, J => 10, ' +
        'K => 11, L => 12, M => 13, N => 14, O => 15, ' +
        'P => 16, Q => 17, R => 18, S => 19, T => 20, ' +
        'U => 21, V => 22, W => 23, X => 24, Y => 25, ' +
        'Z => 26}'
    );
  });
  it('get', () => {
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), i);
    }
  });
  it('getKey', () => {
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.getKey(i), String.fromCharCode(i + 64));
    }
  });
  it('getValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i);
    }
  });
  it('set', () => {
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i + 10);
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i + 10);
    }
  });
  it('setKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.setKey(i + 100, String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), i + 100);
    }
  });
  it('setValue', () => {
    for (let i = 1; i <= 26; i++) {
      map.setValue(String.fromCharCode(i + 64), i + 10);
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i + 10);
    }
  });

  it('clear', () => {
    map.clear();
    assert.strictEqual(0, map.size);
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
  });
  it('delete', () => {
    for (let i = 1; i <= 26; i++) {
      map.delete(String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
  });
  it('deleteKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.deleteKey(String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
  });
  it('deleteValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.deleteValue(i));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
    assert.ok(!map.deleteValue(0));
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      assert.strictEqual(map.get(key), value);
      assert.strictEqual(map.getKey(value), key);
      assert.strictEqual(mapRef.get(key), value);
    });
    assert.strictEqual(iterations, map.size);
  });
  it('has', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.has(String.fromCharCode(i + 64))); // A-Z
      assert.ok(!map.has(String.fromCharCode(i + 96))); // a-z
    }
  });
  it('hasKey', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.hasKey(String.fromCharCode(i + 64))); // A-Z
      assert.ok(!map.hasKey(String.fromCharCode(i + 96))); // a-z
    }
  });
  it('hasValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.hasValue(i)); // A-Z
      assert.ok(!map.hasValue(i + 100)); // a-z
    }
  });
  it('{A => 1} followed by {A => 2} results in {A => 2}', () => {
    const map = new Bimap<string, number>();
    map.set('A', 1);
    map.set('A', 2);
    assert.strictEqual(map.get('A'), 2);
    assert.strictEqual(map.getKey(1), undefined);
    assert.strictEqual(map.size, 1);
  });
  it('{A => 1} followed by {B => 1} results in {B => 1}', () => {
    const map = new Bimap<string, number>();
    map.set('A', 1);
    map.set('B', 1);
    assert.strictEqual(map.get('A'), undefined);
    assert.strictEqual(map.get('B'), 1);
    assert.strictEqual(map.getKey(1), 'B');
    assert.strictEqual(map.size, 1);
  });
});

describe('Multimap: empty map', () => {
  const map = new Multimap();
  it('size', () => {
    assert.strictEqual(map.size, 0);
  });
  it('clear', () => {
    map.clear();
    assert.strictEqual(map.size, 0);
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(), 'Multimap {}');
  });
});

describe('Multimap: single item {"A": 1}', () => {
  const map = new Multimap<string, number>();
  beforeEach(() => {
    map.clear();
    map.set('A', 1);
  });

  it('size', () => {
    assert.strictEqual(map.size, 1);
  });
  it('get', () => {
    assert.strictEqual(map.get('A'), 1);
  });
  it('getKey', () => {
    assert.deepStrictEqual(map.getKey(1), ['A']);
  });
  it('getValue', () => {
    assert.strictEqual(map.getValue('A'), 1);
  });
  it('set', () => {
    map.set('A', 2);
    assert.strictEqual(map.get('A'), 2);
  });
  it('setKey', () => {
    map.setKey(1, 'B');
    assert.strictEqual(map.get('B'), 1);
    assert.strictEqual(map.size, 2);
  });
  it('setValue', () => {
    map.setValue('A', 3);
    assert.strictEqual(map.get('A'), 3);
  });
  it('clear', () => {
    map.clear();
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('delete', () => {
    map.delete('A');
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('deleteKey', () => {
    map.deleteKey('A');
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('deleteValue', () => {
    map.deleteValue(1);
    assert.strictEqual(map.size, 0);
    assert.strictEqual(map.get('A'), undefined);
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      assert.strictEqual(key, 'A');
      assert.strictEqual(value, 1);
      assert.strictEqual(mapRef.get(key), value);
    });
    assert.strictEqual(iterations, map.size);
  });
  it('has', () => {
    assert.ok(map.has('A'));
    assert.ok(!map.has('B'));
  });
  it('hasKey', () => {
    assert.ok(map.hasKey('A'));
    assert.ok(!map.hasKey('B'));
  });
  it('hasValue', () => {
    assert.ok(map.hasValue(1));
    assert.ok(!map.hasValue(2));
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(), 'Multimap {A => 1}');
  });
});

describe('Multimap: alphabet letter => index', () => {
  const map = new Multimap<string, number>();
  beforeEach(() => {
    map.clear();
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i);
    }
  });

  it('size', () => {
    assert.strictEqual(map.size, 26);
  });
  it('inspect', () => {
    assert.strictEqual(map.inspect(),
      'Multimap {' +
        'A => 1, B => 2, C => 3, D => 4, E => 5, ' +
        'F => 6, G => 7, H => 8, I => 9, J => 10, ' +
        'K => 11, L => 12, M => 13, N => 14, O => 15, ' +
        'P => 16, Q => 17, R => 18, S => 19, T => 20, ' +
        'U => 21, V => 22, W => 23, X => 24, Y => 25, ' +
        'Z => 26}'
    );
  });
  it('get', () => {
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), i);
    }
  });
  it('getKey', () => {
    for (let i = 1; i <= 26; i++) {
      assert.deepStrictEqual(map.getKey(i), [String.fromCharCode(i + 64)]);
    }
  });
  it('getValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i);
    }
  });
  it('set', () => {
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i + 10);
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i + 10);
    }
  });
  it('setKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.setKey(i + 100, String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), i + 100);
    }
  });
  it('setValue', () => {
    for (let i = 1; i <= 26; i++) {
      map.setValue(String.fromCharCode(i + 64), i + 10);
      assert.strictEqual(map.getValue(String.fromCharCode(i + 64)), i + 10);
    }
  });

  it('clear', () => {
    map.clear();
    assert.strictEqual(map.size, 0);
    for (let i = 1; i <= 26; i++) {
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
  });
  it('delete', () => {
    for (let i = 1; i <= 26; i++) {
      map.delete(String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
  });
  it('deleteKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.deleteKey(String.fromCharCode(i + 64));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
  });
  it('deleteValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.deleteValue(i));
      assert.strictEqual(map.get(String.fromCharCode(i + 64)), undefined);
    }
    assert.strictEqual(map.size, 0);
    assert.ok(!map.deleteValue(0));
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      assert.strictEqual(map.get(key), value);
      assert.deepStrictEqual(map.getKey(value), [key]);
      assert.strictEqual(mapRef.get(key), value);
    });
    assert.strictEqual(iterations, map.size);
  });
  it('has', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.has(String.fromCharCode(i + 64))); // A-Z
      assert.ok(!map.has(String.fromCharCode(i + 96))); // a-z
    }
  });
  it('hasKey', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.hasKey(String.fromCharCode(i + 64))); // A-Z
      assert.ok(!map.hasKey(String.fromCharCode(i + 96))); // a-z
    }
  });
  it('hasValue', () => {
    for (let i = 1; i <= 26; i++) {
      assert.ok(map.hasValue(i)); // A-Z
      assert.ok(!map.hasValue(i + 100)); // a-z
    }
  });
  it('{A => 1} followed by {A => 2} results in {A => 2}', () => {
    const map = new Multimap<string, number>();
    map.set('A', 1);
    map.set('A', 2);
    assert.strictEqual(map.get('A'), 2);
    assert.strictEqual(map.getKey(1), undefined);
    assert.strictEqual(map.size, 1);
  });
  it('{A => 1} followed by {B => 1} results in {A => 1, B => 1}', () => {
    const map = new Multimap<string, number>();
    map.set('A', 1);
    map.set('B', 1);
    assert.strictEqual(map.get('A'), 1);
    assert.strictEqual(map.get('B'), 1);
    assert.deepStrictEqual(map.getKey(1), ['A', 'B']);
    assert.strictEqual(map.size, 2);
  });
});
