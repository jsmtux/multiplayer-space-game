//Manages the selection crosshair.
//The selected ship can be set through setCurrentShip
function ShieldBehaviour()
{
    Behaviour.call(this, "shield_element");
}

ShieldBehaviour.prototype = Object.create(Behaviour.prototype);
ShieldBehaviour.prototype.constructor = ShieldBehaviour;

ShieldBehaviour.prototype.updateState = function(data, _game)
{
    return data;
};
