
function PhysicsEngine()
{
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.NaiveBroadphase();
}

PhysicsEngine.prototype.registerElement = function(_behaviour, parameters)
{
    var radius = 25.0;
    var mass = 0.5;
    if (parameters.mass)
    {
        mass = parameters.mass;
    }
    var sphereShape = new CANNON.Sphere(radius);
    var sphereBody = new CANNON.Body({mass : mass});
    sphereBody.addShape(sphereShape);
    var position = new CANNON.Vec3(0,0,0);
    if (parameters.position)
    {
        position.x = parameters.position.x;
        position.y = parameters.position.y;
    }
    sphereBody.position.set(position.x,position.y,0);
    this.world.add(sphereBody);
    _behaviour.physicsData = sphereBody;
    _behaviour.physicsData.collisionResponse = parameters.collisionResponse;
    if (parameters.collisionCallback)
    {
        sphereBody.addEventListener("collide", parameters.collisionCallback);
    }
    sphereBody.parentBehaviour = _behaviour;
}

PhysicsEngine.prototype.updateElement = function(_behaviour, _data, _game)
{
    var phisPos = _behaviour.physicsData.position;
    _data.position = new Phaser.Point(phisPos.x, phisPos.y);
}

PhysicsEngine.prototype.updateInfo = function(_behaviour, _data, _game)
{
    _behaviour.physicsData.position = new CANNON.Vec3(_data.position.x,_data.position.y,0);
}

PhysicsEngine.prototype.updateSimulation = function(_timeStep)
{
    this.world.step(_timeStep);
}