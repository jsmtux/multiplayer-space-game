function DrawableGroup(drawable_list)
{
    this.list = drawable_list;
}

DrawableGroup.prototype.preload = function(_game)
{
    for(var ind in this.list)
    {
        this.list[ind].preload(_game);
    }
};

DrawableGroup.prototype.create = function(_game)
{
    for(var ind in this.list)
    {
        this.list[ind].create(_game);
    }
};

DrawableGroup.prototype.remove = function()
{
    for(var ind in this.list)
    {
        this.list[ind].remove();
    }
};

DrawableGroup.prototype.draw = function(_element, _time)
{
    for(var ind in this.list)
    {
        this.list[ind].draw(_element, _time);
    }
};

DrawableGroup.prototype.isCreated = function()
{
    return true;
}

DrawableGroup.prototype.getNetworkData = function()
{
};