function chineseRemainder(p, q, a, b) {
  const pq = p * q;
  const s = q.modInv(p).modMul(q, pq);
  const m1 = a.modMul(s, pq);
  if (b === 0) {
    return m1;
  } else {
    const t = p.modInv(q).modMul(p, pq);
    const m2 = b.modMul(t, pq);
    return (m1 + m2) % pq;
  }
}

module.exports = chineseRemainder;
