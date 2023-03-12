class BigMap {
  static maxSize = 2 ** 24 - 100;

  constructor(name, nogrow) {
    this.name = name || "<generic>";
    this.maps = [];
    this.map = new Map();
    this.nogrow = !!nogrow;
  }

  clone() {
    const set = new BigMap(this.name, this.nogrow);
    if (this.map.size > 0) {
      set.maps = [...this.maps, this.map];
    }
    set.map = new Map();
    return set;
  }

  get size() {
    return this.maps.reduce((a, m) => a + m.size, this.map.size);
  }

  get(key) {
    let res = this.map.get(key);
    if (res !== undefined) {
      return res;
    }
    for (const m of this.maps) {
      res = m.get(key);
      if (res !== undefined) {
        return res;
      }
    }
  }

  has(key) {
    if (this.map.has(key)) {
      return true;
    }

    for (const m of this.maps) {
      if (m.has(key)) {
        return true;
      }
    }

    return false;
  }

  set(key, value) {
    this.map.set(key, value);
    if (this.map.size >= BigMap.maxSize) {
      // console.log(`... extending map for ${this.name}`);
      if (!this.nogrow) {
        this.maps.push(this.map);
      }
      this.map = new Map();
    }
  }

  clear() {
    for (const m of this.maps) {
      m.clear();
    }

    this.maps = [];
    this.map.clear();
  }

  forEach(callback) {
    for (const m of this.maps) {
      m.forEach(callback);
    }
    this.map.forEach(callback);
  }

  *values(autoClear) {
    for (const m of this.maps) {
      yield* m.values();
      if (autoClear) {
        m.clear();
      }
    }

    if (autoClear && this.maps.length > 0) {
      this.maps = [];
    }

    yield* this.map.values();

    if (autoClear) {
      this.map.clear();
    }
  }

  *keys(autoClear) {
    for (const m of this.maps) {
      yield* m.keys();
      if (autoClear) {
        m.clear();
      }
    }

    if (autoClear && this.maps.length > 0) {
      this.maps = [];
    }

    yield* this.map.keys();

    if (autoClear) {
      this.map.clear();
    }
  }
}

module.exports = BigMap;
