//This is the data stored internally about the objects.
//Behaviours receive the current in updateState and return the modified one.
//The game then interpolates in between
function ElementRenderData()
{
    this.position = new Phaser.Point();
    this.scale = 1.0;
    this.rotation = 0.0;
}

ElementRenderData.prototype.clone = function()
{
    var ret = new ElementRenderData();
    ret.position = this.position.clone();
    ret.scale = this.scale;
    ret.rotation = this.rotation;
    return ret;
}
