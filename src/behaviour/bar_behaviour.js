//Manages a healthBar drawable.
//The percentage can be modified in the setPercentage function
function BarBehaviour(_position, _drawable)
{
    Behaviour.call(this, "health_bar");
    this.drawable = _drawable;
}

BarBehaviour.prototype = Object.create(Behaviour.prototype);
BarBehaviour.prototype.constructor = BarBehaviour;

BarBehaviour.prototype.updateState = function(data, _game)
{
    return data;
};

BarBehaviour.prototype.setPercentage = function(_percentage)
{
    this.drawable.barProgress = _percentage;
};
