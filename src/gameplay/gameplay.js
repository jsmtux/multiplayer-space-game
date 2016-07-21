
window.ondragstart = function() { return false; };

var parameterString = decodeURIComponent(location.search.substr(1));
var parameters = JSON.parse(parameterString);

var GameModes = {
    'sp': 1,
    'server' : 2,
    'client' : 3
};

var gameMode;
if (parameters.type === "sp")
{
    gameMode = GameModes.sp;
}
else if (parameters.type === "server")
{
    gameMode = GameModes.server;
}
else
{
    gameMode = GameModes.client;
}
var matchName = parameters.name;
var volume = parameters.volume;

//HTML interaction
var baseHealthSpan = document.getElementById("baseHealth");
var enemyBaseHealthSpan = document.getElementById("enemyHealth");
var moneySpan = document.getElementById("money");
var CollectCostSpan = document.getElementById("CollectCostSpan");
var AttackCostSpan = document.getElementById("AttackCostSpan");
var DefendCostSpan = document.getElementById("DefendCostSpan");

//\HTML interaction
var resolution = new Phaser.Point(Configuration.x_res, Configuration.y_res);
var size = new Phaser.Point(window.innerWidth, window.innerHeight - 104);

var launchedShips = [];
launchedShips[ShipBehaviourTypes.Collect] = [];
launchedShips[ShipBehaviourTypes.Defend] = [];
launchedShips[ShipBehaviourTypes.Attack] = [];

var shipPrices = [];
shipPrices[ShipBehaviourTypes.Collect] = [[1, 0], [8, 100]];
shipPrices[ShipBehaviourTypes.Defend] = [[4,100], [8,200]];
shipPrices[ShipBehaviourTypes.Attack] = [[0,200]];

function getShipPrice(type)
{
    var number = launchedShips[type].length;
    for(var i in shipPrices[type])
    {
        if (number < shipPrices[type][i][0])
        {
            return shipPrices[type][i][1];
        }
    }
    return shipPrices[type][shipPrices[type].length - 1][1];
}

function launchResourceShip()
{
    if (playerMoney.checkAndSubstract(getShipPrice(ShipBehaviourTypes.Collect)))
    {
        var currentMainShipAttributes = new ShipAttributes;
        
        launchedShips[ShipBehaviourTypes.Collect].push(
            game.addEntity(new Drawable('bin/resource_ship.png', DrawableLayer.MIDDLE),
                    new CollectShipBehaviour(startPoint, rotation, game, selectBehaviour, onMoneyHit)));
    }
}

function launchDefenseShip()
{
    if (playerMoney.checkAndSubstract(getShipPrice(ShipBehaviourTypes.Defend)))
    {
        var currentMainShipAttributes = new ShipAttributes;
        launchedShips[ShipBehaviourTypes.Defend].push(
            game.addEntity(new Drawable('bin/defense_ship.png', DrawableLayer.MIDDLE),
                    new DefendShipBehaviour(startPoint, rotation, game, selectBehaviour)));
    }
}

function launchAttackShip()
{
    if (playerMoney.checkAndSubstract(getShipPrice(ShipBehaviourTypes.Attack)))
    {
        var currentMainShipAttributes = new ShipAttributes;
        launchedShips[ShipBehaviourTypes.Attack].push(
            game.addEntity(new Drawable('bin/attack_ship.png', DrawableLayer.MIDDLE),
                    new AttackShipBehaviour(startPoint, rotation, game, selectBehaviour, playerLaserTypes.Single)));
    }
}

function updateCallback()
{
    if (!this.displayCanvas)
    {
        this.displayCanvas = document.getElementsByTagName("canvas")[0];
    }
    this.displayCanvas.style.width = size.x + 'px';
    this.displayCanvas.style.height = size.y + 'px';
    
    for (var shipType in launchedShips)
    {
        for (var ship in launchedShips[shipType])
        {
            if (game.getEntity(launchedShips[shipType][ship]) == undefined)
            {
                launchedShips[shipType].splice(ship, 1);
            }
        }
        var cost = getShipPrice(shipType);
        switch(parseInt(shipType))
        {
            case ShipBehaviourTypes.Attack:
                AttackCostSpan.innerHTML = cost;
                break;
            case ShipBehaviourTypes.Defend:
                DefendCostSpan.innerHTML = cost;
                break;
            case ShipBehaviourTypes.Collect:
                CollectCostSpan.innerHTML = cost;
                break;
        }
    }
}

var music;

function preloadCallback()
{
    music = game.getAudioManager().createAudio('bin/8bit_1.mp3');
    game.getAudioManager().setVolume(parseInt(volume));
}

function createCallback()
{
    music.setLoop(true);
    music.play();   
}

var scene = new Scene();
var game = new PhaserGame(scene, gameMode, matchName, resolution, {'preload': preloadCallback, 'create':createCallback, 'update' : updateCallback});

var selectDrawable = new Drawable('bin/crossair_friend_selected.png', DrawableLayer.BACK);
var selectBehaviour = new SelectBehaviour(selectDrawable);
game.addLocalEntity(selectDrawable, selectBehaviour);

game.controller.selectionStartCallback = function(position)
{    
    var closestSelectable = game.getClosestEntity(position, ["ship"], 100, BehaviourSide.Friend);
    if (closestSelectable)
    {
        selectBehaviour.setCurrentShip(closestSelectable.element);
    }
    
}

var playerMoney = new Money(1000, moneySpan);

//Property updating
function setBaseHealth(_health)
{
    baseHealthSpan.innerHTML = _health;
    game.SignalPropertyChange("RemoteBaseHealth", _health);
}

