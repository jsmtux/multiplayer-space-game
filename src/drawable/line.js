function Line(_startPos, _endPos)
{
    this.startPos = _startPos;
    this.endPos = _endPos;
    this.created = false;
    
    this.sprite;
}

Line.prototype.preload = function(_game)
{
    this.game = _game;
};

Line.prototype.create = function(_game)
{
    if (!this.created)
    {
        var phaser_game = _game.phaser_game;

        this.sprite = phaser_game.make.graphics(100, 200);

        _game.backLayer.add(this.sprite);
        
        this.redrawLine();

        this.created = true;
    }
};

Line.prototype.redrawLine = function()
{
    this.sprite.clear();
    this.sprite.lineStyle(10, 0xffd900, 1);
    this.sprite.moveTo(this.startPos.x, this.startPos.y);
    this.sprite.lineTo(this.endPos.x, this.endPos.y);
    this.sprite.endFill();
};

Line.prototype.setLine = function(_startPos, _endPos)
{
    this.startPos = _startPos;
    this.endPos = _endPos;
    this.redrawLine();
}

Line.prototype.resetLine = function()
{
    this.setLine(new Phaser.Point(0,0), new Phaser.Point(0,0));
}

Line.prototype.remove = function()
{
    if (this.created)
    {
        this.sprite.destroy();
    }
};

Line.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
    }
};

Line.prototype.getNetworkData = function()
{
};

Line.prototype.isCreated = function()
{
    return this.created;
}
