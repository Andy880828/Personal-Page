import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { flags } from '@/lib/env';
import { sceneBudget } from '@/lib/gpu';
import { useReducedMotion, useSiteStore } from '@/store/useSiteStore';
import CameraRig from './CameraRig';
import Atmosphere from './Atmosphere';
import Sky from './Sky';
import Water from './Water';
import LightShafts from './LightShafts';
import MarineSnow from './MarineSnow';
import Fish from './Fish';
import SkillBubbles from './SkillBubbles';
import ProjectProbe from './ProjectProbe';
import Jellyfish from './Jellyfish';
import Plankton from './Plankton';
import Seafloor from './Seafloor';
import { SKY_HEIGHT } from './path';

const Effects = lazy(() => import('./Effects'));
const Debug = lazy(() => import('./Debug'));

/**
 * 「demand」模式（減少動態、測試）下，只有捲動或互動狀態改變時才重繪一幀。
 */
function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    (window as Window & { __invalidate?: () => void }).__invalidate = invalidate;
  }, [invalidate]);
  useEffect(
    () =>
      useSiteStore.subscribe((s, prev) => {
        if (
          s.pos !== prev.pos ||
          s.activeSkill !== prev.activeSkill ||
          s.hoverSkill !== prev.hoverSkill ||
          s.projectFilter !== prev.projectFilter
        )
          invalidate();
      }),
    [invalidate],
  );
  return null;
}

/**
 * 載入流程：預先編譯所有 shader（避免捲到新段落時卡頓）→ 畫出兩幀 → 標記 ready。
 * 測試／效能模式下另外記錄幀數與平均 frame time。
 */
function ReadyProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const frames = useRef(0);
  const compiled = useRef(false);
  const perf = useRef({ sum: 0, n: 0, last: 0 });

  useEffect(() => {
    let cancelled = false;
    const hidden: { visible: boolean }[] = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
    });
    useSiteStore.getState().setSceneProgress(0.7);
    void gl
      .compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        compiled.current = true;
        useSiteStore.getState().setSceneProgress(0.92);
        invalidate();
      });
    // 下一幀各元件的 useFrame 會依 pos 重新決定可見性；這裡先還原
    for (const o of hidden) o.visible = false;
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, invalidate]);

  useFrame(() => {
    const w = window as Window & { __frames?: number };
    w.__frames = (w.__frames ?? 0) + 1;
    if (flags.perf) {
      const now = performance.now();
      const p = perf.current;
      if (p.last) {
        p.sum += now - p.last;
        p.n++;
        window.__perf = { avgFrameMs: p.sum / p.n, samples: p.n };
      }
      p.last = now;
    }
    if (!compiled.current) return;
    frames.current++;
    if (frames.current === 2) {
      useSiteStore.getState().setSceneProgress(1);
      useSiteStore.getState().setSceneReady(true);
    }
    if (frames.current < 3) invalidate();
  }, 1);
  return null;
}

/** 場景內容（不含 Canvas），依 GPU 等級的預算決定數量；單元測試直接渲染這一層 */
export function SceneContents({ budget }: { budget: ReturnType<typeof sceneBudget> }) {
  return (
    <>
      <CameraRig />
      <Atmosphere />
      <Sky />
      <Water segments={budget.waterSegments} />
      <LightShafts />
      <MarineSnow count={budget.snow} />
      <Fish count={budget.fish} />
      <SkillBubbles transmission={budget.transmission} />
      <ProjectProbe />
      <Jellyfish />
      <Plankton count={budget.plankton} />
      <Seafloor />
    </>
  );
}

export default function SceneRoot() {
  const tier = useSiteStore((s) => s.tier);
  const ready = useSiteStore((s) => s.sceneReady);
  const reduced = useReducedMotion();
  const [degraded, setDegraded] = useState(false);
  const budget = useMemo(() => sceneBudget(degraded ? 1 : tier, flags.test), [tier, degraded]);
  const demand = reduced || flags.test;

  useEffect(() => {
    useSiteStore.getState().setSceneProgress(0.45);
    return () => useSiteStore.getState().setSceneReady(false);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-1000"
      style={{ opacity: ready ? 1 : 0 }}
      data-testid="scene"
      data-ready={ready ? '1' : '0'}
    >
      <Canvas
        eventSource={document.getElementById('root')!}
        eventPrefix="client"
        dpr={budget.dpr}
        frameloop={demand ? 'demand' : 'always'}
        camera={{ fov: 52, near: 0.1, far: 420, position: [0, SKY_HEIGHT, 0] }}
        gl={{
          antialias: !budget.postprocessing,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          preserveDrawingBuffer: flags.test,
        }}
        onCreated={() => useSiteStore.getState().setSceneProgress(0.6)}
      >
        {!flags.test && <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={2} />}
        <Invalidator />
        <ReadyProbe />
        <SceneContents budget={budget} />
        {budget.postprocessing && (
          <Suspense fallback={null}>
            <Effects />
          </Suspense>
        )}
        {flags.debug && (
          <Suspense fallback={null}>
            <Debug />
          </Suspense>
        )}
      </Canvas>
    </div>
  );
}
