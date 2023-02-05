import { expect } from 'chai';
import './setup';
import { Bimap, Multimap } from '../src/utils/Bimap';

describe('Bimap: empty map', () => {
  const map = new Bimap();
  it('size', () => {
    expect(map.size).to.equal(0);
  });
  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal('Bimap {}');
  });
});

describe('Bimap: single item {"A": 1}', () => {
  const map = new Bimap<string, number>();
  beforeEach(() => {
    map.set('A', 1);
  });

  it('size', () => {
    expect(map.size).to.equal(1);
  });
  it('get', () => {
    expect(map.get('A')).to.equal(1);
  });
  it('getKey', () => {
    expect(map.getKey(1)).to.equal('A');
  });
  it('getValue', () => {
    expect(map.getValue('A')).to.equal(1);
  });
  it('set', () => {
    map.set('A', 2);
    expect(map.get('A')).to.equal(2);
  });
  it('setKey', () => {
    map.setKey(1, 'B');
    expect(map.get('B')).to.equal(1);
    expect(map.size).to.equal(1);
  });
  it('setValue', () => {
    map.setValue('A', 3);
    expect(map.get('A')).to.equal(3);
  });
  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('delete', () => {
    map.delete('A');
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('deleteKey', () => {
    map.deleteKey('A');
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('deleteValue', () => {
    map.deleteValue(1);
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      expect(key).to.equal('A');
      expect(value).to.equal(1);
      expect(mapRef.get(key)).to.equal(value);
    });
    expect(iterations).to.equal(map.size);
  });
  it('has', () => {
    expect(map.has('A')).to.equal(true);
    expect(map.has('B')).to.equal(false);
  });
  it('hasKey', () => {
    expect(map.hasKey('A')).to.equal(true);
    expect(map.hasKey('B')).to.equal(false);
  });
  it('hasValue', () => {
    expect(map.hasValue(1)).to.equal(true);
    expect(map.hasValue(2)).to.equal(false);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal('Bimap {A => 1}');
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
    expect(map.size).to.equal(26);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal(
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
      expect(map.get(String.fromCharCode(i + 64))).to.equal(i);
    }
  });
  it('getKey', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.getKey(i)).to.equal(String.fromCharCode(i + 64));
    }
  });
  it('getValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i);
    }
  });
  it('set', () => {
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i + 10);
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i + 10);
    }
  });
  it('setKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.setKey(i + 100, String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(i + 100);
    }
  });
  it('setValue', () => {
    for (let i = 1; i <= 26; i++) {
      map.setValue(String.fromCharCode(i + 64), i + 10);
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i + 10);
    }
  });

  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
    for (let i = 1; i <= 26; i++) {
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
  });
  it('delete', () => {
    for (let i = 1; i <= 26; i++) {
      map.delete(String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
  });
  it('deleteKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.deleteKey(String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
  });
  it('deleteValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.deleteValue(i)).to.be.true;
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
    expect(map.deleteValue(0)).to.be.false;
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      expect(map.get(key)).to.equal(value);
      expect(map.getKey(value)).to.equal(key);
      expect(mapRef.get(key)).to.equal(value);
    });
    expect(iterations).to.equal(map.size);
  });
  it('has', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.has(String.fromCharCode(i + 64))).to.equal(true); // A-Z
      expect(map.has(String.fromCharCode(i + 96))).to.equal(false); // a-z
    }
  });
  it('hasKey', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.hasKey(String.fromCharCode(i + 64))).to.equal(true); // A-Z
      expect(map.hasKey(String.fromCharCode(i + 96))).to.equal(false); // a-z
    }
  });
  it('hasValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.hasValue(i)).to.equal(true); // A-Z
      expect(map.hasValue(i + 100)).to.equal(false); // a-z
    }
  });
  it('{A => 1} followed by {A => 2} results in {A => 2}', () => {
    const map = new Bimap<string, number>();
    map.set('A', 1);
    map.set('A', 2);
    expect(map.get('A')).to.equal(2);
    expect(map.getKey(1)).to.equal(undefined);
    expect(map.size).to.equal(1);
  });
  it('{A => 1} followed by {B => 1} results in {B => 1}', () => {
    const map = new Bimap<string, number>();
    map.set('A', 1);
    map.set('B', 1);
    expect(map.get('A')).to.equal(undefined);
    expect(map.get('B')).to.equal(1);
    expect(map.getKey(1)).to.equal('B');
    expect(map.size).to.equal(1);
  });
});

describe('Multimap: empty map', () => {
  const map = new Multimap();
  it('size', () => {
    expect(map.size).to.equal(0);
  });
  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal('Multimap {}');
  });
});

