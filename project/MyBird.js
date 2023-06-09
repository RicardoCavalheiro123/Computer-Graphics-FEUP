import {CGFobject, CGFappearance, CGFshader, CGFtexture} from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';
import { MyPyramid } from './MyPyramid.js';
import { MySphere } from './MySphere.js';
import { MyBirdWing } from './MyBirdWing.js';
import { MyBirdFoot } from './MyBirdFoot.js';
import { MyCylinder } from './MyCylinder.js';
import { MyBirdTail } from './MyBirdTail.js';
import { MyBirdEgg } from './MyBirdEgg.js';


export class MyBird extends CGFobject {
    constructor(scene, orientation, speed, position) {
        super(scene);
        this.initBuffers();

        this.initialPosition = position;
        this.position = position;
        this.orientation = orientation;
        this.speed = speed;
		this.hasEgg = false;
		this.pickUpEgg = false;
		this.egg = null;
        this.y = 0; 
		this.angle = 0;
        this.amplitude = 1;
		this.frequency = 1/1000*2*Math.PI;

		this.initTextures();
		this.initShaders();
    }

	initBuffers() {
		this.triangle = new MyTriangle(this.scene);
		this.eye1 = new MySphere(this.scene, 10,10);
		this.eye2 = new MySphere(this.scene, 10,10);
		this.beak1 = new MyPyramid(this.scene, 4, 2, 2);
		this.beak2 = new MyPyramid(this.scene, 4, 2,2);
		this.body1 = new MySphere(this.scene, 10,10);
		this.head = new MySphere(this.scene, 10,10);
		this.wing1 = new MyBirdWing(this.scene);
		this.wing2 = new MyBirdWing(this.scene);
		this.foot1 = new MyBirdFoot(this.scene);
		this.foot2 = new MyBirdFoot(this.scene);
		this.neck = new MyCylinder(this.scene, 20, 10);
		this.tail = new MyBirdTail(this.scene);
		this.egg = new MyBirdEgg(this.scene, 0, 0, 0);
    }

	initTextures() {
		// Textures
        this.bodyTexture = new CGFtexture(this.scene, "images/body.jpg");
        this.bodyMaterial = new CGFappearance(this.scene);
        this.bodyMaterial.setTexture(this.bodyTexture);
		this.bodyMaterial.setTextureWrap('REPEAT', 'REPEAT');

		this.beakTexture = new CGFtexture(this.scene, "images/beak.jpg");
		this.beakMaterial = new CGFappearance(this.scene);
		this.beakMaterial.setTexture(this.beakTexture);
		this.beakMaterial.setTextureWrap('REPEAT', 'REPEAT');

		this.eyeTexture = new CGFtexture(this.scene, "images/eye.jpg");
		this.eyeMaterial = new CGFappearance(this.scene);
		this.eyeMaterial.setTexture(this.eyeTexture);
		this.eyeMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }

	initShaders() {
	}

    updateTexCoords() {
        this.updateTexCoordsGLBuffers();
    }
    enableNormalViz() {
		this.triangle.enableNormalViz();
		this.eye1.enableNormalViz();
		this.eye2.enableNormalViz();
		this.beak1.enableNormalViz();
		this.beak2.enableNormalViz();
		this.body1.enableNormalViz();
		this.head.enableNormalViz();
		this.wing1.enableNormalViz();
		this.wing2.enableNormalViz();
		this.foot1.enableNormalViz();
		this.foot2.enableNormalViz();
		this.neck.enableNormalViz();
		this.tail.enableNormalViz();

    }
    disableNormalViz() {
		this.triangle.disableNormalViz();
		this.eye1.disableNormalViz();
		this.eye2.disableNormalViz();
		this.beak1.disableNormalViz();
		this.beak2.disableNormalViz();
		this.body1.disableNormalViz();
		this.head.disableNormalViz();
		this.wing1.disableNormalViz();
		this.wing2.disableNormalViz();
		this.foot1.disableNormalViz();
		this.foot2.disableNormalViz();
		this.neck.disableNormalViz();
		this.tail.disableNormalViz();


	}
    updateBuffers(complexity) {
    }

