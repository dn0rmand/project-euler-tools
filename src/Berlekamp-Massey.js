require("./numberHelper");

function pow_mod(a, k, modulo) {
  return a.modPow(k, modulo);
}

function modMul(a, b, m) {
  let c = a * b;
  if (c > Number.MAX_SAFE_INTEGER) {
    c = BigInt(a) * BigInt(b);
    c %= BigInt(m);
    return Number(c);
  } else return c % m;
}

class BerlekampMassey {
  constructor(modulo) {
    this.modulo = modulo;
    this.L = this.n = 0;
    this.m = this.b = 1;

    this.s = [];
    this.C = [1];
    this.B = [1];
  }

  update(d) {
    this.s.push(d);
    for (let i = 1; i <= this.L; i++) {
      const k = modMul(this.C[i], this.s[this.n - i], this.modulo);
      d = (d + k) % this.modulo;
    }

    if (d === 0) {
      this.m += 1;
    } else if (2 * this.L <= this.n) {
      const T = this.C.slice();

      const end = this.n + 1 - this.L + 1;
      this.C.length = end;

      for (let i = this.L + 1; i < end; i++) {
        this.C[i] = 0;
      }

      for (let i = 0; i < this.B.length; i++) {
        const k1 = pow_mod(this.b, this.modulo - 2, this.modulo);
        const k2 = modMul(k1, d, this.modulo);
        const k3 = modMul(k2, this.B[i], this.modulo);

        const v = (this.C[i + this.m] + this.modulo - k3) % this.modulo;
        this.C[i + this.m] = v;
      }

      this.L = end - 1;

      this.B = T;
      this.b = d;
      this.m = 1;
    } else {
      for (let i = 0; i < this.B.length; i++) {
        const k1 = pow_mod(this.b, this.modulo - 2, this.modulo);
        const k2 = modMul(k1, d, this.modulo);
        const k3 = modMul(k2, this.B[i], this.modulo);
        const v = (this.C[i + this.m] + this.modulo - k3) % this.modulo;
        this.C[i + this.m] = v;
      }
      this.m += 1;
    }

    this.n += 1;
  }

  formula() {
    let out = "F(x)=";
    for (let i = 1; i < this.C.length; i++) {
      let output = (this.modulo - this.C[i]) % this.modulo;
      if (output > this.modulo / 2) output -= this.modulo;

      out += `${output < 0 || i == 1 ? "" : "+"}${output}*F(x-${i})`;
    }
    return out;
  }

  outputCodeFor() {
    const name = "dp";
    const index = "i";
    const upperbound = "maxn";

    console.log("// Generated by Berlekamp-Massey algorithm");
    console.log("function compute(maxn, mod)");
    console.log("{");
    for (let i = 1; i < this.C.length; i++) {
      console.log(`   ${name}[${i}]=${this.s[i]};`);
    }
    console.log(`   for (let i=${this.C.length}; i < ${upperbound}; i++)`);
    console.log("   {");
    const valueDecl = "     const value = ";
    const indent = "                   ";
    for (let i = 1; i < this.C.length; i++) {
      let output = (this.modulo - this.C[i]) % this.modulo;
      if (output > this.modulo / 2) output -= this.modulo;
      let out = `${i == 1 ? valueDecl : indent}${
        output < 0 || i == 1 ? "  (" : "+ ("
      }${output} * ${name}[${index}-${i}] % ${this.modulo})`;
      if (i == this.C.length - 1) out += ";";
      console.log(out);
    }

    console.log(`     ${name}[${index}]=(mod + value % mod) % mod;`);
    console.log("   }");
    console.log("}");
  }
}

module.exports = BerlekampMassey;
