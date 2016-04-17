//Used for static elements, like rocks
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
};
