function Drawable(_texture)
{
    this.texture_path = _texture;
    this.texture = -1;
}

Drawable.prototype.preload = function(_game)
{
    this.texture = _game.getTextureManager().createTexture(this.texture_path);
}

Drawable.prototype.create = function(_game)
{//TODO: this should be part of PhaserDrawable
    this.sprite = _game.phaser_game.add.sprite(0, 0, this.texture);
    this.sprite.anchor = new Phaser.Point(0.5, 0.5);
}

Drawable.prototype.draw = function(_element, _time)
{
    var data = _element.getInterpolatedData(_time);
    this.sprite.position = data.position;
    this.sprite.rotation = data.rotation;
}

Drawable.prototype.getNetworkData = function()
{
    return {"texture":this.texture_path};
}

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

function NetworkBehaviour(collisionResponse, type_name)
{
    Behaviour.call(this, "network");
    asPhysical.call(this);
    this.netPos = new Phaser.Point();
    this.netRotation = 0;
    this.networkInfoReceived = false;
    this.initPhysicsParams.collisionResponse = collisionResponse;
    this.remote_type_name = type_name;
}

NetworkBehaviour.prototype = Object.create(Behaviour.prototype);
NetworkBehaviour.prototype.constructor = NetworkBehaviour;

NetworkBehaviour.prototype.getName = function()
{
    return this.remote_type_name;
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
    this.netPos = NetworkInfo.position;
    this.netRotation = NetworkInfo.rotation;
    this.networkInfoReceived = true;
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

function Entity(_drawable, _behaviour)
{
    this.drawable = _drawable;
    this.element = _behaviour;
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
