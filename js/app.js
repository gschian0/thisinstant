import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import fragmentP from "./shader/fragmentPoints.glsl";
import vertexP from "./shader/vertexParticles.glsl";
import dat from "../node_modules/three/examples/jsm/libs/dat.gui.module";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader";
import model from "./assets/Worn_Key.gltf";
import { EffectComposer } from "../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { HalftonePass } from "../node_modules/three/examples/jsm/postprocessing/HalftonePass";
import { ShaderPass } from "../node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import { LuminosityShader } from "../node_modules/three/examples/jsm/shaders/LuminosityShader.js";
import typefaceFont from "./assets/gothic.json";
// import typefaceFont from "../node_modules/three/examples/fonts/droid/droid_serif_bold.typeface.json";
// let textMesh;
const fontLoader = new THREE.FontLoader();
export default class Sketch {
  constructor(options) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.loader = new GLTFLoader();
    this.fontLoader = new THREE.FontLoader();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);
    this.composer = new EffectComposer(this.renderer);
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 4.5);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.effect1Pass = new HalftonePass();
    console.log(this.effect1Pass);
    this.composer.addPass(this.effect1Pass);
    // this.luminosityPass = new ShaderPass(LuminosityShader);
    // this.composer.addPass(this.luminosityPass);
    this.isPlaying = true;
    this.loader.load(model, (gltf) => {
      this.addObjects();
      console.log(gltf);
      console.log(gltf.scene);
      this.model = gltf.scene.children[0];
      this.model.material = this.material;
      this.model.scale.set(1, 1, 1);
      this.model.rotation.y = Math.PI / 2;
      this.model.rotation.z = Math.PI;
      this.scene.add(gltf.scene);
      fontLoader.load("/gothic.json", (font) => {
        const textGeometry = new THREE.TextGeometry("SCRAMBLER", {
          font: font,
          size: 0.5,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
        });
        const textMaterial = new THREE.MeshNormalMaterial();
        textGeometry.center();

        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.y = 1;
        text.position.z = 1;
        this.scene.add(text);
      });

      this.resize();
      this.render();
      this.setupResize();
    });
    // this.settings();
  }

  settings() {
    let that = this; //eslint-disable-line
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this; //eslint-disable-line
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.material2 = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertexP,
      fragmentShader: fragmentP,
    });

    this.geometry = new THREE.BoxBufferGeometry(10, 10, 10, 20, 20, 20);

    this.plane = new THREE.Points(this.geometry, this.material2);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time = this.clock.getElapsedTime();
    this.material.uniforms.time.value = this.time;
    this.material2.uniforms.time.value = this.time;
    this.effect1Pass.material.uniforms.radius.value = this.time % 10;
    // this.model.rotation.x = this.time * 2;
    // this.model.rotation.y = this.time;
    requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