describe('Multimap: single item {"A": 1}', () => {
  const map = new Multimap<string, number>();
  beforeEach(() => {
    map.clear();
    map.set('A', 1);
  });

  it('size', () => {
    expect(map.size).to.equal(1);
  });
  it('get', () => {
    expect(map.get('A')).to.equal(1);
  });
  it('getKey', () => {
    expect(map.getKey(1)).to.deep.equal(['A']);
  });
  it('getValue', () => {
    expect(map.getValue('A')).to.equal(1);
  });
  it('set', () => {
    map.set('A', 2);
    expect(map.get('A')).to.equal(2);
  });
  it('setKey', () => {
    map.setKey(1, 'B');
    expect(map.get('B')).to.equal(1);
    expect(map.size).to.equal(2);
  });
  it('setValue', () => {
    map.setValue('A', 3);
    expect(map.get('A')).to.equal(3);
  });
  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('delete', () => {
    map.delete('A');
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('deleteKey', () => {
    map.deleteKey('A');
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('deleteValue', () => {
    map.deleteValue(1);
    expect(map.size).to.equal(0);
    expect(map.get('A')).to.equal(undefined);
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      expect(key).to.equal('A');
      expect(value).to.equal(1);
      expect(mapRef.get(key)).to.equal(value);
    });
    expect(iterations).to.equal(map.size);
  });
  it('has', () => {
    expect(map.has('A')).to.equal(true);
    expect(map.has('B')).to.equal(false);
  });
  it('hasKey', () => {
    expect(map.hasKey('A')).to.equal(true);
    expect(map.hasKey('B')).to.equal(false);
  });
  it('hasValue', () => {
    expect(map.hasValue(1)).to.equal(true);
    expect(map.hasValue(2)).to.equal(false);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal('Multimap {A => 1}');
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
    expect(map.size).to.equal(26);
  });
  it('inspect', () => {
    expect(map.inspect()).to.equal(
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
      expect(map.get(String.fromCharCode(i + 64))).to.equal(i);
    }
  });
  it('getKey', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.getKey(i)).to.deep.equal([String.fromCharCode(i + 64)]);
    }
  });
  it('getValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i);
    }
  });
  it('set', () => {
    for (let i = 1; i <= 26; i++) {
      map.set(String.fromCharCode(i + 64), i + 10);
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i + 10);
    }
  });
  it('setKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.setKey(i + 100, String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(i + 100);
    }
  });
  it('setValue', () => {
    for (let i = 1; i <= 26; i++) {
      map.setValue(String.fromCharCode(i + 64), i + 10);
      expect(map.getValue(String.fromCharCode(i + 64))).to.equal(i + 10);
    }
  });

  it('clear', () => {
    map.clear();
    expect(map.size).to.equal(0);
    for (let i = 1; i <= 26; i++) {
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
  });
  it('delete', () => {
    for (let i = 1; i <= 26; i++) {
      map.delete(String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
  });
  it('deleteKey', () => {
    for (let i = 1; i <= 26; i++) {
      map.deleteKey(String.fromCharCode(i + 64));
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
  });
  it('deleteValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.deleteValue(i)).to.be.true;
      expect(map.get(String.fromCharCode(i + 64))).to.equal(undefined);
    }
    expect(map.size).to.equal(0);
    expect(map.deleteValue(0)).to.be.false;
  });
  it('forEach', () => {
    let iterations = 0;
    map.forEach((value, key, mapRef) => {
      iterations++;
      expect(map.get(key)).to.equal(value);
      expect(map.getKey(value)).to.deep.equal([key]);
      expect(mapRef.get(key)).to.equal(value);
    });
    expect(iterations).to.equal(map.size);
  });
  it('has', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.has(String.fromCharCode(i + 64))).to.equal(true); // A-Z
      expect(map.has(String.fromCharCode(i + 96))).to.equal(false); // a-z
    }
  });
  it('hasKey', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.hasKey(String.fromCharCode(i + 64))).to.equal(true); // A-Z
      expect(map.hasKey(String.fromCharCode(i + 96))).to.equal(false); // a-z
    }
  });
  it('hasValue', () => {
    for (let i = 1; i <= 26; i++) {
      expect(map.hasValue(i)).to.equal(true); // A-Z
      expect(map.hasValue(i + 100)).to.equal(false); // a-z
    }
  });
  it('{A => 1} followed by {A => 2} results in {A => 2}', () => {
    const map = new Multimap<string, number>();
    map.set('A', 1);
    map.set('A', 2);
    expect(map.get('A')).to.equal(2);
    expect(map.getKey(1)).to.equal(undefined);
    expect(map.size).to.equal(1);
  });
  it('{A => 1} followed by {B => 1} results in {A => 1, B => 1}', () => {
    const map = new Multimap<string, number>();
    map.set('A', 1);
    map.set('B', 1);
    expect(map.get('A')).to.equal(1);
    expect(map.get('B')).to.equal(1);
    expect(map.getKey(1)).to.deep.equal(['A', 'B']);
    expect(map.size).to.equal(2);
  });
});
