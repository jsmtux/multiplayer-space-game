function Entity(_drawable, _behaviour)
{
    this.drawable = _drawable;
    this.element = _behaviour;
}

Entity.prototype.remove = function(_game)
{
    if (this.drawable.isCreated())
    {
        this.drawable.remove();
    }
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

Scene.prototype.getEntity = function(_index)
{
    return this.entities[_index];
};

Scene.prototype.getCloseEntities = function(_point, _elementTypes, _treshold, _entity_side)
{
    var ret = [];
    if (_treshold === undefined)
    {
        _treshold = 50;
    }
    if (_entity_side === undefined)
    {
        _entity_side = BehaviourSide.Any;
    }
    for (var ind in this.entities)
    {
        if ((_entity_side === BehaviourSide.Any || this.entities[ind].element.getSide() === _entity_side)
                && _elementTypes.indexOf(this.entities[ind].element.getName()) !== -1)
        {
            var position = this.entities[ind].element.getCurrentPosition();
            if (position && _point)
            {
                var cur_distance = Phaser.Point.distance(position, _point);
                if (cur_distance < _treshold)
                {
                    ret.push(this.entities[ind]);
                }
            }
        }
    }
    return ret;
};

Scene.prototype.getClosestEntity = function(_point, _elementTypes, _treshold, _entity_side)
{
    var ret = undefined;
    var min_distance = undefined;
    if (_treshold === undefined)
    {
        _treshold = 50;
    }
    if (_entity_side === undefined)
    {
        _entity_side = BehaviourSide.Any;
    }
    for (var ind in this.entities)
    {
        if ((_entity_side === BehaviourSide.Any || this.entities[ind].element.getSide() === _entity_side)
                && _elementTypes.indexOf(this.entities[ind].element.getName()) !== -1)
        {
            var position = this.entities[ind].element.getCurrentPosition();
            if (position && _point)
            {
                var cur_distance = Phaser.Point.distance(position, _point);
                if (ret === undefined || cur_distance < min_distance)
                {
                    ret = this.entities[ind];
                    min_distance = cur_distance;
                }
            }
        }
    }
    if (min_distance > _treshold)
    {
        ret = undefined;
    }
    return ret;
};

Scene.prototype.getEntitiesByBehaviourName = function(_names)
{
    var ret = [];
    for(ind in this.entities)
    {
        if (_names.indexOf(this.entities[ind].element.getName()) !== -1)
        {
            ret.push(this.entities[ind]);
        }
    }
    return ret;
}