uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

attribute float aScale;
attribute float aSpeed;

varying float vAlpha;
varying float vSpeed;
varying float vDistToMouse;

void main() {
  vec3 pos = position; // pre-displaced by CPU each frame

  // Mouse distance for color blending (mouse already in world space)
  vec2 diff = pos.xy - uMouse;
  float dist = length(diff);
  vDistToMouse = dist;

  // Alpha: fade nodes near the edge of the field
  vAlpha = 1.0 - smoothstep(0.0, 8.0, length(pos));

  vSpeed = aSpeed;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aScale * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
