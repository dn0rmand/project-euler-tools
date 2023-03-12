class DistinctCollectionIterator {
  constructor(collection) {
    this.collection = collection;

    if (collection.length === 0) {
      this.bucket = this.collection.buckets.length;
    } else {
      this.bucket = this.collection.buckets.findIndex((b) => b !== undefined);
      this.index = -1;
    }
  }

  get value() {
    if (!this.done) {
      return this.collection.buckets[this.bucket][this.index];
    }
  }

  get done() {
    return this.bucket >= this.collection.buckets.length;
  }

  next() {
    this.index++;

    if (this.index >= this.collection.buckets[this.bucket].length) {
      this.index = 0;
      this.bucket++;

      while (
        this.bucket < this.collection.buckets.length &&
        this.collection.buckets[this.bucket] === undefined
      ) {
        this.bucket++;
      }
    }

    return this;
  }
}

class DistinctCollection {
  static HASHCODE = 2 ** 23 - 1;

  constructor() {
    this.length = 0;
    this.buckets = new Array(DistinctCollection.HASHCODE + 1);
  }

  push(value) {
    const h = value & DistinctCollection.HASHCODE;
    const b = this.buckets[h];
    if (b === undefined) {
      this.buckets[h] = [value];
      this.length++;
    } else if (!b.includes(value)) {
      b.push(value);
      this.length++;
    }
  }

  [Symbol.iterator]() {
    return new DistinctCollectionIterator(this);
  }
}

module.exports = DistinctCollection;
