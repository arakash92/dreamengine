dreamengine.registerModule('Transform')
	.defines(function() {
		dreamengine.Transform = function(game) {
			this.game = game;
			this.originX = 'center';
			this.originY = 'center';
			this.pos = new dreamengine.Vector(0,0);
			this.size = new dreamengine.Dimension(10,10);


			/*------------------------------
			 * Sets the "pivot point" or "anchor"
			 * allows for objects to be drawn
			 * relative to the center instead
			 * of top-left corner
			 *------------------------------*/
			this.setOrigin = function(origin) {
				origin = origin.toLowerCase();
				origin = origin.split(' ');
				var y = origin[0];
				var x = (origin[1] != undefined) ? origin[1] : y;

				this.originX = x;
				this.originY = y;
			}

			//returns an object with left, top, right, bottom values
			this.getArea = function() {
				//compute size
				if (this.game != undefined) {
					if (this.size.width == 'game') {
						this.size.width = this.game.canvas.width;
					}
					if (this.size.height = 'game') {
						this.size.height = this.game.canvas.width;
					}
				}

				//left & right
				var left = this.pos.x;
				var right = this.pos.x + (this.size.width);
				switch(this.originX) {
					case 'center':
						left-= this.size.width / 2;
						right-= this.size.width / 2;
					break;

					case 'right':
						left-= this.size.width;
						right-= this.size.width;
					break;
				}
				//top & bottom
				var top = this.pos.y;
				switch(this.originY) {
					case 'center':
						top-= this.size.height / 2;
					break;

					case 'bottom':
						top-= this.size.height;
					break;
				}
				var bottom = top + this.size.height;

				return {
					'left': Math.round(left),
					'right': Math.round(right),
					'top': Math.round(top),
					'bottom': Math.round(bottom),
					'centerX': Math.round(left + (this.size.width / 2)),
					'centerY': Math.round(top + (this.size.height / 2)),
				};
			}
		}
	});