import { createRng } from '@/lib/seed';

/**
 * 魚群（boids）的純計算：分離、對齊、聚合 + 回到中心 + 躲避指標。
 * 座標是以魚群中心為原點的區域座標；畫面上的位置由元件加上中心點。
 * 不依賴 three，方便單元測試。
 */
export interface School {
  count: number;
  pos: Float32Array;
  vel: Float32Array;
}

export const BOIDS = {
  radius: 7.5,
  separation: 1.3,
  neighbor: 3.4,
  minSpeed: 2.2,
  maxSpeed: 5.2,
};

export function createSchool(count: number, seed: number): School {
  const rng = createRng(seed);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * BOIDS.radius * 0.7;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (rng() - 0.5) * 6;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.6;
    // 一開始大致朝同一方向繞圈游
    vel[i * 3] = -Math.sin(a) * 3;
    vel[i * 3 + 1] = (rng() - 0.5) * 0.4;
    vel[i * 3 + 2] = Math.cos(a) * 3;
  }
  return { count, pos, vel };
}

/**
 * 推進一步。avoid 是區域座標中要躲開的點（滑鼠），null 表示沒有；
 * avoidRadius / avoidStrength 讓「點擊驚散」用更大的範圍與更強的推力。
 */
export function stepSchool(
  s: School,
  dt: number,
  avoid: [number, number, number] | null = null,
  avoidRadius = 4,
  avoidStrength = 0.9,
) {
  if (dt <= 0) return;
  const { count, pos, vel } = s;
  const n2 = BOIDS.neighbor * BOIDS.neighbor;
  const s2 = BOIDS.separation * BOIDS.separation;
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const px = pos[ix]!;
    const py = pos[ix + 1]!;
    const pz = pos[ix + 2]!;
    let ax = 0, ay = 0, az = 0; // prettier-ignore
    let cx = 0, cy = 0, cz = 0, vx = 0, vy = 0, vz = 0, n = 0; // prettier-ignore
    for (let j = 0; j < count; j++) {
      if (j === i) continue;
      const jx = j * 3;
      const dx = pos[jx]! - px;
      const dy = pos[jx + 1]! - py;
      const dz = pos[jx + 2]! - pz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > n2) continue;
      n++;
      cx += dx;
      cy += dy;
      cz += dz;
      vx += vel[jx]!;
      vy += vel[jx + 1]!;
      vz += vel[jx + 2]!;
      if (d2 < s2 && d2 > 1e-6) {
        const inv = 1 / d2;
        ax -= dx * inv * 1.6;
        ay -= dy * inv * 1.6;
        az -= dz * inv * 1.6;
      }
    }
    if (n > 0) {
      ax += (cx / n) * 0.6 + (vx / n - vel[ix]!) * 0.9;
      ay += (cy / n) * 0.6 + (vy / n - vel[ix + 1]!) * 0.9;
      az += (cz / n) * 0.6 + (vz / n - vel[ix + 2]!) * 0.9;
    }
    // 回到中心（扁平的橢球範圍）+ 繞圈的切線推力，讓魚群一直在游
    const r = Math.hypot(px, py * 2.2, pz * 1.6);
    if (r > BOIDS.radius * 0.6) {
      const k = (r - BOIDS.radius * 0.6) * 0.35;
      ax -= (px / r) * k;
      ay -= ((py * 2.2) / r) * k * 1.5;
      az -= ((pz * 1.6) / r) * k;
    }
    ax += -pz * 0.05;
    az += px * 0.05;
    if (avoid) {
      const dx = px - avoid[0];
      const dy = py - avoid[1];
      const dz = pz - avoid[2];
      const d2 = dx * dx + dy * dy + dz * dz;
      const r2 = avoidRadius * avoidRadius;
      if (d2 < r2) {
        const k = (r2 - d2) * avoidStrength;
        const d = Math.sqrt(d2) + 1e-3;
        ax += (dx / d) * k;
        ay += (dy / d) * k;
        az += (dz / d) * k;
      }
    }
    let nvx = vel[ix]! + ax * dt;
    let nvy = vel[ix + 1]! + ay * dt;
    let nvz = vel[ix + 2]! + az * dt;
    const sp = Math.hypot(nvx, nvy, nvz) || 1;
    const clamped = Math.min(BOIDS.maxSpeed, Math.max(BOIDS.minSpeed, sp));
    nvx = (nvx / sp) * clamped;
    nvy = (nvy / sp) * clamped * 0.6;
    nvz = (nvz / sp) * clamped;
    vel[ix] = nvx;
    vel[ix + 1] = nvy;
    vel[ix + 2] = nvz;
  }
  for (let i = 0; i < count * 3; i++) pos[i]! += vel[i]! * dt;
}
