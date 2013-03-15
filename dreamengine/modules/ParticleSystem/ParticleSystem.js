dreamengine.registerModule('ParticleSystem')
	.requires('Entity')
	.defines(function() {
		/*------------------------------
		 * ParticleSystem Component
		 * It also acts as a namespace
		 *------------------------------*/
		dreamengine.ParticleSystem = function(entity, options) {
			//we need access to the entity
			this.entity = entity;
			this.debug = false;
			this.particles = [];
			this.birthCycle = 0;

			this.transform = new dreamengine.Transform();
			this.transform.pos.x = 0;
			this.transform.pos.y = 0;
			this.transform.size.width = 20;
			this.transform.size.height = 20;
			this.anchorX = 'center';
			this.anchorY = 'center';

			this.setAnchor = function(anchor) {
				anchor = anchor.toLowerCase();
				anchor = anchor.split(' ');
				var y = anchor[0];
				var x = (anchor[1] != undefined) ? anchor[1] : y;

				this.anchorX = x;
				this.anchorY = y;
			}

			/*------------------------------
			 * these options determine the options for particles at birth
		  	 * only some of them have effects through time
			 * For options that change from birth to death have an extra option with 'Death' appended to them.
			 * for example: 'particleColor' and 'particleColorDeath'.
			 *------------------------------*/
			this.options = {
				maxParticles: 1000,
				birthRate: 0.1,					//the rate at which particles are born.
				particleLife: 2000,				//the amount in milliseconds particles are alive
				gravity: 1,					//can be int or Vector

				//shape
				particleShape: 'rect',			//can be 'rect' or 'circle'

				//opacity
				particleOpacity: 1.0,			//
				particleOpacityDeath: 0,		//

				//color at birth
				particleColor: 'white', 		//can be 'random', hex value or html color name
				particleColorDeath: 'black',	//

				//size
				particleWidth: null,
				particleHeight: null,
				particleSize: 'random',				//can be int, Vector or string "random"
				particleSizeMin: 1, 			//can be int or Vector(x,y) for different values for each dimension
				particleSizeMax: 5,
				particleSizeSymmetric: true,	//whether the particle height will inherit from the width

				//velocity
				particleSpeed: 0.5,				//the initial velocity of the particles at birth: can be int, 'random' or Vector
				particleDamping: 0.01,

				//direction
				particleDirection: 'random',	//the initial particle direction: can be string 'random', int or Vector

				//drifting
				particleDrift: 2,				//amount of random movement to add
			};
			//set options
			for (var i in options) {
				this.options[i] = options[i];
			}

			for (var i = 0; i < this.options.maxParticles; i++) {
				this.particles[i] = new dreamengine.ParticleSystem.Particle(this);
			}

			this.everySecond = 0;

			this.update = function() {

				this.everySecond += 1000/60;

				if (this.everySecond >= 1000) {
					this.everySecond = 0;
					this.entity.game.debug('Particles', this.particles.length);
				}

				//destroy & update particles
				var canCreateParticle = false;
				for (var i in this.particles) {
					var p = this.particles[i];
					
					if (p.dead == false) {
						//update it
						p.update();
					}else {
						canCreateParticle = true;
					}
					
				}

				//has the birthCycle reached it's target birhRate?
				if (this.birthCycle >= this.options.birthRate && canCreateParticle == true) {
					//create new particles
					
					this.createParticle();
					
					
					//reset the birthCycle
					this.birthCycle = 0;
				}


				//increment the BirthCycle
				this.birthCycle+= 0.1
			}

			this.getArea = function() {
				var tf = this.transform;
				var entityArea = this.entity.components.transform.getArea();
				var selfArea = tf.getArea();

				entityArea.left += selfArea.left;
				entityArea.centerX += selfArea.centerX;
				entityArea.centerY += selfArea.centerY;
				entityArea.right += selfArea.right;
				entityArea.top += selfArea.top;
				entityArea.bottom += selfArea.bottom;

				//add pivot/anchor
				switch(this.anchorX) {
					case 'center':
						entityArea.left+= tf.size.width / 2;
						entityArea.right+= tf.size.width / 2;
					break;

					case 'right':
						entityArea.left+= tf.size.width;
						entityArea.right+= tf.size.width;
					break;
				}
				//top & bottom
				switch(this.anchorY) {
					case 'center':
						entityArea.top+= tf.size.height / 2;
					break;

					case 'bottom':
						entityArea.top+= tf.size.height;
					break;
				}

				return entityArea;
			}

			this.getRandomColor = function() {
				var hexValues = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
				var color = '#';
				for (var i = 0; i < 3; i++) {
					var randomValue = hexValues[Math.round(Math.randomBetween(0, hexValues.length))];
					color += randomValue + randomValue;
				}
				return color;
			}

			/*------------------------------
			 * Creates a new particle based
			 * on the particleSystem options
			 * Appends it to the particles array
			 *------------------------------*/
			this.createParticle = function() {
				for (var i in this.particles) {
					if (this.particles[i].dead == true) {

						var p = this.particles[i];
						p.init();

						//get area
						var area = this.getArea();

						//set particle position
						p.pos.x = Math.randomBetween(area.left, area.right);
						p.pos.y = Math.randomBetween(area.top, area.bottom);

						//shape
						p.shape = this.options.particleShape;

						//longevity
						p.longevity = this.options.particleLife;

						//gravity
						var gravity = this.options.gravity;
						if (typeof gravty == 'object') {
							p.gravity = gravity;
						}else {
							p.gravity = new dreamengine.Vector(0, gravity);
						}

						//color
						switch(this.options.particleColor) {
							case 'random':
								p.color = this.getRandomColor();
							break;
							default:
								p.color = this.options.particleColor;
							break;
						}

						//speed
						p.speed = this.options.particleSpeed;
						p.damping = this.options.particleDamping;
						p.drift.x = Math.randomBetween(0-Math.abs(this.options.particleDrift), Math.abs(this.options.particleDrift));
						p.drift.y = Math.randomBetween(0-Math.abs(this.options.particleDrift), Math.abs(this.options.particleDrift));

						//size
						if (this.options.particleSize == 'random') {
							p.size.width = Math.randomBetween(this.options.particleSizeMin, this.options.particleSizeMax);
							p.size.height = Math.randomBetween(this.options.particleSizeMin, this.options.particleSizeMax);
							if (this.options.particleSizeSymmetric == true) {
								p.size.height = p.size.width;
							}
						}else {
							//specific size
							//if width and height is set, use that.
							if (this.options.particleWidth != null && this.options.particleHeight != null) {
								p.size.width = this.options.particleWidth;
								p.size.height = this.options.particleHeight;
							}else {
								p.size.width = this.options.particleSize;
								p.size.height = this.options.particleSize;
							}
						}
						return true;
					}
				}
				return false;
			}

			this.renderDebug = function(g, force) {
				if (this.debug == true || force == true) {
					var area = this.getArea();

					var tf = this.transform;

					g.fillStyle = 'lightblue';
					g.globalAlpha = 0.3;
					g.fillRect(area.left, area.top, tf.size.width, tf.size.height);

				}
			}

			this.render = function(g) {

				this.renderDebug(g);

				for (var i in this.particles) {
					var p = this.particles[i];
					if (p.dead == false) {
						p.render(g);
					}
				}
			}
		};

		dreamengine.ParticleSystem.Particle = function(psystem) {
			//we need access to the psystem
			this.psystem = psystem;

			this.dead = true;
			this.gravity = 0;
			this.shape = 'rect';

			//time values
			this.init = function() {
				this.dead = false;
				this.birth = (new Date()).getTime();	//birth time in milliseconds
				this.longevity = 2000;//time in milliseconds to live

				//transform values
				this.color = 'white';
				this.opacity = 1.0;
				
				var size = Math.randomBetween(1, 5);
				this.size = new dreamengine.Dimension(size, size);

				this.drift = new dreamengine.Vector(Math.randomBetween(-0.5, 0.5), Math.randomBetween(-0.5, 0.5));

				
				//set the direction to a random vector, then normalize it
				this.direction = new dreamengine.Vector(Math.randomBetween(-1, 1), Math.randomBetween(-1, 1));
				this.direction.normalize();

				this.damping = 0.01;
				this.speed = 0.5;

				this.acceleration = new dreamengine.Vector(2,2);
				this.velocity = new dreamengine.Vector(0,0);

				this.pos = new dreamengine.Vector();
			}

			this.update = function() {

				//check if dead or not
				this.dead = (((new Date()).getTime() - this.birth) >= this.longevity);

				if (this.dead == false) {

					//opacity
					this.opacity -= (this.psystem.entity.game.frame_time) / this.longevity;
					if (this.opacity < 0) {
						this.opacity = 0;
					}

					//deccelerate
					this.speed -= this.damping;
					if (this.speed < 0) {
						this.speed = 0;
					}

					//set acceleration
					this.acceleration.x = this.direction.x;
					this.acceleration.y = this.direction.y;

					this.acceleration.x *= this.speed;
					this.acceleration.y *= this.speed;

					//add drift to acceleration
					//this.acceleration.add(this.drift);

					//set velocity to the direction
					this.velocity.x = this.acceleration.x;
					this.velocity.y = this.acceleration.y;

					//add gravity
					this.velocity.add(this.gravity);

					//move!
					this.pos.add(this.velocity);
				}else {
					this.opacity = 0;
				}
			}


			this.render = function(g) {
				if (this.dead == false) {
					g.fillStyle = this.color;
					g.globalAlpha = this.opacity;

					if (this.shape == 'rect') {
						g.fillRect(this.pos.x - (this.size.width / 2), this.pos.y - (this.size.height / 2), this.size.width, this.size.height);
					}else if (this.shape == 'circle') {
						g.beginPath();
						g.arc(this.pos.x - (this.size.width/2), this.pos.y - (this.size.width/2), this.size.width, 0, 2 * Math.PI, false);
						g.fill();
					}
				}
			}
		}
	});