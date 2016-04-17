//Elements falling down the screen use this behaviour
function CoinBehaviour(_position, _value, _game)
{
    Behaviour.call(this, "coin_" + _value);
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = false;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var colName = event.body.parentBehaviour.getName();
        if ( colName === "ship" )
        {
            _game.removeEntity(self.entityIndex);
        }
    };
}

CoinBehaviour.prototype = Object.create(Behaviour.prototype);
CoinBehaviour.prototype.constructor = CoinBehaviour;

CoinBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    data.rotation += 0.1;
    this.physicsData.velocity.y = 100.0;
    this.removeIfOut(data, _game);
    return data;
};


