function AudioSample(_audioManager, _id)
{
    this.audioManager = _audioManager;
    this.id = _id;
    this.loop = false;
};

AudioSample.prototype.play = function()
{
    if (this.audioManager.isLoaded(this.id))
    {
        this.audioManager.phaserGame.sound.play(this.id,  1, this.loop);
    }
    else
    {
        console.error("Trying to play unloaded sound file " + this.id);
    }
};

AudioSample.prototype.setLoop = function(_loop)
{
    this.loop = _loop;
}

function AudioManager(_phaser_game)
{
    this.phaserGame = _phaser_game;
    this.loadedSamples = {};
    this.global_ind = 1;
};

AudioManager.loadedIndexes = [];

AudioManager.prototype.getAudioInd = function(_path)
{
    var ret = this.loadedSamples[_path];
    if (ret === undefined)
    {
        ret = -1;
    }
    return ret;
};

AudioManager.prototype.getNewInd = function()
{
    return 'a' + this.global_ind++;
};

function audioFileComplete(progress, cacheKey, success, totalLoaded, totalFiles)
{
    AudioManager.loadedIndexes.push(cacheKey);
};

AudioManager.prototype.isLoaded = function(index)
{
    return AudioManager.loadedIndexes.indexOf(index) !== -1;
};

AudioManager.prototype.preload = function()
{
    this.phaserGame.load.onFileComplete.add(audioFileComplete, this);
};

AudioManager.prototype.createAudio = function(_path)
{
    var ind = this.getAudioInd(_path);
    if (ind === -1)
    {
        ind = this.getNewInd();
        this.phaserGame.load.audio(ind, _path);
        this.phaserGame.load.start();
        this.loadedSamples[_path] = ind;
    }
    return new AudioSample(this, ind);
};