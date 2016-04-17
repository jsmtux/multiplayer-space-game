function Entity(_drawable, _behaviour)
{
    this.drawable = _drawable;
    this.element = _behaviour;
}

Entity.prototype.remove = function(_game)
{
    this.drawable.remove();
    this.element.remove(_game);
}

function Scene()
{
    this.entities = {};
    this.numEntities = 0;
}

Scene.prototype.addEntity = function(_drawable, _element)
{
    _element.entityIndex = this.numEntities;
    this.entities[this.numEntities] = new Entity(_drawable, _element);
    return this.numEntities++;
};

Scene.prototype.removeEntity = function(_index, _game)
{
    if (typeof this.entities[_index] !== "undefined")
    {
        this.entities[_index].remove(_game);
        delete this.entities[_index];
    }
};

Scene.prototype.hasEntity = function(_index)
{
    return typeof this.entities[_index] !== "undefined";
};
