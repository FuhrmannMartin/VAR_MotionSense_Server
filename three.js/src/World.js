// World.js
import * as THREE from 'three';
import Plane from './Plane.js';


class World {
    constructor(camera, scene) {
        this.scene = scene;
        this.camera = camera;
        this.score = 0;
        this.totalStars = 10; // Total stars to collect for winning
        this.soundEnabled = true;
        this.audioInitialized = false;
        this.gameOverTriggered = false;  // Flag to prevent multiple game overs
        this.startTime = null;

        this.stars = [];   // Stores stars for collision detection
        this.trees = [];   // Stores trees for collision detection

        this.addGroundPlane();
        this.addAirStars();
        this.plane = new Plane(this.scene);

        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }

    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const newVolume = this.soundEnabled ? 0.5 : 0;
        if (this.scoreSound) this.scoreSound.setVolume(newVolume);
        if (this.engineSound) this.engineSound.setVolume(this.soundEnabled ? 0.3 : 0);
        document.getElementById('soundToggle').innerText = `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
    }

    // Start the audio system
    // World.js - Inside the startAudio function
    startAudio() {
        if (!this.audioInitialized) {
            this.listener = new THREE.AudioListener(); // Attach a reusable AudioListener
            this.camera.add(this.listener); // Add listener to the camera

            const audioLoader = new THREE.AudioLoader();

            // Preload scoring sound buffer
            this.starSoundBuffer = null;
            audioLoader.load('./assets/audio/mixkit-retro-game-notification-212.mp3', (buffer) => {
                this.starSoundBuffer = buffer;
            });

            // Load engine sound
            this.engineSound = new THREE.Audio(this.listener);
            audioLoader.load('./assets/audio/lawn-27600.mp3', (buffer) => {
                this.engineSound.setBuffer(buffer);
                this.engineSound.setLoop(true);
                this.engineSound.setVolume(0.3);
                this.engineSound.play();
            });

            // Load explosion sound
            this.explosionSound = new THREE.Audio(this.listener);
            audioLoader.load('./assets/audio/mixkit-arcade-game-explosion-2759.wav', (buffer) => {
                this.explosionSound.setBuffer(buffer);
                this.explosionSound.setVolume(0.8);
            });

            // Load winning sound
            this.winningSound = new THREE.Audio(this.listener);
            audioLoader.load('./assets/audio/mixkit-video-game-win-2016.wav', (buffer) => {
                this.winningSound.setBuffer(buffer);
                this.winningSound.setVolume(0.8);
            });

            this.audioInitialized = true;
        }
    }



    // Update engine sound based on speed
    updateEngineSound(speed) {
        if (this.soundEnabled && this.engineSound) {
            const minPlaybackRate = 0.8;
            const maxPlaybackRate = 1.2;
            this.engineSound.setPlaybackRate(minPlaybackRate + speed * (maxPlaybackRate - minPlaybackRate));
        }
    }

    // Main animation function - applies pitch, yaw, and speed to the plane
    animate(pitch, yaw, speed) {
        if (this.gameOverTriggered) return;

        // Apply pitch, yaw, and speed to the plane if loaded
        if (this.plane && this.plane.isLoaded) {
            this.plane.pitch_fun(pitch);
            this.plane.yaw_fun(yaw);
            this.plane.speed_fun(speed);

            // Update plane animation
            this.plane.animate();

            // Adjust engine sound based on speed
            this.updateEngineSound(speed);

            // Camera follow logic
            const offset = new THREE.Vector3(0, 1, -3);
            offset.applyQuaternion(this.plane.plane.quaternion);
            this.camera.position.copy(this.plane.plane.position).add(offset);
            this.camera.lookAt(this.plane.plane.position);

            // Check for collisions
            this.checkCollisions();
        }
    }

    // Check for collisions with stars, trees, and ground
    checkCollisions() {
        const planeBox = new THREE.Box3().setFromObject(this.plane.plane);

        // Check for ground collision
        if (this.plane.plane.position.y < 1) {
            this.triggerGameOver();
            return;
        }

        // Check for star collisions
        this.stars = this.stars.filter((star) => {
            const starBox = new THREE.Box3().setFromObject(star);
            if (planeBox.intersectsBox(starBox)) {
                this.incrementScore();
                this.scene.remove(star);
                return false;
            }
            return true;
        });

        // Check for tree collisions
        this.trees.forEach((tree) => {
            const treeBox = new THREE.Box3().setFromObject(tree.group); // Bounding box for the whole tree group
            if (planeBox.intersectsBox(treeBox)) {
                this.triggerGameOver();
            }
        });
    }

    incrementScore() {
        this.score++;
        document.getElementById('score').innerText = `Stars: ${this.score}/${this.totalStars}`;

        // Play star sound using preloaded buffer
        if (this.soundEnabled && this.starSoundBuffer) {
            const starSound = new THREE.Audio(this.listener); // Reuse the listener
            starSound.setBuffer(this.starSoundBuffer);
            starSound.setVolume(0.5);
            starSound.play();
        }

        // Check if player has won
        if (this.score >= this.totalStars) {
            this.triggerWin();
        }
    }






    // Trigger the winning sequence
    triggerWin() {
        // Stop the game
        this.gameOverTriggered = true;

        // Calculate elapsed time
        const elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(2);

        // Play winning sound
        if (this.winningSound && this.soundEnabled) {
            this.winningSound.play();
        }
        if (this.engineSound) this.engineSound.stop();

        // Create and display the winning screen
        const winScreen = document.createElement('div');
        winScreen.id = 'winScreen';
        winScreen.style.position = 'fixed';
        winScreen.style.top = 0;
        winScreen.style.left = 0;
        winScreen.style.width = '100%';
        winScreen.style.height = '100%';
        winScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        winScreen.style.display = 'flex';
        winScreen.style.flexDirection = 'column';
        winScreen.style.alignItems = 'center';
        winScreen.style.justifyContent = 'center';
        winScreen.style.color = 'white';
        winScreen.style.fontFamily = 'Arial, sans-serif';
        winScreen.style.zIndex = 2;

        winScreen.innerHTML = `
            <h1>Congratulations!</h1>
            <p>You collected all ${this.totalStars} stars!</p>
            <p>Time: ${elapsedTime} seconds</p>
            <button onclick="window.location.reload()">Restart Game</button>
        `;

        document.body.appendChild(winScreen);
    }


    // World.js - Inside the World class

    triggerGameOver() {
        if (this.gameOverTriggered) return;

        // Stop the plane and play explosion effect
        this.explodePlane();
        this.gameOverTriggered = true;
    }

// New function to display the game-over screen after explosion
    showGameOverScreen() {
        // Calculate elapsed time since game start
        const elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(2);

        // Create and display game-over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'gameOverScreen';
        gameOverScreen.style.position = 'fixed';
        gameOverScreen.style.top = 0;
        gameOverScreen.style.left = 0;
        gameOverScreen.style.width = '100%';
        gameOverScreen.style.height = '100%';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.flexDirection = 'column';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.fontFamily = 'Arial, sans-serif';
        gameOverScreen.style.zIndex = 2;

        gameOverScreen.innerHTML = `
        <h1>Game Over</h1>
        <p>Score: ${this.score}</p>
        <p>Time: ${elapsedTime} seconds</p>
        <button onclick="window.location.reload()">Restart Game</button>
    `;
        document.body.appendChild(gameOverScreen);
    }

// Adjusted explodePlane function for clarity




    explodePlane() {
        // Hide the plane model to simulate destruction
        if (this.plane && this.plane.plane) {
            this.plane.plane.visible = false;
        }

        // Play explosion sound if available
        if (this.explosionSound && this.soundEnabled) {
            this.explosionSound.play();
        }
        if (this.engineSound) this.engineSound.stop();

        // Create a "DEAD" overlay
        const deadOverlay = document.createElement('div');
        deadOverlay.id = 'deadOverlay';
        deadOverlay.style.position = 'fixed';
        deadOverlay.style.top = '50%';
        deadOverlay.style.left = '50%';
        deadOverlay.style.transform = 'translate(-50%, -50%)';
        deadOverlay.style.fontSize = '200px';
        deadOverlay.style.fontWeight = 'bold';
        deadOverlay.style.color = 'red';
        deadOverlay.style.fontFamily = 'Arial, sans-serif';
        deadOverlay.style.zIndex = '10';
        deadOverlay.innerText = '☠️';

        // Append the overlay to the document body
        document.body.appendChild(deadOverlay);

        // Remove the "DEAD" overlay and show the game-over screen after a delay
        setTimeout(() => {
            document.body.removeChild(deadOverlay); // Remove "DEAD" overlay
            this.showGameOverScreen(); // Show the game-over screen
        }, 1000); // Adjust delay as needed for effect duration
    }








// Add ground plane and trees
    addGroundPlane() {
        const planeGeometry = new THREE.PlaneGeometry(50000, 50000);
        const planeMaterial = new THREE.MeshStandardMaterial({color: 0xaaaaaa, side: THREE.DoubleSide});
        const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.receiveShadow = true;
        this.scene.add(groundPlane);

        this.addTrees();
    }


    // Define the addAirStars function here
    addAirStars() {
        const numStars = 100;
        for (let i = 0; i < numStars; i++) {
            const star = this.createStar();

            // Random position for each star
            star.position.set(
                (Math.random() - 0.5) * 300,
                Math.random() * 30 + 5,
                (Math.random() - 0.5) * 300
            );

            this.scene.add(star);
            this.stars.push(star);  // Add to stars array for collision detection
        }
    }

    // Create a 3D star shape
    createStar() {
        const outerRadius = 2;
        const innerRadius = 0.8;
        const points = 5;
        const shape = new THREE.Shape();

// Define points for the star shape
        for (let i = 0; i <= points * 2; i++) { // Use <= to ensure full loop closure
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }

// Close the path explicitly to ensure the last point connects to the first
        shape.closePath();


        // Improved extrude settings for a more refined star shape
        const extrudeSettings = {
            depth: 0.5,             // Extrusion depth for 3D effect
            bevelEnabled: true,     // Enable bevel for smoother edges
            bevelThickness: 0.2,    // Thickness of the bevel
            bevelSize: 0.1,         // Size of the bevel
            bevelSegments: 2        // Smooths out the bevel
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        //geometry.rotateX(Math.PI); // Rotate to stand vertically if needed
        geometry.rotateZ(Math.random()*10);
        geometry.rotateY(Math.random()*10);

        // Refined material with metallic shine and emissive properties
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffa500,
            metalness: 0.6,
            roughness: 0.4
        });

        const star = new THREE.Mesh(geometry, material);
        star.castShadow = true;
        star.receiveShadow = true;

        return star;
    }


    // Add trees to the scene
    addTrees() {
        this.trees = [];
        for (let i = 0; i < 100; i++) {
            const tree = this.createTree(); // `tree` is now an object with `group`, `trunk`, and `foliage`

            // Set the position of the tree group
            tree.group.position.set(
                (Math.random() - 0.5) * 450,
                0,
                (Math.random() - 0.5) * 450
            );

            this.scene.add(tree.group); // Add the tree group to the scene
            this.trees.push(tree);       // Add to trees array for collision detection
        }
    }

    // Create a tree with trunk and foliage
    createTree() {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5), new THREE.MeshStandardMaterial({color: 0x8b4513}));
        trunk.position.y = 2.5;
        trunk.castShadow = true;
        tree.add(trunk);

        const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.5, 8, 8), new THREE.MeshStandardMaterial({color: 0x228b22}));
        foliage.position.y = 7.5;
        foliage.castShadow = true;
        tree.add(foliage);

        return {group: tree, trunk, foliage};
    }
}

export default World;
