// 模型成品的檢視圖：每個 public/models/*.glb 從三個角度各畫一張，拼成 contact sheet。
// 用法：node scripts/models/preview.mjs [輸出檔，預設 test-results/models-preview.png]
// 用的是和網站一樣的 three + GLTFLoader + MeshoptDecoder，畫得出來就代表網站載得進來。
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const out = process.argv[2] ?? 'test-results/models-preview.png';
const models = readdirSync('public/models').filter((f) => f.endsWith('.glb'));

const html = `<!doctype html><html><body style="margin:0;background:#0b2233">
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const files = ${JSON.stringify(models)};
const W = 260, H = 200, views = [[1, 0.35, 0], [0.7, 0.5, 0.7], [0, 1.2, 0.01]];
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W * views.length, H * files.length);
renderer.setScissorTest(true);
document.body.appendChild(renderer.domElement);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
for (let r = 0; r < files.length; r++) {
  const gltf = await loader.loadAsync('/models/' + files[r]);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b2233);
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x203040, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(2, 3, 1); scene.add(sun);
  scene.add(gltf.scene);
  for (let c = 0; c < views.length; c++) {
    const cam = new THREE.PerspectiveCamera(35, W / H, 0.01, 10);
    cam.position.set(...views[c]).normalize().multiplyScalar(1.9); cam.position.y += 0.3;
    cam.lookAt(0, 0.25, 0);
    const y = (files.length - 1 - r) * H;
    renderer.setViewport(c * W, y, W, H); renderer.setScissor(c * W, y, W, H);
    renderer.render(scene, cam);
  }
}
const label = document.createElement('div');
label.style.cssText = 'position:absolute;left:0;top:0;font:12px monospace;color:#9fd';
label.innerHTML = files.map((f, i) => '<div style="position:absolute;top:' + (i * H + 4) + 'px;left:4px">' + f + '</div>').join('');
document.body.appendChild(label);
window.done = true;
</script></body></html>`;

const TYPES = { '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') return res.end(html);
  const file = url.startsWith('/models/')
    ? path.join('public', url)
    : url.startsWith('/three/')
      ? path.join('node_modules', url)
      : null;
  if (!file || file.includes('..')) return res.writeHead(404).end();
  try {
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 780, height: 200 * models.length } });
page.on('pageerror', (e) => console.error(e));
await page.goto(`http://localhost:${server.address().port}/`);
await page.waitForFunction('window.done === true', null, { timeout: 120_000 });
mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out });
await browser.close();
server.close();
console.log(`✓ ${models.length} 個模型 → ${out}`);
