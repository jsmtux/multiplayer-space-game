function LaserBehaviour(_position, _rotation, _game)
{
    Behaviour.call(this, "laser");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.initData.rotation = _rotation;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        if (event.body.parentBehaviour.getSide() !== self.getSide())
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
    this.physicsData.velocity.x = 1000 * Math.sin(data.rotation);
    this.physicsData.velocity.y = 1000 * Math.cos(data.rotation);
    this.removeIfOut(data, _game);
    return data;
};

function shoot_callback(_element, _data, _game)
{
    var new_drawable = new Drawable('bin/laserRed.png');
    var new_behaviour = new LaserBehaviour(_data.position, _data.rotation, _game)
    new_behaviour.localEnemy = _element.localEnemy;
    _game.addEntity(new_drawable, new_behaviour);
    
    _element.shoot_sound.play();
}

var ShipBehaviourTypes = {
    "Attack": 0,
    "Collect": 1,
    "Defend": 2
}

function ShipBehaviour(_position, _rotation, _game, _selectBehaviour)
{
    Behaviour.call(this, "ship");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
    
    this.shoot_sound = _game.getAudioManager().createAudio("bin/shoot.wav");

    var self = this;
    
    var barDrawable = new HealthBar(75);
    this.barBehaviour = new BarBehaviour(_position, barDrawable);
    this.barBehaviour.attachToObject(this, new Phaser.Point(-25, -45));
    _game.addLocalEntity(barDrawable, this.barBehaviour);

    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        if (colName === "base")
        {
            if (colBehaviour.getSide() !== self.getSide())
            {
                _game.removeEntity(self.entityIndex);
            }
        }
        if (colName === "laser" && colBehaviour.getSide() !== self.getSide())
        {
            self.health -= 25;
        }
        if (colName === "shield_wall_element" && colBehaviour.getSide() !== self.getSide())
        {
            self.health -= 100;
        }
        if (self.health <= 0)
        {
            _game.removeEntity(self.entityIndex);
            while(self.currentMoney > 0)
            {
                var curPos = self.cur_data.position;
                var x_rand = (Math.random() * 50) - 25;
                var y_rand = (Math.random() * 50) - 25;
                _game.addEntity(
                        new Drawable(('bin/rock_bronze.png'),DrawableLayer.FRONT), 
                        new CoinBehaviour(new Phaser.Point(curPos.x + x_rand, curPos.y + y_rand), 150, _game, false));
                self.currentMoney -= 150;
            }
        }
    };
    this.initData.rotation = Math.radians( _rotation);
    
    this.maxVelocity = 200;
    this.acceleration = 100;
    this.health = 100;
    
    this.slowOffset = 25;
    this.touchOffset = 55;
    
    this.behaviourXMovement = 0;
    this.behaviourYMovement = 0;
    
    this.selectBehaviour = _selectBehaviour;
    this.targetDestination;
}

ShipBehaviour.prototype = Object.create(Behaviour.prototype);
ShipBehaviour.prototype.constructor = ShipBehaviour;

ShipBehaviour.prototype.shoot = function(_data, _game)
{
    this.shootFilter.signal(this, _data, _game);
};

ShipBehaviour.prototype.updateState = function(data, _game)
{
    var selected = false;
    if (this.selectBehaviour.isCurrentShip(this))
    {
        this.selectBehaviour.position.x = data.position.x;
        this.selectBehaviour.position.y = data.position.y;
        selected = true;
    }
    this.updateSpecificBehaviour(_game, data, selected);
    this.updatePhysics(data, _game);
    this.updateKeyMovement(data, _game);
    this.removeIfOut(data, _game);
    this.barBehaviour.setPercentage(this.health);
    
    return data;
};

ShipBehaviour.prototype.updateSpecificBehaviour = function(_game, _selected)
{
}

ShipBehaviour.prototype.remove = function(_game)
{
    Behaviour.prototype.remove.call(this, _game);
    if (this.selectBehaviour.isCurrentShip(this))
    {
        this.selectBehaviour.position.x = -100;
        this.selectBehaviour.position.y = -100;
        this.selectBehaviour.setCurrentShip(undefined);
    }
    _game.removeEntity(this.barBehaviour.entityIndex);
};

ShipBehaviour.prototype.setDestination = function(_position)
{
    this.targetDestination = _position;
}

