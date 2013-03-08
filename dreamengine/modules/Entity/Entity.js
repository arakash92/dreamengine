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
			
			/*------------------------------
			 * Constructor
			 *------------------------------*/
			this.pos.x = (x != undefined) ? x : 0;
			this.pos.y = (y != undefined) ? y : 0;

			/*------------------------------
			 * Methods
			 *------------------------------*/
			this.updateComponents = function() {
				for (var i in this.components) {
					var component = this.components[i];
					if (typeof component.update == 'function') {
						component.update();
					}
				}
			}

			this.renderComponents = function(g) {
				for (var i in this.components) {
					var component = this.components[i];
					if (typeof component.render == 'function') {
						component.render(g);
					}
				}
			}

			this.renderDebug = function(g, force) {
				if (this.debug || force == true) {
					var x = this.pos.x - (this.size.width / 2);
					var y = this.pos.y - (this.size.height / 2);

					//draw transparent box
					g.globalAlpha = 0.3;
					g.fillStyle = 'white';
					g.fillRect(x, y, this.size.width, this.size.height);

					//draw name
					y -= this.size.height+10;
					g.globalAlpha = 1;
					g.fillText(this.namePrepend + this.name + this.nameAppend, x, y);
				}
			}

			this.update = function() {
				this.updateComponents();
			}

			this.render = function(g) {
				this.renderComponents(g);
				this.renderDebug(g);
			}
		};

		dreamengine.scene.prototype.entities = [];
		dreamengine.scene.prototype.addEntity = function(name, entity) {
			if (typeof name != 'string') {
				alert('scene.addEntity expects parameter 1 to be string');
				return false;
			}
			if (typeof entity != 'object') {
				alert('scene.addENtity expects parameter 2 to be Entity object');
			}
			this.entities[name] = entity;
		}
		dreamengine.scene.removeEntity = function(name) {
			delete this.entities[name];
			this.entities.splice(name);
		}
	});