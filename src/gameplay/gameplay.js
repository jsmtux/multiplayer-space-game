
window.ondragstart = function() { return false; };

var isServer = location.hash === "#server";


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

var scene = new Scene();
var game = new PhaserGame(scene, isServer, resolution, updateCallback);

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

if (isServer)
{
    game.addEntity(new Drawable('bin/base.png',true), new BaseBehaviour(new Phaser.Point(54,300), setBaseHealth));
    dropCoins();
}
else
{
    game.networkManager.onConnection = function()
    {
        game.addEntity(new Drawable('bin/base.png',true), new BaseBehaviour(new Phaser.Point(resolution.x - 54,300), setBaseHealth, 180));
    };
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
            value = 500;
            break;
    }
  
    var xpos = 200 + (resolution.x - 400) * Math.random();
    game.addEntity(new Drawable(path,true), new CoinBehaviour(new Phaser.Point(xpos,0), value, game));
    setTimeout(dropCoins, 2000 + Math.random()*4000);
}

priceAuxShipSpan.innerHTML = 150;

// Top level functions
function menuButtonSelection(name, id)
{
    var playerShipLaserSelection = document.getElementById(name);

    for(i=0; i<playerShipLaserSelection.childElementCount; i++) {
        if (id === i)
        {
            playerShipLaserSelection.children[i].className =  "active";
        }
        else
        {
            playerShipLaserSelection.children[i].className =  "";            
        }
    }
}

var prevShipId;

var currentMainShipAttributes = new MainShipAttributes;

var isPlayerShipConfOpened = false;
function openShipConf(divName)
{
    var ShipConfDiv = document.getElementById(divName);
    if (!isPlayerShipConfOpened)
    {
        ShipConfDiv.style.maxHeight = "200px";
        ShipConfDiv.style.height = "200px";
    }
    else
    {
        ShipConfDiv.style.maxHeight = "0px";
    }
    isPlayerShipConfOpened = !isPlayerShipConfOpened;
}

function playerShipLaserSelection(id)
{
    menuButtonSelection('playerShipLaserConf', id);
    currentMainShipAttributes.setLaserType(id);
    priceMainShipSpan.innerHTML = currentMainShipAttributes.shipValue;  
}

function playerShipShieldSelection(id)
{
    menuButtonSelection('playerShipShieldConf', id);
    currentMainShipAttributes.setShieldType(id);
    priceMainShipSpan.innerHTML = currentMainShipAttributes.shipValue;  
}

function addPlayerShip()
{
    if ((prevShipId === undefined || !game.getEntity(prevShipId) !== undefined) && playerMoney.checkAndSubstract(currentMainShipAttributes.shipValue))
    {
        if (isServer)
        {
            prevShipId = game.addEntity(new Drawable('bin/player.png'),
                new ShipBehaviour(new Phaser.Point(150,300), 270, game, onMoneyHit, currentMainShipAttributes));
        }
        else
        {
            prevShipId = game.addEntity(new Drawable('bin/player.png'),
                new ShipBehaviour(new Phaser.Point(resolution.x - 150,300), 90, game, onMoneyHit, currentMainShipAttributes));
        }
    }
}


var AuxShipBehaviourType = {
    'Random': 0,
    'Protect': 1,
    'Attack': 2
}
var auxShipBehaviourId = AuxShipBehaviourType.Random;
function auxShipBehaviourSelection(id)
{
    menuButtonSelection('auxShipBehaviourConf', id);
    auxShipBehaviourId = id;
}

function addShip(y)
{
    if (!playerMoney.checkAndSubstract(150))
    {
        return;
    }
    var rotation;
    var position;
    if (isServer)
    {
        rotation = 270;
        position = 0;
    }
    else
    {
        rotation = 90;
        position = resolution.x;
    }
    switch (auxShipBehaviourId)
    {
        case AuxShipBehaviourType.Random:
            game.addEntity(new Drawable('bin/enemy.png'), new AuxShipBehaviour(new Phaser.Point(position , 200), rotation, game));
            break;
        case AuxShipBehaviourType.Protect:
            game.addEntity(new Drawable('bin/enemy.png'), new ProtectAuxShipBehaviour(new Phaser.Point(position , 200), rotation, game));
            break;
        case AuxShipBehaviourType.Attack:
            game.addEntity(new Drawable('bin/enemy.png'), new AttackAuxShipBehaviour(new Phaser.Point(position , 200), rotation, game));
            break;
    }
}