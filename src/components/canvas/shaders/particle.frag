uniform vec3 uColorBase;
uniform vec3 uColorAccent;

varying float vAlpha;
varying float vDistToMouse;

void main() {
  // Radial alpha gradient for point sprite
  float distToCenter = length(gl_PointCoord - vec2(0.5));
  if (distToCenter > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, distToCenter) * vAlpha;

  // Color: blend towards crimson accent near mouse
  float accentMix = smoothstep(3.0, 0.5, vDistToMouse);
  vec3 color = mix(uColorBase, uColorAccent, accentMix);

  gl_FragColor = vec4(color, alpha);
}
