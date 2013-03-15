dreamengine.registerModule('Entity')
	.defines(function() {
		dreamengine.Entity = function(game, name, x, y) {
			/*------------------------------
			 * Properties
			 *------------------------------*/
			this.game = game;
			this.name = (name != undefined) ? name : 'Unnamed Entity';
			this.namePrepend = '';
			this.nameAppend = '';
			this.debug = false;
			this.event = new dreamengine.Event();
			this.components = {};
			this.sprite = null;

			
			/*------------------------------
			 * Setup a new transform component
			 *------------------------------*/
			this.components.transform = new dreamengine.Transform();
			this.components.transform.size.width = 40;
			this.components.transform.size.height = 40;
			this.components.transform.pos.x = (x != undefined) ? x : 0;
			this.components.transform.pos.y = (y != undefined) ? y : 0;

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
					var tf = this.components.transform;
					var area = tf.getArea();

					//draw box around perimeter
					g.globalAlpha = 0.3;
					g.fillStyle = 'white';
					g.fillRect(area.left, area.top, tf.size.width, tf.size.height);


					//draw corner points
					g.globalAlpha = 1;
					g.fillStyle = '#FF5555';
					//left top
					g.fillRect(area.left-2 , area.top-2, 4, 4);

					//center top
					g.fillRect(area.centerX-2 , area.top-2, 4, 4);

					//right top
					g.fillRect(area.right-2 , area.top-2, 4, 4);

					//left bottom
					g.fillRect(area.left-2 , area.bottom-2, 4, 4);

					//center bottom
					g.fillRect(area.centerX-2 , area.bottom-2, 4, 4);

					//right bottom
					g.fillRect(area.right-2 , area.bottom-2, 4, 4);

					//center
					g.fillStyle = '#5555FF';
					g.fillRect(area.centerX-2, area.centerY-2, 4, 4);


					//draw name
					g.fillStyle = 'white';

					//get font metrics
					var textString = this.namePrepend + this.name + this.nameAppend;
					var metrics = g.measureText(textString);

					
					g.fillText(this.namePrepend + this.name + this.nameAppend, area.centerX - (metrics.width / 2), area.top - 10);
					
				}
				this.event.trigger('renderDebug_post', [g]);
			}

			this.update = function() {
				this.event.trigger('update_pre');

				this.updateComponents();

				this.event.trigger('update_post');
			}

			this.renderSprite = function(g) {
				if (this.sprite != null) {
					var area = this.components.transform.getArea();
					g.globalAlpha = 1;
					g.drawImage(this.sprite, area.left, area.top, area.right - area.left, area.bottom - area.top);
				}
			}

			this.render = function(g) {
				this.event.trigger('render_pre', [g]);

				this.renderComponents(g);
				this.renderSprite(g);
				this.renderDebug(g);

				this.event.trigger('render_post', [g]);
			}


			//fire init event
			dreamengine.Event.event.trigger('entity.create', [this]);
		};
	});