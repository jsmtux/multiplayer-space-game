window.ondragstart = function() { return false; } 

var isServer = location.hash == "#server";


//HTML interaction
var baseHealthSpan = document.getElementById("baseHealth");
var enemyBaseHealthSpan = document.getElementById("enemyHealth");
var moneySpan = document.getElementById("money");
var priceMainShipSpan = document.getElementById("priceMainShip");
var priceAuxShipSpan = document.getElementById("priceAuxShip");

//\HTML interaction

var resolution = new Phaser.Point(1344, 648);
var scene = new Scene();
var game = new PhaserGame(scene, isServer, resolution);

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
function onMoneyHit()
{
    playerMoney.add(250);
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
    }
}

function dropCoins()
{
    var xpos = 200 + (resolution.x - 400) * Math.random();
    game.addEntity(new Drawable('bin/rock_1.png',true), new CoinBehaviour(new Phaser.Point(xpos,0), game));
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

function addShip(y)
{
    if (!playerMoney.checkAndSubstract(150))
    {
        return;
    }
    if (isServer)
    {
        game.addEntity(new Drawable('bin/enemy.png'), new EnemyShipBehaviour(new Phaser.Point(0 , 200), 270, game));        
    }
    else
    {
        game.addEntity(new Drawable('bin/enemy.png'), new EnemyShipBehaviour(new Phaser.Point(resolution.x , 200), 90, game));
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

function addPlayerShip()
{
    if ((prevShipId === undefined || !game.hasEntity(prevShipId)) && playerMoney.checkAndSubstract(currentMainShipAttributes.shipValue))
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
