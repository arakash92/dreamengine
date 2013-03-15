dreamengine.registerModule('Sprite')
	.defines(function() {

		dreamengine.Sprite = function(image) {
			this.image = image;
			this.sx = 0;
			this.sy = 0;
			this.swidth = this.image.width;
			this.sheight = this.image.height;
			this.width = this.image.width;
			this.height = this.image.height;
			this.alpha = 1.0;

			this.render = function(g, x, y, width, height) {
				if (width == undefined) {
					var width = this.width;
				}
				if (height == undefined) {
					var height = this.height;
				}
				g.globalAlpha = this.alpha;

				g.drawImage(this.image, this.sx, this.sy, this.swidth, this.sheight, x, y, width, height);
			}
		};

	});