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
    };
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
};

function shoot_callback(_element, _data, _game)
{
    var new_drawable = new Drawable('bin/laserRed.png');
    _game.addEntity(new_drawable, new LaserBehaviour(_data.position, _data.rotation, _game));
    
    _element.shoot_sound.play();
}

function BaseShipBehaviour(_position, _name, _game)
{
    Behaviour.call(this, _name);
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
    this.acceleration = 100;
    
    this.shoot_sound = _game.getAudioManager().createAudio("bin/shoot.wav");
}

BaseShipBehaviour.prototype = Object.create(Behaviour.prototype);
BaseShipBehaviour.prototype.constructor = BaseShipBehaviour;

BaseShipBehaviour.prototype.shoot = function(_data, _game)
{
    this.shootFilter.signal(this, _data, _game);
};

function ShipBehaviour(_position, _rotation, _game, _moneyCallback, _attributes, _selectBehaviour)
{
    this.attributes = _attributes;
    
    BaseShipBehaviour.call(this, _position, "ship", _game);
    var self = this;
    
    var barDrawable = new HealthBar(75);
    this.barBehaviour = new BarBehaviour(_position, barDrawable);
    _game.addLocalEntity(barDrawable, this.barBehaviour);

    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        if (colName === "base" && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
        if (colName === "laser" && colBehaviour.isRemote())
        {
            self.health -= 25;
            if (self.health <= 0)
            {
                _game.removeEntity(self.entityIndex);
            }
        }
        if (colName.substring(0, 5) === "coin_")
        {
            var value = colName.substring(colName.lastIndexOf("_")+1,colName.length);
            _moneyCallback(parseInt(value));
            
            var score_drawable = new Text("+"+value+"u", 'bin/carrier_command.png', 'bin/carrier_command.xml', 15);
            _game.addLocalEntity(score_drawable, new FadingScoreBehaviour(self.cur_data.position, score_drawable), false);
            
            self.collect_sound.play();
        }
    };
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
    
    this.maxVelocity = 200;
    this.health = 100;
    
    this.touchOffset = 25;
    
    this.selectBehaviour = _selectBehaviour;
    this.targetDestination;
    
    this.collect_sound = _game.getAudioManager().createAudio("bin/pick.wav");
}

ShipBehaviour.prototype = Object.create(BaseShipBehaviour.prototype);
ShipBehaviour.prototype.constructor = ShipBehaviour;

ShipBehaviour.prototype.updateState = function(data, _game)
{
    if (this.selectBehaviour.isCurrentShip(this))
    {
        this.selectBehaviour.position.x = data.position.x;
        this.selectBehaviour.position.y = data.position.y;
    }
    this.barBehaviour.position.x = data.position.x - 25;
    this.barBehaviour.position.y = data.position.y - 35;
    this.updatePhysics(data, _game);
    this.updateKeyMovement(data, _game);
    if (_game.controller.getFireStatus())
    {
        this.shoot(data, _game);
    }
    this.removeIfOut(data, _game);
    this.barBehaviour.setPercentage(this.health);
    return data;
};

ShipBehaviour.prototype.remove = function(_game)
{
    if (this.selectBehaviour.isCurrentShip(this))
    {
        this.selectBehaviour.position.x = -100;
        this.selectBehaviour.position.y = -100;
        this.selectBehaviour.setCurrentShip(undefined);
    }
    Behaviour.prototype.remove.call(_game);
    _game.removeEntity(this.barBehaviour.entityIndex);    
};

ShipBehaviour.prototype.isSelectable = function()
{
    return true;
}

ShipBehaviour.prototype.updateKeyMovement = function(data, _game)
{

    this.physicsData.force.x = 0;
    this.physicsData.force.y = 0;
    
    //keyboard joystick control
    var x_axis;
    var y_axis;
    
    if (_game.controller.touchPos && this.selectBehaviour.isCurrentShip(this))
    {
        this.targetDestination = new Phaser.Point(_game.controller.touchPos.x, _game.controller.touchPos.y);
    }
    
    if (this.targetDestination)
    {
        x_axis = this.targetDestination.x > data.position.x + this.touchOffset ? 1 : 0;
        x_axis = this.targetDestination.x < data.position.x - this.touchOffset ? -1 : x_axis;
        y_axis = this.targetDestination.y > data.position.y + this.touchOffset ? 1 : 0;
        y_axis = this.targetDestination.y < data.position.y - this.touchOffset ? -1 : y_axis;
    }
    
    if (x_axis > 0)
    {
        if (this.physicsData.velocity.x < 0)
        {
            this.physicsData.force.x = x_axis * this.acceleration * 2;
        }
        else if (this.physicsData.velocity.x < this.maxVelocity)
        {
            this.physicsData.force.x = x_axis * this.acceleration;
        }
    }
    else if (x_axis < 0)
    {
        if (this.physicsData.velocity.x > 0)
        {
            this.physicsData.force.x += x_axis * this.acceleration * 2;
        }
        else if (this.physicsData.velocity.x > -this.maxVelocity)
        {
            this.physicsData.force.x += x_axis * this.acceleration;
        }
    }
    else
    {
        this.physicsData.force.x -= 2 * this.physicsData.velocity.x;        
    }
    if (y_axis < 0)
    {
        if (this.physicsData.velocity.y > 0)
        {
            this.physicsData.force.y = y_axis * this.acceleration * 2;
        }
        else if (this.physicsData.velocity.y > -this.maxVelocity)
        {
            this.physicsData.force.y = y_axis * this.acceleration;
        }
    }
    else if (y_axis > 0)
    {
        if (this.physicsData.velocity.y < 0)
        {
            this.physicsData.force.y += y_axis * this.acceleration * 2;
        }
        else if (this.physicsData.velocity.y < this.maxVelocity)
        {
            this.physicsData.force.y += y_axis * this.acceleration;
        }
    }
    else
    {
        this.physicsData.force.y -= 2 * this.physicsData.velocity.y;        
    }
};

