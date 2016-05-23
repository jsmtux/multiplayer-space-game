function RadarBehaviour(_rotation, _scale)
{
    Behaviour.call(this, "radar_element");
    this.rotation = _rotation;
    this.scale = _scale;
}

RadarBehaviour.prototype = Object.create(Behaviour.prototype);
RadarBehaviour.prototype.constructor = RadarBehaviour;

RadarBehaviour.prototype.updateState = function(data, _game)
{
    data.rotation = this.rotation;
    data.scale = this.scale;
    this.rotation += 0.1;
    return data;
};
