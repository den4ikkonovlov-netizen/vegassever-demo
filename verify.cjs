const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {ROOMS,ROMANTIC,estimateFor,rateFor,formatDate}=require('./dist/app.js');
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
check('Prices before and on the December transition',()=>{
  assert.equal(estimateFor('big','2026-12-09',3).total,7500);
  assert.equal(estimateFor('big','2026-12-10',3).total,8400);
  assert.equal(estimateFor('small','2026-10-19',2).total,3000);
  assert.equal(estimateFor('small','2026-12-10',2).total,3600);
  assert.equal(estimateFor('medium','2026-12-10',4).total,8800);
  assert.equal(estimateFor('plus','2026-12-10',6).total,15000);
  assert.equal(estimateFor('fantasy','2026-10-19',3).total,6600);
});
check('Invalid calculator selections are rejected',()=>{
  for(const args of [['unknown','2026-10-19',3],['__proto__','2026-10-19',3],['big','',3],['big','2026-10-19',0],['big','2026-10-19',100],['big','2026-10-19',2.5]])assert.equal(estimateFor(...args),null);
});
check('Calendar formatting uses Moscow date without day shift',()=>{assert.match(formatDate('2026-12-10'),/10 декабря 2026/);});
check('Room capacities and source links present',()=>{
  assert.deepEqual(Object.values(ROOMS).map(r=>r.capacity),[20,10,12,10,5]);
  for(const room of Object.values(ROOMS)){assert.match(room.product,/^https:\/\/vk\.ru\/market\/product\//);assert.ok(rateFor(room,'2027-01-01')>=room.price);assert.ok(room.photos.length>0);for(const photo of room.photos)assert.ok(fs.existsSync(path.join('dist/assets/rooms',photo)));}
  assert.equal(ROMANTIC.price,9000);assert.ok(fs.existsSync(path.join('dist/assets/rooms',ROMANTIC.photos[0])));
});
const html=fs.readFileSync('dist/index.html','utf8');
const css=fs.readFileSync('dist/styles.css','utf8');
const js=fs.readFileSync('dist/app.js','utf8');
check('Local HTML links, IDs and assets resolve',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
  for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)),'Missing anchor '+href);
    if(href.startsWith('./'))assert.ok(fs.existsSync(path.join('dist',href)),'Missing file '+href);
  }
  for(const [,id] of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(id),'Missing script target '+id);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
});
check('Images are real JPEG files and fonts are valid binaries',()=>{
  for(const name of ['guests-friends.jpg','guests-party.jpg','guests-holiday.jpg']){const b=fs.readFileSync('dist/assets/'+name);assert.ok(b.length>10000);assert.equal(b.readUInt16BE(0),0xffd8);}
  for(const [,font] of fs.readFileSync('dist/assets/fonts.css','utf8').matchAll(/url\(\.\/([^)]+)\)/g)){const b=fs.readFileSync('dist/assets/'+font);assert.ok(b.length>1000);assert.ok([0x00010000,0x774f4632,0x4f54544f].includes(b.readUInt32BE(0)));}
});
check('Only the requested map is embedded; no inline handlers or HTML injection sinks',()=>{
  assert.ok(!/\son\w+\s*=|<script(?![^>]*\bsrc=)/i.test(html));
  const frames=[...html.matchAll(/<iframe\b[^>]*>/gi)];assert.equal(frames.length,1);assert.match(frames[0][0],/src="https:\/\/yandex\.ru\/map-widget\/v1\//);
  assert.ok(!/innerHTML\s*=|eval\(|localStorage|sessionStorage|document\.cookie|fetch\(/.test(js));
  assert.ok(html.includes("connect-src 'none'"));assert.ok(html.includes('frame-src https://yandex.ru https://yandex.com'));
  for(const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))assert.match(link[0],/rel="noopener noreferrer"/);
});
check('Responsive, keyboard and reduced-motion provisions exist',()=>{
  assert.ok(css.includes('@media(max-width:680px)'));assert.ok(fs.readFileSync('dist/sections.css','utf8').includes('prefers-reduced-motion'));
  assert.ok(html.includes('aria-controls="mobile-nav"'));assert.ok(html.includes('aria-live="polite"'));
  assert.ok(js.includes("dialog.addEventListener('close'"));assert.ok(html.includes('data-select-room="big"'));assert.equal((html.match(/<button\b[^>]*class="room-choice(?:\s|\")/g)||[]).length,6);
});
console.log(`\n${checks} verification groups passed. Browser visual QA remains separate.`);
