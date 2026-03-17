uniform vec2 uMouse;
uniform float uCollapsed;
uniform float uBurst;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vInstanceAlpha;

void main() {
  // Soft edges along the width axis (vUv.y 0→1 maps to width)
  float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

  // Mouse proximity glow (uMouse already in world space)
  float distToMouse = length(vWorldPos.xy - uMouse);
  float mouseInfluence = smoothstep(3.0, 0.0, distToMouse);
  vec3 color = mix(uColorBase, uColorAccent, mouseInfluence);

  // Connections vanish at 60% burst progress
  float burstFade = 1.0 - smoothstep(0.0, 0.6, uBurst);

  float alpha = vInstanceAlpha * edgeFade * (1.0 - uCollapsed * 0.8) * burstFade;
  gl_FragColor = vec4(color, alpha);
}
