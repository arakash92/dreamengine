// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


/*------------------------------
 * Utility functions
 *------------------------------*/
Math.randomBetween = function(min, max) {
	if (min > max) {
		trigger_error('Math.randomBetween expects max to be greater than min.');
		return false;
	}
	if (min > 0) {
		return min + (Math.random() * (max-min));
	}else {
		return min + Math.random() * (max + Math.abs(min));
	}
}


function dreamengine(wrapper, options) {
	var self = this;

	/* require libraries */
	// jquery hotkeys
	if ($.hotkeys == undefined) {
		$("head").append('<script type="text/javascript" src="' +dreamengine.settings.dreamengineURL +'core/jquery.hotkeys.js"></script>');
	}

	/* options */
	this.options = {
		fps: 60,
		width: 480,
		height: 320,
	}
	for (var i in options) {
		this.options[i] = options[i];
	}

	/* initialize canvas */
	this.wrapper = $(wrapper);
	this.wrapper.addClass('dreamengine');
	this.wrapper.append('<canvas width="' +options['width'] +'" height="' +options['height'] +'" class="canvas"></canvas>');
	this.canvas = this.wrapper.find('canvas')[0];
	this.ctx = this.canvas.getContext('2d');

	this.resize = function() {
		//set canvas dimensions
		var width = 1280;
		var height = 720;

		if ($(window).width() < 1280) {
			//1280x768
			width = 1024;
			height = 768;
		}
		if ($(window).width() < 1024) {
			//800x600
			width = 800;
			height = 600;
		}
		if ($(window).width() < 800) {
			width = $(window).width();
			height = $(window).height();
		}

		this.canvas.width = width;
		this.canvas.height = height;

		this.wrapper.css({
			width: width,
			height: height,
			'left': ($(window).width() - width) / 2
		});
		this.event.trigger('resize');
	}
	$(window).bind('resize', function() {
		self.resize();
	});


	//create debug
	this.wrapper.append('<div style="color: white;" class="debug"></div>');
	
	/* systems */
	this.event = new dreamengine.Event();
	this.input = new dreamengine.Input(this);


	/* gameloop stuff */
	this.running = false;
	this.frame_time  = 0;		//amount of time in MS for one update
	this.currentTime = 0;		//the current time
	this.prevTime    = 0;		//the previous time
	this.deltaTime   = 0;		//deltatime: time since last loop

	this.updateTimer = 0;
	
	this.updates = 0;
	this.renders = 0;

	this.updatesPerSecond = 0;
	this.rendersPerSecond = 0;
	this.perSecond = null;

	/* scene stuff */
	this.activeScene = null;

	this.setScene = function(scene) {
		this.activeScene = scene;
	}

	this.run = function() {
		self.frame_time = 1000/self.options.fps;

		self.currentTime = (new Date()).getTime();
		self.prevTime = (new Date()).getTime();
		self.running = true;
		self.gameloop();
	};

	this.pause = function() {
		self.running = false;
		console.log('game paused.');
	}

	this.debugMessages = {};
	this.debug = function(key, value) {
		this.debugMessages[key] = value;
	}

	this.gameloop = function() {
		
		if (self.running == true) {
			setTimeout(function() {
				requestAnimationFrame(self.gameloop, self.canvas);

				self.currentTime = (new Date()).getTime();
				self.deltaTime = self.currentTime - self.prevTime;
				self.prevTime = self.currentTime;

				//deltaTime should be 16.666. (time between updates)
				//we need to divide deltatime by 16.6666 (frame_time)
				if (self.perSecond == null) {
					self.perSecond = self.currentTime;
				}
				if (self.currentTime - self.perSecond >= 1000) {
					self.perSecond = self.currentTime;
					self.updatesPerSecond = self.updates;
					self.rendersPerSecond = self.renders;
					self.updates = 0;
					self.renders = 0;
					self.debug('Deltatime', self.deltaTime);
					self.debug('Updates', self.updatesPerSecond +'/s');
					self.debug('Renders', self.rendersPerSecond +'/s');

					
					

					self.wrapper.find('.debug').html("");
					for (var i in self.debugMessages) {
						self.wrapper.find('.debug').append(i +': ' + self.debugMessages[i] +'<br>');
					}
				}

				for (var i = 0; i < Math.round(self.deltaTime/self.frame_time); i++) {
					self.update();
				}
			
				self.render();

			}, self.frame_time);
		}
	};

	self.update = function() {
		this.updates++;
		if (this.activeScene != null) {
			this.activeScene.update();
		}
	}

	self.render = function() {
		this.renders++;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (this.activeScene != null) {
			this.activeScene.render(this.ctx);
		}
	}
	this.resize();
}



