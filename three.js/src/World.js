import * as THREE from 'three';
import Plane from './Plane.js';

class World {
    constructor(camera, scene) {
        this.scene = scene;
        this.camera = camera;
        this.score = 0;
        this.soundEnabled = true;
        this.audioInitialized = false;  // Flag to ensure audio initializes only once

        // Add ground plane with trees
        this.addGroundPlane();

        // Add stars
        this.rings = [];
        this.addAirStars();

        // Initialize the plane
        this.plane = new Plane(this.scene);

        // Event listener for sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }

    // Initialize sounds after user interaction
    startAudio() {
        if (!this.audioInitialized) {
            const listener = new THREE.AudioListener();
            this.camera.add(listener);

            // Load scoring sound
            this.scoreSound = new THREE.Audio(listener);
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load('./assets/audio/mixkit-retro-game-notification-212.mp3', (buffer) => {
                this.scoreSound.setBuffer(buffer);
                this.scoreSound.setVolume(0.5);
            });

            // Load and configure the engine sound
            this.engineSound = new THREE.Audio(listener);
            audioLoader.load('./assets/audio/lawn-27600.mp3', (buffer) => {
                this.engineSound.setBuffer(buffer);
                this.engineSound.setLoop(true);
                this.engineSound.setVolume(0.3);
                this.engineSound.hasPlaybackControl = true;
                this.engineSound.playbackRate = 1.0;
                this.engineSound.play();
            });

            this.audioInitialized = true;  // Set flag to prevent re-initializing
        }
    }

    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const newVolume = this.soundEnabled ? 0.5 : 0;

        if (this.scoreSound) this.scoreSound.setVolume(newVolume);
        if (this.engineSound) this.engineSound.setVolume(this.soundEnabled ? 0.3 : 0);

        const button = document.getElementById('soundToggle');
        button.innerText = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
    }

    // Play scoring sound
    playScoreSound() {
        if (this.soundEnabled && this.scoreSound.isPlaying) this.scoreSound.stop();
        if (this.soundEnabled) this.scoreSound.play();
    }

    // Update engine sound based on speed
    updateEngineSound(speed) {
        if (this.soundEnabled) {
            const minPlaybackRate = 0.8;
            const maxPlaybackRate = 1.2;
            this.engineSound.setPlaybackRate(minPlaybackRate + speed * (maxPlaybackRate - minPlaybackRate));
        }
    }

    // Animation function
    animate(pitch, yaw, speed) {
        if (this.plane && this.plane.isLoaded) {
            this.plane.pitch_fun(pitch);
            this.plane.yaw_fun(yaw);
            this.plane.speed_fun(speed);

            // Update plane animation
            this.plane.animate();

            // Adjust engine sound based on speed
            this.updateEngineSound(speed);

            // Camera offset to position the camera behind the plane
            const offset = new THREE.Vector3(0, 1, -3);
            offset.applyQuaternion(this.plane.plane.quaternion);
            this.camera.position.copy(this.plane.plane.position).add(offset);
            this.camera.lookAt(this.plane.plane.position);

            // Collision detection with stars
            this.checkStarCollisions();
        }
    }

    // Add random stars to the scene
    addAirStars() {
        const numStars = 100;
        for (let i = 0; i < numStars; i++) {
            const star = this.createStar();

            // Random position for each star
            star.position.set(
                (Math.random() - 0.5) * 200,
                Math.random() * 30 + 5,
                (Math.random() - 0.5) * 200
            );

            this.scene.add(star);
            this.rings.push(star);
        }
    }

    // Create a 3D star shape
    createStar() {
        const shape = new THREE.Shape();
        const outerRadius = 2;
        const innerRadius = 0.8;
        const points = 5;

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        shape.closePath();

        const extrudeSettings = { depth: 0.5, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffc107 });
        const star = new THREE.Mesh(geometry, material);
        star.castShadow = true;
        return star;
    }

    // Check for collisions between plane and stars
    checkStarCollisions() {
        const planePosition = this.plane.plane.position;

        this.rings = this.rings.filter((star) => {
            const distance = planePosition.distanceTo(star.position);

            if (distance < 2) {
                this.incrementScore();
                this.playScoreSound();
                this.scene.remove(star);
                return false;
            }

            return true;
        });
    }

    // Increment score and update display
    incrementScore() {
        this.score++;
        document.getElementById('score').innerText = `Score: ${this.score}`;
    }

    // Add a large ground plane
    addGroundPlane() {
        const planeGeometry = new THREE.PlaneGeometry(50000, 50000);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
        const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.receiveShadow = true;
        this.scene.add(groundPlane);

        this.addTrees();
    }

    // Add random trees to the scene
    addTrees() {
        const numTrees = 100;
        for (let i = 0; i < numTrees; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * 450,
                0,
                (Math.random() - 0.5) * 450
            );

            this.scene.add(tree);
        }
    }

    // Create a tree with a trunk and foliage
    createTree() {
        const tree = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const foliageGeometry = new THREE.ConeGeometry(2.5, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 7.5;
        foliage.castShadow = true;
        tree.add(foliage);

        return tree;
    }
}

export default World;
