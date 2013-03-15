//initialzie Sequelize
var Sequelize = require("sequelize");

//setup a mysql connection using Sequelize
var sequelize = new Sequelize('etheria', 'afflicto', '', {
	// custom host; default: localhost
	host: 'localhost',

	// custom port; default: 3306
	port: 3306,

	// custom protocol
	// - default: 'tcp'
	// - added in: v1.5.0
	// - postgres only, useful for heroku
	protocol: 'tcp',

	// disable logging; default: console.log
	logging: false,

	// max concurrent database requests; default: 50
	maxConcurrentQueries: 100,

	// the sql dialect of the database
	// - default is 'mysql'
	// - currently supported: 'mysql', 'sqlite', 'postgres'
	dialect: 'mysql',

	// disable inserting undefined values as NULL
	// - default: false
	omitNull: true,

	// Specify options, which are used when sequelize.define is called.
	// The following example:
	//   define: {timestamps: false}
	// is basically the same as:
	//   sequelize.define(name, attributes, { timestamps: false })
	// so defining the timestamps for each model will be not necessary
	// Below you can see the possible keys for settings. All of them are explained on this page
	define: {
		underscored: false,
		freezeTableName: false,
		syncOnAssociation: true,
		charset: 'utf8',
		collate: 'utf8_general_ci',
		//classMethods: {method1: function() {}},
		//instanceMethods: {method2: function() {}},
		timestamps: true,
	},

	// similiar for sync: you can define this to always force sync for models
	sync: { force: true },

	// sync after each association (see below). If set to false, you need to sync manually after setting all associations. Default: true
	syncOnAssociation: true,

	// use pooling in order to reduce db connection overload and to increase speed
	// currently only for mysql and postgresql (since v1.5.0)
	pool: { maxConnections: 5, maxIdleTime: 30},
});


/*
var Foo = sequelize.define('Foo', {
	// instantiating will automatically set the flag to true if not set
	flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},
	// default values for dates => current time
	myDate: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
	// setting no title will throw an error when trying to save
	title: { type: Sequelize.STRING, allowNull: false},
	// Creating two objects with the same value will throw an error. Currently composite unique
	// keys can only be created 'addIndex' from the migration-section below
	someUnique: {type: Sequelize.STRING, unique: true},
	// Go on reading for further information about primary keys
	identifier: { type: Sequelize.STRING, primaryKey: true},
	// autoIncrement can be used to create auto_incrementing integer columns
	incrementMe: { type: Sequelize.INTEGER, autoIncrement: true }
});
*/

var Account = sequelize.define('Account', {
	lastLogin: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
	username: { type: Sequelize.STRING },
	password: { type: Sequelize.STRING },
});




function Player(name, x, y) {
	this.name = name;
	this.x = x;
	this.y = y;
}

//hash of players active
var accounts = {};


/*------------------------------
 * Initialize socket IO
 *------------------------------*/
var io = require('socket.io').listen(8080);

//io.set('log_level', 1);

io.sockets.on('connection', function (socket) {

	socket.emit('connect', {message: 'Connected'});

	socket.on('login', function(data) {
		
		Account.find({ where: {username: data.username, password: data.password} }).success(function(account) {
			var status;
			if (account != null) {
				status = 'success';
				accounts[account.id] = {
					'socket': socket,
					'model': account
				};
			}else {
				status = 'error';
			}

			socket.emit('login', {status: status});
		});
		
	});

	/*
	socket.on('player.move', function (data) {
		players[data.name].x = data.x;
		players[data.name].y = data.y;
  	});

  	socket.on('fetch.players', function(data) {
		socket.emit('fetch.players', players);
  	});
	*/

});