ShipBehaviour.prototype.updateKeyMovement = function(data, _game)
{

    this.physicsData.force.x = 0;
    this.physicsData.force.y = 0;
    
    //keyboard joystick control
    var x_axis;
    var y_axis;
    
    if (this.getSide() === BehaviourSide.Friend && _game.controller.touchPos && this.selectBehaviour.isCurrentShip(this))
    {
        this.targetDestination = new Phaser.Point(_game.controller.touchPos.x, _game.controller.touchPos.y);
    }
    
    if (this.targetDestination)
    {
        //Slow down approximating to target
        x_axis = this.targetDestination.x > data.position.x + this.slowOffset ? 0.5 : 0;
        x_axis = this.targetDestination.x < data.position.x - this.slowOffset ? -0.5 : x_axis;
        y_axis = this.targetDestination.y > data.position.y + this.slowOffset ? 0.5 : 0;
        y_axis = this.targetDestination.y < data.position.y - this.slowOffset ? -0.5 : y_axis;
        //Decide main direction
        x_axis = this.targetDestination.x > data.position.x + this.touchOffset ? 1 : 0;
        x_axis = this.targetDestination.x < data.position.x - this.touchOffset ? -1 : x_axis;
        y_axis = this.targetDestination.y > data.position.y + this.touchOffset ? 1 : 0;
        y_axis = this.targetDestination.y < data.position.y - this.touchOffset ? -1 : y_axis;
    }

    if (this.behaviourXMovement !== 0 || this.behaviourYMovement !== 0)
    {
        x_axis = this.behaviourXMovement;
        y_axis = this.behaviourYMovement;
    
        this.behaviourXMovement = 0;
        this.behaviourYMovement = 0;
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

ShipBehaviour.prototype.getShipType = function()
{
    return undefined;
};

function CollectShipBehaviour(_position, _rotation, _game, _selectBehaviour, _moneyCallback)
{
    ShipBehaviour.call(this, _position, _rotation, _game, _selectBehaviour);
    
    var self = this;
    var shipCollisionCallback = this.initPhysicsParams.collisionCallback;
    
    this.radarSize = 100;
    this.setRadarBehaviour(_game, this.radarSize);
    
    this.initPhysicsParams.collisionCallback = function(event) {
        shipCollisionCallback(event);
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        
        if (colName === "base")
        {
            if (colBehaviour.getSide() === self.getSide())
            {
                var score_drawable = new Text("-"+self.currentMoney+"u", 'bin/carrier_command.png', 'bin/carrier_command.xml', 15);
                _game.addLocalEntity(score_drawable, new FadingScoreBehaviour(self.cur_data.position, score_drawable), false);
                
                _moneyCallback(self.currentMoney);
                self.currentMoney = 0;
            }
        }
        if (colName.substring(0, 5) === "coin_")
        {
            var value = colName.substring(colName.lastIndexOf("_")+1,colName.length);
            self.currentMoney += parseInt(value);
            
            var score_drawable = new Text("+"+value+"u", 'bin/carrier_command.png', 'bin/carrier_command.xml', 15);
            _game.addLocalEntity(score_drawable, new FadingScoreBehaviour(self.cur_data.position, score_drawable), false);
            
            self.collect_sound.play();
        }
    };
    
    this.currentMoney = 0;
    
    this.collect_sound = _game.getAudioManager().createAudio("bin/pick.wav");

    this.maxVelocity = 400;
    this.acceleration = 300;
}

CollectShipBehaviour.prototype = Object.create(ShipBehaviour.prototype);
CollectShipBehaviour.prototype.constructor = CollectShipBehaviour;

CollectShipBehaviour.prototype.setRadarBehaviour = function(_game, _size)
{

    var radarDrawable = new Drawable('bin/radar_bg.png', DrawableLayer.BACK);
    this.bgBehaviour = new EmptyBehaviour(0, _size / 75);
    this.bgBehaviour.attachToObject(this); 
    _game.addLocalEntity(radarDrawable, this.bgBehaviour); 
    
    var radarDrawableTop = new Drawable('bin/radar_top.png', DrawableLayer.FRONT);
    this.radarBehaviour = new RadarBehaviour(0, _size / 75);
    this.radarBehaviour.attachToObject(this); 
    _game.addLocalEntity(radarDrawableTop, this.radarBehaviour); 
}

CollectShipBehaviour.prototype.updateSpecificBehaviour = function(_game, _data, _selected)
{
    if (!_selected)
    {
        var curPos = this.getCurrentPosition();
        var entity = _game.getClosestEntity(curPos, ["coin_150", "coin_300", "coin_600"], this.radarSize, BehaviourSide.Friend);
        if (entity !== undefined)
        {
            if ( curPos.x < entity.element.getCurrentPosition().x)
            {
                this.behaviourXMovement = 1;
            }
            if ( curPos.x > entity.element.getCurrentPosition().x)
            {
                this.behaviourXMovement = -1;
            }
            if ( curPos.y < entity.element.getCurrentPosition().y)
            {
                this.behaviourYMovement = 1;
            }
            if ( curPos.y > entity.element.getCurrentPosition().y)
            {
                this.behaviourYMovement = -1;
            }
        }
    }
};

CollectShipBehaviour.prototype.remove = function(_game)
{
    ShipBehaviour.prototype.remove.call(this, _game);
    _game.removeEntity(this.radarBehaviour.entityIndex);
    _game.removeEntity(this.bgBehaviour.entityIndex);
};

CollectShipBehaviour.prototype.getShipType = function()
{
    return ShipBehaviourTypes.Collect;
};

function AttackShipBehaviour(_position, _rotation, _game, _selectBehaviour, _laserType)
{
    ShipBehaviour.call(this, _position, _rotation, _game, _selectBehaviour);
    
    var laserRange = 0;
    var laserWidth = 90;
    
    switch(_laserType)
    {
        case playerLaserTypes.None:
            this.shootFilter = new RepeatEliminationFilter(function(){}, 0);
            break;
        case playerLaserTypes.Single:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 10);
            laserRange = 150;
            break;
        case playerLaserTypes.Double:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 6);
            laserRange = 200;
            break;
        case playerLaserTypes.Triple:
            this.shootFilter = new RepeatEliminationFilter(shoot_callback, 3);
            laserRange = 250;
            break;
    }
    

    this.maxVelocity = 300;
    this.acceleration = 200;
}

