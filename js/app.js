import * as THREE from "three"
import fragment from "./shader/fragment.glsl"
import vertex from "./shader/vertex.glsl"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gui from "lil-gui"
import gsap from "gsap"
import img1 from "../img/img-1.jpg"
import img2 from "../img/img-2.jpg"
import img3 from "../img/img-3.jpg"
import mask from "../img/mask.jpg"
import createInputEvents from "simple-input-events"

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js"
// import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js"
// import { OutputPass } from "three/addons/postprocessing/OutputPass.js"

import { CurtainShader } from "./postProcessingEffect"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.container.appendChild(this.renderer.domElement)

    // setting up the 2D Canvas

    this.ctx = this.renderer.domElement.getContext("2d")
    this.container.width = 1920
    this.container.height = 1080

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    )

    this.event = createInputEvents(this.renderer.domElement)

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 900)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.time = 0
    this.mouse = new THREE.Vector2()
    this.mouseTarget = new THREE.Vector2()

    this.isPlaying = true

    this.initPostprocessing()
    this.addObjects()
    this.resize()
    this.render()
    this.setupResize()
    this.events()
    // this.settings()
  }

  events() {
    this.event.on("move", ({ uv }) => {
      // normalize uvs so they happen in the center
      this.mouse.x = uv[0] - 0.5
      this.mouse.y = uv[1] - 0.5
    })
  }

  initPostprocessing() {
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    const effectPass = new ShaderPass(CurtainShader)
    this.composer.addPass(effectPass)

    // this.glitchPass = new GlitchPass()
    // this.composer.addPass(this.glitchPass)

    // this.outputPass = new OutputPass()
    // this.composer.addPass(this.outputPass)
  }

  settings() {
    let that = this
    this.settings = {
      progress: 0,
    }
    this.gui = new dat.GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.01)
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.composer.setSize(this.width, this.height)
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    let that = this

    this.textures = [img1, img2, img3]
    this.textures = this.textures.map((img) =>
      new THREE.TextureLoader().load(img)
    )
    this.maskTexture = new THREE.TextureLoader().load(mask)
    this.geometry = new THREE.PlaneGeometry(1920, 1080, 1, 1)

    this.groups = []

    this.textures.forEach((texture, index) => {
      let group = new THREE.Group()
      this.scene.add(group)

      this.groups.push(group)

      for (let i = 0; i < 3; i++) {
        let material = new THREE.MeshBasicMaterial({
          // map: this.textures[i],
          map: texture,
        })

        if (i > 0) {
          // second and third images will have the mask ( a whole inside)
          material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: this.maskTexture,
            transparent: true,
          })
        }

        let mesh = new THREE.Mesh(this.geometry, material)
        // layer them one behind the other
        mesh.position.z = (i + 1) * 100
        group.add(mesh)

        group.position.x = index * 2500
      }
    })
  }

  stop() {
    this.isPlaying = false
  }

  play() {
    if (!this.isPlaying) {
      this.render()
      this.isPlaying = true
    }
  }

  render() {
    if (!this.isPlaying) return
    this.time += 0.05
    // this.material.uniforms.time.value = this.time

    // create inertia effect

    this.mouseTarget.lerp(this.mouse, 0.1)

    this.groups.forEach((group, index) => {
      group.rotation.x = -this.mouseTarget.y * 0.1
      group.rotation.y = -this.mouseTarget.x * 0.1
    })

    requestAnimationFrame(this.render.bind(this))
    // this.renderer.render(this.scene, this.camera)
    this.composer.render()
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
