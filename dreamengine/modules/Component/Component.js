dreamengine.registerModule('Component')
	.requires('Entity')
	.defines(function() {
		/*------------------------------
		 * Create the component class
		 *------------------------------*/
		dreamengine.Component = function(entity) {
			this.entity = entity;

			this.update = function() {
				
			}

			this.render = function(g) {
				
			}
		};
	});