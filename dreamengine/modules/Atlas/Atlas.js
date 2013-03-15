dreamengine.registerModule('Atlas')
	.requires('Sprite')
	.defines(function() {

		dreamengine.Atlas = function(image, json, onLoad) {
			var self = this;
			this.image = image;
			this.sprites = {};
			this.onLoad = onLoad;

			this.parseJson = function() {
				$.post(dreamengine.settings.projectURL + json, function(data) {
					
					if (typeof data === 'object') {
						for (var i in data.frames) {
							//get frame
							var frame = data.frames[i];

							//instantiate a new sprite object
							var sprite = new dreamengine.Sprite(self.image);

							//set sprite transform properties
							sprite.sx = frame.frame.x;
							sprite.sy = frame.frame.y;
							sprite.swidth = frame.frame.w;
							sprite.sheight = frame.frame.h;
							sprite.width = frame.frame.w;
							sprite.height = frame.frame.h;

							//add the sprite to the atlas/spritesheet
							var name = i;
							var name = name.replace('.png', '');
							self.sprites[name] = sprite;
						}
					}

					//run onLoad function
					if (typeof self.onLoad == 'function') {
						self.onLoad();
					}
				});
			}

			if (typeof this.image == 'string') {
				//load the image
				this.image = new Image();
				this.image.onload = function() {
					this.parseJson();
				}
			}else {
				//it's an image already, just parse the json now
				this.parseJson();
			}
		};

	});