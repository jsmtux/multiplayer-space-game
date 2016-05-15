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
};

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
};

Behaviour.prototype.isRemote = function()
{
    return false;
};

Behaviour.prototype.getName = function()
{
    return this.name;
};

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
};

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
};

Behaviour.prototype.updateState = function(data)
{
    console.log("Unimplemented updateState for element");
    return data;
};

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
    };
}