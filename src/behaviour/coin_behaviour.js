//Elements falling down the screen use this behaviour
function CoinBehaviour(_position, _value, _game, _falling)
{
    if (_falling === undefined)
    {
        _falling = true;
    }
    Behaviour.call(this, "coin_" + _value);
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = false;
    this.it = 0;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colBehaviour = event.body.parentBehaviour;
        var colName = colBehaviour.getName();
        if ( colName === "ship" && self.it > 10)
        {
            _game.removeEntity(self.entityIndex);
        }
    };
    this.falling = _falling;
}

CoinBehaviour.prototype = Object.create(Behaviour.prototype);
CoinBehaviour.prototype.constructor = CoinBehaviour;

CoinBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    data.rotation += 0.1;
    if (this.falling)
    {
        this.physicsData.velocity.y = 100.0;
    }
    else
    {
        if (this.it > 200)
        {
            _game.removeEntity(this.entityIndex);
        }
    }
    this.removeIfOut(data, _game);
    this.it++;
    return data;
};


