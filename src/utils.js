function getMillis()
{
    var date = new Date();
    return date.getTime();
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function TimeFilter(_game)
{
}
TimeFilter.numTicks = 0;

TimeFilter.update = function()
{
    TimeFilter.numTicks++;
};

function RepeatEliminationFilter(callback, cadence)
{
    this.callback = callback;
    this.cadence = cadence;
    this.lastSent = TimeFilter.numTicks;
}

RepeatEliminationFilter.prototype = Object.create(TimeFilter.prototype);
RepeatEliminationFilter.prototype.constructor = RepeatEliminationFilter;

RepeatEliminationFilter.prototype.signal = function(_element, _data, _game)
{
    if (TimeFilter.numTicks - this.lastSent > this.cadence)
    {
        this.lastSent = TimeFilter.numTicks;
        return this.callback(_element, _data, _game);
    }
    return false;
};

function isObjectEmpty(obj)
{
    return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
}

function copyObject(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

function mergeObjects(obj1, obj2)
{
    if (obj1 === undefined)
    {
        obj1 = {};
    }
    if (obj2 === undefined)
    {
        obj1 = {};
    }
    for (var attrname in obj2)
    {
        if (typeof obj2[attrname] !== "function")
        {
            obj1[attrname] = obj2[attrname];
        }
    }
    return obj1;
}