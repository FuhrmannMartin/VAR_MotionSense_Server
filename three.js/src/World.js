import * as THREE from 'three';
import Plane from './Plane.js';

class World {
    constructor(camera, scene) {
        this.scene = scene;
        this.camera = camera;
        this.score = 0; // Initialisiere den Score

        // Add ground plane with trees
        addGroundPlane(this.scene);

        // Add air rings
        this.rings = []; // Array für die Ringe, um später auf sie zugreifen zu können
        this.addAirRings();

        // Initialize the plane
        this.plane = new Plane(this.scene);
    }

    animate(pitch, yaw, speed) {
        if (this.plane && this.plane.isLoaded) {
            this.plane.pitch_fun(pitch);
            this.plane.yaw_fun(yaw);
            this.plane.speed_fun(speed);


            // Update plane animation
            this.plane.animate();

            // Kamera-Offset, um die Kamera hinter dem Flugzeug zu positionieren
            const offset = new THREE.Vector3(0, 1, -3);
            offset.applyQuaternion(this.plane.plane.quaternion);
            this.camera.position.copy(this.plane.plane.position).add(offset);
            this.camera.lookAt(this.plane.plane.position);

            // Kollisionserkennung mit Ringen
            this.checkRingCollisions();
        }
    }

    addAirRings() {
        const numRings = 100; // Anzahl der Ringe
        const ringRadius = 2; // Radius der Ringe
        const ringTube = 0.1; // Dicke des Rings

        for (let i = 0; i < numRings; i++) {
            const ring = this.createRing(ringRadius, ringTube);

            // Zufällige Position für den Ring
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 30 + 5; // Zwischen 5 und 35 in der Höhe
            const z = (Math.random() - 0.5) * 200;

            ring.position.set(x, y, z);

            this.scene.add(ring);
            this.rings.push(ring); // Ring zum Array hinzufügen
        }
    }

    createRing(radius, tube) {
        const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffd700 });
        const ring = new THREE.Mesh(geometry, material);
        ring.castShadow = true;
        return ring;
    }

    checkRingCollisions() {
        const planePosition = this.plane.plane.position;
        
        this.rings = this.rings.filter((ring) => {
            const distance = planePosition.distanceTo(ring.position);
            
            if (distance < 2) { // Prüfe, ob das Flugzeug nahe genug am Ring ist
                this.score++;
                document.getElementById('score').innerText = `Score: ${this.score}`; // Aktualisiere den Score
                this.scene.remove(ring); // Entferne den Ring aus der Szene
                return false; // Entferne den Ring aus dem Array
            }
            
            return true; // Behalte den Ring im Array
        });
    }
}

function addGroundPlane(scene) {
    const planeGeometry = new THREE.PlaneGeometry(50000, 50000);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // Funktion zum Erstellen eines Baums
    function createTree() {
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

    const numTrees = 100;
    for (let i = 0; i < numTrees; i++) {
        const tree = createTree();
        const scale = 0.5;
        tree.scale.set(scale, scale, scale);

        const x = (Math.random() - 0.5) * 450;
        const z = (Math.random() - 0.5) * 450;

        tree.position.set(x, 0, z);
        scene.add(tree);
    }
}

export default World;
