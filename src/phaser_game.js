function PhaserGame(_scene, _isServer, _matchName, _resolution, _callbacks)
{
    Game.call(this, _scene, _isServer, _matchName, _resolution, _callbacks);
    var self = this;
    this.initUpdateLoop();
    this.phaser_game = new Phaser.Game(_resolution.x, _resolution.y, Phaser.AUTO, 'game-window', 
        { preload: function(){self.preload();}, create: function(){self.create();}, update: function(){self.updateRenderElements();}});
    this.texture_manager = new PhaserTextureManager(this.phaser_game);
    this.font_manager = new PhaserFontManager(this.phaser_game);
    this.audio_manager = new AudioManager(this.phaser_game);
}

PhaserGame.prototype = Object.create(Game.prototype);
PhaserGame.prototype.constructor = PhaserGame;

PhaserGame.prototype.getTextureManager = function()
{
    return this.texture_manager;
};

PhaserGame.prototype.getFontManager = function()
{
    return this.font_manager;
};

PhaserGame.prototype.getAudioManager = function()
{
    return this.audio_manager;
};

PhaserGame.prototype.preload = function()
{
    if (this.callbacks.preload !== undefined)
    {
        this.callbacks.preload();
    }
    this.texture_manager.preload();
    this.font_manager.preload();
    this.audio_manager.preload();
    this.phaser_game.stage.disableVisibilityChange = true;
    for (var entity in this.scene.entities)
    {
        this.scene.entities[entity].drawable.preload(this);
    }
    this.backLayer = this.phaser_game.add.group();
    this.frontLayer = this.phaser_game.add.group();
};

PhaserGame.prototype.create = function()
{
    this.finishedLoading = true;
    
    if (this.callbacks.create !== undefined)
    {
        this.callbacks.create();
    }
};
