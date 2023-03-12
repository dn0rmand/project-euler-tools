class BigSet {
  static maxSize = 2 ** 24 - 100;

  constructor(name, nogrow) {
    this.name = name || "<generic>";
    this.maps = [];
    this.map = new Set();
    this.nogrow = !!nogrow;
  }

  clone() {
    const set = new BigSet(this.name, this.nogrow);
    if (this.map.size > 0) {
      set.maps = [...this.maps, this.map];
    }
    set.map = new Set();
    return set;
  }

  get size() {
    return this.maps.reduce((a, m) => a + m.size, this.map.size);
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

  delete(key) {
    let removed = false;

    removed |= this.map.delete(key);
    for (const m of this.maps) {
      removed |= m.delete(key);
    }

    return removed;
  }

  add(key) {
    if (this.has(key)) {
      return;
    }

    this.map.add(key);
    if (this.map.size >= BigSet.maxSize) {
      // console.log(`... extending map for ${this.name}`);
      if (!this.nogrow) {
        this.maps.push(this.map);
      }
      this.map = new Set();
    }
  }

  clear() {
    for (const m of this.maps) {
      m.clear();
    }

    this.maps = [];
    this.map.clear();
  }

  *keys(autoClear) {
    yield* this.values(autoClear);
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

  forEach(callback) {
    for (const m of this.maps) {
      m.forEach(callback);
    }

    this.map.forEach(callback);
  }
}

module.exports = BigSet;
