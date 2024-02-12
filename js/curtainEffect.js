import { Vector2 } from "three"

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const CurtainShader = {
  name: "CurtainShader",

  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0 },
    tSize: { value: new Vector2(256, 256) },
    center: { value: new Vector2(0.5, 0.5) },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform vec2 center;
		uniform float uProgress;
		uniform float scale;
		uniform vec2 tSize;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;



		void main() {

		

			vec2 newPosition = vUv;
		//	p += 0.1*sin(10. *vUv.x);

		// curtains split into 4 parts
		if (newPosition.x < 0.25) {
			

		} else if (newPosition.x < 0.5) {
			newPosition.x = newPosition.x - 0.25 * uProgress;

		} else if (newPosition.x < 0.75) {
			newPosition.x = newPosition.x - 0.35 * uProgress;

		} else {
			newPosition.x = newPosition.x - 0.65 * uProgress;
		}

		// shifts texture backwards + forwards
		//newPosition.x += uProgress;

		vec4 color = texture2D( tDiffuse, newPosition );
			gl_FragColor = color;

		}`,
}

export { CurtainShader }
