dreamengine.registerModule('World')
	.requires('Entity,Atlas')
	.defines(function() {

		/*------------------------------
		 * Camera class
		 *------------------------------*/
		dreamengine.Camera = function(x, y, width, height) {
			/*------------------------------
			 * Arguments
			 *------------------------------*/
			if (x == undefined) {
				x = 10;
			}
			if (y == undefined) {
				y = 10;
			}
			if (width == undefined) {
				width = 20;
			}
			if (height == undefined) {
				height = 20;
			}
			/*------------------------------
			 * Properties
			 *------------------------------*/
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			this.getArea = function() {
				return {
					left: this.x,
					right: this.x + this.width,
					top: this.y,
					bottom: this.y+this.height,
				};
			}
		}

		dreamengine.World = function(game, atlas) {
			/*------------------------------
			 * Properties
			 *------------------------------*/
			var self = this;
			this.game = game;
			this.atlas = atlas;
			this.event = new dreamengine.Event();
			this.camera = new dreamengine.Camera(0, 0, 500, 500);
			this.onLoad = undefined;

			this.width = 50;
			this.height = 50;
			this.tilesets = null;
			this.tileheight = 16;
			this.tilewidth = 16;

			//final computed
			this.layers = {};

			this.tilesize = new dreamengine.Dimension(48,48);

			/*------------------------------
			 * Parses a world.json file
			 *------------------------------*/
			this.parseWorld = function(file, onLoad) {
				console.log('parsing world "' +file +'"...');
				this.onLoad = onLoad;
				

				$.post(dreamengine.settings.projectURL + file, function(data) {
					console.log(data);
					self.width = data.width;
					self.height = data.height;
					self.tileheight = data.tileheight;
					self.tilewidth = data.tilewidth;


					//loop through layers
					for (var layerName in data.layers) {
						var layer = data.layers[layerName];
						self.layers[layerName] = {};

						//loop through layer data
						for (var i in layer.data) {
							var vector = self.getVector(i);
							var tile = self.getTileImageVector(layer.data[i]);

							var entity = new dreamengine.Entity(self.game, 'tile', vector.x, vector.y);
							entity.sprite = new dreamengine.Sprite(self.atlas.image);

							entity.sprite.sx = tile.x;
							entity.sprite.sy = tile.y;
							entity.sprite.swidth = self.tilewidth;
							entity.sprite.sheight = self.tileheight;
							entity.sprite.width = self.tilesize.width;
							entity.sprite.height = self.tilesize.height;

							entity.renderSprite = function(g) {
								var tf = this.components.transform;
								this.sprite.render(g, tf.pos.x, tf.pos.y);
							}

							self.layers[layerName][i] = entity;
						}

					}

					/*
					for (var i in data.layers) {

						var layer = data.layers[i];
						//loop through layer data
						for(i in layer.data) {
							var vector = self.getVector(i);
							var tile = self.getTileImageVector(layer.data[i]);

							this.layers[]

							g.drawImage(self.atlas.image, tile.x, tile.y, self.tilewidth, self.tileheight, vector.x, vector.y, self.tilesize.width, self.tilesize.height);
						}
					}*/

					if (typeof self.onLoad == 'function') {
						self.onLoad();
					}
				});
			}


			/*------------------------------
			 * Update
			 *------------------------------*/
			this.update = function() {
				this.event.trigger('update_pre');

				

				this.event.trigger('update_post');
			}

			/*------------------------------
			 * Takes a tile ID and returns a vector
			 *------------------------------*/
			this.getVector = function(id) {
				//y is equal to the ID divided by the width.
				var y = Math.floor(id/this.width);

				//x is equal to the remaining number when we subtract Y * the height
				var x = id - (y*this.width);
				x-=1; //zero-based

				//now make them pixel coordinates
				x = x * this.tilesize.width;
				y = y * this.tilesize.height;
				
				return new dreamengine.Vector(x,y);
			}

			/*------------------------------
			 * Inverse of getVector
			 * Takes either x and y or a vector
			 * and returns the tile ID
			 *------------------------------*/
			this.getTileID = function(x, y) {
				if (typeof x == 'object') {
					var y = x.y;
					var x = x.x;
				}
   				
				y = y / this.tilesize.height;
				y = y * this.width;

				x = x / this.tilesize.width;
				x+=1;

				return Math.round(x+y);
   				
			}


			/*------------------------------
			 * Render
			 *------------------------------*/
			this.render = function(g) {
				//this.event.trigger('render_pre', [g]);

				//get start and end position from camera in tileID format
				var startID = this.getTileID(this.camera.x, this.camera.y);
				
				var endID = this.getTileID(this.camera.x + this.camera.width, this.camera.y + this.camera.height);

				var l,layer,e,entity;
				var cameraArea = this.camera.getArea();
				for(l in this.layers) {
					layer = this.layers[l];
					for (e in layer) {
						entity = layer[e];
						var tf = entity.components.transform;
						if (tf.pos.x > cameraArea.left && tf.pos.y < cameraArea.right) {
							if (tf.pos.y > cameraArea.top && tf.pos.y < cameraArea.bottom) {
								entity.render(g);
							}
						}

					}
				}

				//this.event.trigger('render_post', [g]);
			}

			//takes a tile ID and returns it's sprite
			this.getTileImageVector = function(id) {
				//get the width of the atlas
				var atlasWidth = this.atlas.image.width;
				atlasWidth = atlasWidth / this.tilewidth;

				//y is equal to the ID divided by the width.
				var y = Math.floor(id/atlasWidth);

				//x is equal to the remaining number when we subtract Y * the height
				var x = id - (y*atlasWidth);
				x-=1; //zero-based

				//now make them pixel coordinates
				x = x * this.tilewidth;
				y = y * this.tileheight;

				return new dreamengine.Vector(Math.round(x),Math.round(y));

			}

		}
	});