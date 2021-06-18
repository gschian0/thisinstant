import * as THREE from "../node_modules/three/build/three.module.js";

import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js";

import suzanne from "../assets/suzanne_buffergeometry.json";
let camera, scene, renderer, stats;

let mesh;

const dummy = new THREE.Object3D();

const amount = 8;
const count = Math.pow(amount, 3);

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: false }); // false improves the frame rate
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.outputEncoding = THREE.sRGBEncoding;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.set(0, 0, 20);
  ``;
  new THREE.BufferGeometryLoader().load(suzanne, function (geometry) {
    const instanceColors = [];

    for (let i = 0; i < count; i++) {
      instanceColors.push(Math.random());
      instanceColors.push(Math.random());
      instanceColors.push(Math.random());
    }

    geometry.setAttribute(
      "instanceColor",
      new THREE.InstancedBufferAttribute(new Float32Array(instanceColors), 3)
    );

    geometry.computeVertexNormals();

    geometry.scale(0.5, 0.5, 0.5);

    //console.log( geometry );

    //

    new THREE.TextureLoader().load(
      "textures/matcaps/matcap-porcelain-white.jpg",
      function (texture) {
        texture.encoding = THREE.sRGBEncoding;

        const material = new THREE.MeshMatcapMaterial({
          color: 0xaaaaff,
          matcap: texture,
        });

        const colorParsChunk = [
          "attribute vec3 instanceColor;",
          "varying vec3 vInstanceColor;",
          "#include <common>",
        ].join("\n");

        const instanceColorChunk = [
          "#include <begin_vertex>",
          "\tvInstanceColor = instanceColor;",
        ].join("\n");

        const fragmentParsChunk = [
          "varying vec3 vInstanceColor;",
          "#include <common>",
        ].join("\n");

        const colorChunk = [
          "vec4 diffuseColor = vec4( diffuse * vInstanceColor, opacity );",
        ].join("\n");

        material.onBeforeCompile = function (shader) {
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", colorParsChunk)
            .replace("#include <begin_vertex>", instanceColorChunk);

          shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", fragmentParsChunk)
            .replace(
              "vec4 diffuseColor = vec4( diffuse, opacity );",
              colorChunk
            );

          //console.log( shader.uniforms );
          //console.log( shader.vertexShader );
          //console.log( shader.fragmentShader );
        };

        mesh = new THREE.InstancedMesh(geometry, material, count);

        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame

        scene.add(mesh);
      }
    );
  });

  //

  stats = new Stats();
  document.body.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

  render();

  stats.update();
}

function render() {
  if (mesh) {
    const time = Date.now() * 0.001;

    mesh.rotation.x = Math.sin(time / 4);
    mesh.rotation.y = Math.sin(time / 2);

    let i = 0;
    const offset = (amount - 1) / 2;

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < amount; z++) {
          dummy.position.set(offset - x, offset - y, offset - z);
          dummy.rotation.y =
            Math.sin(x / 4 + time) +
            Math.sin(y / 4 + time) +
            Math.sin(z / 4 + time);
          dummy.rotation.z = dummy.rotation.y * 2;

          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
