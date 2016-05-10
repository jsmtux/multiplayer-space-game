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

    this.canvasDiv.addEventListener("mousedown", function(evt){self.handleMouseStart(evt);}, false);
    this.canvasDiv.addEventListener("mouseup", function(evt){self.handleMouseEnd(evt);}, false);
    this.canvasDiv.addEventListener("mousemove", function(evt){self.handleMouseMove(evt);}, false);
    
    this.updateStretchFactor();
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

Controller.prototype.updateStretchFactor = function()
{
    var div = this.canvasDiv.childNodes[0];
    if (div)
    {
        this.x_stretch_factor = Configuration.x_res / div.offsetWidth;
        this.y_stretch_factor = Configuration.y_res / div.offsetHeight;
    }
}

Controller.prototype.handleStart = function(evt)
{
    this.updateStretchFactor();
    evt.preventDefault();
    if (!this.touchStartPos)
    {
        this.touchStartPos = {};
        this.touchPos = {};
        this.touchPos.x = this.touchStartPos.x = (evt.changedTouches[0].pageX - this.canvasDiv.offsetLeft) * this.x_stretch_factor;
        this.touchPos.y = this.touchStartPos.y = (evt.changedTouches[0].pageY - this.canvasDiv.offsetTop) * this.y_stretch_factor;
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
            this.touchPos.x = (evt.changedTouches[0].pageX - this.canvasDiv.offsetLeft) * this.x_stretch_factor;
            this.touchPos.y = (evt.changedTouches[0].pageY - this.canvasDiv.offsetTop) * this.y_stretch_factor;
            var xdiff = curTouch.clientX - this.touchPos.x;
            var ydiff = curTouch.clientY - this.touchPos.y;
            this.touchDiffPos = new Phaser.Point(xdiff,ydiff);
            break;
        }
    }
};

Controller.prototype.handleMouseStart = function(evt)
{
    this.updateStretchFactor();
    evt.preventDefault();
    if (!this.touchStartPos)
    {
        this.touchStartPos = {};
        this.touchPos = {};
        this.touchPos.x = this.touchStartPos.x = (evt.pageX - this.canvasDiv.offsetLeft) * this.x_stretch_factor;
        this.touchPos.y = this.touchStartPos.y = (evt.pageY - this.canvasDiv.offsetTop) * this.y_stretch_factor;
        this.touchStartPos.id = evt.identifier;
    }
};

Controller.prototype.handleMouseEnd = function(evt)
{
    evt.preventDefault();
    if (this.touchStartPos && this.touchStartPos.id === evt.identifier)
    {
        this.touchStartPos = undefined;
        this.touchDiffPos = new Phaser.Point(0,0);
    }
};

Controller.prototype.handleMouseMove = function(evt)
{
    evt.preventDefault();
    if (this.touchStartPos && this.touchStartPos.id === evt.identifier)
    {
        this.touchPos.x = (evt.pageX - this.canvasDiv.offsetLeft) * this.x_stretch_factor;
        this.touchPos.y = (evt.pageY - this.canvasDiv.offsetTop) * this.y_stretch_factor;
        var xdiff = evt.clientX - this.touchPos.x;
        var ydiff = evt.clientY - this.touchPos.y;
        this.touchDiffPos = new Phaser.Point(xdiff,ydiff);
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