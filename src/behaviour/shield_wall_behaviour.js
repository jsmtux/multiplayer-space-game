function ShieldWallBehaviour(_drawable)
{
    Behaviour.call(this, "shield_wall_element");
    asPhysical.call(this);
    
    this.initPhysicsParams.position = new Phaser.Point(200, 200);
    this.initPhysicsParams.collisionResponse = false;
    this.initPhysicsParams.size = new Phaser.Point(100, 20);
    this.initPhysicsParams.shapeType = ShapeType.RECTANGLE;

    this.inited = false;
    this.position = undefined;

    this.drawable = _drawable;
}

ShieldWallBehaviour.prototype = Object.create(Behaviour.prototype);
ShieldWallBehaviour.prototype.constructor = ShieldWallBehaviour;

ShieldWallBehaviour.prototype.updateState = function(data, _game)
{
    if(this.position !== undefined)
    {
        var physicsData = data.clone();
        physicsData.position = this.position;
        physicsData.rotation = this.rotation;
        this.updatePhysics(physicsData, _game, true);//Acts as a remote element, physics will not affect it
    }
    else
    {
        this.updatePhysics(data, _game, true);
    }
    this.inited = true;
    return data;
};

ShieldWallBehaviour.prototype.resetLine = function()
{
    if(this.inited)
    {
        this.position = new Phaser.Point(1000, 2000);
        this.drawable.resetLine();
    }
}

ShieldWallBehaviour.prototype.setLine = function(_startPos, _endPos, _game)
{
    if (this.inited)
    {
        var line = new Phaser.Line(_startPos.x, _startPos.y, _endPos.x, _endPos.y);
        line.midPoint(this.position);

        this.rotation = Phaser.Point.angle(_endPos, _startPos);
        this.drawable.setLine(_startPos, _endPos);
        //modifying box size does not work yet
        var length = _startPos.distance(_endPos);
        _game.getPhysicsEngine().updateElementSize(this, length / 2, 10);
    }
}