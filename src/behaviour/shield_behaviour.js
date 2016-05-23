//Manages the selection crosshair.
//The selected ship can be set through setCurrentShip
function ShieldBehaviour(_rotation)
{
    Behaviour.call(this, "shield_element");
    this.rotation = _rotation;
}

ShieldBehaviour.prototype = Object.create(Behaviour.prototype);
ShieldBehaviour.prototype.constructor = ShieldBehaviour;

ShieldBehaviour.prototype.updateState = function(data, _game)
{
    data.rotation = this.rotation;
    return data;
};