AttackShipBehaviour.prototype = Object.create(ShipBehaviour.prototype);
AttackShipBehaviour.prototype.constructor = AttackShipBehaviour;

AttackShipBehaviour.prototype.updateSpecificBehaviour = function(_game, _data, _selected)
{
    if (this.selectBehaviour.isCurrentShip(this))
    {
                this.shoot(_data, _game);
    }
    
    var enemySide;
    if (this.getSide() == BehaviourSide.Enemy)
    {
        enemySide = BehaviourSide.Friend;
    }
    else
    {
        enemySide = BehaviourSide.Enemy;
    }
    
    var ships = _game.getCloseEntities(_data.position, ["ship"], DefendShipBehaviour.shieldDistance, enemySide);
    
};

AttackShipBehaviour.prototype.remove = function(_game)
{
    ShipBehaviour.prototype.remove.call(this, _game);
    _game.removeEntity(this.coneBehaviour.entityIndex);
};

AttackShipBehaviour.prototype.getShipType = function()
{
    return ShipBehaviourTypes.Attack;
};

function DefendShipBehaviour(_position, _rotation, _game, _selectBehaviour)
{
    ShipBehaviour.call(this, _position, _rotation, _game, _selectBehaviour);
    var shieldDrawable = new Drawable('bin/shield_1.png', DrawableLayer.BACK);
    var shieldGlowDrawable = new Drawable('bin/shield_1_over.png', DrawableLayer.FRONT);
    var shieldGroup = new DrawableGroup([shieldDrawable, shieldGlowDrawable]);
    this.shieldBehaviour = new ShieldBehaviour(Math.radians( _rotation - 90));
    this.shieldBehaviour.attachToObject(this);
    _game.addLocalEntity(shieldGroup, this.shieldBehaviour); 
    
    this.lines = [];
}

DefendShipBehaviour.prototype = Object.create(ShipBehaviour.prototype);
DefendShipBehaviour.prototype.constructor = DefendShipBehaviour;

DefendShipBehaviour.shieldDistance = 200;

DefendShipBehaviour.prototype.getLine = function(index, _game)
{
    if (this.lines.length <= index)
    {
        var drawable = new Line(new Phaser.Point(0,0), new Phaser.Point(0,0));
        var behaviour = new ShieldWallBehaviour(drawable);
        this.lines.push(
                {'drawable':drawable,
                    'behaviour': behaviour});
        
        _game.addLocalEntity(drawable, behaviour);
    }
    return this.lines[index];
}

DefendShipBehaviour.prototype.remove = function(_game)
{
    ShipBehaviour.prototype.remove.call(this, _game);
    _game.removeEntity(this.shieldBehaviour.entityIndex);
    for (var i in this.lines)
    {
        _game.removeEntity(this.lines[i].behaviour.entityIndex);
    }
};

DefendShipBehaviour.prototype.updateSpecificBehaviour = function(_game, _data, _selected)
{
    var ships = _game.getCloseEntities(_data.position, ["ship"], DefendShipBehaviour.shieldDistance, BehaviourSide.Any);
    var max = Math.max(ships.length, this.lines.length);
    for (var ind = 0; ind < max; ind ++)
    {
        var line = this.getLine(ind, _game);
        line.behaviour.resetLine();
        if (ind < ships.length)
        {
            
            if (ships[ind].element.entityIndex < this.entityIndex)
            {
                continue;
            }
            var element = ships[ind].element;
            if ((element.getShipType === undefined || element.getShipType() === ShipBehaviourTypes.Defend)
                    && element !== this)
            {
                line.behaviour.setLine(_data.position, element.getCurrentPosition(), _game);
            }
        }
    }
};

DefendShipBehaviour.prototype.getShipType = function()
{
    return ShipBehaviourTypes.Defend;
};
