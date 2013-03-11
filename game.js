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
	height: 214,
});

//disale image smoothing on the canvas context
game.ctx.imageSmoothingEnabled = false;
game.ctx.mozImageSmoothingEnabled = false;
game.ctx.webkitImageSmoothingEnabled = false;

//set the default font
game.ctx.font = "12px monospace";


/*------------------------------
 * Initialize socket connection
 *------------------------------*/
game.socket = io.connect('http://localhost:8080');


/*------------------------------
 * Load all the assets for
 * the loading screen
 *------------------------------*/
dreamengine.loadAssets({
	'images': {
		//'logo': 'sprites/logo.png',
	},
	'sounds': {
		'loading': 'sounds/loading.mp3',
	},
	'modules': 'Entity',
}, function() {
	/*------------------------------
	 * Setup the loading screen
	 *------------------------------*/
	var scene = new dreamengine.scene(game, {

		init: function() {
			var self = this;
			//prepare players variable
			this.players = {};

			//get player name
			this.name = prompt("player name:");
			
			//authenticate
	  		game.socket.emit('connect', {'name': this.name});

			/*------------------------------
			 * Chatbox
			 *------------------------------*/
			var chatbox = new dreamengine.Entity(game, "Chat", 174, 0);
			this.addEntity(50, chatbox);
			chatbox.size.x = 100;
			chatbox.size.y = 40;
			chatbox.messages = [];
			chatbox.message = function(type, message) {
				//we prepend/unshift because the newest message shold be at 0
				this.messages.unshift({'type': type, 'message': message, time: (new Date()).getTime()});
			}
			chatbox.event.bind('update_pre', function() {
				//get current time
				var now = (new Date()).getTime();

				//create a temporary array for holding
				//messages that will be displayed
				var messagesDisplay = [];

				//remove old messages
				for (var i in this.messages) {
					var msg = this.messages[i];

					//is this message old?
					if (now - msg.time >= 5000) {
						//trash it
						this.messages.splice(i, 1);
					}else {
						//it's not old, so we'll display it

						//is the message about to get old?
						if (now - msg.time >= 4000) {
							//get opacity based on time
							//since opacity is 0.0 to 1.0, we'll first subtract 4000
							//which is the 4 seconds that elapse before we fade it out
							var difference = now - msg.time;
							difference -= 4000;

							//set the message opacity
							msg.opacity = difference / 1000;
						}

						messagesDisplay.push(msg);
					}
				}

				//get the font metrics


				//now display the messages
				for (var i in messagesDisplay) {
					var msg = messagesDisplay[i];
					ctx.fillStyle = 'white';
					ctx.fillText('[' + msg.type + '] ' + msg.message, this.pos.x, this.pos.y - (12 * (i+1)));
				}
			});



			

			var player = new dreamengine.Entity(game, this.name, 100, 100);
			
			player.speed = 3;

			player.event.bind('update_pre', function() {
				player.moving = false;

				if (game.input.keys['w']) {
					player.pos.y -= player.speed;
					player.moving = true;
				}
				if (game.input.keys['s']) {
					player.pos.y += player.speed;
					player.moving = true;
				}
				if (game.input.keys['a']) {
					player.pos.x -= player.speed;
					player.moving = true;
				}
				if (game.input.keys['d']) {
					player.pos.x += player.speed;
					player.moving = true;
				}

				if (player.moving) {
					player.event.trigger('move');
				}
			});


			/*------------------------------
			 * Socket Player Move
			 *------------------------------*/
			player.event.bind('move', function() {
				game.socket.emit('player.move', {'name': player.name, 'x': player.pos.x, 'y': player.pos.y});
			});

			/*------------------------------
			 * Socket fetch players
			 *------------------------------*/
			self.players = {};
			game.socket.on('fetch.players',function(data) {
				var players = data;
				for (var i in players) {
					var p = players[i];
					//check if the player exists
					
					var e = new dreamengine.Entity(game, p.name, p.x, p.y);
					e.debug = true;
					self.players[p.name] = e;
					
				}
			});


			player.debug = true;
			this.addEntity(10, player);
			
		},

		onUpdate: function() {
			var self = this;
			game.socket.emit('fetch.players', {'name': this.name});

			for (var i in this.players) {
				this.players[i].update();
			}
		},

		onRender: function(g) {
			for (var i in this.players) {
				this.players[i].render(g);
			}
		},
	});

	game.setScene(scene);

	game.run();
});



