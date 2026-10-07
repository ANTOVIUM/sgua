import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
const root=new URL('./dist/',import.meta.url);
const base=await readFile(new URL('index.html',root),'utf8');
for(const mode of ['present','presenter']){await mkdir(new URL(mode+'/',root),{recursive:true});await writeFile(new URL(mode+'/index.html',root),base.replace('<head>','<head><base href="../">'));}
const css=await readFile(new URL('style.css',root),'utf8');
const content=await readFile(new URL('content.js',root),'utf8');
const app=await readFile(new URL('app.js',root),'utf8');
const font=(await readFile(new URL('assets/golos.woff2',root))).toString('base64');
const license=await readFile(new URL('assets/OFL.txt',root),'utf8');
let single=base.replace(/<link rel="preload"[^>]+>/,'').replace('<link rel="stylesheet" href="style.css">','<style>'+css.replace("url('assets/golos.woff2')",`url('data:font/woff2;base64,${font}')`)+'</style>').replace('<link rel="manifest" href="manifest.webmanifest">','').replace('<script src="content.js"></script>','<script>window.__STANDALONE__=true;'+content+'</script>').replace('<script src="app.js"></script>','<script>'+app+'</script>');
single=single.replace('</head>','<!-- '+license.replaceAll('--','- -')+' --></head>');
await writeFile(new URL('standalone.html',root),single);
const assets=['./','./index.html','./present/','./present/index.html','./presenter/','./presenter/index.html','./app.js','./content.js','./style.css','./assets/golos.woff2','./assets/icon.svg','./assets/OFL.txt','./standalone.html','./manifest.webmanifest'];
try {for(const file of await readdir(new URL('static/',root)))if(file.endsWith('.html'))assets.push('./static/'+file);}catch{}
try {await readFile(new URL('fallback.pdf',root));assets.push('./fallback.pdf');}catch{}
const version='antonov-keynote-2026-v4';
const sw=`const CACHE=${JSON.stringify(version)};const ASSETS=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('antonov-keynote-2026-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;})));});`;
await writeFile(new URL('sw.js',root),sw);
await writeFile(new URL('start-local.py',root),`from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler\nfrom pathlib import Path\nimport os, webbrowser\nos.chdir(Path(__file__).resolve().parent)\nwebbrowser.open('http://localhost:8765/present/')\nprint('Экран докладчика: http://localhost:8765/presenter/')\nThreadingHTTPServer(('127.0.0.1',8765),SimpleHTTPRequestHandler).serve_forever()\n`);
console.log(JSON.stringify({routes:['/','/present/','/presenter/'],standalone_bytes:Buffer.byteLength(single),local_font:true}));
