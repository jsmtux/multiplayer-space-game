function PhaserGame(_scene, _isServer, _resolution)
{
    Game.call(this, _scene, _isServer, _resolution);
    var self = this;
    this.initUpdateLoop();
    this.phaser_game = new Phaser.Game(_resolution.x, _resolution.y, Phaser.AUTO, 'game-window', 
        { preload: function(){self.preload();}, create: function(){self.create();}, update: function(){self.updateRenderElements();}});
    this.texture_manager = new PhaserTextureManager(this.phaser_game);
    this.font_manager = new PhaserFontManager(this.phaser_game);
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

PhaserGame.prototype.preload = function()
{
    this.texture_manager.preload();
    this.font_manager.preload();
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
};
