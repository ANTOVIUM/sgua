import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(process.cwd(),'dist');
const args=process.argv.slice(2);let port=4173;const p=args.indexOf('--port');if(p>=0)port=Number(args[p+1]);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://local').pathname);if(name.endsWith('/'))name+='index.html';const path=resolve(root,'.'+name);if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403).end();return;}const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Файл не найден');}}).listen(port,'0.0.0.0',()=>console.log('Keynote preview on '+port));
