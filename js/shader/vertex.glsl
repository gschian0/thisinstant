uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vec3 newPos = position;
  float slTi = time * .5;
  newPos.y += 0.5*sin(newPos.x+slTi);
  newPos.z += 0.2*sin(PI*newPos.y+slTi);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
}