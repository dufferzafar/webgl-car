// Constructor
RacingGame = function()
{
	Sim.App.call(this);
}

// Subclass Sim.App
RacingGame.prototype = new Sim.App();

// Our custom initializer
RacingGame.prototype.init = function(param)
{
	// Call superclass init code to set up scene, renderer, default camera
	Sim.App.prototype.init.call(this, param);

	param = param || {};
	this.param = param;

	this.hud = param.hud;
	this.sounds = param.sounds;

	this.createEnvironment();
	this.loadCars();
	this.loadRacer();

	this.curTime = Date.now();
	this.deltat = 0;

	this.running = false;
	this.state = RacingGame.STATE_LOADING;

	// Make sure the game has keyboard focus
	this.focus();

	this.addContextListener();
}

RacingGame.prototype.createEnvironment = function()
{
	this.environment = new Environment();
	this.environment.init({app:this,
		textureSky:true,
		textureGround:true,
		textureFinishLine:true,
		displaySigns:true});
	this.addObject(this.environment);
}

RacingGame.prototype.loadCars = function()
{
	this.carModels = [];
	this.nMakesLoaded = 0;
	this.nMakesTotal = 3;
	this.cars = [];
}

RacingGame.prototype.loadRacer = function()
{
	var that = this;
	var model = new JSONModel;
	model.init({ url : "../models/Nissan GTR OBJ/Objects/NissanOBJ1.js", scale:0.0254,
		callback: function(model) { that.onRacerLoaded(model); }
	});
}

RacingGame.prototype.onRacerLoaded = function(model)
{
	// Turn away from camera
	model.mesh.rotation.y = Math.PI;

	this.player = new Player;
	this.player.init({ mesh : model.object3D, camera : camera, exhaust:true,
		sounds : this.sounds});
	this.addObject(this.player);
	this.player.setPosition(0, RacingGame.CAR_Y + Environment.GROUND_Y,
			Environment.ROAD_LENGTH / 2 - RacingGame.PLAYER_START_Z);
	this.player.start();

	this.startGame();
}

RacingGame.prototype.startGame = function()
{
	this.running = true;
	this.state = RacingGame.STATE_RUNNING;
	this.startTime = Date.now();

	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.loop = true;
		driving.play();
	}
}

RacingGame.prototype.update = function()
{
	if (this.running)
	{
		this.elapsedTime = (Date.now() - this.startTime) / 1000;
		this.updateHUD();
	}

	Sim.App.prototype.update.call(this);
}

RacingGame.prototype.updateHUD = function()
{
	if (this.hud)
	{
		var kmh = this.player.speed * 3.6;  // convert m/s to km/hr
		this.hud.speedometer.update(kmh);

		this.hud.tachometer.update(this.player.rpm);

		this.hud.timer.innerHTML = "TIME<br>" + this.elapsedTime.toFixed(2);

		var roadRelative = (this.player.object3D.position.z - (Environment.ROAD_LENGTH / 2) + 4);
		var distanceKm = -roadRelative / Environment.ROAD_LENGTH;
		this.hud.odometer.innerHTML = "TRIP<br>" + distanceKm.toFixed(2);
	}
}

RacingGame.prototype.handleKeyDown = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyDown(keyCode, charCode);
	}
}

RacingGame.prototype.handleKeyUp = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyUp(keyCode, charCode);
	}
}

RacingGame.prototype.restart = function(e)
{
	// Re-init the sounds
	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.pause();
		driving.currentTime = 0;
	}

	// Hide the overlay
	var overlay = document.getElementById("overlay");
	overlay.style.display = 'none';

	// Reinitialize us
	this.container.removeChild(this.renderer.domElement);
	this.init( this.param );
}

RacingGame.prototype.handleContextLost = function(e)
{
	this.restart();
}

RacingGame.prototype.addContextListener = function()
{
	var that = this;

	this.renderer.domElement.addEventListener("webglcontextlost",
			function(e) {
				that.handleContextLost(e);
				},
			false);
}

RacingGame.COLLIDE_RADIUS = Math.sqrt(2 * Car.CAR_WIDTH);
RacingGame.STATE_LOADING = 0;
RacingGame.STATE_RUNNING = 1;
RacingGame.STATE_COMPLETE = 2;
RacingGame.STATE_CRASHED = 3;
RacingGame.CAR_Y = .4666;
RacingGame.CAR_START_Z = 10;
RacingGame.PLAYER_START_Z = 4;
RacingGame.best_time = Number.MAX_VALUE;
