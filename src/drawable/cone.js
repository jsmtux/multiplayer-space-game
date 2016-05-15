function Cone(_width, _length)
{
    this.width = _width;
    this.length = _length;
    this.created = false;
    
    this.sprite;
}

Cone.prototype.preload = function(_game)
{
    this.game = _game;
};

Cone.prototype.create = function(_game)
{
    if (!this.created)
    {
        var phaser_game = _game.phaser_game;

        this.sprite = phaser_game.add.graphics(100, 200);
        _game.backLayer.add(this.sprite);

        // set a fill and line style
        this.sprite.beginFill(0xAA1100);

        // draw a shape
        var numSegments = 10;
        for(var i = 0; i < numSegments; i++)
        {
            var segmentWidth = this.width / numSegments;
            var curWidth = segmentWidth * i - this.width / 2;
            this.sprite.lineTo(Math.cos(Math.radians(curWidth)) * this.length, Math.sin(Math.radians(curWidth)) * this.length);
        }
        this.sprite.endFill();
        
        this.created = true;
    }
};

Cone.prototype.remove = function()
{
    if (this.created)
    {
        this.sprite.destroy();
    }
};

Cone.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
    }
};

Cone.prototype.getNetworkData = function()
{
};
