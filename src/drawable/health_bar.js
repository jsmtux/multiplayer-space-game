function HealthBar(_width)
{
    this.width = _width;
    this.created = false;
    
    this.bar;
    this.sprite;
}

HealthBar.prototype.preload = function(_game)
{
    this.game = _game;
};

HealthBar.prototype.create = function(_game)
{
    if (!this.created)
    {
        var phaser_game = _game.phaser_game;

        this.bar = phaser_game.add.bitmapData(this.width, 8);
        this.barProgress = 100;
        
        this.sprite = phaser_game.add.sprite(phaser_game.world.centerX - (this.bar.width * 0.5), phaser_game.world.centerY, this.bar);
        
        this.created = true;
    }
};

HealthBar.prototype.remove = function()
{
    if (this.created)
    {
        this.bar.destroy();
        this.sprite.destroy();
        this.game.phaser_game.tweens.remove(this.tween);
    }
};

HealthBar.prototype.draw = function(_element, _time)
{
    if (this.created)
    {
        this.bar.context.clearRect(0, 0, this.bar.width, this.bar.height);

        if (this.barProgress < 32) {
           this.bar.context.fillStyle = '#f00';   
        }
        else if (this.barProgress < 64) {
            this.bar.context.fillStyle = '#ff0';
        }
        else {
            this.bar.context.fillStyle = '#0f0';
        }

        this.bar.context.fillRect(0, 0, (this.barProgress / 100) * this.width, 8);

        // important - without this line, the context will never be updated on the GPU when using webGL
        this.bar.dirty = true;
        
        var data = _element.getInterpolatedData(_time);
        this.sprite.position = data.position;
        this.sprite.rotation = data.rotation;
    }
};

HealthBar.prototype.getNetworkData = function()
{
    return {"progress":100};
};

HealthBar.prototype.isCreated = function()
{
    return this.created;
}