// Original vector artwork: a projected sphere with individually lit mirror tiles.
import {writeFileSync} from 'node:fs';
const center=[90,94],radius=73,rows=22,columns=24;
const point=(lat,lon)=>[center[0]+radius*Math.cos(lat)*Math.sin(lon),center[1]+radius*Math.sin(lat)];
const fixed=value=>value.toFixed(2);
let tiles='';
for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const a=-Math.PI/2+row*Math.PI/rows,b=a+Math.PI/rows;
  const c=-Math.PI/2+col*Math.PI/columns,d=c+Math.PI/columns;
  const lat=(a+b)/2,lon=(c+d)/2;
  const normal=[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];
  const diffuse=Math.max(0,-.46*normal[0]-.52*normal[1]+.7*normal[2]);
  const sparkle=(Math.sin(row*73+col*19)*43758.5453)%1;
  const hot=Math.pow(Math.max(0,-.4*normal[0]-.4*normal[1]+.82*normal[2]),20);
  const luminance=Math.min(96,15+diffuse*53+sparkle*17+hot*30);
  const hue=normal[0]>.5?320:normal[0]<-.45?220:267;
  const saturation=luminance>80?15:24;
  const corners=[point(a+.006,c+.006),point(a+.006,d-.006),point(b-.006,d-.006),point(b-.006,c+.006)];
  tiles+=`<polygon points="${corners.map(p=>p.map(fixed).join(',')).join(' ')}" fill="hsl(${hue} ${saturation}% ${fixed(luminance)}%)" stroke="#28203d" stroke-width=".35"/>`;
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><defs><radialGradient id="shine" cx="30%" cy="25%" r="75%"><stop stop-color="#e6e1ff" stop-opacity=".24"/><stop offset=".48" stop-color="#d2b9ff" stop-opacity="0"/><stop offset="1" stop-color="#100e29" stop-opacity=".6"/></radialGradient><radialGradient id="halo"><stop stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><path d="M90 0v20" stroke="#b5a5d0" stroke-width="1"/><ellipse cx="90" cy="21" rx="5" ry="3" fill="#827190"/><circle cx="90" cy="94" r="73.5" fill="#312447"/>${tiles}<circle cx="90" cy="94" r="73" fill="url(#shine)"/><circle cx="60" cy="52" r="17" fill="url(#halo)"/><path d="m60 36 2 14 12 2-12 2-2 14-2-14-12-2 12-2z" fill="#fff9ed"/><path d="m139 87 1 7 7 1-7 1-1 7-1-7-7-1 7-1z" fill="#f4d6ff"/></svg>`;
writeFileSync(new URL('../dist/assets/disco-ball.svg',import.meta.url),svg);
