// kit-v2: seeded pseudo-randomness. Every stochastic thing in an episode must be a pure
// function of (seed, t). Math.random is banned at page start.
(function () {
  const BB = (window.BB = window.BB || {});

  function hashStr(s) {
    let h = 2166136261 >>> 0;
    s = String(s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // mulberry32: small, fast, good enough, and identical everywhere.
  function mulberry32(seed) {
    let a = (typeof seed === 'string' ? hashStr(seed) : seed >>> 0) || 1;
    const r = function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (lo, hi) => lo + r() * (hi - lo);
    r.int = (lo, hi) => Math.floor(lo + r() * (hi - lo + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.gauss = () => {
      let u = 0, v = 0;
      while (!u) u = r();
      while (!v) v = r();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    return r;
  }

  // Replace Math.random for the whole page with the episode's seeded generator.
  function installSeed(seed) {
    const r = mulberry32(seed);
    Math.random = () => r();
    BB.random = r;
    BB.mulberry32 = mulberry32;
    BB.hashStr = hashStr;
    return r;
  }

  BB.installSeed = installSeed;
  BB.mulberry32 = mulberry32;
  BB.hashStr = hashStr;
})();
