//Used by the bases at both sides of the screen
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
