

function TextureManager()
{
    this.loadedTextures = {};
    this.global_ind = 1;
}

TextureManager.prototype.getTexInd = function(_path)
{
    var ret = this.loadedTextures[_path];
    if (ret === undefined)
    {
        ret = -1;
    }
    return ret;
}

TextureManager.prototype.getNewInd = function()
{
    return this.global_ind++;
}

TextureManager.prototype.createTexture = function(_path)
{
    return -1;
}

function PhaserTextureManager(_phaserGame)
{
    TextureManager.call(this);
    this.phaserGame = _phaserGame;
}

PhaserTextureManager.prototype = Object.create(TextureManager.prototype);
PhaserTextureManager.prototype.constructor = PhaserTextureManager;

PhaserTextureManager.prototype.createTexture = function(_path)
{
    var ind = this.getTexInd(_path);
    if (ind == -1)
    {
        ind = this.getNewInd();
        this.phaserGame.load.image(ind, _path);
        this.loadedTextures[_path] = ind;
    }
    return ind;
}
