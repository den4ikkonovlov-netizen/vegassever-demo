import {mkdir,writeFile} from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600;700;800&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Font stylesheet: '+response.status);
const source=await response.text();
const blocks=[...source.matchAll(/\/\* (cyrillic|latin) \*\/([\s\S]*?)(?=\/\*|$)/g)];
if(blocks.length!==16)throw Error('Unexpected font stylesheet');
const downloads=new Map();let css='/* Self-hosted Onest and Unbounded. Source: Google Fonts, SIL Open Font License. */\n';
for(const [,subset,block]of blocks){
  const family=block.match(/font-family: '([^']+)'/)[1].toLowerCase();
  const remote=block.match(/url\((https[^)]+)\)/)[1];
  const file=`${family}-${subset}.woff2`;
  downloads.set(file,remote);css+=`/* ${subset} */\n${block.trim().replace(remote,'./'+file)}\n`;
}
await mkdir('dist/assets',{recursive:true});
for(const [file,remote]of downloads){const r=await fetch(remote,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Font download: '+r.status);const b=Buffer.from(await r.arrayBuffer());if(b.toString('ascii',0,4)!=='wOF2')throw Error('Invalid font');await writeFile('dist/assets/'+file,b);console.log(file,b.length);}
await writeFile('dist/assets/fonts.css',css);
