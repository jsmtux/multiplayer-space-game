//Used by the bases at both sides of the screen
function BaseShieldBehaviour(_position, _drawable, _rotation, _game)
{
    Behaviour.call(this, "base");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.mass = 50000;
    this.initPhysicsParams.shapeType = ShapeType.RECTANGLE;
    this.initPhysicsParams.size = new Phaser.Point(25, 25);
    this.initPhysicsParams.collisionResponse = false;
    if (_rotation !== undefined)
    {
        this.rotation = Math.radians(_rotation);
    }
    this.health = 10;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colName = event.body.parentBehaviour.getName();
        if (colName === "laser")
        {
            self.health -= 1;
            _drawable.tint(0xFF55FF);
            setTimeout(function(){_drawable.tint(0xFFFFFF)}, 100);
        }
        if (self.health < 0)
        {
            _game.removeEntity(self.entityIndex);
        }
    };
}

BaseShieldBehaviour.prototype = Object.create(Behaviour.prototype);
BaseShieldBehaviour.prototype.constructor = BaseShieldBehaviour;

BaseShieldBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    data.rotation = this.rotation;
    return data;
};
