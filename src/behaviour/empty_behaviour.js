function EmptyBehaviour(_rotation, _scale, _position)
{
    if (_rotation === undefined)
    {
        _rotation = 0;
    }
    if (_scale === undefined)
    {
        _scale = 1.0;
    }
    Behaviour.call(this, "empty_element");
    this.rotation = _rotation;
    this.scale = _scale;
    this.position = _position;
}

EmptyBehaviour.prototype = Object.create(Behaviour.prototype);
EmptyBehaviour.prototype.constructor = EmptyBehaviour;

EmptyBehaviour.prototype.setPosition = function(_position)
{
    this.position = _position;
}

EmptyBehaviour.prototype.updateState = function(data, _game)
{
    data.rotation = this.rotation;
    data.scale = this.scale;
    if (this.position !== undefined)
    {
        data.position = this.position;
    }
    return data;
};
