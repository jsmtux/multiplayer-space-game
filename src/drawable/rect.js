function Rect(_halfWidth, _halfHeight)
{
    this.halfWidth = _halfWidth;
    this.halfHeight = _halfHeight;
    this.created = false;
    this.needsRedraw = true;
    
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

        this.sprite = phaser_game.make.graphics(1000, 2000);

        _game.debugLayer.add(this.sprite);

        this.redrawBox();
        
        this.created = true;
    }
};

Rect.prototype.setSize = function(_halfWidth, _halfHeight)
{
    this.halfWidth = _halfWidth;
    this.halfHeight = _halfHeight;
    this.needsRedraw = true;
}

Rect.prototype.redrawBox = function()
{
    if (this.sprite)
    {
        this.sprite.clear();
        this.sprite.lineStyle(2, 0xff00ff, 1);        
        this.sprite.drawRect(-this.halfWidth, -this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
        this.needsRedraw = false;
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
        if (this.needsRedraw)
        {
            this.redrawBox();
        }
        var data = _element.getInterpolatedData(_time);
        var position = data.position;
        this.sprite.rotation = data.rotation;
        this.sprite.position = new Phaser.Point(position.x, position.y);
    }
};

Rect.prototype.getNetworkData = function()
{
};

Rect.prototype.isCreated = function()
{
    return this.created;
}