uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uUnderColor;
uniform float uUnderDensity;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vHeight;
varying float vRing;

void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);
  // 細節法線：兩層流動雜訊，讓高光碎成閃爍的光點
  vec2 q = vWorld.xz * 0.9;
  float n1 = vnoise(q + uTime * vec2(0.35, 0.2));
  float n2 = vnoise(q * 2.3 - uTime * vec2(0.25, 0.4));
  vec3 detail = vec3(n1 - 0.5, 0.0, n2 - 0.5) * 0.35 * exp(-dist * 0.02);
  vec3 N = normalize(vNormalW + detail);

  if (gl_FrontFacing) {
    // 海面上：菲涅爾混合深海色與天空反射，加上夕陽光帶
    float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
    vec3 R = reflect(-V, N);
    R.y = abs(R.y) + 0.07;
    vec3 refl = skyColor(normalize(R)) * 0.75;
    vec3 body = uDeep + vec3(0.9, 0.45, 0.2) * 0.06 * max(vHeight + 0.2, 0.0) * max(dot(normalize(vec3(uSunDir.x, 0.0, uSunDir.z)), -V), 0.0);
    vec3 col = mix(body, refl, F);
    float glint = pow(max(dot(R, uSunDir), 0.0), 420.0) * 4.0 + pow(max(dot(R, uSunDir), 0.0), 48.0) * 0.22;
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
    float shimmer = 0.6 + 0.4 * vnoise(vWorld.xz * 1.6 + uTime * 0.6);
    vec3 skyLight = vec3(0.75, 0.9, 1.0) * 1.6 * shimmer;
    vec3 col = mix(uUnderColor * 1.6, skyLight, window);
    col += vec3(1.0, 0.8, 0.55) * pow(max(dot(-reflect(V, Nd), uSunDir), 0.0), 60.0) * 0.6;
    float fog = 1.0 - exp(-pow(dist * uUnderDensity, 2.0));
    col = mix(col, uUnderColor, fog);
    gl_FragColor = vec4(col, 1.0);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
