import * as THREE from 'three'

class Lights {

    constructor(scene){
        this.ambientLight
        this.directionalLight
        this.hemisphereLight
        this.spotLight
        this.pointLight

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
        
        this.hemisphereLight = new THREE.HemisphereLight(0xffff00, 0x0000ff, 0.9)
        
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 3)
        this.directionalLight.castShadow = true
        
        this.directionalLight.position.z = 0 //default target for directional light = (0,0,0)
        this.directionalLight.position.x = 0.5 //default target for directional light = (0,0,0)
        
        this.spotLight = new THREE.SpotLight( 0xff5555 , 100)
        this.spotLight.position.set (3, 3, 0)
        //this.spotLight.target = cube
        this.spotLight.castShadow = true
        
        this.pointLight = new THREE.PointLight( 0x00ff00, 100)
        this.pointLight.position.set( -3, 3, 0 )
        this.pointLight.castShadow = true
    
    }
}

export default Lights