/*-------------------
	Settings
*/
dreamengine.settings = {
	baseURL: null,
};
dreamengine.setup = function(settings) {
	for (var i in settings) {
		dreamengine.settings[i] = settings[i];
	}
};



/*-------------------
	Modules
*/
dreamengine.loadedModules = {

};

dreamengine.loadModule = function(name, callback) {
	var name = name.replace(' ', '');
	console.log('loading module ' + name +'...');
	if (dreamengine.loadedModules[name] == true) {
		console.log('Module ' + name +' is already loaded, skipping.');
		return false;
	}
	dreamengine.loadedModules[name] = false;

	var src = dreamengine.settings.dreamengineURL +'modules/' + name +'/' + name +'.js';
	$("head").append("<script type='text/javascript' src='" + src +"' rel='dreamengine-module'></script>");

	//set an interval to check when the module is defined
	if (typeof callback == 'function') {
		var interval = setInterval(function() {
			if (dreamengine.loadedModules[name] == true) {
				callback();
			}
		}, 50);
	}
};

dreamengine.loadModules = function(modules, callback) {
	if (typeof modules === 'string') {
		var modules = modules.replace(' ', '');
		modules = modules.split(',');
		for (var i in modules) {
			var mod = modules[i];
			dreamengine.loadModule(mod);
		}
	}

	if (typeof callback == 'function') {
		var interval = setInterval(function() {
			var ready = true;
			for (var i in dreamengine.loadedModules) {
				if (dreamengine.loadedModules[i] != true) {
					ready = false;
				}
			}
			if (ready) {
				clearInterval(interval);
				callback();
			}
		}, 50);
	}
}

dreamengine.modules = {};

dreamengine.registerModule = function(name) {
	console.log('dreamengine.modules.' + name +' is being registered...');
	dreamengine.modules[name] = {
		name: name,
		ready: true,
		requires: function(modules) {
			console.log(this.name +' requires the following modules: ' + modules);
			var self = this;
			this.ready = false;
			modules = modules.replace(' ', '');
			modules = modules.split(',');

			var modulesReady = {};
			for (var i in modules) {
				modulesReady[modules[i]] = false;
			}

			for (var i in modules) {
				var mod = modules[i];
				console.log('Checking dependency ' + mod);
				if (dreamengine.loadedModules[mod] != true) {
					console.log('module ' + mod +' is not loaded, loading it...');
					dreamengine.loadModule(mod, function() {
						modulesReady[mod] = true;
					});
				}else {
					modulesReady[mod] = true;
				}
			}
			//set an interval to check when dependenies are ready
			var interval = setInterval(function() {
				var ready = true;
				for (var i in modulesReady) {
					if (modulesReady[i] == false) {
						ready = false;
					}
				}
				if (ready == true) {
					clearInterval(interval);
					self.ready = true;
				}
			}, 50);
			return this;
		},
		defines: function(callback) {
			console.log(this.name +' is defining...');
			var self = this;
			if (this.ready) {
				console.log('running callback');
				callback();
				dreamengine.loadedModules[self.name] = true;
			}else {
				var interval = setInterval(function() {
					if (self.ready) {
						console.log('Dependencies are ready, running define callback now');
						clearInterval(interval);
						callback();
						dreamengine.loadedModules[self.name] = true;
					}
				}, 50);
			}
			
			return this;
		},
	};
	return dreamengine.modules[name];
};



/*------------------------------
 * Images
 *------------------------------*/
dreamengine.images = {

};
dreamengine.loadImage = function(name, file, callback) {
	console.log('loading image ' + name +' file is ' + file);
	dreamengine.images[name] = false;
	var img = new Image();
	img.onload = function() {
		dreamengine.images[name] = img;
		if (typeof callback == 'function') {
			callback();
		}
	}
	img.src = dreamengine.settings.projectURL + file;
};
dreamengine.loadImages = function(images, callback) {
	for (var i in images) {
		dreamengine.loadImage(i, images[i]);
	}
	if (typeof callback == 'function') {
		var interval = setInterval(function() {
			var ready = true;
			for(var i in dreamengine.images) {
				if (dreamengine.images[i] == false) {
					ready = false;
				}
			}
			if (ready == true) {
				clearInterval(interval);
				callback();
			}
		}, 30);
	}
};

