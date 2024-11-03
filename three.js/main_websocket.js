import * as THREE from 'three';

let scene, camera, renderer, cube;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;
    connectWebSocket();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Data received:', data);
        const { x, y, z, color } = data;
        cube.position.set(x*100, y*100, z*100);
        cube.material.color = new THREE.Color(color);
    };
}

init();
