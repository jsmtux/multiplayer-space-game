var playerLaserTypes = {
    'None': 0,
    'Single': 1,
    'Double': 2,
    'Triple': 3
};

var playerShieldTypes = {
    'None': 0,
    'Normal': 1,
    'Extended': 2
};

function MainShipAttributes()
{
    this.shipValue = 0;
    this.laserType = playerLaserTypes.None;
    this.shieldType = playerShieldTypes.None;
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
    switch(this.shieldType)
    {
        case playerShieldTypes.Normal:
            this.shipValue += 2000;
            break;
        case playerShieldTypes.Extended:
            this.shipValue += 5000;
            break;
    }      
};

MainShipAttributes.prototype.setLaserType = function(_type)
{
    this.laserType = _type;
    this.updateValue();
};


MainShipAttributes.prototype.setShieldType = function(_type)
{
    this.shieldType = _type;
    this.updateValue();
};
