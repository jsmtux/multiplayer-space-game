function NetworkManager(isServer, _matchName, _game)
{
    var self = this;
    this.game = _game;
    this.elements = {};

    this.removed_elements = [];
    this.remote_elements = {};

    this.buffered_property_updates = {}; // Game property updates
    this.drawableInfo = {}; // Info from created or deleted elements
    this.ready = false;
    this.onConnection;

    this.lastNetworkId = 0;

    this.acks = []; // Buffer of acks pending send
    this.packetId = 0; // Id of last packet sent
    this.infoNotAckd = {}; // Set with info not yet ack'd
    
    this.ackdPackages = []; // Packages with existing acks TODO: Should add on front and have max size
    
    this.lastPacketReceived; // Last package id received
    
    this.debugMode = false;
    this.debugModeFailRate = 0.5;
    this.debugModePing = 200;

    if (isServer)
    {
        var peer = new Peer(Configuration.serverPeer + '-' + _matchName, {
            key: '50aebg7h1a21q0k9', reliable:false,
            config: {'iceServers': [
                { url: 'stun:stun.l.google.com:19302' },
                { url: 'stun:stun1.l.google.com:19302' },
                {
                	url: 'turn:jsmtux.ddns.net:3478',
                	credential: 'msgpsw',
                	username: 'msggame'
                }
            ], reliable:false}
        }); 
        
        this.conn = peer.connect(Configuration.clientPeer + '-' + _matchName);
        this.conn.on('open', function(){
            self.ready = true;
        });
        
        this.conn.on('data', function(data){
            self.receiveNetworkUpdate(data);
        });
    }
    else
    {
        var peer = new Peer(Configuration.clientPeer + '-' + _matchName, {
            key: '50aebg7h1a21q0k9', reliable:false,
                config: {'iceServers': [
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'stun:stun1.l.google.com:19302' },
                    {
                    	url: 'turn:jsmtux.ddns.net:3478',
                    	credential: 'msgpsw',
                    	username: 'msggame'
                    }
                ]}
        });  
        peer.on('connection', function(conn) {
            self.conn = conn;
            conn.on('data', function(data){
                self.receiveNetworkUpdate(data);
            });
            if (self.onConnection !== undefined)
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
};

NetworkManager.prototype.registerElement = function(_drawableInfo, _behaviour, _remote)
{
    if (!_remote)
    {
        var ind = this.lastNetworkId++;
        this.elements[ind] = {};
        this.elements[ind].behaviour = _behaviour;
        this.elements[ind].drawable = _drawableInfo;
        var data = _drawableInfo.getNetworkData();
        data['layer'] = _drawableInfo.layer;
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
            data['size'] = _behaviour.initPhysicsParams.size;
        }
        this.drawableInfo[ind] = data;
    }
    return ind;
};

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
};

NetworkManager.prototype.sendUpdate = function()
{
    if (this.ready)
    {
        var toSend = {};
        
        var elementChanges = {};
        var drawableChanges = {};
        var isReliable = false;
        
        //object deletion
        for(var ind in this.removed_elements)
        {
            elementChanges[this.removed_elements[ind]] = "deleted";
        }
        this.removed_elements = [];
        
        //object creation information
        for (var attrname in this.drawableInfo)
        {
            elementChanges[attrname] = this.drawableInfo[attrname];
        }
        
        if (!isObjectEmpty(elementChanges))
        {
            isReliable = true;
            this.infoNotAckd[this.packetId] = copyObject(elementChanges);
        }
        
        //object updated
        for(var ind in this.elements)
        {
            elementChanges[ind] = mergeObjects(elementChanges[ind], this.elements[ind].behaviour.cur_data);
            drawableChanges[ind] = {};
            drawableChanges[ind].tint = this.elements[ind].drawable.getTint();
        }

        this.drawableInfo = {};
        toSend['element_changes'] = elementChanges;
        toSend['drawable_changes'] = drawableChanges;
    
        //Random variable updating
        toSend['game_info'] = this.buffered_property_updates;
        this.buffered_property_updates = {};
        
        //Not Ack'd messages
        if (!isObjectEmpty(this.infoNotAckd))
        {
            toSend['repeat_info'] = this.infoNotAckd;
        }
        
        //Message control
        var msgInfo = {};
        msgInfo['packet_id'] = this.packetId++;
        msgInfo['reliable'] = isReliable;
        msgInfo['acks'] = this.acks;
        this.acks = [];
        toSend['msg_info'] = msgInfo;
        
        if (this.debugMode)
        {
            if (Math.random() > this.debugModeFailRate)
            {
                var self = this;
                setTimeout(function(){ self.sendObject(toSend); }, this.debugModePing + Math.random() * this.debugModePing);
            }
        }
        else
        {
            this.sendObject(toSend);
        }
    }
};

