/**
 * Emit.js - to make any js object an event emitter (server or browser)
 * 
 * based on Emit -> https://github.com/jeromeetienne/Emit.js
 * From Emit -> changed bind and unbind events to on and off, added one event
 */
this.Emit = G.Emit = (function(){

    var Emit = function() {};
    Emit.prototype = {
        on: function(event, fct)
        {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
            return {
                context:this,
                event:event,
                type:"on",
                callback: fct,
                makeOne: function()
                {
                    this.off();
                    var res = this.context.one(this.event, this.callback);
                    for(var i in res)
                    {
                        this[i] = res[i];
                    }    
                },
                off: function()
                {
                    this.context.off(this.event, this.callback);
                }
            };
        },
        one:function(event, fct)
        {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(["one", fct]);
            return {
                context:this,
                event:event,
                type:"off",
                callback: fct,
                makeOn: function()
                {
                    this.off();
                    var res = this.context.on(this.event, this.callback);
                    for(var i in res)
                    {
                        this[i] = res[i];
                    }    
                },
                off: function()
                {
                    this.context.off(this.event, this.callback);
                }
            };
        },
        off: function(event, fct)
        {
            this._events = this._events || {};
            if (event in this._events === false) return;
            //return if successfully spliced on event
            if(this._events[event].splice(this._events[event].indexOf(fct), 1).length > 0) return;
            //handle one events
            for (var i = 0; i < this._events[event].length; i++)
            {
                //if one, remove
                if(typeof this._events[event][i] === "object" && this._events[event][0] === "one" && this._events[event][i][1] === fct) 
                {
                    this._events[event].splice(this._events[event][i], 1);
                }
            }
            return this;
        },
        trigger: function(event /* , args... */ )
        {
            this._events = this._events || {};
            if (!this._events[event]) return;
            var responses = [];
            for (var i = 0; i < this._events[event].length; i++)
            {
                var res;
                //if one, remove
                if(this._events[event][i][0] === "one") 
                {
                    var fn = this._events[event][i][1];
                    this._events[event].splice(i, 1);
                    res = fn.apply(this, arguments[1]||undefined);
                }
                else res = this._events[event][i].apply(this, arguments[1]||undefined);
                responses.push(res);
            }
            return responses;
        }
    };

    /**
     * mixin will delegate all Emit.js function in the destination object
     *
     * - require('Emit').mixin(Foobar) will make Foobar able to use Emit
     *
     * @param {Object} the object which will support Emit
     */
    Emit.mixin = function(destObject)
    {
        var props = ['on', 'one', 'off', 'trigger'];
        for (var i = 0; i < props.length; i++)
        {
            if (typeof destObject === 'function')
            {
                destObject.prototype[props[i]] = Emit.prototype[props[i]];
            }
            else
            {
                destObject[props[i]] = Emit.prototype[props[i]];
            }
        }
    }

    return Emit;
})(G);