/*------------------------------
 * Assets
 *------------------------------*/
dreamengine.loadAssets = function(assets, callback) {
	//modules
	dreamengine.loadModules(assets['modules']);

	//images
	dreamengine.loadImages(assets['images']);
	
	//sounds
	

	//set interval to check for load, then run callback
	var interval = setInterval(function() {
		var ready = true;
		//loop through images
		for (var i in dreamengine.images) {
			if (dreamengine.images[i] == false) {
				ready = false;
			}
		}

		//loop through modules
		for (var i in dreamengine.modulesReady) {
			if (dreamengine.modulesReady[i] != true) {
				ready = false;
			}
		}

		if (ready == true) {
			clearInterval(interval);
			if (typeof callback == 'function') {
				callback();
			}
		}
	}, 30);
};


/*------------------------------
 * Scenes
 *------------------------------*/
dreamengine.Scene = function(game, methods) {
	//properties
	this.game = game;
	this.layers = [];
	this.event = new dreamengine.Event();

	//methods

	this.addEntity = function(layer, entity) {
		if (entity === undefined) {
			trigger_error('addEntity expects parameter 2 to be dreamengine.Entity');
			return false;
		}
		if (this.layers[layer] == undefined) {
			this.layers[layer] = [];
		}
		this.layers[layer].push(entity);
	}

	this.update = function() {
		//this.event.trigger('update_pre');

		for (var i in this.layers) {
			var layer = this.layers[i];
			for(var i in layer) {
				var entity = layer[i];
				if (typeof entity.update == 'function') {
					entity.update();
				}
			}
		}

		if (typeof this.onUpdate == 'function') {
			this.onUpdate();
		}

		//this.event.trigger('update_post');
	}

	this.render = function(ctx) {
		//this.event.trigger('render_pre', [ctx]);

		for (var i in this.layers) {
			var layer = this.layers[i];
			for(var i in layer) {
				var entity = layer[i];
				if (typeof entity.update == 'function') {
					entity.render(ctx);
				}
			}
		}

		if (typeof this.onRender == 'function') {
			this.onRender(ctx);
		}
		//this.event.trigger('render_post', [ctx]);
	}

	//override methods
	for (var i in methods) {
		this[i] = methods[i];
	}
	//init
	if (typeof this.init == 'function') {
		this.init();
	}
}


/*------------------------------
 * Input
 *------------------------------*/
dreamengine.Input = function(game) {
	var self = this;
	this.game = game;	
	this.keys = {};

	$(document).keydown(function(e) {
		self.keys[dreamengine.Input.keyNames[e.which]] = true;
	});

	$(document).keyup(function(e) {
		self.keys[dreamengine.Input.keyNames[e.which]] = false;
	});

	$(document).bind('mousemove', function(e) {
		var x = e.pageX;
		var y = e.pageY;

		var canvasOffset = $(self.game.canvas).offset();

		x -= canvasOffset.left;

		y -= canvasOffset.top;
	});
}
dreamengine.Input.keyCodes = {
		'backspace':8,
		'tab':9,
		'enter':13,
		'shift':16,
		'ctrl':17,
		'alt':18,
		'pause_break':19,
		'caps_lock':20,
		'escape':27,
		'page_up':33,
		'page down':34,
		'end':35,
		'home':36,
		'left_arrow':37,
		'up_arrow':38,
		'right_arrow':39,
		'down_arrow':40,
		'insert':45,
		'delete':46,
		'0':48,
		'1':49,
		'2':50,
		'3':51,
		'4':52,
		'5':53,
		'6':54,
		'7':55,
		'8':56,
		'9':57,
		'a':65,
		'b':66,
		'c':67,
		'd':68,
		'e':69,
		'f':70,
		'g':71,
		'h':72,
		'i':73,
		'j':74,
		'k':75,
		'l':76,
		'm':77,
		'n':78,
		'o':79,
		'p':80,
		'q':81,
		'r':82,
		's':83,
		't':84,
		'u':85,
		'v':86,
		'w':87,
		'x':88,
		'y':89,
		'z':90,
		'left_window key':91,
		'right_window key':92,
		'select_key':93,
		'numpad 0':96,
		'numpad 1':97,
		'numpad 2':98,
		'numpad 3':99,
		'numpad 4':100,
		'numpad 5':101,
		'numpad 6':102,
		'numpad 7':103,
		'numpad 8':104,
		'numpad 9':105,
		'multiply':106,
		'add':107,
		'subtract':109,
		'decimal point':110,
		'divide':111,
		'f1':112,
		'f2':113,
		'f3':114,
		'f4':115,
		'f5':116,
		'f6':117,
		'f7':118,
		'f8':119,
		'f9':120,
		'f10':121,
		'f11':122,
		'f12':123,
		'num_lock':144,
		'scroll_lock':145,
		'semi_colon':186,
		'equal_sign':187,
		'comma':188,
		'dash':189,
		'period':190,
		'forward_slash':191,
		'grave_accent':192,
		'open_bracket':219,
		'backslash':220,
		'closebracket':221,
		'single_quote':222
	};