    update(t) {
		if(this.startPickEggAnimation) {
			this.startPickEggAnimation = false;
			if (t - this.initstartPickEggAnimation < 2000){}
			else {this.initstartPickEggAnimation = t;}
		}

        // Calculate the new position of the bird
        this.position = [this.position[0] + Math.sin(this.orientation)*(this.speed)*0.1, this.position[1], this.position[2] + Math.cos(this.orientation)*(this.speed)*0.1];

		//console.log("pos: " + this.position + " orientation: " + this.orientation + " speed: " + this.speed);

		//	Bird movement
		this.wing1.update(t, this.frequency, this.speed);
		this.wing2.update(-t,this.frequency, this.speed);
		this.tail.update(-t, this.frequency);

    	this.y = this.amplitude * 0.1*Math.sin(t*this.frequency);

		//	Bird picking egg animation
		let animateTime = t - this.initstartPickEggAnimation;
		if(animateTime < 990) {
			this.position[1] -= this.animationSpeed;
			this.angle += Math.PI/30;
			if (this.angle>2*Math.PI/10) this.angle = 2*Math.PI/10;
		} else if (animateTime < 2000) {
			if (animateTime < 1200) this.checkEggColision();
			this.position[1] += this.animationSpeed;
			if (animateTime < 1500) {
				this.angle -= Math.PI/30;
				if (this.angle<-2*Math.PI/10) this.angle = -2*Math.PI/10;
			}
			else if (this.angle<=0 && animateTime >= 1800) {
				this.angle += Math.PI/30;
				if (this.angle>0) this.angle = 0;
			}
		} else {
			this.angle = 0;
		}
    }

    turn(v) {
        this.orientation = this.orientation + v;
    }

    accelerate(v) {
        this.speed = this.speed + v * this.scene.speedFactor;
        if(this.speed < 0) this.speed = 0;
    }

    reset() {
        this.position = this.initialPosition;
        this.orientation = 0;
        this.speed = 0;
    }

	pickEgg(v) {
		this.startPickEggAnimation = true;
		this.animationSpeed = v;
	}

	checkEggColision() {
		if (this.hasEgg) return;

		let eggIndex = -1;
		let eggDistance = vec3.distance([this.scene.birdEggs[0].position[0], 0, this.scene.birdEggs[0].position[2]], [this.position[0], 0, this.position[2]]);
		for (let i = 0; i < this.scene.birdEggs.length; i++) {
            const egg = this.scene.birdEggs[i];

            // Check if the egg is at the bird's current position
            const distance = vec3.distance([egg.position[0], 0, egg.position[2]], [this.position[0], 0, this.position[2]]);
            if (distance < 10 && distance <= eggDistance) {
                // Store a reference to the egg
				eggIndex = i;
				this.egg = egg;
				this.hasEgg = true;

				eggDistance = distance;
			}
        }

		if (this.hasEgg) {
            // Remove the egg from the scene
			this.scene.birdEggs.splice(eggIndex, 1);
			this.egg.position = [0, 0, 0];
		}
	}

	dropEgg() {
		// If Bird has egg and it is going to fall into nest, it should drop it
		if(!this.hasEgg) return;

		const in_nest = this.egg.dropEgg([this.position[0], this.position[1]-1, this.position[2]], 18.7, this.speed, this.orientation);

		if(in_nest) {
			this.hasEgg = false;
			this.scene.birdEggs.push(this.egg);
			this.egg = null;
		}
	}

