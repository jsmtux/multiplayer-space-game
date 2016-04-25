function Controller()
{
    var self = this;
    document.onkeydown = function(event){self.onKeyDown(event.keyCode);};
    document.onkeyup = function(event){self.onKeyUp(event.keyCode);};
    this.keyStatus = {};
    
    this.touchStartPos;
    this.touchDiffPos = new Phaser.Point(0,0);
    
    this.touchRatio = 40;
    
    var self = this;
    this.canvasDiv = document.getElementById("game-window");
    this.canvasDiv.addEventListener("touchstart", function(evt){self.handleStart(evt);}, false);
    this.canvasDiv.addEventListener("touchend", function(evt){self.handleEnd(evt);}, false);
    this.canvasDiv.addEventListener("touchmove", function(evt){self.handleMove(evt);}, false);
}

Controller.Keys = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    FIRE: 32,
    W: 87,
    D: 68,
    S: 83,
    A: 65
};

Controller.prototype.handleStart = function(evt)
{
    evt.preventDefault();
    if (!this.touchStartPos)
    {
        this.touchStartPos = {};
        this.touchStartPos.x = evt.changedTouches[0].clientX;
        this.touchStartPos.y = evt.changedTouches[0].clientY;
        this.touchStartPos.id = evt.changedTouches[0].identifier;
    }
};

Controller.prototype.handleEnd = function(evt)
{
    evt.preventDefault();
    for (var ind in evt.changedTouches)
    {
        var curTouch = evt.changedTouches[ind];
        if (this.touchStartPos && this.touchStartPos.id === curTouch.identifier)
        {
            this.touchStartPos = undefined;
            this.touchDiffPos = new Phaser.Point(0,0);
        }
    }
};

Controller.prototype.handleMove = function(evt)
{
    evt.preventDefault();
    for (var ind in evt.changedTouches)
    {
        var curTouch = evt.changedTouches[ind];
        if (this.touchStartPos && this.touchStartPos.id === curTouch.identifier)
        {
            var xdiff = curTouch.clientX - this.touchStartPos.x;
            var ydiff = curTouch.clientY - this.touchStartPos.y;
            this.touchDiffPos = new Phaser.Point(xdiff,ydiff);
            break;
        }
    }
};

Controller.prototype.onKeyDown = function(key)
{
    this.keyStatus[key] = true;
};

Controller.prototype.onKeyUp = function(key)
{
    this.keyStatus[key] = false;
};

Controller.prototype.getKeyStatus = function(key)
{
    return this.keyStatus[key];
};

Controller.prototype.getXAxisStatus = function()
{
    var ret = 0;
    if (this.getKeyStatus(Controller.Keys.LEFT)
        || this.getKeyStatus(Controller.Keys.A))
    {
        ret = -1;
    }
    if (this.getKeyStatus(Controller.Keys.RIGHT)
        || this.getKeyStatus(Controller.Keys.D))
    {
        ret += 1;
    }
    if (this.touchDiffPos.x !== 0)
    {
        ret = this.touchDiffPos.x / this.touchRatio;
        ret = ret > 1 ? 1 : ret;
        ret = ret < -1 ? -1 : ret;
    }
    return ret;
};

Controller.prototype.getYAxisStatus = function()
{
    var ret = 0;
    if (this.getKeyStatus(Controller.Keys.UP)
        || this.getKeyStatus(Controller.Keys.W))
    {
        ret = -1;
    }
    if (this.getKeyStatus(Controller.Keys.DOWN)
        || this.getKeyStatus(Controller.Keys.S))
    {
        ret = 1;
    }
    if (this.touchDiffPos.y !== 0)
    {
        ret = this.touchDiffPos.y / this.touchRatio;
        ret = ret > 1 ? 1 : ret;
        ret = ret < -1 ? -1 : ret;
    }
    return ret;    
};

Controller.prototype.getFireStatus = function()
{
    return this.getKeyStatus(Controller.Keys.FIRE) || this.touchStartPos !== undefined;
}