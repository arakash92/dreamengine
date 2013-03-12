dreamengine.registerModule('Player')
	.requires('Entity')
	.defines(function() {
		/*------------------------------
		 * Define Player class
		 *------------------------------*/
		dreamengine.Player = function() {

		}
		
		/*------------------------------
		 * bring in all the properties
		 * from the Entity class
		 *------------------------------*/
		for (var i in dreamengine.Entity.prototype) {
			dreamengine.Player.prototype[i] = dreamengine.Entity.prototype[i];
		}
		
		/*------------------------------
		 * define Player properties
		 *------------------------------*/
	});
