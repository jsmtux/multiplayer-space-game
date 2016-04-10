function LaserBehaviour(_position, _rotation, _friends, _game)
{
    Behaviour.call(this, "laser");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.initData.rotation = _rotation;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colName = event.body.parentBehaviour.getName();
        if (_friends.indexOf(colName) === -1)
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
        _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, ["base", "ship"],_game));
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
        console.log(colBehaviour);
        if (colBehaviour.getName() === "base" && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    }
    this.initData.rotation = Math.radians(270 + _rotation);
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

function EnemyShipBehaviour(_initPosition, _endPosition, _rotation, _game)
{
    this.endPosition = _initPosition;
    this.initPosition = _endPosition;
    BaseShipBehaviour.call(this, this.initPosition, "enemy");
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        console.log(colBehaviour);
        if (colBehaviour.getName() === "base" && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    }
    this.initData.rotation = Math.radians(_rotation);
    this.speed = 200;

    function shoot_callback(_element, _data, _game)
    {
        var new_drawable = new Drawable('bin/laserRed.png');
        _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, ["enemyBase", "enemy"], _game));
    }
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
}

EnemyShipBehaviour.prototype = Object.create(BaseShipBehaviour.prototype);
EnemyShipBehaviour.prototype.constructor = EnemyShipBehaviour;

EnemyShipBehaviour.Status = {
    Entering : 0,
    Shooting : 1,
    Leaving : 2
}

EnemyShipBehaviour.prototype.moveTowards = function(_data, _position)
{
    var difference = Phaser.Point.subtract(_data.position, _position);
    var distance = difference.getMagnitude();
    difference = Phaser.Point.normalize(difference);
    var speed = Math.min(this.speed, distance);
    this.physicsData.force.x =  -difference.x * speed < this.physicsData.velocity.x ? -speed : speed;
    this.physicsData.force.y = -difference.y * speed < this.physicsData.velocity.y ? -speed : speed;
    return distance;
}

EnemyShipBehaviour.prototype.updateState = function(data, _game)
{
    var self = this;
    this.updatePhysics(data, _game);
    
    if (!this.status)
    {
        this.status = EnemyShipBehaviour.Status.Entering;
    }
    
    switch(this.status)
    {
        case EnemyShipBehaviour.Status.Entering:
            if (this.moveTowards(data, this.endPosition) < 1)
            {
                this.status = EnemyShipBehaviour.Status.Shooting;
                this.initShootingStatus = TimeFilter.numTicks;
            }
            break;
        case EnemyShipBehaviour.Status.Leaving:
            if (this.moveTowards(data, this.initPosition) < 1)
            {
                this.status = EnemyShipBehaviour.Status.Entering;
                this.initShootingStatus = TimeFilter.numTicks;
            }
            break;
        case EnemyShipBehaviour.Status.Shooting:
            this.shootFilter.signal(this, data, _game);
            if (TimeFilter.numTicks - this.initShootingStatus > 100)
            {
                this.status = EnemyShipBehaviour.Status.Leaving;
            }
            break;
    }
    
    return data;
}
