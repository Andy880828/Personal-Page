import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Object3D,
  Vector2,
  Vector3,
  type Group,
  type PointLight,
} from 'three';
import { createRng, SCENE_SEED } from '@/lib/seed';
import { useSiteStore } from '@/store/useSiteStore';
import { FLOOR_Y } from './path';
import { floorHeight } from './floor';
import { sceneTime } from './time';

const VENTS: [number, number, number][] = [
  [7, -34, 1.0],
  [11.5, -40, 0.7],
  [-9, -44, 0.85],
];

const plumeVert = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
attribute vec3 aOrigin;
varying float vLife;
void main() {
  float life = fract(uTime * (0.1 + aSeed * 0.07) + aSeed * 13.0);
  vec3 p = aOrigin;
  p.y += life * 14.0;
  p.x += sin(life * 6.0 + aSeed * 30.0) * life * 1.6;
  p.z += cos(life * 5.0 + aSeed * 20.0) * life * 1.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vLife = life;
  gl_PointSize = (3.0 + life * 12.0) * uPixelRatio * 30.0 / max(-mv.z, 0.5);
}`;

const plumeFrag = /* glsl */ `
varying float vLife;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * (1.0 - vLife) * smoothstep(0.0, 0.08, vLife);
  vec3 hot = vec3(1.0, 0.62, 0.3);
  vec3 smoke = vec3(0.18, 0.2, 0.24);
  vec3 c = mix(hot * 1.8, smoke, smoothstep(0.05, 0.5, vLife));
  gl_FragColor = vec4(c * a * 0.75, 1.0);
}`;

/** 4,000 m 海床：起伏的地形、岩塊、三座熱泉煙囪與上升的熱泉粒子，加上地面的發光點 */
export default function Seafloor() {
  const group = useRef<Group>(null);
  const light = useRef<PointLight>(null);

  const data = useMemo(() => {
    const terrain = new PlaneGeometry(150, 110, 110, 80);
    terrain.rotateX(-Math.PI / 2);
    terrain.translate(0, 0, -30);
    const p = terrain.attributes.position!;
    const heightAt = floorHeight;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
    terrain.computeVertexNormals();

    const rng = createRng(SCENE_SEED + 43);
    const rocks = Array.from({ length: 9 }, () => {
      const g = new IcosahedronGeometry(1, 1);
      const rp = g.attributes.position!;
      for (let i = 0; i < rp.count; i++) {
        const k = 0.75 + rng() * 0.5;
        rp.setXYZ(i, rp.getX(i) * k, rp.getY(i) * k * 0.7, rp.getZ(i) * k);
      }
      g.computeVertexNormals();
      const x = (rng() - 0.5) * 50;
      const z = -10 - rng() * 35;
      return { g, x, z, y: heightAt(x, z), s: 0.8 + rng() * 2.2, ry: rng() * 6 };
    });

    const chimneys = VENTS.map(([x, z, s]) => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new Vector2((1.3 - t * 0.85) * (0.85 + rng() * 0.3), t * 6));
      }
      const g = new LatheGeometry(pts, 9);
      return { g, x, z, y: heightAt(x, z) - 0.5, s };
    });

    // 熱泉粒子
    const per = 70;
    const origins = new Float32Array(VENTS.length * per * 3);
    const seeds = new Float32Array(VENTS.length * per);
    VENTS.forEach(([x, z, s], v) => {
      const top = heightAt(x, z) - 0.5 + 6 * s;
      for (let i = 0; i < per; i++) {
        const k = v * per + i;
        origins[k * 3] = x + (rng() - 0.5) * 0.4;
        origins[k * 3 + 1] = top;
        origins[k * 3 + 2] = z + (rng() - 0.5) * 0.4;
        seeds[k] = rng();
      }
    });
    const plume = new BufferGeometry();
    plume.setAttribute('position', new BufferAttribute(origins.slice(), 3));
    plume.setAttribute('aOrigin', new BufferAttribute(origins, 3));
    plume.setAttribute('aSeed', new BufferAttribute(seeds, 1));

    // 地面的生物發光點
    const dots = 260;
    const dp = new Float32Array(dots * 3);
    for (let i = 0; i < dots; i++) {
      const x = (rng() - 0.5) * 80;
      const z = -4 - rng() * 50;
      dp[i * 3] = x;
      dp[i * 3 + 1] = heightAt(x, z) + 0.15;
      dp[i * 3 + 2] = z;
    }
    const dotGeo = new BufferGeometry();
    dotGeo.setAttribute('position', new BufferAttribute(dp, 3));
    dotGeo.setAttribute(
      'aSeed',
      new BufferAttribute(
        Float32Array.from({ length: dots }, () => rng()),
        1,
      ),
    );

    // 管蟲叢（Riftia）：熱泉旁一叢白色管子，頂端是紅色的鰓冠；程序幾何，兩個 InstancedMesh
    const worms: { x: number; y: number; z: number; h: number; tilt: number; ry: number }[] = [];
    for (const [vx, vz] of [VENTS[0]!, VENTS[2]!]) {
      for (let i = 0; i < 46; i++) {
        const a = rng() * Math.PI * 2;
        const r = 1.6 + Math.sqrt(rng()) * 2.6;
        const x = vx + Math.cos(a) * r;
        const z = vz + Math.sin(a) * r;
        worms.push({
          x,
          z,
          y: heightAt(x, z) - 0.1,
          h: 0.9 + rng() * 1.6,
          tilt: (rng() - 0.5) * 0.35,
          ry: rng() * 6.28,
        });
      }
    }

    return { terrain, rocks, chimneys, plume, dotGeo, worms };
  }, []);

  const wormTubes = useRef<InstancedMesh>(null);
  const wormPlumes = useRef<InstancedMesh>(null);
  const wormGeo = useMemo(
    () => ({
      tube: new CylinderGeometry(0.07, 0.09, 1, 6, 1).translate(0, 0.5, 0),
      plume: new ConeGeometry(0.16, 0.34, 7, 1).translate(0, 0.17, 0),
    }),
    [],
  );
  useEffect(() => {
    const d = new Object3D();
    data.worms.forEach((w, i) => {
      d.position.set(w.x, w.y, w.z);
      d.rotation.set(w.tilt, w.ry, w.tilt * 0.6);
      d.scale.set(1, w.h, 1);
      d.updateMatrix();
      wormTubes.current?.setMatrixAt(i, d.matrix);
      // 鰓冠接在管子頂端
      d.position.set(w.x, w.y, w.z);
      d.updateMatrix();
      const top = new Vector3(0, w.h, 0).applyEuler(d.rotation);
      d.position.add(top);
      d.scale.setScalar(0.9 + (i % 5) * 0.08);
      d.updateMatrix();
      wormPlumes.current?.setMatrixAt(i, d.matrix);
    });
    if (wormTubes.current) wormTubes.current.instanceMatrix.needsUpdate = true;
    if (wormPlumes.current) wormPlumes.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  const mats = useMemo(
    () => ({
      wormTube: new MeshStandardMaterial({ color: '#d9d4c7', roughness: 0.7 }),
      wormPlume: new MeshStandardMaterial({
        color: '#c8203a',
        roughness: 0.5,
        emissive: new Color('#ff3355'),
        emissiveIntensity: 0.15,
      }),
      floor: new MeshStandardMaterial({ color: '#2a5568', roughness: 0.95, metalness: 0.05, flatShading: true }),
      rock: new MeshStandardMaterial({ color: '#253a46', roughness: 0.9, flatShading: true }),
      chimney: new MeshStandardMaterial({
        color: '#14181b',
        roughness: 0.9,
        flatShading: true,
        emissive: new Color('#ff7a2e'),
        emissiveIntensity: 0.03,
      }),
      plume: new ShaderMaterial({
        vertexShader: plumeVert,
        fragmentShader: plumeFrag,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      }),
      dots: new ShaderMaterial({
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uPixelRatio; attribute float aSeed; varying float vA;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            vA = 0.3 + 0.7 * pow(0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0), 3.0);
            gl_PointSize = (1.0 + aSeed * 1.5) * uPixelRatio * 30.0 / max(-mv.z, 0.5);
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA;
            if (a < 0.004) discard;
            gl_FragColor = vec4(vec3(0.31, 0.94, 0.82) * a * 1.4, 1.0);
          }`,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      }),
    }),
    [],
  );

  useFrame((state) => {
    const pos = useSiteStore.getState().pos;
    const g = group.current;
    if (!g) return;
    g.visible = pos > 4.4;
    if (!g.visible) return;
    const t = sceneTime(state);
    const pr = state.gl.getPixelRatio();
    for (const m of [mats.plume, mats.dots]) {
      m.uniforms.uTime!.value = t;
      m.uniforms.uPixelRatio!.value = pr;
    }
    if (light.current) light.current.intensity = 16 + Math.sin(t * 7.3) * 2 + Math.sin(t * 2.1) * 2.5;
  });

  return (
    <group ref={group} position={[0, FLOOR_Y, 0]}>
      <mesh geometry={data.terrain} material={mats.floor} />
      {data.rocks.map((r, i) => (
        <mesh key={i} geometry={r.g} material={mats.rock} position={[r.x, r.y, r.z]} scale={r.s} rotation-y={r.ry} />
      ))}
      {data.chimneys.map((c, i) => (
        <mesh key={i} geometry={c.g} material={mats.chimney} position={[c.x, c.y, c.z]} scale={c.s} />
      ))}
      <instancedMesh ref={wormTubes} args={[wormGeo.tube, mats.wormTube, data.worms.length]} frustumCulled={false} />
      <instancedMesh ref={wormPlumes} args={[wormGeo.plume, mats.wormPlume, data.worms.length]} frustumCulled={false} />
      <points geometry={data.plume} material={mats.plume} frustumCulled={false} />
      <points geometry={data.dotGeo} material={mats.dots} frustumCulled={false} />
      <pointLight ref={light} position={[7, 9, -32]} color="#ff9a4d" distance={60} decay={1.3} intensity={16} />
    </group>
  );
}