function setEnemyBaseHealth(_name, _health)
{
    if (_name === "RemoteBaseHealth")
    {
        enemyBaseHealthSpan.innerHTML = _health;
    }
}

function setMoneyAmount(_name, _money)
{
    if (_name === "MoneyReceived")
    {
        playerMoney.add(_money);
    }
}
///
function onMoneyHit(value)
{
    playerMoney.add(value);
}

function spawnBase(leftPosition)
{
    var ret = [];
    var position;
    var rotation;
    var shieldPosition;
    if (leftPosition)
    {
        position = 54;
        rotation = 0;
        shieldPosition = 50;
    }
    else
    {
        position = resolution.x - 54;
        rotation = 180;
        shieldPosition = resolution.x - 40;
    }
    ret.push(game.addEntity(new Drawable('bin/base_2.png',DrawableLayer.FRONT), new BaseBehaviour(new Phaser.Point(position,300), setBaseHealth, rotation)));
    var shieldDrawable = new Drawable('bin/baseArmor3.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,130), shieldDrawable, rotation, game)));
    var shieldDrawable = new Drawable('bin/baseArmor4.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,470), shieldDrawable, rotation, game)));
    var shieldDrawable = new Drawable('bin/baseArmor1.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,220), shieldDrawable, rotation, game)));
    var shieldDrawable = new Drawable('bin/baseArmor2.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,380), shieldDrawable, rotation, game)));
    return ret;
}
/*
function dropCoins()
{
    var kind = Math.random();
    var path;
    var value;

    switch (true)
    {
        case (kind < 0.5):
            path = 'bin/rock_bronze.png';
            value = 150;
            break;
        case (kind < 0.8):
            path = 'bin/rock_silver.png';
            value = 300;
            break;
        case (kind < 1):
            path = 'bin/rock_gold.png';
            value = 600;
            break;
    }
  
    var xpos = 200 + (resolution.x - 400) * Math.random();
    game.addEntity(new Drawable(path,DrawableLayer.FRONT), new CoinBehaviour(new Phaser.Point(xpos,0), value, game));
    setTimeout(dropCoins, 2000 + Math.random()*4000);
}

*/


function TestStage()
{
    
}

TestStage.prototype.Start = function(director)
{
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/meteor.png', DrawableLayer.MIDDLE),new MeteorBehaviour(director.getRandomInitPosition(), game));
    }, 1000);
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/powerup_attack.png', DrawableLayer.MIDDLE),new PowerUpBehaviour(director.getRandomInitPosition(), game,PowerUpTypes.Attack));
    }, 3000);
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/powerup_health.png', DrawableLayer.MIDDLE),new PowerUpBehaviour(director.getRandomInitPosition(), game,PowerUpTypes.Health));
    }, 3000);
    setTimeout(function(){
        clearInterval(interval);
        director.Next();
    }, 300000);
}

function SimpleCollect()
{
    
}

SimpleCollect.prototype.Start = function(director)
{
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/meteor.png', DrawableLayer.MIDDLE),new MeteorBehaviour(director.getRandomInitPosition(), game));
    }, 4000);
    setTimeout(function(){
        clearInterval(interval);
        director.Next();
    }, 30000);
}

function MoreCollect()
{
    
}

MoreCollect.prototype.Start = function(director)
{
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/meteor.png', DrawableLayer.MIDDLE),new MeteorBehaviour(director.getRandomInitPosition(), game));
    }, 10000);
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/powerup_attack.png', DrawableLayer.MIDDLE),new PowerUpBehaviour(director.getRandomInitPosition(), game, PowerUpTypes.Attack));
    }, 10000);
    setTimeout(function(){
        clearInterval(interval);
        director.Next();
    }, 30000);
}

function CollectAndShip()
{
    
}

CollectAndShip.prototype.Start = function(director)
{
    var interval = setInterval(function(){
        game.addEntity(new Drawable('bin/meteor.png', DrawableLayer.MIDDLE),new MeteorBehaviour(director.getRandomInitPosition(), game));
    }, 2000);
    
    setInterval(function(){
        game.addEntity(new Drawable('bin/attack_ship.png', DrawableLayer.MIDDLE),new AiAttackShipBehaviour(new Phaser.Point(resolution.x - 150,300), 270, game, selectBehaviour, playerLaserTypes.Single));
    }, 8000);
}

function AIDirector()
{
    this.stages = [];
    this.curStage = 0;
    
    //this.stages.push(new TestStage());
    this.stages.push(new SimpleCollect());
    this.stages.push(new MoreCollect());
    this.stages.push(new CollectAndShip());
}

AIDirector.prototype.Start = function()
{
    this.Next();
}

AIDirector.prototype.Next = function()
{
    this.stages[this.curStage++].Start(this);
}

AIDirector.prototype.getRandomInitPosition = function()
{
    var ret = new Phaser.Point(resolution.x - 150,300)
    var margin = 0.1;
    ret.y = resolution.y * Math.random() * (1 - 2 * margin) + resolution.y * margin;
    return ret;
}

// Top level functions
var startPoint;
var rotation;
if(gameMode === GameModes.server || gameMode === GameModes.sp)
{
    startPoint = new Phaser.Point(150,300);
    rotation = 90;
}
else
{
    startPoint = new Phaser.Point(resolution.x - 150,300);
    rotation = 270;
}

if (gameMode === GameModes.server)
{
    spawnBase(true);
    dropCoins();
}
else if (gameMode === GameModes.client)
{
    game.networkManager.onConnection = function()
    {
        spawnBase(false);
    };
}
else if (gameMode === GameModes.sp)
{
    spawnBase(true);
    var aiDirector = new AIDirector();
    aiDirector.Start();
}
else
{
    console.error("Invalid game mode");
}