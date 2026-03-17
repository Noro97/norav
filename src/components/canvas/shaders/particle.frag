uniform float uTime;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

varying float vAlpha;
varying float vSpeed;
varying float vDistToMouse;

void main() {
  float distToCenter = length(gl_PointCoord - vec2(0.5));
  if (distToCenter > 0.5) discard;

  // Soft glow: bright center fading to edge
  float glow = smoothstep(0.5, 0.0, distToCenter);

  // Per-node sine pulse using aSpeed as phase offset
  float pulse = 0.85 + 0.15 * sin(uTime * 0.5 + vSpeed * 6.28318);

  float alpha = glow * vAlpha * pulse;

  // Blend toward crimson near mouse
  float accentMix = smoothstep(3.0, 0.5, vDistToMouse);
  vec3 color = mix(uColorBase, uColorAccent, accentMix);

  gl_FragColor = vec4(color, alpha);
}