dreamengine.Input.keyNames = {};
for (var i in dreamengine.Input.keyCodes) {
	var value = dreamengine.Input.keyCodes[i];
	dreamengine.Input.keyNames[value] = i;
}


/*------------------------------
 * Event
 *------------------------------*/
dreamengine.Event = function() {
	this.listeners = [];
	
	this.bind = function(eventName, closure, priority) {
		//validate
		if (typeof eventName != 'string' || typeof closure != 'function') {
			return false;
		}
		priority = (priority != undefined) ? priority : 50;

		var explode = eventName.split('.');
		var eventName = explode[0];
		if (typeof explode[1] == 'string') {
			var eventSpace = explode[1];
		}

		//make sure the event name exists on the listener stack
		if (this.listeners[eventName] == undefined) {
			this.listeners[eventName] = [];
		}

		//make sure the priority exists
		if (this.listeners[eventName][priority] == undefined) {
			this.listeners[eventName][priority] = [];
		}

		//are we namespacing it?
		if (eventSpace != undefined) {
			//namespaced
			if (this.listeners[eventName][priority][eventSpace] == undefined) {
				this.listeners[eventName][priority][eventSpace] = [];
			}
			this.listeners[eventName][priority][eventSpace].push(closure);
		}else {
			//not namespaced
			this.listeners[eventName][priority].push(closure);
		}
	}

	this.unbind = function(eventName) {
		var explode = eventName.split('.');
		var eventName = explode[0];
		if (typeof explode[1] == 'string') {
			var eventSpace = explode[1];
		}

		if (this.listeners[eventName] != undefined) {
			if (eventSpace == undefined) {
				this.listeners[eventName] = [];
			}else {
				//namespaced
			}
		}
	};

	this.trigger = function(eventName, params) {
		if (this.listeners[eventName] != undefined) {
			for (var i in this.listeners[eventName]) {
				var priority = this.listeners[eventName][i];

				for (var i in priority) {
					if (typeof params !== undefined) {
						if (typeof priority[i] == 'function') {
							priority[i].call(null, params);
						}else if (typeof priority[i] == 'array') {
							for (var ii in priority[i]) {
								priority[i][ii].call(null, params);
							}
						}
					}else {
						var params = priority[i]();
					}
				}
			}
		}

		return params;
	}
};
dreamengine.Event.event = new dreamengine.Event();


/*-------------------
	Utility
*/
dreamengine.Dimension = function(w, h) {
	this.width = w;
	this.height = h;
};

dreamengine.Vector = function(x, y) {
	if (x == undefined) {
		x = 0;
	}
	if (y == undefined) {
		y = 0;
	}
	this.x = x;
	this.y = y;

	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
	}

	this.sub = function(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	this.mult = function(num) {
		this.x *= num;
		this.y *= num;
	}

	this.div = function(num) {
		this.x = this.x / num;
		this.y = this.y / num;
	}

	this.mag = function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	}

	this.normalize = function() {
		var mag = this.mag();
		if (mag != 0) {
			this.div(this.mag());
		}
	}
};

