// 共用：雜訊與天空顏色（海面反射與天空球必須一致）
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}

uniform vec3 uSunDir;

vec3 skyColor(vec3 dir) {
  float h = dir.y;
  vec3 zenith = vec3(0.012, 0.035, 0.085);
  vec3 mid = vec3(0.05, 0.15, 0.26);
  vec3 horizon = vec3(0.85, 0.42, 0.2);
  vec3 col = mix(horizon, mid, smoothstep(0.0, 0.09, h));
  col = mix(col, zenith, smoothstep(0.08, 0.55, h));
  float s = max(dot(dir, uSunDir), 0.0);
  col += vec3(1.0, 0.45, 0.18) * pow(s, 10.0) * 0.45 * smoothstep(-0.05, 0.12, h + 0.06);
  col += vec3(1.0, 0.7, 0.45) * pow(s, 160.0) * 1.1;
  col += vec3(1.0, 0.86, 0.68) * smoothstep(0.9994, 0.9997, s) * 3.0;
  // 地平線以下：海面遠方的霧
  col = mix(col, vec3(0.03, 0.09, 0.15), smoothstep(0.0, -0.08, h));
  return col;
}
