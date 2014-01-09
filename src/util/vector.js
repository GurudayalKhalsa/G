//define a vector
G.Vector = function(x, y)
{
    this.x = typeof x === "number" ? x : 0;
    this.y = typeof y === "number" ? y : 0;
}

G.Vector.prototype.dot = function(v)
{
    return this.x * v.x + this.y * v.y;
};

G.Vector.prototype.length = function()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

G.Vector.prototype.normalize = function(num)
{
    var s = (num || 1) / this.length();
    this.x *= s;
    this.y *= s;
    return this;
};

G.Vector.prototype.add = function(x,y)
{
    if(!y && x instanceof G.Vector) { var vec = x; x = vec.x, y = vec.y; };
    if(x) this.x += x;
    if(y) this.y += y;
    return this;
}

G.Vector.prototype.plus = function()
{
    return this.add.apply(new G.Vector(this.x, this.y), arguments);
}

G.Vector.prototype.subtract = function(x,y)
{
    if(!y && x instanceof G.Vector) { var vec = x; x = vec.x, y = vec.y; };
    if(x) this.x -= x;
    if(y) this.y -= y;
    return this;
}

G.Vector.prototype.minus = function()
{
    return this.subtract.apply(new G.Vector(this.x, this.y), arguments);
}

G.Vector.prototype.multiply = function(s1, s2)
{
    if(s2) return new G.Vector(this.x * s1, this.y * s2);
    return new G.Vector(this.x * s1, this.y * s1);
};

G.Vector.prototype.divide = function(s1, s2)
{
    if(s2) return new G.Vector(this.x / s1, this.y / s2);
    return new G.Vector(this.x / s1, this.y / s1);
};

G.Vector.prototype.ceil = function()
{
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
}

G.Vector.prototype.floor = function()
{
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
}

G.Vector.prototype.round = function()
{
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
}

G.Vector.prototype.set = function(x,y)
{
    if(!y && x instanceof G.Vector) { var vec = x; x = vec.x, y = vec.y; };
    if(typeof x === "number") this.x = x;
    if(typeof y === "number") this.y = y;
    return this;
}
G.toVectors = function(vertices)
{
    if(vertices[0] && vertices[0] instanceof G.Vector) return vertices;
    vertices = vertices.map(function(val, i, arr){ if(i % 2 === 0) return new G.Vector(val, arr[i+1]) });
    for(var i = vertices.length; i > 0; i--) if(typeof vertices[i] === "undefined") vertices.splice(i,1);
    return vertices;
}