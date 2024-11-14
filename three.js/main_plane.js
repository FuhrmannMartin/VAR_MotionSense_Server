// main_plane.js
import * as THREE from 'three';
import Lights from './src/Lights.js';
import World from './src/World.js';

let gameStarted = false;
let lastFrameTime = 0;
const targetFPS = 60;
const interval = 1000 / targetFPS;
let startTime;

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
let pitch, yaw, finalspeed;
let socket;

function connectWebSocket() {
    const connectionStatus = document.getElementById('connectionStatus');
    const startButton = document.getElementById('startButton');
    const pingInterval = 5000;

    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
        connectionStatus.innerText = "Connecting...";
        console.log("WebSocket connected, waiting for data...");

        setInterval(() => {
            const startTime = Date.now();
            socket.send(JSON.stringify({ type: 'ping' }));
        }, pingInterval);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
            const latency = Date.now() - startTime;
            console.log(`Ping: ${latency} ms`);
        } else {
            connectionStatus.innerText = "Connected";
            startButton.disabled = false;  // Enable and style button on game data received
            console.log("Game data received, connection confirmed");

            handleGameData(data);
        }
    };

    socket.onerror = (error) => {
        connectionStatus.innerText = "Connection Error";
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        connectionStatus.innerText = "Disconnected";
        startButton.disabled = true;
        console.warn("WebSocket closed, attempting to reconnect...");
        setTimeout(connectWebSocket, 3000);
    };
}

function handleGameData(data) {
    const { rotX, rotY, rotZ, speed } = data;
    pitch = ((Math.abs(rotZ) - Math.PI / 2) / Math.PI / 2) * -3;
    yaw = rotX / 6 / Math.PI;
    finalspeed = 0.5 + speed * 2;
}

function initializeGame() {
    gameStarted = true;
    startTime = Date.now(); // Start the timer when the game begins
    world.startTime = startTime;
    world.startAudio();
    requestAnimationFrame(animate);
}

// Animation function - halts if game is over
function animate() {
    if (gameStarted && !world.gameOverTriggered) {
        // Update the world with the current steering inputs
        world.animate(pitch, yaw, finalspeed);

        // Render the scene
        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}
connectWebSocket();
export { initializeGame }
