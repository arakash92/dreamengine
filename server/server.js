var io = require('socket.io').listen(8080);

/*------------------------------
 * Player class
 *------------------------------*/
function Player(name, x, y) {
	this.name = name;
	this.x = x;
	this.y = y;
}

var players = {};

io.sockets.on('connection', function (socket) {
	//hash of players active
	


	socket.on('connect', function(data) {
		players[data.name] = new Player(data.name, 100,100);
	});
	

	socket.on('player.move', function (data) {
		players[data.name].x = data.x;
		players[data.name].y = data.y;

  	});

  	/*------------------------------
  	 * Fetch players
  	 *------------------------------*/
  	socket.on('fetch.players', function(data) {
		socket.emit('fetch.players', players);
  	});

});