<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>

	<title>Dreamengine</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<!--jquery & jquery ui-->
	<script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
	<script type="text/javascript" src="http://code.jquery.com/ui/1.10.1/jquery-ui.js"></script>
	

	<!--bootsrap js-->
	<script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js"></script>

	<!--bootstrap css-->
	<link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css" rel="stylesheet">

	<!--create.js for sound-->
	<script type="text/javascript" src="http://code.createjs.com/createjs-2013.02.12.min.js"></script>

	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/core/jquery.hotkeys.js"></script>

	<!--dreamengine-->
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/dreamengine.js"></script>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/modules/Transform/Transform.js"></script>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/modules/Entity/Entity.js"></script>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/modules/ParticleSystem/ParticleSystem.js"></script>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/modules/Sprite/Sprite.js"></script>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/dreamengine/modules/World/World.js"></script>
	
	<!--socket.io-->
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/server/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js"></script>

	<link rel="stylesheet" type="text/css" href="dreamengine/dreamengine.css">

	<style type="text/css">
		body {
			margin: 0;
			background: #111;
		}
		.gui-loginscreen {
			position: relative;
			top: 40%;
			border-top: 1px solid #888;
			border-bottom: 1px solid #666;
			background: rgba(255,255,255,0.3);
			text-align: center;
			color: #ddd;
		}
		.gui-loginscreen .loginstatus {
			position: absolute;
			text-align: center;
			top: 0px;
			width: 100%;
			padding: 12px;
			color: white;
		}


		.gui-screen > .inner {
			padding: 8px;
		}
		form {
			margin: 0;
		}
	</style>

</head>
<body>
	<div id="rpg">
		<div class="gui">
			<div style="display: none;" class="gui-screen gui-loginscreen clearfix">
				<div class="inner">
					<form id="loginform" class="form-inline">
					  	<input type="text" class="username input-medium" placeholder="Username">
					  	<input type="password" class="password input-medium" placeholder="Password">
						<button type="submit" class="btn-primary btn">Sign in</button>
					</form>
					<div class="loginstatus" style="display: none;">
						Connecting...
					</div>
				</div>
			</div>
		</div>
	</div>
	<script type="text/javascript" src="http://192.168.1.137/dreamengine/game.js"></script>
</body>
</html>