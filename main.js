import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/geometries/TextGeometry.js";

class Environment {
  constructor(font, particle) {
    this.font = font;
    this.particle = particle;
    this.container = document.querySelector("#magic");

    this.scene = new THREE.Scene();
    this.createCamera();
    this.createRenderer();
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  setup() {
    this.createParticles = new CreateParticles(
      this.scene,
      this.font,
      this.particle,
      this.camera,
      this.renderer
    );
  }

  render() {
    this.createParticles.render();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.container.clientWidth / this.container.clientHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, 100);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.render(); // Start render loop
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}

class CreateParticles {
  constructor(scene, font, particleImg, camera, renderer) {
    this.scene = scene;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;

    this.mouse = new THREE.Vector2(-200, 200);
    this.raycaster = new THREE.Raycaster();
    this.colorChange = new THREE.Color();
    this.buttonPressed = false;

    this.data = {
      text: "FUTURE\nIS NOW",
      amount: 1500,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: 16,
      area: 250,
      ease: 0.05,
    };

    this.setup();
    this.bindEvents();
  }

  setup() {
    this.createText();
  }

  bindEvents() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.buttonPressed = true;
    this.data.ease = 0.01;
  }

  onMouseUp() {
    this.buttonPressed = false;
    this.data.ease = 0.05;
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  render() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    requestAnimationFrame(() => this.render());
  }

  createText() {
    let points = [];

    let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    let colors = [];
    let sizes = [];

    for (let shape of shapes) {
      let shapePoints = shape.getSpacedPoints(this.data.amount / 2);
      shapePoints.forEach((pt) => {
        points.push(new THREE.Vector3(pt.x, pt.y, 0));
        colors.push(1, 1, 1); // White
        sizes.push(1);
      });
    }

    let bufferGeo = new THREE.BufferGeometry().setFromPoints(points);
    bufferGeo.setAttribute("customColor", new THREE.Float32BufferAttribute(colors, 3));
    bufferGeo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: this.particleImg },
      },
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particles = new THREE.Points(bufferGeo, material);
    this.scene.add(this.particles);
  }
}

const preload = () => {
  let manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    new Environment(typo, particle);
  };

  let typo = null;
  const loader = new FontLoader(manager);
  loader.load("https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json", (font) => {
    typo = font;
  });

  const particle = new THREE.TextureLoader(manager).load(
    "https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png"
  );
};

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
  preload();
else document.addEventListener("DOMContentLoaded", preload);
