// kit-v2: design tokens. One world, one line language.
// Authority: 00_SERIES/VISUAL_DIRECTION_S02.md (line language, worlds) and
// 00_SERIES/CAMERA_AND_ZONES_S02.md (zones, stroke widths, type scale).
(function () {
  const BB = (window.BB = window.BB || {});

  // Logical authoring space. Everything is authored in 1920x1080 units and scaled
  // to the actual frame, so one master size drives all six episodes.
  const BASE_W = 1920, BASE_H = 1080;

  const WORLDS = {
    ice: {
      paper: '#0a2f5c', panel: 'rgba(8,38,74,0.86)', ink: '#eef6ff', cyan: '#8fe4ff',
      accent: '#8fe4ff', accent2: '#ff9b3d', dim: 'rgba(143,228,255,0.40)',
      hot: '#ffffff', grid: 'rgba(143,228,255,0.085)', earth: null,
    },
    network: {
      paper: '#071c38', panel: 'rgba(6,24,46,0.88)', ink: '#eaf5ff', cyan: '#5ce1e6',
      accent: '#5ce1e6', accent2: '#8fe4ff', dim: 'rgba(92,225,230,0.40)',
      hot: '#ffffff', grid: 'rgba(92,225,230,0.085)', earth: null,
    },
    orbit: {
      paper: '#050d21', panel: 'rgba(5,13,33,0.88)', ink: '#eaf2ff', cyan: '#86dcff',
      accent: '#ffcf5c', accent2: '#86dcff', dim: 'rgba(134,220,255,0.40)',
      hot: '#ffffff', grid: 'rgba(134,220,255,0.075)', earth: null,
    },
    graphite: {
      paper: '#123043', panel: 'rgba(14,42,58,0.88)', ink: '#eaf4ff', cyan: '#8fe4ff',
      accent: '#ff9b3d', accent2: '#8fe4ff', dim: 'rgba(255,155,61,0.38)',
      hot: '#ffffff', grid: 'rgba(143,228,255,0.075)', earth: null,
    },
    cleanroom: {
      paper: '#0c3b47', panel: 'rgba(10,50,62,0.88)', ink: '#f2fbff', cyan: '#86dcff',
      accent: '#c39bff', accent2: '#86dcff', dim: 'rgba(195,155,255,0.40)',
      hot: '#ffffff', grid: 'rgba(134,220,255,0.08)', earth: null,
    },
    strata: {
      paper: '#112430', panel: 'rgba(14,32,43,0.88)', ink: '#f6ecdb', cyan: '#8fe4ff',
      accent: '#ff9b3d', accent2: '#86dcff', dim: 'rgba(255,155,61,0.40)',
      hot: '#ffffff', grid: 'rgba(143,228,255,0.08)',
      earth: ['#6b4a2f', '#8a6136', '#b98a4b', '#5b3a24'],
    },
  };

  // Screen zones as fractions of width/height (CAMERA_AND_ZONES_S02.md section 1).
  const ZONES = {
    SAFE: { x0: 0.05, x1: 0.95, y0: 0.06, y1: 0.94 },
    TOP_BAND: { x0: 0.05, x1: 0.95, y0: 0.06, y1: 0.13 },
    HERO: { x0: 0.20, x1: 0.80, y0: 0.14, y1: 0.78 },
    RAIL_L: { x0: 0.05, x1: 0.19, y0: 0.14, y1: 0.78 },
    RAIL_R: { x0: 0.81, x1: 0.95, y0: 0.14, y1: 0.78 },
    NUMBER_CARD: { x0: 0.06, x1: 0.40, y0: 0.62, y1: 0.80 },
    SOURCE_CHIP: { x0: 0.06, x1: 0.40, y0: 0.81, y1: 0.85 },
    CAPTION: { x0: 0.15, x1: 0.85, y0: 0.86, y1: 0.94 },
    TITLE_CARD: { x0: 0.20, x1: 0.80, y0: 0.38, y1: 0.62 },
  };

  // Type scale in authoring units (1920x1080). Cap height must be >= 2.0% of frame
  // height (QC B3), so the smallest size here is 22 units -> 22/1080 = 2.04%.
  const TYPE = { micro: 22, small: 26, body: 30, label: 32, sub: 38, head: 54, title: 92 };

  function tokens(worldName, W, H) {
    const w = WORLDS[worldName] || WORLDS.ice;
    const s = (H || BASE_H) / BASE_H; // scale factor from authoring space
    return {
      world: worldName,
      W: W || BASE_W, H: H || BASE_H,
      scale: s,
      W0: BASE_W, H0: BASE_H,
      BASE_W: BASE_W, BASE_H: BASE_H,
      ...w,
      font: "'IBM Plex Mono','Space Mono',Consolas,'Courier New',monospace",
      fontBold: "'IBM Plex Mono','Space Mono',Consolas,'Courier New',monospace",
      // stroke tokens (VISUAL_DIRECTION section 1): hairline 1, line 2, heavy 3.5 at 1080p
      hair: 1 * s, line: 2 * s, heavy: 3.5 * s,
      // type scale scaled
      type: Object.fromEntries(Object.entries(TYPE).map(([k, v]) => [k, v * s])),
      zones: ZONES,
      // zone rect helpers, in authoring units
      zone(name) {
        const z = ZONES[name];
        return { x0: z.x0 * BASE_W, x1: z.x1 * BASE_W, y0: z.y0 * BASE_H, y1: z.y1 * BASE_H };
      },
    };
  }

  BB.tokens = tokens;
  BB.WORLDS = WORLDS;
  BB.ZONES = ZONES;
  BB.TYPE = TYPE;
  BB.BASE_W = BASE_W;
  BB.BASE_H = BASE_H;
})();
