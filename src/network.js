var sendFunction = function(){}

function connectedSendFunction(self, data)
{
    if (self.drawableInfo)
    {
        self.conn.send(JSON.stringify(self.drawableInfo));
        self.drawableInfo = {};
    }
    self.conn.send(data);
}

function NetworkManager(isServer, _game)
{
    var self = this;
    this.game = _game;
    this.elements = {};
    this.removed_elements = [];
    this.remote_elements = {};
    this.drawableInfo = {};
    this.onConnection;
    if (isServer)
    {
        var peer = new Peer('Alice', {
            key: '50aebg7h1a21q0k9',
            config: {'iceServers': [
                { url: 'stun:stun.l.google.com:19302' },
                { url: 'stun:stun1.l.google.com:19302' },
                { url: 'stun:stun-turn.org:3478' },
                { url: 'turn:stun-turn.org:3478' }
            ]}
        }); 
        
        this.conn = peer.connect('bob');
        this.conn.on('open', function(){
            sendFunction = function(data){connectedSendFunction(self, data);};
        });
        
        this.conn.on('data', function(data){
            self.receiveNetworkUpdate(data);
        });
    }
    else
    {
        sendFunction = function(){};
        var peer = new Peer('bob', {key: '50aebg7h1a21q0k9'});  
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
                sendFunction = function(data){connectedSendFunction(self, data);};
            });
        });
    }
}

NetworkManager.prototype.registerElement = function(_drawableInfo, _behaviour, _remote)
{
    if (!_remote)
    {
        var ind = Object.keys(this.elements).length;
        this.elements[ind] = _behaviour;
        var data = _drawableInfo.getNetworkData();
        data['type_name'] = _behaviour.getName();
        if (_behaviour.initPhysicsParams.collisionResponse == 0)
        {
            data['collisionResponse'] = 0;
        }
        this.drawableInfo[ind] = data;
    }
    else
    {
        var ind = Object.keys(this.remote_elements).length;
        this.remote_elements[ind] = _behaviour;
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
    var toSend = {};
    for(var ind in this.elements)
    {
        toSend[ind] = this.elements[ind].cur_data;
    }
    for(var ind in this.removed_elements)
    {
        toSend[ind] = "deleted";
    }
    sendFunction(JSON.stringify(toSend));
}

NetworkManager.prototype.receiveNetworkUpdate = function(_data)
{
    var data = JSON.parse(_data);
    for (element in data)
    {
        if (this.remote_elements[element] === undefined)
        {
            if (data[element].texture !== undefined)
            {
                var collisionResponse = 1;
                if (data[element].collisionResponse !== undefined)
                {
                    collisionResponse = data[element].collisionResponse;
                }
                //maybe set network id here instead of letting game do it
                this.game.addEntity(new Drawable(data[element].texture), new NetworkBehaviour(collisionResponse, data[element]["type_name"], this.game), true);
            }
        }
        else
        {
            if (typeof data[element] === "string" && data[element] === "deleted")
            {
                var entityIndex = this.remote_elements[element].entityIndex;
                delete this.remote_elements[element];
                this.game.removeEntity(entityIndex);
            }
            else if (this.remote_elements[element].updateNetworkInfo)
            {
                this.remote_elements[element].updateNetworkInfo(data[element]);
            }
        }
    }
}
