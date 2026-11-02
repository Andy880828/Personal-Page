uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uUnderColor;
uniform float uUnderDensity;
uniform float uFade;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vHeight;
varying float vRing;

void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);
  // 細節法線：兩層慢速流動的雜訊，只在近處有作用。
  // 速度與幅度都刻意很小：太快或太尖的高光會讓整片海面每一幀都在閃。
  vec2 q = vWorld.xz * 0.7;
  float n1 = vnoise(q + uTime * vec2(0.05, 0.03));
  float n2 = vnoise(q * 1.9 - uTime * vec2(0.035, 0.06));
  float detailAmp = 0.16 * exp(-dist * 0.045);
  vec3 detail = vec3(n1 - 0.5, 0.0, n2 - 0.5) * detailAmp;
  vec3 N = normalize(vNormalW + detail);

  if (gl_FrontFacing) {
    // 海面上：菲涅爾混合深海色與天空反射，加上夕陽光帶
    float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
    vec3 R = reflect(-V, N);
    R.y = abs(R.y) + 0.07;
    vec3 refl = skyColor(normalize(R)) * 0.75;
    vec3 body = uDeep + vec3(0.9, 0.45, 0.2) * 0.06 * max(vHeight + 0.2, 0.0) * max(dot(normalize(vec3(uSunDir.x, 0.0, uSunDir.z)), -V), 0.0);
    vec3 col = mix(body, refl, F);
    // 夕陽光帶：用平滑的寬高光，不用超高次方（那會變成逐像素的閃點）
    float s = max(dot(R, uSunDir), 0.0);
    float glint = smoothstep(0.975, 0.999, s) * 0.9 + pow(s, 24.0) * 0.22;
    col += vec3(1.0, 0.75, 0.45) * glint;
    // 漣漪的白色波紋
    col += vec3(0.85, 0.95, 1.0) * smoothstep(0.25, 0.9, vRing) * 0.35;
    // 遠方淡入地平線
    float haze = 1.0 - exp(-dist * 0.01);
    vec3 horizonCol = skyColor(normalize(vec3(-V.x, 0.01, -V.z)));
    col = mix(col, mix(vec3(0.02, 0.08, 0.15), horizonCol, 0.35), haze * 0.7);
    gl_FragColor = vec4(col, 1.0);
  } else {
    // 水下往上看：斯涅爾窗（看得到天空的圓錐）之外是全反射的水色
    vec3 Nd = -N;
    float cosT = max(dot(Nd, V), 0.0);
    float window = smoothstep(0.62, 0.8, cosT);
    float shimmer = 0.7 + 0.3 * vnoise(vWorld.xz * 1.2 + uTime * 0.12);
    vec3 skyLight = vec3(0.75, 0.9, 1.0) * 1.6 * shimmer;
    vec3 col = mix(uUnderColor * 1.25, skyLight, window);
    col += vec3(1.0, 0.8, 0.55) * pow(max(dot(-reflect(V, Nd), uSunDir), 0.0), 60.0) * 0.6;
    float fog = 1.0 - exp(-pow(dist * uUnderDensity, 2.0));
    // 遠處與淡出時用透明度露出真正的背景，而不是混成「看起來一樣」的水色：
    // 水面經過色調映射、背景清除色不會，兩者混色永遠對不齊，地平線會留一條接縫
    gl_FragColor = vec4(col, (1.0 - fog) * uFade);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
