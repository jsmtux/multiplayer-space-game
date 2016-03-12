function getMillis()
{
    var date = new Date();
    return date.getTime();
}

var isServer = location.hash == "#server";

function Game(_scene, _isServer)
{
    this.scene = _scene;
    this.lastUpdated = getMillis();
    this.updateFps = 15;
    this.controller = new Controller();
    this.physicsEngine = new PhysicsEngine();
    this.networkManager = new NetworkManager(_isServer, this);
    this.finishedLoading = false;
}

Game.prototype.initUpdateLoop = function()
{
    var self = this;
    setInterval(function(){
        self.updateElements();
        self.lastUpdated = getMillis();
    }, 1000/this.updateFps);
}

Game.prototype.updateRenderElements = function()
{
    var elapsed = getMillis() - this.lastUpdated;
    var t = elapsed / (1000.0 / this.updateFps);
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.draw(this.scene.entities[entity].element, t);
    }
}

Game.prototype.updateElements = function()
{
    if (this.physicsEngine)
    {
        this.physicsEngine.updateSimulation(1.0/this.updateFps);
    }
    var new_data = {};
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].element.updateData(this);
    }
    this.networkManager.sendUpdate();
}

Game.prototype.getTextureManager = function()
{
    console.log("getTextureManager function undefined");
    return undefined;
}

Game.prototype.getPhysicsEngine = function()
{
    return this.physicsEngine;
}

Game.prototype.addEntity = function(_drawable, _element, _remote)
{
    if (this.finishedLoading)
    {
        _drawable.preload(this);
        _drawable.create(this);
    }
    if (this.networkManager)
    {
        _element.networkId = this.networkManager.registerElement(_drawable, _element, _remote);
    }
    else
    {
        _element.networkId = -1;
    }
    this.scene.addEntity(_drawable, _element);
}

function PhaserGame(_scene, _isServer)
{
    Game.call(this, _scene, _isServer);
    var self = this;
    this.initUpdateLoop();
    this.phaser_game = new Phaser.Game(800, 600, Phaser.AUTO, '', 
        { preload: function(){self.preload();}, create: function(){self.create()}, update: function(){self.updateRenderElements();}});
    this.texture_manager = new PhaserTextureManager(this.phaser_game);
}

PhaserGame.prototype = Object.create(Game.prototype);
PhaserGame.prototype.constructor = PhaserGame;

PhaserGame.prototype.getTextureManager = function()
{
    return this.texture_manager;
}

PhaserGame.prototype.preload = function()
{
    this.phaser_game.stage.disableVisibilityChange = true;
    this.getTextureManager().createTexture('bin/enemy.png');
    this.getTextureManager().createTexture('bin/meteor.png');
    this.getTextureManager().createTexture('bin/laserRed.png');
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.preload(this);
    }
}

PhaserGame.prototype.create = function()
{
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.create(this);
    }
    this.finishedLoading = true;
}

function Scene()
{
    this.entities = [];
}

Scene.prototype.addEntity = function(_drawable, _element)
{
    this.entities.push(new Entity(_drawable, _element));
}

var scene = new Scene();
var game = new PhaserGame(scene, isServer);
if (isServer)
{
    game.addEntity(new Drawable('bin/meteor.png'), new StaticBehaviour(new Phaser.Point(300,300)));
    game.addEntity(new Drawable('bin/enemy.png'), new ShipBehaviour(new Phaser.Point(0,0)));
}
else
{
    game.networkManager.onConnection = function()
    {
        game.addEntity(new Drawable('bin/enemy.png'), new ShipBehaviour(new Phaser.Point(600,600)));
    }
}