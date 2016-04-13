
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

function BaseShipBehaviour(_position, _name)
{
    Behaviour.call(this, _name);
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    function shoot_callback(_element, _data, _game)
    {
        var new_drawable = new Drawable('bin/laserRed.png');
        _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, _game));
    }
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
}

BaseShipBehaviour.prototype = Object.create(Behaviour.prototype);
BaseShipBehaviour.prototype.constructor = BaseShipBehaviour;

BaseShipBehaviour.prototype.shoot = function(_data, _game)
{
    this.shootFilter.signal(this, _data, _game);
}

function ShipBehaviour(_position, _rotation, _game)
{
    BaseShipBehaviour.call(this, _position, "ship");
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        if ((colName === "base" || colName === "laser")&& colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    }
    this.initData.rotation = Math.radians( _rotation);
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

ShipBehaviour.prototype.updateKeyMovement1 = function(data, _game)
{
    if (_game.controller.getKeyStatus(Controller.Keys.RIGHT))
    {
        this.physicsData.force.x = -100 * (Math.cos(data.rotation) - Math.sin(data.rotation));
    }
    if (_game.controller.getKeyStatus(Controller.Keys.LEFT))
    {
        this.physicsData.force.x += 100 * (Math.cos(data.rotation) - Math.sin(data.rotation));
    }
    if (_game.controller.getKeyStatus(Controller.Keys.UP))
    {
        this.physicsData.force.y = 100 * (Math.cos(data.rotation) - Math.sin(data.rotation));
    }
    if (_game.controller.getKeyStatus(Controller.Keys.DOWN))
    {
        this.physicsData.force.y += -100 * (Math.cos(data.rotation) - Math.sin(data.rotation));
    }
}

ShipBehaviour.prototype.updateKeyMovement = function(data, _game)
{
    if (_game.controller.getKeyStatus(Controller.Keys.FIRE))
    {
        this.shoot(data, _game);
    }
    if (_game.controller.getKeyStatus(Controller.Keys.UP))
    {
        data.rotation += 0.1;
    }
    if (_game.controller.getKeyStatus(Controller.Keys.DOWN))
    {
        data.rotation -= 0.1;
    }
    this.physicsData.force.x = 10 * - Math.sin(data.rotation);
    this.physicsData.force.y = 45 * Math.cos(data.rotation);
    
}

function EnemyShipBehaviour(_initPosition, _rotation, _game, _hitCallback)
{
    this.initPosition = _initPosition;
    BaseShipBehaviour.call(this, this.initPosition, "enemy");
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        console.log(colBehaviour);
        if (colBehaviour.getName() === "base" && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
        if (colBehaviour.getName() === "laser" && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
            _hitCallback();
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
