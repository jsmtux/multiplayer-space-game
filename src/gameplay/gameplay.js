
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
var priceMainShipSpan = document.getElementById("priceMainShip");
var priceAuxShipSpan = document.getElementById("priceAuxShip");

//\HTML interaction
var resolution = new Phaser.Point(Configuration.x_res, Configuration.y_res);
var size = new Phaser.Point(window.innerWidth, window.innerHeight - 104);


function updateCallback()
{
    if (!this.displayCanvas)
    {
        this.displayCanvas = document.getElementsByTagName("canvas")[0];
    }
    this.displayCanvas.style.width = size.x + 'px';
    this.displayCanvas.style.height = size.y + 'px';
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

var playerMoney = new Money(0, moneySpan);

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
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,130), shieldDrawable, rotation)));
    var shieldDrawable = new Drawable('bin/baseArmor4.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,470), shieldDrawable, rotation)));
    var shieldDrawable = new Drawable('bin/baseArmor1.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,220), shieldDrawable, rotation)));
    var shieldDrawable = new Drawable('bin/baseArmor2.png',DrawableLayer.FRONT);
    ret.push(game.addEntity(shieldDrawable, new BaseShieldBehaviour(new Phaser.Point(shieldPosition,380), shieldDrawable, rotation)));
    return ret;
}

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

function launchResourceShip()
{
    var currentMainShipAttributes = new ShipAttributes;
    game.addEntity(new Drawable('bin/resource_ship.png', DrawableLayer.MIDDLE),
                new CollectShipBehaviour(startPoint, rotation, game, selectBehaviour, onMoneyHit));
}

function launchDefenseShip()
{
    var currentMainShipAttributes = new ShipAttributes;
    game.addEntity(new Drawable('bin/defense_ship.png', DrawableLayer.MIDDLE),
                new DefendShipBehaviour(startPoint, rotation, game, selectBehaviour));
}

function launchAttackShip()
{
    var currentMainShipAttributes = new ShipAttributes;
    game.addEntity(new Drawable('bin/attack_ship.png', DrawableLayer.MIDDLE),
                new AttackShipBehaviour(startPoint, rotation, game, selectBehaviour, playerLaserTypes.Single));
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
    var enemyBase = spawnBase(false);
    for(var i in enemyBase)
    {
        game.getEntity(enemyBase[i]).element.setEnemy();
    }
    setInterval(function(){
        game.addEntity(new Drawable('bin/attack_ship.png', DrawableLayer.MIDDLE),new AiAttackShipBehaviour(new Phaser.Point(resolution.x - 150,300), 270, game, selectBehaviour, playerLaserTypes.Single));
    }, 4000);
    dropCoins();
}
else
{
    console.error("Invalid game mode");
}