import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const pitchSpeed = 0.03;
const rollSpeed = 0.03;
const yawSpeed = 0.03;
const propellerSpeed = 5;
const forwardSpeed = 1;

class Plane {
    constructor(scene) {
        this.scene = scene;
        this.plane = null;

        this.roll = 0;
        this.rollTo = 0;
        this.yaw = 0;
        this.yawTo = 0;
        this.pitch = 0;
        this.pitchTo = 0;
        this.direction = new THREE.Vector3(0, 0, 1); // Start by facing forward in the Z direction
        
        this.isLoaded = false;

        this.loadPlane();
    }

    // Pitch (x-axis)
    pitch_fun(pitch) {
        this.pitch = pitch;
    }

    // Yaw (y-axis) with PT1 filter behavior
    yaw_fun(yaw) {
        this.yaw += yaw;
        this.rollTo = -yaw*5*Math.PI;
    }

    animate() {
        if (this.plane && this.isLoaded) {
            // Smoothly adjust pitch and roll towards their target values
            this.roll += (this.rollTo - this.roll) * rollSpeed;
    
            // Apply the calculated rotation to the plane's visual orientation using Euler angles
            this.plane.rotation.set(this.pitch, this.yaw, this.roll, 'YXZ'); // Use Y (yaw), then X (pitch), then Z (roll)
    
            // Recalculate the direction vector based on the new rotations
            this.direction.set(0, 0, 1);
            this.direction.applyEuler(this.plane.rotation);
    
            // Move the plane forward in the current direction
            const movement = this.direction.clone().multiplyScalar(forwardSpeed);
            this.plane.position.add(movement);
    
            // Rotate the propeller based on speed
            if (this.propeller) {
                this.propeller.rotation.z += propellerSpeed;
            }
    
            // Debugging output
            console.log("Roll:", this.roll, "Yaw:", this.yaw, "Pitch:", this.pitch);
        }
    }    

    loadPlane() {
        const loader = new GLTFLoader();
        loader.load(
            './assets/3d/cartoon_plane.glb',
            (gltf) => {
                console.log("GLTF Model Loaded:", gltf);

                if (gltf.scene instanceof THREE.Object3D) {
                    console.log("gltf.scene is a THREE.Object3D instance");

                    this.plane = gltf.scene;
                    this.plane.scale.set(1, 1, 1);
                    this.plane.position.y = 1;

                    this.scene.add(this.plane); // Add the model to the scene

                    this.plane.traverse((child) => {
                        if (child.name === "Propeller_1_Body_0") {
                            this.propeller = child;
                            console.log("Propeller object found!");
                        }
                    });
                    this.isLoaded = true;

                    console.log("Plane successfully added to the scene.");
                } else {
                    console.error("Error: Loaded GLTF scene is not an instance of THREE.Object3D");
                }
            },
            undefined,
            (error) => {
                console.error("Error loading GLTF model:", error);
            }
        );
    }
}

export default Plane;
