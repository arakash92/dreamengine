dreamengine.registerModule('Component')
	.requires('Entity')
	.defines(function() {

		dreamengine.Entity.Component = function(entity) {
			this.entity = entity;
			this.pos = new dreamengine.Vector();
			this.size = new dreamengine.Size(10,10);

			this.getArea = function() {
				var area = this.entity.getArea();
				
			}
		}

	});