function NetworkManager(isServer, _game)
{
    var self = this;
    this.game = _game;
    this.elements = {};
    this.removed_elements = [];
    this.remote_elements = {};
    this.buffered_property_updates = {};
    this.drawableInfo = {};
    this.ready = false;
    this.onConnection;
    this.lastNetworkId = 0;
    if (isServer)
    {
        var peer = new Peer('Alice-jose', {
            key: '50aebg7h1a21q0k9',
            config: {'iceServers': [
                { url: 'stun:stun.l.google.com:19302' },
                { url: 'stun:stun1.l.google.com:19302' },
                { url: 'stun:stun-turn.org:3478' },
                { url: 'turn:stun-turn.org:3478' }
            ]}
        }); 
        
        this.conn = peer.connect('bob-jose');
        this.conn.on('open', function(){
            self.ready = true;
        });
        
        this.conn.on('data', function(data){
            self.receiveNetworkUpdate(data);
        });
    }
    else
    {
        var peer = new Peer('bob-jose', {key: '50aebg7h1a21q0k9'});  
        peer.on('connection', function(conn) {
            self.conn = conn;
            conn.on('data', function(data){
                self.receiveNetworkUpdate(data);
            });
            if (self.onConnection != undefined)
            {
                self.onConnection();
            }
            self.conn.on('open', function(){
                self.ready = true;
            });
        });
    }
}

NetworkManager.prototype.sendObject = function(obj)
{
    this.conn.send(JSON.stringify(obj));
}

NetworkManager.prototype.registerElement = function(_drawableInfo, _behaviour, _remote)
{
    if (!_remote)
    {
        var ind = this.lastNetworkId++;
        this.elements[ind] = _behaviour;
        var data = _drawableInfo.getNetworkData();
        data['front'] = _drawableInfo.front;
        data['type_name'] = _behaviour.getName();
        if (!_behaviour.initPhysicsParams)
        {
            data['collisionResponse'] = 0;
            data['shapeType'] = ShapeType.SPHERE;
        }
        else
        {
            if (_behaviour.initPhysicsParams.collisionResponse === 0)
            {
                data['collisionResponse'] = 0;
            }
            data['shapeType'] = _behaviour.initPhysicsParams.shapeType;
        }
        this.drawableInfo[ind] = data;
    }
    return ind;
}

NetworkManager.prototype.removeElement = function(_networkId, _remote)
{
    if (!_remote)
    {
        delete this.elements[_networkId];
        this.removed_elements.push(_networkId);
    }
    else
    {
        
    }
}

NetworkManager.prototype.sendUpdate = function()
{
    if (this.ready)
    {
        var toSend = {};
        
        var elementChanges = {};
        
        //object updated
        for(var ind in this.elements)
        {
            elementChanges[ind] = this.elements[ind].cur_data;
        }
        
        //object deletion
        for(var ind in this.removed_elements)
        {
            elementChanges[this.removed_elements[ind]] = "deleted";
        }
        this.removed_elements = [];
        
        //object creation information
        for (var attrname in this.drawableInfo) { elementChanges[attrname] = this.drawableInfo[attrname]; }
        this.drawableInfo = {};
        toSend['element_changes'] = elementChanges;
    
        //Random variable updating
        toSend['game_info'] = this.buffered_property_updates;
        this.buffered_property_updates = {}
        
        this.sendObject(toSend);
    }
}

NetworkManager.prototype.receiveNetworkUpdate = function(_data)
{
    var data = JSON.parse(_data);
    var elementChanges = data['element_changes'];
    for (element in elementChanges)
    {
        if (this.remote_elements[element] === undefined)
        {
            if (elementChanges[element].texture !== undefined)
            {
                var collisionResponse = 1;
                if (elementChanges[element].collisionResponse !== undefined)
                {
                    collisionResponse = elementChanges[element].collisionResponse;
                }
                var behaviour = new NetworkBehaviour(collisionResponse, elementChanges[element], this.game);
                this.game.addEntity(new Drawable(elementChanges[element].texture, elementChanges[element].front), behaviour, true);
                this.remote_elements[element] = behaviour;
            }
            if (elementChanges[element].font !== undefined)
            {
                var collisionResponse = 0;
                var behaviour = new NetworkBehaviour(collisionResponse, elementChanges[element], this.game);
                this.game.addEntity(new Text(elementChanges[element].text, elementChanges[element].font, elementChanges[element].description), behaviour, true);
                this.remote_elements[element] = behaviour;
            }
        }
        else
        {
            if (typeof elementChanges[element] === "string" && elementChanges[element] === "deleted")
            {
                var entityIndex = this.remote_elements[element].entityIndex;
                delete this.remote_elements[element];
                this.game.removeEntity(entityIndex);
            }
            else if (this.remote_elements[element].updateNetworkInfo)
            {
                this.remote_elements[element].updateNetworkInfo(elementChanges[element]);
            }
        }
    }
    
    var propertyUpdates = data['game_info'];
    for (property in propertyUpdates)
    {
        this.game.ReceivePropertyChange(property, propertyUpdates[property]);
    }
}

NetworkManager.prototype.SignalPropertyChange = function(_name, _text)
{
    this.buffered_property_updates[_name] = _text;
}
