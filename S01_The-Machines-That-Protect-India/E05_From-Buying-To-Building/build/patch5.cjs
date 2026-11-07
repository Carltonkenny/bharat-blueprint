const fs = require('fs');
process.chdir(__dirname + '/..');
let e = fs.readFileSync('src/ep5.js', 'utf8');
const miss = [];
const rep = (a, b) => { if (!e.includes(a)) { miss.push(a.slice(0, 70)); return; } e = e.replace(a, () => b); };
// 1.2 / 11.1 tile labels short enough for a 210 px tile
rep("[['1', 'AIR DEFENCE'], ['2', 'FIGHTER ENGINE'], ['3', 'CARRIER'], ['4', 'SENSE · DECIDE'], ['5', 'WHO MAKES IT?']]", "[['1', 'AIR DEFENCE'], ['2', 'ENGINE'], ['3', 'CARRIER'], ['4', 'SHIELD'], ['5', 'WORKSHOPS']]");
rep("['AIR DEFENCE', 'FIGHTER ENGINE', 'FLOATING AIRPORT', 'SENSE · DECIDE', 'WORKSHOPS']", "['AIR DEFENCE', 'ENGINE', 'CARRIER', 'SHIELD', 'WORKSHOPS']");
// bottom lines clear of the title block
rep("T(ix, fmt(n), CX, 600, 56,", "T(ix, fmt(n), CX, 570, 56,");
rep("L(ix, 'EACH SQUARE = 500 BUSINESSES', 1180, 640, 28, { align: 'right',", "L(ix, 'EACH SQUARE = 500 BUSINESSES', CX, 612, 28, { align: 'center',");
rep("L(ix, 'EACH MAKER DOES ONE THING WELL', CX, 640, 28,", "L(ix, 'EACH MAKER DOES ONE THING WELL', CX, 612, 28,");
rep("L(ix, 'YOU MOVE UP BECAUSE YOU PASSED', CX, 640, 32,", "L(ix, 'YOU MOVE UP BECAUSE YOU PASSED', CX, 622, 32,");
rep("['PART TEST', 'EVERY WORKSHOP'], ['WHOLE MACHINE', 'TESTED AS A SYSTEM'], ['PROOF', 'EPISODE 2 · THE PROOF IDEA']", "['PART TEST', 'EVERY WORKSHOP'], ['WHOLE MACHINE', 'AS A SYSTEM'], ['PROOF', 'FROM EPISODE 2']");
rep("source(ix, 'SOURCE: PIB', p, 1180 - 190, 650);", "source(ix, 'SOURCE: PIB', p, 60, 652);");
rep("source(ix, 'SOURCE: PIB', p, 1180 - 190, 640);", "source(ix, 'SOURCE: PIB', p, 60, 640);");
rep("K('g39', D('g39'), 1)", "K('g39', D('g39') * 0.8, 1)");
// 6.4 magnifier clear of the title
rep("M.inset(ix, 800, 270, 120, [zx, 408], 5,", "M.inset(ix, 820, 285, 100, [zx, 408], 5,");
// 3.2 car: assembled positions plus an exploded offset
rep("const part = (dx, dy, f) => f(cx + dx * ex, cy + dy * ex);", "const part = ([bx, by], [dx, dy], f) => f(cx + bx + dx * ex, cy + by + dy * ex);");
rep("part(0, 0, (x, y) => BP.poly(", "part([0, 0], [0, 0], (x, y) => BP.poly(");
rep("[-1, 1].forEach((m, i) => part(130 * m, 90, (x, y) =>", "[-1, 1].forEach((m, i) => part([118 * m, 8], [60 * m, 120], (x, y) =>");
rep("part(-30, -150, (x, y) =>", "part([140, -14], [150, -120], (x, y) =>");
rep("part(130, -120, (x, y) =>", "part([10, -62], [30, -150], (x, y) =>");
rep("part(-130, -90, (x, y) =>", "part([-70, -42], [-170, -100], (x, y) =>");
fs.writeFileSync('src/ep5.js', e);
console.log('misses', JSON.stringify(miss));
