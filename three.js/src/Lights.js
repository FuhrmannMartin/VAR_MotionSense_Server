import * as THREE from 'three';

class Lights {
    constructor(scene) {
        // Ambient light for general illumination
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(this.ambientLight);

        // Hemisphere light for natural outdoor lighting effect
        this.hemisphereLight = new THREE.HemisphereLight(0xffff00, 0x0000ff, 0.6);
        scene.add(this.hemisphereLight);

        // Directional light for main shadows
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        this.directionalLight.position.set(50, 100, 50); // Position higher to cover more area

        this.directionalLight.castShadow = true;

        // Set high resolution for sharper shadows
        this.directionalLight.shadow.mapSize.width = 4096;
        this.directionalLight.shadow.mapSize.height = 4096;

        // Configure the shadow camera for larger coverage
        const shadowCameraSize = 200; // Larger area for shadow casting
        this.directionalLight.shadow.camera.left = -shadowCameraSize;
        this.directionalLight.shadow.camera.right = shadowCameraSize;
        this.directionalLight.shadow.camera.top = shadowCameraSize;
        this.directionalLight.shadow.camera.bottom = -shadowCameraSize;

        // Extend the camera's far plane to retain shadows farther away
        this.directionalLight.shadow.camera.near = 1;
        this.directionalLight.shadow.camera.far = 1000;
        this.directionalLight.shadow.bias = -0.002; // Adjust bias to reduce shadow artifacts

        scene.add(this.directionalLight);

        // SpotLight for focused, localized shadows
        this.spotLight = new THREE.SpotLight(0xff5555, 1);
        this.spotLight.position.set(10, 40, 10);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.castShadow = true;

        // Configure SpotLight shadow for focused shadows
        this.spotLight.shadow.mapSize.width = 2048;
        this.spotLight.shadow.mapSize.height = 2048;
        this.spotLight.shadow.camera.near = 0.1;
        this.spotLight.shadow.camera.far = 300;
        this.spotLight.shadow.camera.fov = 30;

        scene.add(this.spotLight);

        // Optional PointLight for additional lighting effects without shadows
        this.pointLight = new THREE.PointLight(0x00ff00, 0.5);
        this.pointLight.position.set(-5, 5, 5);
        this.pointLight.castShadow = false; // Disabled to optimize performance
        scene.add(this.pointLight);
    }
}

export default Lights;

