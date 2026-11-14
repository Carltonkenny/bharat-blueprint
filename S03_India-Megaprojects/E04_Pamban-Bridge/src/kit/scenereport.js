// kit-v2: the scene report. window.__sceneReport(t) returns every text, label and shape
// with its bounding box, colour and opacity, for the scene-graph QC gates (B1..B17).
// The drawing code registers what it draws; nothing is reverse-engineered from pixels.
(function () {
  const BB = (window.BB = window.BB || {});

  let items = [];
  let beat = null;

  const R = (BB.report = {
    begin(t, beatId) {
      items = [];
      beat = beatId || null;
      return items;
    },
    add(item) {
      item.beat = beat;
      if (item.x0 == null) return item;
      item.w = item.x1 - item.x0;
      item.h = item.y1 - item.y0;
      items.push(item);
      return item;
    },
    items() { return items.slice(); },
    clear() { items = []; },
  });

  // window.__sceneReport(t): seek the page to t and report what is on screen.
  window.__sceneReport = function (t) {
    if (typeof window.seek === 'function' && typeof t === 'number') {
      try { window.seek(t); } catch (e) { /* reported by gate B13 */ }
    }
    return { t, beat, items: items.slice() };
  };

  // window.__sceneReset(): forget registered items (used by the QC driver between beats).
  window.__sceneReset = function () { items = []; };
})();
