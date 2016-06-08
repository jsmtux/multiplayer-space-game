function Circle(_radius)
{
    this.diameter = _radius * 2;
    this.created = false;
    
    this.sprite;
}

Circle.prototype.preload = function(_game)
{
    this.game = _game;
};

Circle.prototype.create = function(_game)
{
    if (!this.created)
    {
        var phaser_game = _game.phaser_game;

        this.sprite = phaser_game.make.graphics(0, 0);

        // set a fill and line style
        this.sprite.lineStyle(2, 0xff00ff, 1);
        
        this.sprite.drawCircle(0, 0, this.diameter);

        _game.debugLayer.add(this.sprite);
        
        this.created = true;
    }
};

Circle.prototype.remove = function()
{
    if (this.created)
    {
        this.sprite.destroy();
    }
};

Circle.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
    }
};

Circle.prototype.getNetworkData = function()
{
};

Circle.prototype.isCreated = function()
{
    return this.created;
}