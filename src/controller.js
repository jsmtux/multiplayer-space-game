function Controller()
{
    var self = this;
    document.onkeydown = function(event){self.onKeyDown(event.keyCode);};
    document.onkeyup = function(event){self.onKeyUp(event.keyCode);};
    this.keyStatus = {};
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