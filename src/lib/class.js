// --------------------------------- \\
// JS Class method (from John Resig) \\
// --------------------------------- \\

(function()
{
    var initializing = false,
        fnTest = /xyz/.test(function()
        {
            xyz
        }) ? /\b_super\b/ : /.*/;
    this.Class = function(obj)
    {
        for (var i in obj) if(i !== "initialize")this[i] = obj[i];
        if(obj && obj.initialize) obj.initialize.apply(this);
    };
    this.Class.extend = function(prop)
    {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this;
        initializing = false;
        for (var name in prop)
        {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function(name, fn)
            {
                return function()
                {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret
                }
            }(name, prop[name]) : prop[name]
        }

        function Class()
        {
            if (!initializing && this.initialize) this.initialize.apply(this, arguments)
        }
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class
    }
}).call(G);