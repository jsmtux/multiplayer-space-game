
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
};

TextureManager.prototype.getNewInd = function()
{
    return this.global_ind++;
};

TextureManager.prototype.createTexture = function(_path)
{
    return -1;
};

function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles)
{
    PhaserTextureManager.loadedIndexes.push(cacheKey);
}

function PhaserTextureManager(_phaserGame)
{
    TextureManager.call(this);
    this.phaserGame = _phaserGame;
}

PhaserTextureManager.loadedIndexes = [];

PhaserTextureManager.prototype = Object.create(TextureManager.prototype);
PhaserTextureManager.prototype.constructor = PhaserTextureManager;

PhaserTextureManager.prototype.isLoaded = function(index)
{
    return PhaserTextureManager.loadedIndexes.indexOf(index) !== -1;
};

PhaserTextureManager.prototype.preload = function()
{
    this.phaserGame.load.onFileComplete.add(fileComplete, this);
};

PhaserTextureManager.prototype.createTexture = function(_path)
{
    var ind = this.getTexInd(_path);
    if (ind === -1)
    {
        ind = this.getNewInd();
        this.phaserGame.load.image(ind, _path);
        this.phaserGame.load.start();
        this.loadedTextures[_path] = ind;
    }
    return ind;
};