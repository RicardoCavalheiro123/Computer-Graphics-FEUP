import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";
import { MyBird } from "./MyBird.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyWing } from "./MyWing.js";
import { MyFoot } from "./MyFoot.js";
import { MyTerrain } from "./MyTerrain.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  init(application) {
    super.init(application);
    
    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    //Initialize scene objects
    this.axis = new CGFaxis(this);
    this.initObjects();

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayNormals = false;
    this.scaleFactor = 3;
    this.speedFactor = 0.1;
    this.selectedObject = 0;
    this.objectComplexity = 0.5;

    this.enableTextures(true);

    this.initTextures();
    this.initShaders();

    this.setUpdatePeriod(1000/60);

  }

  // initialize objects
  initObjects() {
    this.terrain = new MyTerrain(this,30);
    this.earth = new MySphere(this, 50, 50);
    this.bird = new MyBird(this, 0, 0, [0, 3, 0]);
    this.wing = new MyWing(this,3,3);
    this.panorama = new MyPanorama(this, 'images/panorama4.jpg', 50, 50);
    this.foot = new MyFoot(this,3,3);

    this.objects = [this.terrain, this.earth, this.bird, this.wing, this.foot ,this.panorama];

    // Labels and ID's for object selection on MyInterface
    this.objectIDs = { 'Terrain': 0, 'Earth': 1 , 'Bird': 2, 'Wing': 3, 'Foot': 4, 'Panorama' : 5};
  }

  // initialize textures
  initTextures() {
    this.textureEarth = new CGFtexture(this, "images/earth.jpg");
    this.earthText = new CGFappearance(this);
    this.earthText.setTexture(this.textureEarth);
    this.earthText.setTextureWrap('REPEAT', 'REPEAT');
  }

  // initialize shaders
  initShaders() {
  }

  // initialize lights
  initLights() {
    this.lights[0].setPosition(15, 0, 5, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
    // change FOV
  }

  initCameras() {
    this.camera = new CGFcamera(
      2*Math.PI/3,
      0.1,
      1000,
      vec3.fromValues(50, 10, 150),
      vec3.fromValues(0, 0, 0)
    );
  }

  hexToRgbA(hex)
  {
      var ret;
      //either we receive a html/css color or a RGB vector
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          ret=[
              parseInt(hex.substring(1,3),16).toPrecision()/255.0,
              parseInt(hex.substring(3,5),16).toPrecision()/255.0,
              parseInt(hex.substring(5,7),16).toPrecision()/255.0,
              1.0
          ];
      }
      else
          ret=[
              hex[0].toPrecision()/255.0,
              hex[1].toPrecision()/255.0,
              hex[2].toPrecision()/255.0,
              1.0
          ];
      return ret;
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }

  updateObjectComplexity(){
    this.objects[this.selectedObject].updateBuffers(this.objectComplexity);
  }

  checkKeys() {
    var text="Keys pressed: ";
    var keysPressed=false;

    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW")) {
      text+=" W ";
      keysPressed=true;
      this.bird.accelerate(0.05);
    }

    if (this.gui.isKeyPressed("KeyS")) {
      text+=" S ";
      keysPressed=true;
      this.bird.accelerate(-0.05);
    }

    if (this.gui.isKeyPressed("KeyA")) {
      text+=" A ";
      keysPressed=true;
      this.bird.turn(2*Math.PI/200);
    }

    if (this.gui.isKeyPressed("KeyD")) {
      text+=" D ";
      keysPressed=true;
      this.bird.turn(-2*Math.PI/200);
    }

    if (this.gui.isKeyPressed("KeyR")) {
      text+=" R ";
      keysPressed=true;
      this.bird.reset();
    }

    if (keysPressed)
      console.log(text);
  }

  // called periodically (as per setUpdatePeriod() in init())
  update(t) {
    this.checkKeys();
    this.bird.update(t);
  }

	// main display function
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    if (this.displayAxis) 
        this.axis.display();

    this.setDefaultAppearance();


    this.scale(this.scaleFactor,this.scaleFactor,this.scaleFactor);

    // Draw normals
    if (this.displayNormals)
        this.objects[this.selectedObject].enableNormalViz();
    else
        this.objects[this.selectedObject].disableNormalViz();


    // ---- BEGIN Primitive drawing section
    this.pushMatrix();

  
    this.pushMatrix();
      // Terrain
      if(this.selectedObject == 0) this.objects[0].display();
    this.popMatrix();
    
    this.pushMatrix();
      // Earth
      if(this.selectedObject == 1) {
        this.earthText.apply();
        this.scale(200,200,200);

        this.objects[1].display();
      }
    this.popMatrix();

    this.pushMatrix();
      // Bird
      if(this.selectedObject == 2) this.objects[2].display();
    this.popMatrix();

    this.pushMatrix();
      // Wing
      if(this.selectedObject == 3) {
        this.translate(0,0,0);
        this.scale(100,100,100);

        this.objects[3].display();
      }
    this.popMatrix();

    this.pushMatrix();
      // Foot
      if(this.selectedObject == 4) {
        this.translate(0,0,0);
        this.scale(100,100,100);

        this.objects[4].display();
      }
    this.popMatrix();

    this.pushMatrix();
      // Panorama
      if(this.selectedObject == 5) {
        this.translate(this.camera.position[0], this.camera.position[1], this.camera.position[2]);
        this.objects[5].display();
      }
    this.popMatrix();

    
    this.popMatrix();

    // ---- END Primitive drawing section

		// restore default shader (will be needed for drawing the axis in next frame)
		this.setActiveShader(this.defaultShader);
  }
}
