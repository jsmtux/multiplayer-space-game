var DrawableLayer = {
    "BACK": 0,
    "MIDDLE": 1,
    "FRONT": 2
}

function Drawable(_texture, _layer)
{
    if (_layer === undefined)
    {
        _layer = DrawableLayer.MIDDLE;
    }
    this.texture_path = _texture;
    this.texture = -1;
    this.created = false;
    this.preloaded = false;
    this.layer = _layer;
}

Drawable.prototype.preload = function(_game)
{
    if (!this.preloaded)
    {
        this.texture = _game.getTextureManager().createTexture(this.texture_path);
    }
    else
    {
        console.warn("Double call to preload");
    }
};

Drawable.prototype.create = function(_game)
{//TODO: this should be part of PhaserDrawable
    if (!this.preloaded)
    {
        this.preloaded = _game.getTextureManager().isLoaded(this.texture);
    }
    if (!this.created && this.preloaded)
    {
        this.created = true;
        this.sprite = _game.phaser_game.add.sprite(0, 0, this.texture);
        switch(this.layer)
        {
            case DrawableLayer.FRONT:
                _game.frontLayer.add(this.sprite);
                break;
            case DrawableLayer.MIDDLE:
                _game.middleLayer.add(this.sprite);
                break;
            case DrawableLayer.BACK:
                _game.backLayer.add(this.sprite);
                break;
        }
        this.sprite.anchor = new Phaser.Point(0.5, 0.5);
    }
};

Drawable.prototype.remove = function()
{
    this.sprite.destroy();
};

Drawable.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
        this.sprite.scale.setTo(data.scale, data.scale);
    }
};

Drawable.prototype.getNetworkData = function()
{
    return {"texture":this.texture_path};
};

Drawable.prototype.isCreated = function()
{
    return this.created;
}

Drawable.prototype.tint = function(_value)
{
    this.sprite.tint = _value;
}