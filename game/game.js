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

	this.fuel = 80;

	this.running = false;
	this.state = RacingGame.STATE_LOADING;

	// Make sure the game has keyboard focus
	this.focus();
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
	model.init({ url : "../models/Nissan GTR OBJ/Objects/NissanOBJ1.js", scale:0.025,
		callback: function(model) { that.onRacerLoaded(model); }
	});
}

RacingGame.prototype.onRacerLoaded = function(model)
{
	// Turn away from camera
	model.mesh.rotation.y = Math.PI;

	this.player = new Player;
	this.player.init({ mesh : model.object3D, camera : camera,
		exhaust: false, sounds : this.sounds});
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

RacingGame.prototype.finishGame = function()
{
   this.running = false;
   this.player.stop();
   this.state = RacingGame.STATE_COMPLETE;
}

RacingGame.prototype.update = function()
{
	if (this.running)
	{
		this.elapsedTime = (Date.now() - this.startTime) / 1000;
		this.updateHUD();

		if (this.player.object3D.position.z < (-Environment.ROAD_LENGTH / 2 - Car.CAR_LENGTH))
		{
		    this.finishGame();
		}
	}

	Sim.App.prototype.update.call(this);
}

RacingGame.prototype.updateHUD = function()
{
	if (this.hud)
	{
		var kmh = this.player.speed * 3.6;  // convert m/s to km/hr
		this.hud.speedometer.update(kmh);
		this.hud.timer.innerHTML = "TIME<br>" + this.elapsedTime.toFixed(2);

		this.hud.fuelgauge.update(this.fuel);
	}
}

RacingGame.prototype.handleKeyDown = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyDown(keyCode, charCode);
		this.fuel = this.fuel - 0.05;
	}
}

RacingGame.prototype.handleKeyUp = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyUp(keyCode, charCode);
		this.fuel = this.fuel - 0.01;
	}
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
