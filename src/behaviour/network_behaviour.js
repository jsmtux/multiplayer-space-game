//Behaviour used for representing remote elements
//updateNetworkInfo is called from the network manager when new info is received
function NetworkBehaviour(collisionResponse, _data, _game, _drawable)
{
    Behaviour.call(this, "network");
    asPhysical.call(this);
    this.netPos = new Phaser.Point();
    this.netRotation = 0;
    this.networkInfoReceived = false;
    this.initPhysicsParams.collisionResponse = collisionResponse;
    this.initPhysicsParams.shapeType = _data['shapeType'];
    this.initPhysicsParams.size = _data['size']
    this.remote_type_name = _data["type_name"];
    this.game = _game;
    this.drawable = _drawable;
}

NetworkBehaviour.prototype = Object.create(Behaviour.prototype);
NetworkBehaviour.prototype.constructor = NetworkBehaviour;

NetworkBehaviour.prototype.getName = function()
{
    return this.remote_type_name;
}

NetworkBehaviour.prototype.isRemote = function()
{
    return true;
}

NetworkBehaviour.prototype.updateState = function(data, _game)
{
    if (this.networkInfoReceived)
    {
        data.position.x = this.netPos.x;
        data.position.y = this.netPos.y;
        data.rotation = this.netRotation;
        this.updatePhysics(data, _game, true);
        return data;
    }
    else
    {
        return undefined;
    }
}

NetworkBehaviour.prototype.updateNetworkInfo = function(behaviourInfo, drawableInfo)
{
    if (typeof behaviourInfo === "string" && behaviourInfo === "deleted")
    {
        //Remove game element without sending network
    }
    else
    {
        if (behaviourInfo.position)
        {
            this.netPos = behaviourInfo.position;
            this.networkInfoReceived = true;
        }
        if (behaviourInfo.rotation)
        {
            this.netRotation = behaviourInfo.rotation;
        }
        if (drawableInfo.tint)
        {
            this.drawable.tint(drawableInfo.tint);
        }
    }
}
