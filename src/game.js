function Game(_scene, _isServer, _resolution)
{
    this.scene = _scene;
    this.lastUpdated = getMillis();
    this.updateFps = 15;
    this.controller = new Controller();
    this.physicsEngine = new PhysicsEngine();
    this.networkManager = new NetworkManager(_isServer, this);
    this.finishedLoading = false;
    this.resolution = _resolution;
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

Game.prototype.addLocalEntity = function(_drawable, _element)
{
    if (this.finishedLoading)
    {
        _drawable.preload(this);
    }
    _element.networkId = -1;
    return this.scene.addEntity(_drawable, _element);
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
    setEnemyBaseHealth(_name, _text);
    setMoneyAmount(_name, _text);
}