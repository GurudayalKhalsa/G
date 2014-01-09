/**
 * Emit.js - to make any js object an event emitter (server or browser)
 * 
 * based on MicroEvent -> https://github.com/jeromeetienne/microevent.js
 * From MicroEvent -> changed bind and unbind events to on and off, added one event
 */
! function(name, root, factory) {
    //expose module to either Node/CommonJS or AMD if available, and root object of choosing (e.g. Window)
    (typeof define === "function" && define.amd) ? define(function(){ return root.call(factory) }) : (typeof module === "object" && typeof module.exports === "object") ? module.exports = factory.call(root) : root[name] = factory.call(root)
}
("Emit", this, function() {

    var Emit = function() {};
    Emit.prototype = {
        on: function(event, fct)
        {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        },
        one:function(event, fct)
        {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(["one", fct]);
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
                if(typeof this._events[event][i] === "object") 
                {
                    res = this._events[event][i][1].apply(this, arguments[1]||undefined);
                    this._events[event].splice(this._events[event][i], 1);
                }
                else res = this._events[event][i].apply(this, arguments[1]||undefined);
                responses.push(res);
            }
            return responses;
        }
    };

    /**
     * mixin will delegate all MicroEvent.js function in the destination object
     *
     * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
     *
     * @param {Object} the object which will support MicroEvent
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
});