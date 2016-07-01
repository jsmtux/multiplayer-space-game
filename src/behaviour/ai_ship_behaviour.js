function AiAttackShipBehaviour(_position, _rotation, _game, _selectBehaviour, _laserType)
{
    AttackShipBehaviour.call(this, _position, _rotation, _game, _selectBehaviour, _laserType);
    this.setEnemy();
}

AiAttackShipBehaviour.prototype = Object.create(AttackShipBehaviour.prototype);
AiAttackShipBehaviour.prototype.constructor = AiAttackShipBehaviour;

AiAttackShipBehaviour.prototype.updateSpecificBehaviour = function(_game, _data, _selected)
{
    AttackShipBehaviour.prototype.updateSpecificBehaviour.call(this, _game, _data, _selected);
    var yPos = Math.random() * 500 + 100;
    this.setDestination(new Phaser.Point(200,yPos));
    this.shoot(_data, _game);
}