NetworkManager.prototype.receiveNetworkUpdate = function(_data)
{
    var data = JSON.parse(_data);
    
    var messageControl = data['msg_info'];
    
    if (this.ackdPackages.indexOf(messageControl.packet_id) !== -1)
    {
        console.log("Ignoring existing packet with id :" + messageControl.packet_id);
        return;
    }
    
    if (this.lastPacketReceived === undefined || this.lastPacketReceived < messageControl.packet_id )
    {
        this.lastPacketReceived = messageControl.packet_id;
    }
    
    if (messageControl.reliable)
    {
        this.acks.push(messageControl.packet_id);
        this.ackdPackages.push(messageControl.packet_id);
    }

    for (var ind in messageControl.acks)
    {
        delete this.infoNotAckd[messageControl.acks[ind]];
    }
    
    var prevAckInfo = data['repeat_info'];
    for (var i in prevAckInfo)
    {
        var prev_msg = {};
        prev_msg['element_changes'] = prevAckInfo[i];
        prev_msg['msg_info'] = {};
        prev_msg['msg_info'].reliable = true;
        prev_msg['msg_info'].packet_id = i;
        this.receiveNetworkUpdate(JSON.stringify(prev_msg));
    }
    
    var elementChanges = data['element_changes'];
    var drawableChanges = data['drawable_changes'];
    for (element in elementChanges)
    {
        // Check if this is a new element
        if (this.remote_elements[element] === undefined)
        {
            if (elementChanges[element].texture !== undefined)
            {
                var collisionResponse = 1;
                if (elementChanges[element].collisionResponse !== undefined)
                {
                    collisionResponse = elementChanges[element].collisionResponse;
                }
                var drawable = new Drawable(elementChanges[element].texture, elementChanges[element].layer);
                var behaviour = new NetworkBehaviour(collisionResponse, elementChanges[element], this.game, drawable);
                this.game.addEntity(drawable, behaviour, true);
                this.remote_elements[element] = behaviour;
            }
            if (elementChanges[element].font !== undefined)
            {
                var collisionResponse = 0;
                var drawable = new Text(elementChanges[element].text, elementChanges[element].font, elementChanges[element].description);
                var behaviour = new NetworkBehaviour(collisionResponse, elementChanges[element], this.game, drawable);
                this.game.addEntity(drawable, behaviour, true);
                this.remote_elements[element] = behaviour;
            }
        }
        //This is an existing element, either updated or removed
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
                // The updated info is not reliable. If we are receiving a previous package it will be ignored
                if (this.lastPacketReceived === messageControl.packet_id)
                {
                    this.remote_elements[element].updateNetworkInfo(elementChanges[element], drawableChanges[element]);
                }
            }
        }
    }
    
    var propertyUpdates = data['game_info'];
    for (property in propertyUpdates)
    {
        this.game.ReceivePropertyChange(property, propertyUpdates[property]);
    }
};

NetworkManager.prototype.SignalPropertyChange = function(_name, _text)
{
    this.buffered_property_updates[_name] = _text;
};
