var playerLaserTypes = {
    'None': 0,
    'Single': 1,
    'Double': 2,
    'Triple': 3
};

function MainShipAttributes()
{
    this.shipValue = 0;
    this.laserType = playerLaserTypes.None;
}

MainShipAttributes.prototype.updateValue = function()
{
    this.shipValue = 0;
    switch(this.laserType)
    {
        case playerLaserTypes.Single:
            this.shipValue = 200;
            break;
        case playerLaserTypes.Double:
            this.shipValue = 500;
            break;
        case playerLaserTypes.Triple:
            this.shipValue = 1000;
            break;
    }      
};

MainShipAttributes.prototype.setLaserType = function(_type)
{
    this.laserType = _type;
    this.updateValue();
};
