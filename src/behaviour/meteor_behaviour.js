function MeteorBehaviour(_position, _game)
{
    Behaviour.call(this, "meteor");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.initData.rotation = 270;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        if (event.body.parentBehaviour.getSide() !== self.getSide())
        {
            _game.removeEntity(self.entityIndex);
        }
        if (event.body.parentBehaviour.getName() === "laser")
        {
            for(var i = 0; i < 4; i++)
            {
                var curPos = self.cur_data.position;
                var x_rand = (Math.random() * 50) - 25;
                var y_rand = (Math.random() * 50) - 25;
                _game.addEntity(
                        new Drawable(('bin/rock_bronze.png'),DrawableLayer.FRONT), 
                        new CoinBehaviour(new Phaser.Point(curPos.x + x_rand, curPos.y + y_rand), 150, _game, false));
            }
        }
    };
    this.localEnemy = true;
}

MeteorBehaviour.prototype = Object.create(Behaviour.prototype);
MeteorBehaviour.prototype.constructor = MeteorBehaviour;

MeteorBehaviour.prototype.updateState = function(data, _game)
{
    this.updatePhysics(data, _game);
    this.physicsData.velocity.x = -100;
    data.rotation += 0.05;
    this.removeIfOut(data, _game);
    return data;
};