	display() {
		this.scene.pushMatrix();


			this.scene.translate(0, this.y, 0);
			this.scene.translate(this.position[0], this.position[1], this.position[2]);
			this.scene.rotate(this.orientation, 0, 1, 0);
			this.scene.rotate(this.angle, 1, 0, 0);
			this.scene.scale(7.5, 7.5, 7.5);

			// Bird Eyes
			this.scene.pushMatrix();
			this.eyeMaterial.apply();
			this.scene.translate(0.13, 0.23, 0.15);
			this.scene.scale(0.03, 0.03, 0.03);
			this.scene.rotate(3*Math.PI/4, 0, 1, 0);
			this.eye1.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
			this.scene.translate(-0.13, 0.23, 0.15);
			this.scene.scale(0.03, 0.03, 0.03);
			this.scene.rotate(1*Math.PI/4, 0, 1, 0);

			this.eye2.display();
			this.scene.popMatrix();


			// Bird Beak
			this.scene.pushMatrix();
			this.beakMaterial.apply();
			this.scene.translate(0, 0.2, 0.22);
			this.scene.scale(0.08, 0.08, 0.1);
			this.scene.rotate(Math.PI/2, 1, 0, 0);
			this.beak1.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
			this.scene.translate(0, .18, 0.22);
			this.scene.scale(0.08, 0.08, 0.1);
			this.scene.rotate(Math.PI/2, 1, 0, 0);
			this.scene.rotate(Math.PI, 0, 1, 0);
			this.beak2.display();
			this.scene.popMatrix();

			// Bird Body
			this.scene.pushMatrix();
			this.bodyMaterial.apply();
			this.scene.translate(0, 0, -0.5);
			this.scene.scale(0.3, 0.2, 0.5);
			this.scene.rotate(Math.PI/2, 1, 0, 0);
			this.body1.display();
			this.scene.popMatrix();

			// Bird Neck
			this.scene.pushMatrix();
			this.bodyMaterial.apply();
			this.scene.translate(0, 0.04, -.1);
			this.scene.rotate(Math.PI/3, 1, 0, 0);
			this.scene.scale(0.07, 0.3, 0.07);
			this.neck.display();
			this.scene.popMatrix();

			// Bird Head
			this.scene.pushMatrix();
			this.bodyMaterial.apply();
			this.scene.translate(0, .2, .1);
			this.scene.scale(.15,.15,.15);
			this.scene.rotate(Math.PI/2, 1, 0, 0);
			this.head.display();
			this.scene.popMatrix();


			// Bird Wings
			this.scene.pushMatrix();
			this.scene.translate(0.2, .1, -0.4);
			this.scene.scale(0.3, 0.3, 0.3);
			this.scene.rotate(Math.PI, 0, 1, 0);
			this.scene.rotate(Math.PI, 1, 0, 0);
			this.wing1.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
			this.scene.translate(-0.2, .1, -0.4);
			this.scene.scale(0.3, 0.3, 0.3);
			this.wing2.display();
			this.scene.popMatrix();



			// Bird Feet
			this.scene.pushMatrix();
			this.scene.translate(.1, -0.3, -.5);
			this.scene.scale(0.2, 0.2, 0.2);
			this.scene.rotate(-Math.PI/2, 0, 1, 0);
			this.foot1.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
			this.scene.translate(-.1, -0.3, -.5);
			this.scene.scale(0.2, 0.2, 0.2);
			this.scene.rotate(-Math.PI/2, 0, 1, 0);
			this.foot2.display();
			this.scene.popMatrix();

			// Bird Tail
			this.scene.pushMatrix();
			this.bodyMaterial.apply();
			this.scene.translate(0, 0, -1.1);
			this.scene.scale(0.2, 0.2, 0.2);
			this.scene.rotate(-Math.PI/2, 0, 1, 0);
			this.tail.display();
			this.scene.popMatrix();

			if(this.hasEgg) {
				this.scene.pushMatrix();
				this.scene.translate(0, -.4, -.48);
				this.egg.display(0.2);
				this.scene.popMatrix();
			}

		this.scene.popMatrix();
	}

}