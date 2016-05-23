//Manages the selection crosshair.
//The selected ship can be set through setCurrentShip
function SelectBehaviour(_drawable)
{
    Behaviour.call(this, "select_element");
    this.drawable = _drawable;
    this.position = new Phaser.Point(-100, -100);
    this.curShip;
}

SelectBehaviour.prototype = Object.create(Behaviour.prototype);
SelectBehaviour.prototype.constructor = SelectBehaviour;

SelectBehaviour.prototype.updateState = function(data, _game)
{
    if (this.curShip)
    {
        this.attachToObject(this.curShip);
    }
    else
    {
        this.attachToObject(undefined);
        data.position = new Phaser.Point(-100, -100);
    }
    data.rotation += 0.05;
    return data;
};

SelectBehaviour.prototype.setCurrentShip = function(_ship)
{
    this.curShip = _ship;
};

SelectBehaviour.prototype.isCurrentShip = function(_ship)
{
    return this.curShip === _ship;
}
