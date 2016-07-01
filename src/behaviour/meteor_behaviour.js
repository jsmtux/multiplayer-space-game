function MeteorBehaviour(_position, _game)
{
    Behaviour.call(this, "meteor");
    asPhysical.call(this);
    this.initPhysicsParams.position = _position;
    this.initPhysicsParams.collisionResponse = 0;
    this.initData.rotation = 270;
    var self = this;
    this.initPhysicsParams.collisionCallback = function(event) {
        var collisionName = event.body.parentBehaviour.getName();
        if (collisionName === "laser" || collisionName === "base" || collisionName === "shield_wall_element")
        {
            _game.removeEntity(self.entityIndex);
            if (collisionName !== "base")
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