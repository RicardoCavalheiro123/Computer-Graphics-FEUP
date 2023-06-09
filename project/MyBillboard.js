import { CGFappearance, CGFobject, CGFtexture } from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";


export class MyBillboard extends CGFobject {
  constructor(scene, position, angle_scene) {
    super(scene);
    this.position = position;
    this.initBuffers();
    this.initTextures();
    this.angle_scene = angle_scene;
  }

  initBuffers() {
    this.quad = new MyQuad(this.scene);
  }

  initTextures() {
    const textures = ["images/billboardtree.png","images/tree_model1.png","images/tree_model2.png", "images/tree_model3.png"]
    const random = Math.floor(Math.random() * textures.length)
    this.texture = new CGFtexture(this.scene, textures[random]);

    this.material = new CGFappearance(this.scene);
    this.material.setTexture(this.texture);
  }

  display() {
    this.calculateOrientation();
    this.scene.pushMatrix();
    this.scene.translate(this.position[0], this.position[1], this.position[2]);
    this.scene.scale(2, 5, 2);
    this.scene.translate(0, 0.5,0);
    this.scene.rotate(this.ang-this.angle_scene, 0, 1, 0);
    this.material.apply();

    this.quad.display();
    this.scene.popMatrix();
  }

  calculateOrientation() {
    // Calculate the direction from the camera to the quad
    var cameraDir = vec3.normalize([], vec3.subtract([], this.scene.camera.position, this.position));

    // Calculate the normal vector of the quad
    var normal = vec3.normalize([], this.quad.normals.slice(0, 3));

    // Calculate the angle between the camera direction and the quad normal
    var angle = Math.atan2(vec3.cross([], cameraDir, normal)[1], vec3.dot(cameraDir, normal));

    // Store the angle and the rotation axis (which is the y-axis)
    this.ang = -angle;
    this.axis = vec3.fromValues(0, 1, 0);

  }



  updateBuffers(objectComplexity) {
    this.quad.updateBuffers(objectComplexity);
  }

  enableNormalViz() {
    this.quad.enableNormalViz();
  }

  disableNormalViz() {
    this.quad.disableNormalViz();
  }
}
