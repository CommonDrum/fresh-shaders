// islands/ShaderCanvas.tsx
import { useEffect, useRef } from "preact/hooks";
import * as THREE from "three";

const vertexShader = `
  uniform float time;
  
  // Rotation matrix function
  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(
      c, -s,
      s, c
    );
  }

  void main() {
    // Get the position
    vec3 pos = position;
    
    // Rotate the position in XY plane
    vec2 rotated = rotate2d(time) * pos.xy;
    
    // Update position with rotation
    gl_Position = vec4(rotated, pos.z, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;

  void main() {
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0,2,4));
    float circle = distance(uv, mouse);
    circle = smoothstep(0.1, 0.11, circle);
    color = mix(vec3(1.0), color, circle);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function ShaderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const width = 400;
    const height = 400;
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1.5, 1.5); // Made slightly smaller to see rotation better
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(width, height) },
        mouse: { value: new THREE.Vector2(0.5, 0.5) }
      }
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width;
      const y = 1.0 - (event.clientY - rect.top) / height;
      material.uniforms.mouse.value.set(x, y);
    };
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      // Slower rotation
      material.uniforms.time.value = performance.now() / 2000;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      class="border border-gray-300 rounded-lg overflow-hidden cursor-pointer"
    />
  );
}