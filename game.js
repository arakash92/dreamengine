/*------------------------------
 * First we setup dreamengine
 * we need to pass in the url to
 * our project as well as where
 * the dreamengine files are stored
 *------------------------------*/
dreamengine.setup({
	dreamengineURL: 'http://192.168.1.137/dreamengine/dreamengine/',
	projectURL: 'http://192.168.1.137/dreamengine/project/',
});


/*------------------------------
 * Create a new game instance
 *------------------------------*/
var game = new dreamengine('#rpg', {
	width: 480,
	height: 320,
});


/*------------------------------
 * Set context defaults
 * disable image smoothing
 * and set the font
 *------------------------------*/
game.ctx.imageSmoothingEnabled = false;
game.ctx.mozImageSmoothingEnabled = false;
game.ctx.webkitImageSmoothingEnabled = false;
game.ctx.font = "12px monospace";


/*------------------------------
 * Initialize socket connection
 *------------------------------*/
socket = io.connect('http://192.168.1.137:8080');
var userAccount = null;



/*------------------------------
 * Load assets
 *------------------------------*/
dreamengine.loadAssets({
	'images': {
		//'logo': 'sprites/logo.png',
		'loginscreen': 'backgrounds/white_mountains.png',
		'atlas': 'world/atlas.png',
	},
	'sounds': {
		'loading': 'sounds/loading.mp3',
	},
	'modules': 'Entity, Player, ParticleSystem, Atlas, World',
}, function() {




	
	/*------------------------------
	 * Setup the world scene
	 *------------------------------*/
	var worldScene = new dreamengine.Scene(game, {
		initialize: function() {
			var self = this;
			/*------------------------------
			 * First, we want to load the world atlas
			 *------------------------------*/
			this.atlas = new dreamengine.Atlas(dreamengine.images['atlas'], 'world/atlas.json', function() {
				//now that it's ready, let's create a new World
				self.world = new dreamengine.World(game, self.atlas);

				//load our world tilemap
				self.world.parseWorld('world/world.json', function() {
					console.log('world is ready');

					//render the world
					self.onRender = function(g) {
						
						self.world.render(g);

						if (game.input.keys['w']) {
							self.world.camera.y -= 1;
						}
						if (game.input.keys['s']) {
							self.world.camera.y += 1;
						}
						if (game.input.keys['a']) {
							self.world.camera.x -= 1;
						}
						if (game.input.keys['d']) {
							self.world.camera.x += 1;
						}
					};
				});

			});
		},
	});




	/*------------------------------
	 * Setup the login screen
	 *------------------------------*/
	var loginscreen = new dreamengine.Scene(game, {
		init: function() {
			var self = this;
			this.gui = $(".gui-loginscreen");


			/*------------------------------
			 * Create the background entity
			 * this is for the falling snow
			 *------------------------------*/
			var background = new dreamengine.Entity(game, 'background');
			background.sprite = dreamengine.images['loginscreen'];
			var tf = background.components.transform;
			tf.setOrigin('top left');
			tf.pos.x = 0;
			tf.pos.y = 0;
			tf.size.width = game.canvas.width;
			tf.size.height = game.canvas.height;
			this.addEntity(0, background);

			game.event.bind('resize', function() {
				tf.size.width = game.canvas.width;
				tf.size.height = game.canvas.height;
			});

			/*------------------------------
			 * Falling dust particle system
			 *------------------------------*/
			var snow = new dreamengine.Entity(game, 'snow');
				//enable debug, set position, size and origin
				snow.debug = false;
				snow.components.transform.size.width = game.canvas.width;
				game.event.bind('resize', function() {
					snow.components.transform.size.width = game.canvas.width;
				});
				snow.components.transform.size.height = 0;
				snow.components.transform.pos.x = game.canvas.width / 2;
				snow.components.transform.pos.y = 0;
				snow.components.transform.setOrigin('top center');

				snow.components.psystem = new dreamengine.ParticleSystem(snow, {
					birthRate: 0.5,
					maxParticles: 200,
					particleLife: 18000,
					particleSpeed: 0.3,
					particleDamping: 0.0,
					particleSize: 'random',
					particleSizeMin: 1,
					particleSizeMax: 5,
					particleShape: 'circle',
					gravity: 0.5,
				});

				var psystem = snow.components.psystem;
				psystem.transform.size.width = game.canvas.width;
				psystem.transform.size.height = 0;
				psystem.debug = false;
				psystem.setAnchor('top center');
				psystem.transform.setOrigin('top center');
			self.addEntity(1, snow);

			

			/*------------------------------
			 * Socket Login
			 *------------------------------*/
			socket.on('login', function(data) {
				if (data.status == 'success') {
					self.gui.hide('fade', 1000);
					game.setScene(worldScene);
					worldScene.initialize();
				}else {
					console.log('login error');
				}
				self.gui.find('form input').removeAttr('disabled');
				self.gui.find('form').css('opacity', 1);
				self.gui.find('.loginstatus').hide();
			});


			/*------------------------------
			 * Login form
			 *------------------------------*/
			self.gui.find('form').submit(function(e) {
				e.preventDefault();
				$(this).find('input').attr('disabled', 'disabled');
				$(this).css('opacity', 0.2);

				self.gui.find('.loginstatus').html('Connecting...').show('fade');

				var username = $(this).find('.username').val();
				var password = $(this).find('.password').val();

				//attempt login
				socket.emit('login', {'username': username, 'password': password});
			});



			/*------------------------------
			 * Fade in the scene
			 *------------------------------*/
			setTimeout(function() {
				self.gui.show('fade', 3000);
			}, 500);
		},
	});

	
	/*------------------------------
	 * Set the initial screen to
	 * the loginscreen, then run the game
	 *------------------------------*/
	game.setScene(worldScene);
	worldScene.initialize();
	$(".gui-loginscreen").hide();
	game.run();
});



