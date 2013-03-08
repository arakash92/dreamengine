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



function dreamengine(wrapper, options) {
	var self = this;
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


	this.resize = function() {
		var width = $(window).width();
		var height = width / 16*9;
		
		if (height > $(window).height()) {
			height = $(window).height();
			width = height * 16/9;
		}

		this.wrapper.css({
			width: width,
			height: height,
			'left': ($(window).width() - width) /2
		});

		this.ctx = this.canvas.getContext('2d');
	}
	this.resize();
	$(window).bind('resize', function() {
		self.resize();
	});


	//create debug
	this.wrapper.append('<div style="color: white;" class="debug"></div>');
	

	/* gameloop stuff */
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

		self.gameloop();
	};

	this.debugMessages = {};
	this.debug = function(key, value) {
		this.debugMessages[key] = value;
	}

	this.gameloop = function() {
		setTimeout(function() {
			requestAnimationFrame(self.gameloop);

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
	console.log('loading module ' + name +'...');
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
	var modules = modules.replace(' ', '');
	modules = modules.split(',');
	for (var i in modules) {
		var mod = modules[i];
		dreamengine.loadModule(mod);
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
				if (dreamengine.loadedModules[mod] != true) {
					console.log('module ' + mod +' is not loaded, loading it...');
					dreamengine.loadModule(mod, function() {
						modulesReady[mod] = true;
					});
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
dreamengine.scene = function(game, methods) {
	//properties
	this.game = game;
	this.entities = {};

	//methods
	this.update = function() {

		for(var i in this.components) {
			var comp = this.components[i];
			if (typeof comp.update == 'function') {
				comp.update();
			}
		}

		if (typeof this.onUpdate == 'function') {
			this.onUpdate();
		}
	}

	this.render = function(ctx) {
		for (var i in this.components) {
			var comp = this.components[i];
			if (typeof comp.render == 'function') {
				comp.render(ctx);
			}
		}

		if (typeof this.onRender == 'function') {
			this.onRender(ctx);
		}
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


/*-------------------
	Utility
*/
dreamengine.dimension = function(w, h) {
	this.width = w;
	this.height = h;
};

dreamengine.vector = function(x, y) {
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

