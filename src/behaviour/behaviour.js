function ElementRenderData()
{
    this.position = new Phaser.Point();
    this.scale = 1.0;
    this.rotation = 0.0;
}

ElementRenderData.prototype.clone = function()
{
    var ret = new ElementRenderData();
    ret.position = this.position.clone();
    ret.scale = this.scale;
    ret.rotation = this.rotation;
    return ret;
}

var global_behaviour_id = 0;

function Behaviour(_name)
{
    this.id = global_behaviour_id++;
    this.old_data;
    this.cur_data;
    this.name = _name;
    this.initData = new ElementRenderData();
}

Behaviour.prototype.remove = function(_game)
{
    if (this.physicsData !== undefined)
    {
        _game.getPhysicsEngine().unRegisterElement(this.physicsData);
    }
}

Behaviour.prototype.removeIfOut = function(data, _game)
{
    var margin = 50;
    var ret = false;
    if (data.position.x < - margin 
        || data.position.x > (_game.resolution.x + margin)
        || data.position.y < -margin
        || data.position.y > (_game.resolution.y + margin))
    {
        _game.removeEntity(this.entityIndex);
        ret = true;
    }
    return ret;
}

Behaviour.prototype.isRemote = function()
{
    return false;
}

Behaviour.prototype.getName = function()
{
    return this.name;
}

function interpolatePoint(prev, cur, time)
{
    return Phaser.Point.interpolate(prev, cur, time);
}

function interpolateNumber(prev, cur, time)
{
    return prev * (1 - time) + cur * (time);
}

Behaviour.prototype.getInterpolatedData = function(_time)
{
    //TODO: fix this. Because of this, elements appear in 0,0 before beinig initialised
    var ret = new ElementRenderData();
    if (this.old_data)
    {
        ret.position = interpolatePoint(this.old_data.position, this.cur_data.position, _time);
        ret.scale = interpolateNumber(this.old_data.scale, this.cur_data.scale, _time);
        ret.rotation = interpolateNumber(this.old_data.rotation, this.cur_data.rotation, _time);
    }
    return ret;
}

Behaviour.prototype.updateData = function(_game)
{
    if (this.old_data)
    {
        this.old_data = this.cur_data;
        this.cur_data = this.updateState(this.cur_data.clone(), _game);
    }
    else
    {
         this.old_data = this.cur_data =  this.updateState(this.initData, _game);
    }
}

Behaviour.prototype.updateState = function(data)
{
    console.log("Unimplemented updateState for element");
    return data;
}

function NetworkBehaviour(collisionResponse, _data, _game)
{
    Behaviour.call(this, "network");
    asPhysical.call(this);
    this.netPos = new Phaser.Point();
    this.netRotation = 0;
    this.networkInfoReceived = false;
    this.initPhysicsParams.collisionResponse = collisionResponse;
    this.initPhysicsParams.shapeType = _data['shapeType'];
    this.remote_type_name = _data["type_name"];
    this.game = _game;
}

NetworkBehaviour.prototype = Object.create(Behaviour.prototype);
NetworkBehaviour.prototype.constructor = NetworkBehaviour;

NetworkBehaviour.prototype.getName = function()
{
    return this.remote_type_name;
}

NetworkBehaviour.prototype.isRemote = function()
{
    return true;
}

NetworkBehaviour.prototype.updateState = function(data, _game)
{
    if (this.networkInfoReceived)
    {
        data.position.x = this.netPos.x;
        data.position.y = this.netPos.y;
        data.rotation = this.netRotation;
        this.updatePhysics(data, _game, true);
        return data;
    }
    else
    {
        return undefined;
    }
}

NetworkBehaviour.prototype.updateNetworkInfo = function(NetworkInfo)
{
    if (typeof NetworkInfo === "string" && NetworkInfo === "deleted")
    {
        //Remove game element without sending network
    }
    else
    {
        this.netPos = NetworkInfo.position;
        if (NetworkInfo.rotation)
        {
            this.netRotation = NetworkInfo.rotation;
        }
        this.networkInfoReceived = true;
    }
}

function StaticBehaviour(_position)
{
    Behaviour.call(this, "static");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.mass = 50;
}

StaticBehaviour.prototype = Object.create(Behaviour.prototype);
StaticBehaviour.prototype.constructor = StaticBehaviour;

StaticBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    return data;
}

function BaseBehaviour(_position, _healthCallback, _rotation)
{
    Behaviour.call(this, "base");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.mass = 50000;
    this.initPhysicsParams.shapeType = ShapeType.RECTANGLE;
    this.initPhysicsParams.collisionResponse = false;
    this.health = 100;
    this.healthCallback = _healthCallback;
    if (_rotation !== undefined)
    {
        this.rotation = Math.radians(_rotation);
    }
    this.updateHealth();
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colName = event.body.parentBehaviour.getName();
        if (colName === "laser")
        {
            self.health -= 1;
        }
        self.updateHealth();
    }
}

BaseBehaviour.prototype = Object.create(Behaviour.prototype);
BaseBehaviour.prototype.constructor = StaticBehaviour;

BaseBehaviour.prototype.updateHealth = function()
{
    this.healthCallback(this.health);
}

BaseBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    data.rotation = this.rotation;
    return data;
}

function CoinBehaviour(_position, _game)
{
    Behaviour.call(this, "coin");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = false;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colName = event.body.parentBehaviour.getName();
        if ( colName === "ship" )
        {
            _game.removeEntity(self.entityIndex);
        }
    }
}

CoinBehaviour.prototype = Object.create(Behaviour.prototype);
CoinBehaviour.prototype.constructor = CoinBehaviour;

CoinBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    data.rotation += 0.1;
    this.physicsData.velocity.y = 100.0;
    this.removeIfOut(data, _game);
    return data;
}

function Entity(_drawable, _behaviour)
{
    this.drawable = _drawable;
    this.element = _behaviour;
}

Entity.prototype.remove = function(_game)
{
    this.drawable.remove();
    this.element.remove(_game);
}

function asPhysical()
{
    this.physicsData;
    this.initPhysicsParams = {collisionResponse: 1};
    this.updatePhysics = function(data, _game, _isRemote)
    {
        if(!this.physicsData)
        {
            _game.getPhysicsEngine().registerElement(this, this.initPhysicsParams);
        }

        if (!_isRemote)
        {
            _game.getPhysicsEngine().updateElement(this, data, _game);
        }
        else
        {
            _game.getPhysicsEngine().updateInfo(this, data, _game);
        }
    }
}
