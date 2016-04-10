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
    this.properties = {};
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
    TimeFilter.update();
    if (this.physicsEngine)
    {
        this.physicsEngine.updateSimulation(1.0/this.updateFps);
    }
    var new_data = {};
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.create(this);
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
    }
    if (this.networkManager)
    {
        _element.networkId = this.networkManager.registerElement(_drawable, _element, _remote);
    }
    else
    {
        _element.networkId = -1;
    }
    return this.scene.addEntity(_drawable, _element);
}

Game.prototype.removeEntity = function(_index)
{
    if (this.hasEntity(_index))
    {
        var entity = this.scene.entities[_index];
        var remote = entity.element.isRemote();
        var id = entity.element.networkId;
        this.networkManager.removeElement(id, remote);
    }
    this.scene.removeEntity(_index, this);
}

Game.prototype.hasEntity = function(_index)
{
    return this.scene.hasEntity(_index);
}

Game.prototype.SignalPropertyChange = function(_name, _text)
{
    this.networkManager.SignalPropertyChange(_name, _text);
}

Game.prototype.ReceivePropertyChange = function(_name, _text)
{
    this.properties[_name] = _text;
    setEnemyBaseHealth(_name, _text)
}

var RES_X = 1920;
var RES_Y = 1080;

function PhaserGame(_scene, _isServer)
{
    Game.call(this, _scene, _isServer);
    var self = this;
    this.initUpdateLoop();
    this.phaser_game = new Phaser.Game(RES_X*0.7, RES_Y*0.6, Phaser.AUTO, '', 
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
    this.texture_manager.preload();
    this.phaser_game.stage.disableVisibilityChange = true;
    //TODO: get rid of this.
    this.getTextureManager().createTexture('bin/enemy.png');
    this.getTextureManager().createTexture('bin/player.png');
    this.getTextureManager().createTexture('bin/meteor.png');
    this.getTextureManager().createTexture('bin/laserRed.png');
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.preload(this);
    }
    this.backLayer = this.phaser_game.add.group();
    this.frontLayer = this.phaser_game.add.group();
}

PhaserGame.prototype.create = function()
{
    this.finishedLoading = true;
}

function Scene()
{
    this.entities = {};
    this.numEntities = 0;
}

Scene.prototype.addEntity = function(_drawable, _element)
{
    _element.entityIndex = this.numEntities;
    this.entities[this.numEntities] = new Entity(_drawable, _element);
    return this.numEntities++;
}

Scene.prototype.removeEntity = function(_index, _game)
{
    if (typeof this.entities[_index] !== "undefined")
    {
        this.entities[_index].remove(_game);
        delete this.entities[_index];
    }
}

Scene.prototype.hasEntity = function(_index)
{
    return typeof this.entities[_index] !== "undefined";
}

//HTML interaction

var baseHealthSpan = document.getElementById("baseHealth");
var enemyBaseHealthSpan = document.getElementById("enemyHealth");
var moneySpan = document.getElementById("money");

//\HTML interaction

var scene = new Scene();
var game = new PhaserGame(scene, isServer);

function Money(amount, div)
{
    this.current = amount;
    this.info_div = div;
    this.info_div.innerHTML = amount;
}

Money.prototype.get = function()
{
    return this.current;
}

Money.prototype.set = function(amount)
{
    this.current = amount;
    this.info_div.innerHTML = amount;
}

Money.prototype.checkAndSubstract = function(amount)
{
    var ret = false;
    if (this.current >= amount)
    {
        ret = true;
        this.set(this.current - amount);
    }
    return ret;
}

var playerMoney = new Money(1500, moneySpan);

function setBaseHealth(_health)
{
    baseHealthSpan.innerHTML = _health;
    game.SignalPropertyChange("RemoteBaseHealth", _health);
}

function setEnemyBaseHealth(_name, _health)
{
    if (_name == "RemoteBaseHealth")
    {
        enemyBaseHealthSpan.innerHTML = _health;
    }
}

if (isServer)
{
    //game.addEntity(new Drawable('bin/meteor.png'), new StaticBehaviour(new Phaser.Point(300,300)));
    game.addEntity(new Drawable('bin/base.png',true), new BaseBehaviour(new Phaser.Point(55,300), setBaseHealth));
}
else
{
    game.networkManager.onConnection = function()
    {
        game.addEntity(new Drawable('bin/base.png',true), new BaseBehaviour(new Phaser.Point(1300,300), setBaseHealth, 180));
    }
}

// Top level functions
function addShip(y)
{
    if (!playerMoney.checkAndSubstract(150))
    {
        return;
    }
    if (isServer)
    {
        game.addEntity(new Drawable('bin/enemy.png'), new EnemyShipBehaviour(new Phaser.Point(1500,300), new Phaser.Point(200 , 200), 270, game));        
    }
    else
    {
        game.addEntity(new Drawable('bin/enemy.png'), new EnemyShipBehaviour(new Phaser.Point(10,200), new Phaser.Point(1500 , 300), 90, game));
    }
}

var prevShipId;
function addPlayerShip()
{
    if (!playerMoney.checkAndSubstract(250))
    {
        return;
    }
    if (prevShipId === undefined || !game.hasEntity(prevShipId))
    {
        if (isServer)
        {
            prevShipId = game.addEntity(new Drawable('bin/player.png'), new ShipBehaviour(new Phaser.Point(0,300), 0, game));
        }
        else
        {
            prevShipId = game.addEntity(new Drawable('bin/player.png'), new ShipBehaviour(new Phaser.Point(1350,300), 180, game));
        }
    }
}
