
function Money(amount, div)
{
    this.current = amount;
    this.info_div = div;
    this.info_div.innerHTML = amount;
}

Money.prototype.get = function()
{
    return this.current;
};

Money.prototype.set = function(amount)
{
    this.current = amount;
    this.info_div.innerHTML = amount;
};

Money.prototype.checkAndSubstract = function(amount)
{
    var ret = false;
    if (this.current >= amount)
    {
        ret = true;
        this.set(this.current - amount);
    }
    return ret;
};

Money.prototype.add = function(amount)
{
    this.set(this.current + amount);
};


