/*------------------------------
 * First we setup dreamengine
 * we need to pass in the url to
 * our project as well as where
 * the dreamengine files are stored
 *------------------------------*/
dreamengine.setup({
	dreamengineURL: 'http://dev/rpg2/dreamengine/',
	projectURL: 'http://dev/rpg2/project/',
});

//initialize a new game
var game = new dreamengine('#rpg', {
	width: 480,
	height: 270,
});

game.ctx.imageSmoothingEnabled = false;
game.ctx.mozImageSmoothingEnabled = false;
game.ctx.webkitImageSmoothingEnabled = false;

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

			//set the scene
			game.setScene(this);

			//run the game
			game.run();
		},

		onUpdate: function() {
			this.increment += 0.0001;
			this.logoOpacity += this.increment;
		},

		onRender: function(g) {
			var logo = dreamengine.images.logo;
			var width = logo.width * 3;
			var height = logo.height * 3;
			var x = game.canvas.width / 2;
			var y = game.canvas.height / 2;
			x -= width / 2;
			y -= height / 2;
			g.globalAlpha = this.logoOpacity;
			g.drawImage(dreamengine.images.logo, x, y, width, height);
		},
	});
});



