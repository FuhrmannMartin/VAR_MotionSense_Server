import * as THREE from 'three';
import Lights from './src/Lights.js';
import World from './src/World.js';

let lastFrameTime = 0;
const targetFPS = 60;
const interval = 1000 / targetFPS;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const lights = new Lights(scene);
scene.add(lights.ambientLight);
scene.add(lights.hemisphereLight);
scene.add(lights.directionalLight);
scene.add(lights.spotLight);
scene.add(lights.pointLight);

const world = new World(camera, scene);

function animate(timestamp) {
    // Check if the plane is loaded and enough time has passed for the next frame
    if (world.plane && world.plane.isLoaded && (timestamp - lastFrameTime) >= interval) {
        world.animate(); // Update the world
        renderer.render(scene, camera); // Render the scene
        lastFrameTime = timestamp; // Update the last frame time
    }
    
    // Request the next frame
    requestAnimationFrame(animate);
}

// Start the animation loop
requestAnimationFrame(animate);

window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    console.log(window.innerWidth, window.innerHeight);
});
