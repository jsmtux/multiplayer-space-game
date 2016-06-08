function Rect(_halfWidth, _halfHeight)
{
    this.halfWidth = _halfWidth;
    this.halfHeight = _halfHeight;
    this.created = false;
    
    this.sprite;
}

Rect.prototype.preload = function(_game)
{
    this.game = _game;
};

Rect.prototype.create = function(_game)
{
    if (!this.created)
    {
        var phaser_game = _game.phaser_game;

        this.sprite = phaser_game.make.graphics(0, 0);

        // set a fill and line style
        this.sprite.lineStyle(2, 0xff00ff, 1);
        
        this.sprite.drawRect(0, 0, this.halfWidth * 2, this.halfHeight * 2);

        _game.debugLayer.add(this.sprite);
        
        this.created = true;
    }
};

Rect.prototype.remove = function()
{
    if (this.created)
    {
        this.sprite.destroy();
    }
};

Rect.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        var position = data.position;
        this.sprite.position = new Phaser.Point(position.x - this.halfWidth, position.y - this.halfHeight);
        this.sprite.rotation = data.rotation;
    }
};

Rect.prototype.getNetworkData = function()
{
};

Rect.prototype.isCreated = function()
{
    return this.created;
}