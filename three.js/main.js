// main.js
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/jsm/controls/OrbitControls.js';

let scene, camera, renderer, arrowHelper, controls;
let points = []; // Array to hold the points of the line
let lastPosition = new THREE.Vector3(0, 0, 0); // Starting point for the line
let isFirstPersonView = false; // Track current view mode

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a button to toggle the view
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle View';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.padding = '10px';
    document.body.appendChild(toggleButton);
    toggleButton.addEventListener('click', toggleView);

    // Initialize orbit controls for camera manipulation
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;

    // Initialize the arrow helper to represent the plane's direction
    const initialDirection = new THREE.Vector3(1, 0, 0); // Initially points along the X-axis
    arrowHelper = new THREE.ArrowHelper(initialDirection, lastPosition, 1, 0x00ff00); // Length and color
    scene.add(arrowHelper);

    // Set initial camera position for an overview
    camera.position.set(5, 5, 15);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Add random objects to the scene
    addRandomObjects();

    connectWebSocket();
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls only if in default view
    if (!isFirstPersonView) {
        controls.update();
    }

    renderer.render(scene, camera);
}

let tracePoints = [];
let traceLine;

function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Data received:', data);

        // Extract pitch, yaw, roll, and speed from the received data
        const { rotX, rotY, rotZ, speed } = data;

        // Enforce positive Z value to maintain consistency
        const pitch = rotX;
        const yaw = -rotY;           // Negate yaw if necessary for stability
        const roll = Math.abs(rotZ);  // Force roll to be positive

        // Create a new Euler from adjusted orientation data
        const euler = new THREE.Euler(pitch, yaw, roll, 'YXZ'); // Yaw, Pitch, Roll order

        // Apply the Euler angles to control the arrow's orientation
        arrowHelper.setRotationFromEuler(euler);

        // Calculate forward movement direction based on orientation
        const forwardDirection = new THREE.Vector3(0, 1, 0).applyEuler(euler).normalize();

        // Calculate the new position by moving forward based on speed
        const newPosition = lastPosition.clone().add(forwardDirection.multiplyScalar(speed));

        // Update the arrow's position and add tracing
        arrowHelper.position.copy(newPosition);
        lastPosition.copy(newPosition);

        // Draw a permanent trace line
        addTraceLine(newPosition);

        // Update the camera position and orientation in first-person view
        if (isFirstPersonView) {
            updateCameraForFirstPersonView(forwardDirection);
        }
    };
}

function addTraceLine(newPosition) {
    // Add new position to trace points
    tracePoints.push(newPosition.clone());

    // Update line geometry
    const traceGeometry = new THREE.BufferGeometry().setFromPoints(tracePoints);
    if (!traceLine) {
        const traceMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        traceLine = new THREE.Line(traceGeometry, traceMaterial);
        scene.add(traceLine);
    } else {
        traceLine.geometry.dispose(); // Dispose of old geometry
        traceLine.geometry = traceGeometry; // Set new geometry
    }
}




function toggleView() {
    isFirstPersonView = !isFirstPersonView;

    if (isFirstPersonView) {
        controls.enabled = false;
    } else {
        controls.enabled = true;
        camera.position.set(0, 0, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
}

function updateCameraForFirstPersonView(direction) {
    const cameraOffset = direction.clone().multiplyScalar(-1); // Offset distance from arrow
    camera.position.copy(arrowHelper.position.clone().add(cameraOffset));
    camera.lookAt(arrowHelper.position.clone().add(direction));
}

function addRandomObjects() {
    const objectCount = 20;
    const range = 10;

    for (let i = 0; i < objectCount; i++) {
        const x = (Math.random() - 0.5) * range;
        const y = (Math.random() - 0.5) * range;
        const z = (Math.random() - 0.5) * range;

        // Randomize size and shape
        const size = Math.random() * 0.5 + 0.2;
        const geometry = Math.random() > 0.5 ? new THREE.BoxGeometry(size, size, size) : new THREE.SphereGeometry(size / 2, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        const object = new THREE.Mesh(geometry, material);

        object.position.set(x, y, z);
        scene.add(object);
    }

    // Add ambient light and directional light for better illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
}

init();
