function ConeBehaviour(_rotation, _width, _length)
{
    Behaviour.call(this, "health_bar");
    this.rotation = _rotation;
    this.halfWidth = Math.radians(_width) / 2;
    this.length = _length;
}

ConeBehaviour.prototype = Object.create(Behaviour.prototype);
ConeBehaviour.prototype.constructor = ConeBehaviour;

ConeBehaviour.prototype.updateState = function(data, _game)
{
    data.rotation = this.rotation;
    return data;
};

ConeBehaviour.prototype.isInside = function(_position)
{
    var ret = false;
    var curPos = this.getCurrentPosition();
    if (curPos)
    {
        var distance = Phaser.Point.distance(_position, curPos);
        if (distance < this.length)
        {
            var angle = Phaser.Point.angle(_position, curPos);
            angle -= this.rotation;
            var fullCircle = 2*Math.PI;
            while (angle < 0)
            {
                angle += fullCircle;
            }
            ret = fullCircle - this.halfWidth < angle || this.halfWidth > angle;
        }
    }
    return ret;
};