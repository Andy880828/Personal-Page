uniform float uTime;
uniform vec4 uRipples[8]; // xz 位置、開始時間、強度
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vHeight;
varying float vRing;

// 四道方向不同的長浪 + 滑鼠漣漪
float waves(vec2 p, float t, out float ring) {
  float h = 0.0;
  h += 0.34 * sin(dot(p, vec2(0.12, 0.05)) + t * 0.9);
  h += 0.22 * sin(dot(p, vec2(-0.07, 0.16)) + t * 1.15);
  h += 0.12 * sin(dot(p, vec2(0.27, -0.21)) + t * 1.7);
  h += 0.06 * sin(dot(p, vec2(-0.41, -0.33)) + t * 2.4);
  ring = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 r = uRipples[i];
    float age = t - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 6.0) continue;
    float d = distance(p, r.xy);
    float front = age * 3.2;
    float env = exp(-abs(d - front) * 0.9) * exp(-age * 0.75) * r.w;
    h += sin(d * 2.6 - age * 8.0) * env * 0.35;
    ring += env;
  }
  return h;
}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  float ring;
  float h = waves(world.xz, uTime, ring);
  float e = 0.35;
  float r1;
  float hx = waves(world.xz + vec2(e, 0.0), uTime, r1);
  float hz = waves(world.xz + vec2(0.0, e), uTime, r1);
  world.y += h;
  vNormalW = normalize(vec3(h - hx, e, h - hz));
  vWorld = world.xyz;
  vHeight = h;
  vRing = ring;
  gl_Position = projectionMatrix * viewMatrix * world;
}
