function EmptyBehaviour(_rotation, _scale)
{
    Behaviour.call(this, "empty_element");
    this.rotation = _rotation;
    this.scale = _scale;
}

EmptyBehaviour.prototype = Object.create(Behaviour.prototype);
EmptyBehaviour.prototype.constructor = EmptyBehaviour;

EmptyBehaviour.prototype.updateState = function(data, _game)
{
    data.rotation = this.rotation;
    data.scale = this.scale
    return data;
};
