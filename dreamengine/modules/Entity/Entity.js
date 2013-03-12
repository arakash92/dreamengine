dreamengine.registerModule('Entity')
	.defines(function() {
		dreamengine.Entity = function(game, name, x, y) {
			/*------------------------------
			 * Private variables
			 *------------------------------*/
			var game = game;



			/*------------------------------
			 * Properties
			 *------------------------------*/
			this.name = (name != undefined) ? name : 'Unnamed Entity';
			this.namePrepend = '';
			this.nameAppend = '';
			this.debug = false;
			this.pos = new dreamengine.vector();
			this.originX = 'center';
			this.originY = 'center';
			this.size = new dreamengine.dimension(10,10);
			this.event = new dreamengine.event();
			
			/*------------------------------
			 * Constructor
			 *------------------------------*/
			this.pos.x = (x != undefined) ? x : 0;
			this.pos.y = (y != undefined) ? y : 0;

			/*------------------------------
			 * Methods
			 *------------------------------*/
			this.setOrigin = function(origin) {
				origin = origin.toLowerCase();
				origin = origin.split(' ');
				var x = origin[0];
				var y = (origin[1] != undefined) ? origin[1] : x;

				this.originX = x;
				this.originY = y;
			}

			this.updateComponents = function() {
				this.event.trigger('updateComponents_pre');
				for (var i in this.components) {
					var component = this.components[i];
					if (typeof component.update == 'function') {
						component.update();
					}
				}
				this.event.trigger('updateComponents_post');
			}

			this.renderComponents = function(g) {
				this.event.trigger('renderComponents_pre', [g]);
				for (var i in this.components) {
					var component = this.components[i];
					if (typeof component.render == 'function') {
						component.render(g);
					}
				}
				this.event.trigger('renderComponents_post', [g]);
			}

			this.renderDebug = function(g, force) {
				this.event.trigger('renderDebug_pre', [g]);
				if (this.debug || force == true) {
					var x = this.pos.x;
					var y = this.pos.y;

					//apply origin offset
					switch(this.originX) {
						case 'center':
							x-= this.size.width / 2;
						break;

						case 'right':
							x-= this.size.width;
						break;
					}

					switch(this.originY) {
						case 'center':
							y-= this.size.height / 2;
						break;

						case 'bottom':
							y-= this.size.height;
						break;
					}

					//draw size box
					g.globalAlpha = 0.3;
					g.fillStyle = 'white';
					g.fillRect(x, y, this.size.width, this.size.height);

					//draw origin points
					g.globalAlpha = 1;
					g.fillStyle = '#FF5555';

					//top left
					g.arc(
						x - this.size.width,
						y - this.size.height,
						4,
						0,
						2 * Math.PI, true);

					//draw name
					y -= this.size.height+10;
					g.globalAlpha = 1;
					g.fillStyle = 'white';
					g.fillText(this.namePrepend + this.name + this.nameAppend, x, y);
				}
				this.event.trigger('renderDebug_post', [g]);
			}

			this.update = function() {
				this.event.trigger('update_pre');
				this.updateComponents();
				this.event.trigger('update_post');
			}

			this.render = function(g) {
				this.event.trigger('render_pre', [g]);
				this.renderComponents(g);
				this.renderDebug(g);
				this.event.trigger('render_post', [g]);
			}


			//fire init event
			dreamengine.event.event.trigger('entity.create', [this]);
		};
	});