function AuxShipBehaviour(_initPosition, _rotation, _game)
{
    this.initPosition = _initPosition;
    BaseShipBehaviour.call(this, this.initPosition, "enemy", _game);
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        if ((colBehaviour.getName() === "base" || colBehaviour.getName() === "laser") && colBehaviour.isRemote())
        {
            _game.removeEntity(self.entityIndex);
        }
    };
    this.initData.rotation = Math.radians(_rotation);
    this.speed = 100;

    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 30);
    this.curRotation = 0;
}

AuxShipBehaviour.prototype = Object.create(BaseShipBehaviour.prototype);
AuxShipBehaviour.prototype.constructor = AuxShipBehaviour;

AuxShipBehaviour.prototype.updateState = function(data, _game)
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
};

AuxShipBehaviour.prototype.moveTowards = function(_data, _position)
{
    var difference = Phaser.Point.subtract(_data.position, _position);
    var speed = this.speed;
    this.physicsData.force.x = 0;
    this.physicsData.force.y = 0;
    if (difference.x > 10)
    {
        if (this.physicsData.velocity.x > -this.speed)
        {
            this.physicsData.force.x = -this.acceleration;
        }
    }
    else if (difference.x < -10)
    {
        if (this.physicsData.velocity.x < this.speed)
        {
            this.physicsData.force.x = this.acceleration;
        }
    }
    else {
        this.physicsData.velocity.x *= 0.7;
    }

    if (difference.y > 10)
    {
        if (this.physicsData.velocity.y > -this.speed)
        {
            this.physicsData.force.y = -this.acceleration;
        }
    }
    else if (difference.y < -10)
    {
        if (this.physicsData.velocity.y < this.speed)
        {
            this.physicsData.force.y = this.acceleration;
        }
    }
    else {
        this.physicsData.velocity.y *= 0.7;
    }
}

function ProtectAuxShipBehaviour(_initPosition, _rotation, _game)
{
    AuxShipBehaviour.call(this, _initPosition, _rotation, _game);
    this.speed = 200;
}

ProtectAuxShipBehaviour.prototype = Object.create(AuxShipBehaviour.prototype);
ProtectAuxShipBehaviour.prototype.constructor = AuxShipBehaviour;

ProtectAuxShipBehaviour.prototype.updateState = function(data, _game)
{
    var self = this;
    this.updatePhysics(data, _game);
    
    
    var shipElements = _game.getEntitiesByBehaviourName('ship');
    for (var ind in shipElements)
    {
        if (!shipElements[ind].element.isRemote())
        {
            var position = shipElements[ind].element.cur_data.position.clone();
            position.x -= Math.sin(this.initData.rotation) * 100;
            this.moveTowards(data, position);
            this.shootFilter.signal(this, data, _game);
            break;
        }
    }
    this.removeIfOut(data, _game);
    
    return data;
};

function AttackAuxShipBehaviour(_initPosition, _rotation, _game)
{
    AuxShipBehaviour.call(this, _initPosition, _rotation, _game);
    this.speed = 200;
    this.currentEnemyShip;
}

AttackAuxShipBehaviour.prototype = Object.create(AuxShipBehaviour.prototype);
AttackAuxShipBehaviour.prototype.constructor = AuxShipBehaviour;

AttackAuxShipBehaviour.prototype.updateState = function(data, _game)
{
    var self = this;
    this.updatePhysics(data, _game);
    
    if (this.currentEnemyShip && _game.getEntity(this.currentEnemyShip.element.entityIndex) !== undefined)
    {
        var position = this.currentEnemyShip.element.cur_data.position.clone();
        position.x -= 200;
        this.moveTowards(data, position);
    }
    else
    {
        this.physicsData.force.x = 0;
        this.physicsData.force.y = 0;
        var shipElements = _game.getEntitiesByBehaviourName('enemy');
        for (var ind in shipElements)
        {
            if (shipElements[ind].element.isRemote())
            {
                this.currentEnemyShip = shipElements[ind];
                break;
            }
        }
    }
    this.shootFilter.signal(this, data, _game);
    this.removeIfOut(data, _game);
    
    return data;
};
