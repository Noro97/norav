uniform float uLineWidth;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;
attribute float instanceAlpha;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vInstanceAlpha;

void main() {
  // uv.x: 0=start, 1=end along the line; uv.y: 0=bottom edge, 1=top edge
  vUv = uv;
  vInstanceAlpha = instanceAlpha;

  vec3 dir = normalize(instanceEnd - instanceStart);

  // Billboard: cross dir with Z-axis; guard against parallel case
  vec3 up = vec3(0.0, 0.0, 1.0);
  if (abs(dot(dir, up)) > 0.999) up = vec3(1.0, 0.0, 0.0);
  vec3 right = normalize(cross(dir, up)) * uLineWidth;

  // Expand unit quad [0,1]x[0,1] into world-space rectangle
  // uv.x selects the along-line position, uv.y selects the across-line edge
  vec3 worldPos = mix(instanceStart, instanceEnd, uv.x)
                + right * (uv.y - 0.5);

  vWorldPos = worldPos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
