// Renders the storyboard page from window.SB and window.PANELS (all artwork is drawn live on canvas).
(function () {
  const SB = window.SB, $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const mmss = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  const CLS = { P: 'Publicly documented reference', C: 'Conceptual illustration', O: 'Original visual interpretation' };
  const root = $('#root');

  const sec = (title, body) => { const s = el('section', 'blk'); s.appendChild(el('h2', null, title)); s.appendChild(body); root.appendChild(s); return s; };
  const list = (arr, cls) => { const u = el('ul', cls); arr.forEach((x) => u.appendChild(el('li', null, esc(x)))); return u; };

  $('#ep-title').textContent = SB.title; $('#ep-sub').textContent = SB.subtitle;
  $('#spec').textContent = `${SB.spec.w}×${SB.spec.h} · ${SB.spec.fps} fps · ${SB.spec.dur} s · ${SB.spec.frames} frames · silent MP4 · narration reserved for ElevenLabs stage`;

  sec('1 · Project overview', el('p', null, `A recurring series that explains engineering systems as a story that unfolds on a drafting sheet. Episode 1 explains what happens <b>before</b> a missile is fired, using India’s Akash-NG air-defence system. The opening is a hypothetical scenario used to introduce the engineering problem; it is not an actual attack or a reconstruction of classified procedure. The video is generated entirely by code: no image generation, no stock imagery, no ComfyUI, no narration yet.`));
  sec('2 · Genre and creative direction', (() => { const d = el('div'); d.appendChild(el('p', null, `<b>${SB.genre}</b>. Story first, engineering second, spectacle only in service of understanding. Every narration beat gets a visual event; objects are drawn, connected, separated and assembled, and details transform into the next scene’s subject.`)); return d; })());
  sec('3 · Exact visual identity — ' + SB.style, (() => { const t = el('table', 'kv'); SB.identity.forEach(([k, v]) => t.appendChild(el('tr', null, `<th>${esc(k)}</th><td>${esc(v)}</td>`))); return t; })());

  const nar = el('div', 'nar');
  SB.sections.forEach((s) => { const b = el('div', 'nsec'); b.appendChild(el('h3', null, `[${s.range} | ${s.name}]`)); s.text.forEach((l) => b.appendChild(el('p', null, esc(l)))); if (s.final) { b.appendChild(el('p', 'fin', 'FINAL SCREEN:<br>' + s.final.map(esc).join('<br>'))); } nar.appendChild(b); });
  sec('4 · Locked narration script', nar);

  // panels
  const panelsHost = el('div');
  const queue = [];
  SB.sections.forEach((s, i) => {
    const wrap = el('div', 'scene');
    wrap.appendChild(el('h3', null, `Scene ${i + 1} — ${s.name} <span>${s.range}</span>`));
    const grid = el('div', 'grid');
    SB.panels.filter((p) => p.sc === i + 1).forEach((p) => {
      const card = el('article', 'card');
      const cv = el('canvas'); cv.width = 1280; cv.height = 720; cv.id = 'cv-' + p.id;
      card.appendChild(cv);
      const badges = p.cls.map((c) => `<span class="badge b${c}">${CLS[c]}</span>`).join('');
      const refs = p.refs.length ? p.refs.join(', ') : '—';
      card.appendChild(el('div', 'meta', `
        <div class="hd"><b>${p.id}</b> ${esc(p.title.toUpperCase())} <span class="tm">${mmss(p.t0)}–${mmss(p.t1)}</span></div>
        <div class="bd">${badges}</div>
        <dl>
          <dt>Narration</dt><dd class="q">${esc(p.narr)}</dd>
          <dt>On-screen text</dt><dd>${esc(p.text)}</dd>
          <dt>Composition</dt><dd><b>BG</b> ${esc(p.comp.bg)}<br><b>MID</b> ${esc(p.comp.mid)}<br><b>FG</b> ${esc(p.comp.fg)}</dd>
          <dt>Camera</dt><dd>${esc(p.cam)}</dd>
          <dt>Start → motion → end</dt><dd><b>Start:</b> ${esc(p.start)}<br><b>Motion:</b> ${esc(p.anim)}<br><b>End:</b> ${esc(p.end)}</dd>
          <dt>Transition out</dt><dd>${esc(p.trans)}</dd>
          <dt>Technical notes</dt><dd>${esc(p.notes)}</dd>
          <dt>Sources</dt><dd>${refs}</dd>
        </dl>`));
      grid.appendChild(card);
      queue.push(p);
    });
    wrap.appendChild(grid); panelsHost.appendChild(wrap);
  });
  sec('5 · Scene-by-scene breakdown and storyboard panels (24 code-drawn key frames)', panelsHost);

  const srcT = el('table', 'src');
  srcT.appendChild(el('tr', null, '<th>ID</th><th>Class</th><th>Source</th><th>Supports</th><th>Status</th>'));
  SB.sources.forEach((s) => srcT.appendChild(el('tr', null, `<td>${s.id}</td><td>${s.cls === 'P' ? 'Public' : 'Engineering'}</td><td>${esc(s.title)}${s.url ? `<br><code>${esc(s.url)}</code>` : ''}</td><td>${esc(s.claims)}</td><td>${esc(s.status)}</td>`)));
  const reg = el('div'); reg.appendChild(srcT);
  reg.appendChild(el('h3', null, 'Not publicly documented — will not be shown or invented')); reg.appendChild(list(SB.notPublic));
  sec('6 · Public reference register', reg);

  const leg = el('div'); Object.entries(CLS).forEach(([k, v]) => leg.appendChild(el('p', null, `<span class="badge b${k}">${v}</span> ` + ({ P: 'Backed by a public DRDO / MoD release.', C: 'Drawn to explain; generic; not to scale; no unpublished detail.', O: 'Created for the story (maps, alert, stamp, titles).' })[k])));
  sec('7 · Visual classification', leg);
  sec('8 · Animation architecture', list(SB.architecture));
  const at = el('table', 'kv'); SB.assets.forEach(([k, v]) => at.appendChild(el('tr', null, `<th>${esc(k)}</th><td>${esc(v)}</td>`)));
  sec('9 · Asset and code inventory', at);
  sec('10 · Quality-control checklist', list(SB.qc, 'chk'));
  sec('11 · Assumptions and open points', list(SB.assumptions));

  // draw panels one at a time so the page stays responsive
  let i = 0;
  const next = () => {
    if (i >= queue.length) { document.body.dataset.done = '1'; return; }
    const p = queue[i++], cv = document.getElementById('cv-' + p.id), ctx = cv.getContext('2d', { willReadFrequently: true });
    const sc = SB.sections[p.sc - 1], pan = window.PANELS[p.id];
    BP.frame(ctx, 1280, 720, (ix) => pan.draw(ix, p.key), {
      header: `SC.${p.sc} · ${sc.name}`, block: `${p.id} · ${mmss(p.t0)}`, cam: pan.cam ? pan.cam(p.key) : null, seed: 11, grainSeed: 100 + i,
    });
    setTimeout(next, 0);
  };
  Promise.all(['600 28px "IBM Plex Mono"', '700 28px "Space Mono"'].map((f) => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready).then(next);
})();
