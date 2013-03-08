/*------------------------------
 * First we setup dreamengine
 * we need to pass in the url to
 * our project as well as where
 * the dreamengine files are stored
 *------------------------------*/
dreamengine.setup({
	dreamengineURL: 'http://localhost/dreamengine/dreamengine/',
	projectURL: 'http://localhost/dreamengine/project/',
});



/*------------------------------
 * Create a new game instance
 *------------------------------*/
var game = new dreamengine('#rpg', {
	width: 380,
	height: 170,
});

//disale image smoothing on the canvas context
game.ctx.imageSmoothingEnabled = false;
game.ctx.mozImageSmoothingEnabled = false;
game.ctx.webkitImageSmoothingEnabled = false;


/*------------------------------
 * Load some modues
 *------------------------------*/
//dreamengine.loadModule('Entity');
dreamengine.loadModule('Component')


/*------------------------------
 * Load all the assets for
 * the loading screen
 *------------------------------*/
dreamengine.loadAssets({
	'images': {
		'logo': 'sprites/logo.png',
	},
	'sounds': {
		'loading': 'sounds/loading.mp3',
	},
}, function() {
	/*------------------------------
	 * Setup the loading screen
	 *------------------------------*/
	var loadingScreen = new dreamengine.scene(game, {
		init: function() {
			this.logoOpacity = 0.0;
			this.increment = 0.0001;
			this.size = 1;

			//set the scene
			game.setScene(this);

			//run the game
			game.run();
		},

		onUpdate: function() {
			this.increment += 0.0001;
			this.logoOpacity += this.increment;
			this.size += this.increment;

			if (this.size > 3) {
				this.size = 3;
			}
		},

		onRender: function(g) {
			var logo = dreamengine.images.logo;
			var width = logo.width * this.size;
			var height = logo.height * this.size;
			var x = game.canvas.width / 2;
			var y = game.canvas.height / 2;
			x -= width / 2;
			y -= height / 2;
			g.globalAlpha = this.logoOpacity;
			g.drawImage(dreamengine.images.logo, x, y, width, height);
		},
	});
});



