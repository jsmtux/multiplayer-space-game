function PhaserFontManager(_game)
{
    this.fonts = {};
    this.game = _game;
    this.global_ind = 1;
}

PhaserFontManager.prototype.addFont = function(_image, _description)
{
    var id = -1;
    if(typeof this.fonts[_image] !== "undefined")
    {
        id = this.fonts[_image];
    }
    else
    {
        this.game.load.bitmapFont(this.global_ind, _image, _description);
        this.game.load.start();
        this.fonts[_image] = this.global_ind++;
    }
    return id;
}

function fontFileComplete(progress, cacheKey, success, totalLoaded, totalFiles)
{
    if (PhaserFontManager.loadedIndexes.indexOf(cacheKey) == -1)
    {
        PhaserFontManager.loadedIndexes.push(cacheKey);
    }
}

PhaserFontManager.prototype.preload = function()
{
    this.game.load.onFileComplete.add(fontFileComplete, this);
}

PhaserFontManager.loadedIndexes = [];


PhaserFontManager.prototype.isLoaded = function(index)
{
    return PhaserFontManager.loadedIndexes.indexOf(index) !== -1;
}

function Text(_text, _image, _imageDesc)
{
    this.image = _image;
    this.imageDesc = _imageDesc;
    this.text = _text;

    this.font = -1;
    this.created = false;
    this.preloaded = false;
}

Text.prototype.preload = function(_game)
{
    if (!this.preloaded)
    {
        this.font = _game.getFontManager().addFont(this.image, this.imageDesc);
    }
    else
    {
        console.warn("Double call to preload");
    }
}

Text.prototype.create = function(_game)
{
    if (!this.preloaded)
    {
        this.preloaded = _game.getFontManager().isLoaded(this.font);
    }
    if (!this.created && this.preloaded)
    {
        this.sprite = _game.phaser_game.add.bitmapText(0, 0, this.font, this.text, 34);
        _game.frontLayer.add(this.sprite);
        this.sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.created = true;
    }
}

Text.prototype.remove = function()
{
    if (this.created)
    {
        this.sprite.destroy();
    }
}

Text.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
    }
}

Text.prototype.getNetworkData = function()
{
    return {"font":this.image, "description":this.imageDesc, "text":this.text};
}
