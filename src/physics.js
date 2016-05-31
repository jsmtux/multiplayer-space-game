var ShapeType = {
    SPHERE : 0,
    RECTANGLE : 1
};

function PhysicsEngine()
{
    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.bodiesToRemove = [];
}

PhysicsEngine.prototype.registerElement = function(_behaviour, parameters)
{
    var type = parameters.shapeType;
    if (type === undefined)
    {
        type = ShapeType.SPHERE;
    }
    var body;
    if (type === ShapeType.SPHERE)
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
        body = sphereBody;
    } else if (type === ShapeType.RECTANGLE)
    {
        if (parameters.mass)
        {
            mass = parameters.mass;
        }
        var rectangleShape = new CANNON.Box(new CANNON.Vec3(parameters.size.x, parameters.size.y, parameters.size.y));
        var rectangleBody = new CANNON.Body({mass : mass});
        rectangleBody.addShape(rectangleShape);
        body = rectangleBody;        
    }
    var position = new CANNON.Vec3(0,0,0);
    if (parameters.position)
    {
        position.x = parameters.position.x;
        position.y = parameters.position.y;
    }
    body.position.set(position.x,position.y,0);
    this.world.add(body);
    _behaviour.physicsData = body;
    _behaviour.physicsData.collisionResponse = parameters.collisionResponse;
    if (parameters.collisionCallback)
    {
        body.addEventListener("collide", parameters.collisionCallback);
    }
    body.parentBehaviour = _behaviour;
};

PhysicsEngine.prototype.unRegisterElement = function(_body)
{
    this.bodiesToRemove.push(_body);
};

PhysicsEngine.prototype.updateElement = function(_behaviour, _data, _game)
{
    var phisPos = _behaviour.physicsData.position;
    _data.position = new Phaser.Point(phisPos.x, phisPos.y);
};

PhysicsEngine.prototype.updateInfo = function(_behaviour, _data, _game)
{
    _behaviour.physicsData.position = new CANNON.Vec3(_data.position.x,_data.position.y,0);
};

PhysicsEngine.prototype.updateSimulation = function(_timeStep)
{
    this.world.step(_timeStep);
    for(var i in this.bodiesToRemove)
    {
        this.world.remove(this.bodiesToRemove[i]);
    }
    this.bodiesToRemove = [];
};