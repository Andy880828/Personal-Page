import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** 只被 models.ts 動態 import，打包成獨立的 gltf chunk（見 vite.config.ts） */
export function createLoader() {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}
