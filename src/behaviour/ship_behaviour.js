
function LaserBehaviour(_position, _rotation, _game)
{
    Behaviour.call(this, "laser");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.initData.rotation = _rotation;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        if (event.body.parentBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    }
}

LaserBehaviour.prototype = Object.create(Behaviour.prototype);
LaserBehaviour.prototype.constructor = LaserBehaviour;

LaserBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    this.physicsData.velocity.x = -1000 * Math.sin(data.rotation);
    this.physicsData.velocity.y = 1000 * Math.cos(data.rotation);
    this.removeIfOut(data, _game);
    return data;
}

function shoot_callback(_element, _data, _game)
{
    var new_drawable = new Drawable('bin/laserRed.png');
    _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, _game));
}

function BaseShipBehaviour(_position, _name)
{
    Behaviour.call(this, _name);
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
}

BaseShipBehaviour.prototype = Object.create(Behaviour.prototype);
BaseShipBehaviour.prototype.constructor = BaseShipBehaviour;

BaseShipBehaviour.prototype.shoot = function(_data, _game)
{
    this.shootFilter.signal(this, _data, _game);
}

function ShipBehaviour(_position, _rotation, _game, _moneyCallback, _attributes)
{
    this.attributes = _attributes;
    
    BaseShipBehaviour.call(this, _position, "ship");
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        if ((colName === "base" || colName === "laser")&& colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
        if (colName === "coin")
        {
            _moneyCallback();
        }
    }
    this.initData.rotation = Math.radians( _rotation);
    
    switch(this.attributes.laserType)
    {
        case playerLaserTypes.None:
            this.shootFilter = new RepeatEliminationFilter(function(){}, 0);
            break;
        case playerLaserTypes.Single:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 10);
            break;
        case playerLaserTypes.Double:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 6);
            break;
        case playerLaserTypes.Triple:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
            break;
    }
    
    this.acceleration = 100;
    this.maxVelocity = 200;
}

ShipBehaviour.prototype = Object.create(BaseShipBehaviour.prototype);
ShipBehaviour.prototype.constructor = ShipBehaviour;

ShipBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    this.updateKeyMovement(data, _game);
    if (_game.controller.getKeyStatus(Controller.Keys.FIRE))
    {
        this.shoot(data, _game);
    }
    this.removeIfOut(data, _game);
    return data;
}

ShipBehaviour.prototype.updateKeyMovement = function(data, _game)
{
    this.physicsData.force.x = 0;
    this.physicsData.force.y = 0;
    
    if (_game.controller.getKeyStatus(Controller.Keys.RIGHT)
            || _game.controller.getKeyStatus(Controller.Keys.D))
    {
        if (this.physicsData.velocity.x < 0)
        {
            this.physicsData.force.x = this.acceleration * 2;
        }
        else if (this.physicsData.velocity.x < this.maxVelocity)
        {
            this.physicsData.force.x = this.acceleration;
        }
    }
    else if (_game.controller.getKeyStatus(Controller.Keys.LEFT)
            || _game.controller.getKeyStatus(Controller.Keys.A))
    {
        if (this.physicsData.velocity.x > 0)
        {
            this.physicsData.force.x += - this.acceleration * 2;
        }
        else if (this.physicsData.velocity.x > -this.maxVelocity)
        {
            this.physicsData.force.x += - this.acceleration;
        }
    }
    else
    {
        this.physicsData.force.x -= 2 * this.physicsData.velocity.x;        
    }
    if (_game.controller.getKeyStatus(Controller.Keys.UP)
            || _game.controller.getKeyStatus(Controller.Keys.W))
    {
        if (this.physicsData.velocity.y > 0)
        {
            this.physicsData.force.y = - this.acceleration * 2;
        }
        else if (this.physicsData.velocity.y > -this.maxVelocity)
        {
            this.physicsData.force.y = - this.acceleration;
        }
    }
    else if (_game.controller.getKeyStatus(Controller.Keys.DOWN)
            || _game.controller.getKeyStatus(Controller.Keys.S))
    {
        if (this.physicsData.velocity.y < 0)
        {
            this.physicsData.force.y += this.acceleration * 2;
        }
        else if (this.physicsData.velocity.y < this.maxVelocity)
        {
            this.physicsData.force.y += this.acceleration;
        }
    }
    else
    {
        this.physicsData.force.y -= 2 * this.physicsData.velocity.y;        
    }
}


function EnemyShipBehaviour(_initPosition, _rotation, _game)
{
    this.initPosition = _initPosition;
    BaseShipBehaviour.call(this, this.initPosition, "enemy");
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        console.log(colBehaviour);
        if ((colBehaviour.getName() === "base" || colBehaviour.getName() === "laser") && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    }
    this.initData.rotation = Math.radians(_rotation);
    this.speed = 100;

    function shoot_callback(_element, _data, _game)
    {
        var new_drawable = new Drawable('bin/laserRed.png');
        _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, _game));
    }
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 30);
    this.curRotation = 0;
}

EnemyShipBehaviour.prototype = Object.create(BaseShipBehaviour.prototype);
EnemyShipBehaviour.prototype.constructor = EnemyShipBehaviour;

EnemyShipBehaviour.prototype.updateState = function(data, _game)
{
    var self = this;
    this.updatePhysics(data, _game);
    
    this.curRotation = Math.random() * 0.1 - 0.05;
    data.rotation += this.curRotation;
    this.physicsData.velocity.x = -this.speed * Math.sin(data.rotation);
    this.physicsData.velocity.y = this.speed * Math.cos(data.rotation);
    this.shootFilter.signal(this, data, _game);
    this.removeIfOut(data, _game);
    
    return data;
}