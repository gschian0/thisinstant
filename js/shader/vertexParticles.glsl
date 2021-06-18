uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texture1;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vec3 newPos = position;
  newPos.z += sin(20.*2.*PI*newPos.y+time);
  newPos.y += sin(200.*2.*PI*newPos.x+time);
  vec4 mvPosition = modelViewMatrix * vec4( newPos, 1. );
  gl_PointSize = 100. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}