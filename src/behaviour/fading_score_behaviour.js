//Used for representing the score when getting more money
function FadingScoreBehaviour(_position, _drawable)
{
    Behaviour.call(this, "fading");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.drawable = _drawable;
}

FadingScoreBehaviour.prototype = Object.create(Behaviour.prototype);
FadingScoreBehaviour.prototype.constructor = FadingScoreBehaviour;

FadingScoreBehaviour.prototype.updateState = function(data, _game)
{
    if (this.drawable.sprite)
    {
        this.drawable.sprite.alpha -= 0.1;
    }
    this.updatePhysics(data, _game);
    this.physicsData.force.y = -100.0;
    this.removeIfOut(data, _game);
    return data;
}
