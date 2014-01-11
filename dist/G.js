/**
 * G 0.2, 2014-01-10
 * A fast, powerful and extendable HTML5 game framework
 *
 * Copyright (c) 2014 Gurudayal Khalsa, gurudayalkhalsa@gmail.com
 * Licensed MIT
 */
! function(name, root, factory) {
    //expose module to either Node/CommonJS or AMD if available, and root object of choosing (e.g. Window)
    (typeof define === "function" && define.amd) ? define(function(){ return root.call(factory) }) : (typeof module === "object" && typeof module.exports === "object") ? module.exports = factory.call(root) : root[name] = factory.call(root)
}
("G", this, function() {

var G = {};

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

 var Event = function(){

    var root = this;
    var self = root;

    var events = root.events = {
        move:['mousemove', 'touchmove'],
        down:['mousedown', 'touchstart'],
        up:['mouseup', 'touchend']        
    }

    function get(event)
    {
        //get element/s to listen to, callback function and useCapture
        var el = (arguments.length > 2 && typeof arguments[1] === "object") ? arguments[1] : window;
        var callback = arguments.length === 2 ? arguments[1] : (typeof arguments[1] === "function" ? arguments[1] : (typeof arguments[2] === "function" ? arguments[2] : arguments[3]));    
        var useCapture = false;
        for(var i = 0; i < arguments.length; i++) if(arguments[i] === true) useCapture = true;


        //handle errors
        if(typeof arguments[0] === "undefined") return false;
        if(typeof callback === "undefined") 
        {
            console.warn("No callback specified. Not listening for event.");   
            return false;
        }     
        if(typeof el.addEventListener === "undefined") 
        {
            console.warn("Invalid DOM object. Not listening for event.", arguments[1]);
            return false;
        }

        //sets to object that called this function, e.g. mouse, if undefined defaults to events declared at top
        var events = this.events || events;

        //handle if event/s in custom event map
        if(Array.isArray(event) || (typeof event === "string" && event.split(",").length > 1) || event in events)
        {
            if(typeof event === "string") event = event.split(",");
            for(var i = 0; i < event.length; i++)
            {
                if(event[i] in events) 
                {
                    var e = events[event[i]];

                    for(var j = 0; j < e.length; j++)
                    {
                        if(j === 0) event.splice(i, 1, e[j]);
                        else event.splice(i, 0, e[j]);
                    }
                }
            }
        }

        function run(func, type, event, el, callback, useCapture)
        {
            //handle single
            if(!Array.isArray(event) && (typeof event === "object" || (typeof event === "string" && event.split(",").length === 1)))
            {   
                function one(e)
                {
                    callback.apply(this, arguments);
                    el.removeEventListener(event, one);
                }
                if(type === "one") el[func](event, one, useCapture);
                else el[func](event, callback, useCapture);

                
            }

            //handle multiple
            else
            {
                if(typeof event === "string") event = event.split(",");
                for(var i = 0; i < event.length; i++)
                {
                    run(func, type, event[i], el, callback, useCapture);
                }
            }
        }

        return {
            run:run,
            el:el,
            callback:callback,
            event:event,
            useCapture:useCapture
        };
    }

    /**
     * @method on - Add an event listener - works for non-mouse event (any event that can be listened to from addEventListener)
     * @param event - the event type to listen to, e.g. mousedown. Can be string or array of strings
     * @param (Optional) element - the dom element to listen to events from. Defaults to root element if not specified
     * @param callback - the function to be called when the event is triggered. If no element, this should be the second parameter
     */
    root.on = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;
        
        obj.run("addEventListener", "on", obj.event, obj.el, obj.callback, obj.useCapture);
    }

    /**
     * @method one - Add an event listener that gets called only once
     * @param event - the event type to listen to, e.g. mousedown. Can be string or array of strings
     * @param (Optional) element - the dom element to listen to events from. Defaults to root element if not specified
     * @param callback - the function to be called when the event is triggered. If no element, this should be the second parameter
     */
    root.one = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;


        obj.run("addEventListener", "one", obj.event, obj.el, obj.callback, obj.useCapture);
    }

    /**
     * @method off - Removes an event listener
     * @param event - the event type to listen to, e.g. mousedown. Can be string or array of strings
     * @param (Optional) element - the dom element/s to remove events from. Can be element or array of Defaults to root element if not specified
     * @param callback - the function mapped to the event listener
     */
    root.off = function(event)
    {
        var obj = get.apply(this, arguments);
        if(!obj) return false;

        obj.run("removeEventListener", "off", obj.event, obj.el, obj.callback);
    }

    root.key = (function()
    {
        var Key = {};

        var root;

        Key.setRoot = function(r)
        {
            if(typeof r.addEventListener !== "function") console.warn("Invalid root, setting to window.");
            //Get root element to add event listeners to
            root = typeof r.addEventListener === "function" ? r : (typeof window.addEventListener === "function" ? window : "nosupport");
            //handle if browser doesn't support event listeners(old ie), or if no window (not in browser)
            if(typeof root === "undefined") throw new Error("Key must be run in a browser");
            if(root === "nosupport") throw new Error("Key must be run in a browser with support for addEventListener. IE8 and below, and similar old browsers are not supported.");
            return Key;
        };

        Key.setRoot(window);

        Key.separator = ",";

        var state = Key.state = 
        {
            up: {},
            down: {}
        };

        var map = Key.map = 
        {

        };

        var multipleModifiers = 
        {
            "shift":["⇧"],
            "alt":["option", "⌥"],
            "ctrl":navigator.userAgent.indexOf("Macintosh") !== -1 ? ["control", "⌃"] : ["control", "⌃", "meta"],
            "cmd":navigator.userAgent.indexOf("Macintosh") !== -1 ? ["command","⌘", "meta"] : ["command", "⌘"]
        };

        // modifier keys
        var modifierMap = 
        {
            "shiftKey":16,
            "altKey":18,
            "ctrlKey":17,
            "metaKey":navigator.userAgent.indexOf("Macintosh") !== -1 ? 91 : 18
        };
        
        // special keys
        var keyMap = 
        {
            16:["shift","⇧"],
            18:["alt","option","⌥"],
            17:["ctrl","control","⌃"],
            91:["cmd","command","⌘"],
            8: "backspace", 
            9: "tab", 
            12: "clear",
            13: "enter", 
            13: "return",
            27: "escape", 
            32: "space",
            37: "left", 
            38: "up",
            39: "right", 
            40: "down",
            46: "delete",
            36: "home", 
            35: "end",
            33: "pageup", 
            34: "pagedown",
            188: ",", 
            190: ".", 
            191: "/",
            192: "`", 
            189: "-",
            187: "=",
            186: ";", 
            222: "\'",
            219: "[", 
            221: "]", 
            220: "\\"
        };

        //set meta key based on OS (Cmd for mac, Ctrl for win/linux)
        // if(navigator.userAgent.indexOf("Macintosh") !== -1) keyMap[91].push("meta");
        // else keyMap[17].push("meta");

        /**
         * @method run - Starts the engine to record the state to Key.state
         */
        (function()
        {
            var thisRoot = root;

            //add event listeners, apply to Key.states
            var listeners = 
            {
                down:function(e)
                {
                    var key = Key.toString(e.keyCode);
                    if(!Array.isArray(key)) key = [key];

                    for(var i = 0; i < key.length; i++)
                    {
                        state.down[key[i]] = true;
                        state.up = {};
                    }
                    if(e.metaKey) state.down.meta = true;
                    
                },
                up:function(e)
                {
                    var key = Key.toString(e.keyCode);
                    if(!Array.isArray(key)) key = [key];

                    for(var i = 0; i < key.length; i++)
                    {
                        state.up[key[i]] = true;
                        delete state.down[key[i]];
                    }
                    if(!e.metaKey) delete state.down.meta;
                    //hack - when meta key is down and other keys are unpressed, other key unpress event is not triggered, so they are treated as down still
                    //this gets rid of all down keys when meta key is up
                    if(key[0] === "cmd" || key[0] === "ctrl") state.down = {};
                    setTimeout(function(){state.up = {}}, (G.stage?G.stage.deltaTime||1000/60:1000/60));
                }
            };

            
            //remove previous events if defined
            root.removeEventListener("keydown", listeners.down);
            root.removeEventListener("keyup", listeners.up);
            //add new events
            root.addEventListener("keydown", listeners.down, true);
            root.addEventListener("keyup", listeners.up, true);

            return Key;
        })();

        Key.toString = function(code)
        {
            var stringKey = String.fromCharCode(code);
            if(stringKey && (!keyMap[code])) var key = stringKey.toLowerCase();
            else var key = keyMap[code];
            return key;
        }

        function flatten(array)
        {
            var flat = [];
            for (var i = 0, l = array.length; i < l; i++){
                var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
                if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]); }
            }
            return flat;
        }

        function removeUndefined(arr)
        {
            var n = [];
            for(var i in arr) if(arr[i] !== undefined) n.push(arr[i]);
            return n;
        }

        function contains(arr, str)
        {
            if(Array.isArray(str)) 
            {
                for(var i = 0; i < str.length; i++) if(contains(arr, str[i])) return true;
                return false;
            }
            else
            {
                return Array.isArray(arr) ? flatten(arr).indexOf(str) !== -1 : (arr[str] ? true : false);
            }
        }

        function process(key, type, e)
        {
            //if no key to process, return, assigning enkeys to currently down/up depending on type
            if(!key)
            {
                if(e)
                {
                    var keys = [];

                    var multiples = [keyMap[modifierMap["metaKey"]],keyMap[modifierMap["ctrlKey"]],keyMap[modifierMap["shiftKey"]],keyMap[18]];

                    //prevent multiple of same key from being in e.keys, e.g. if cmd+a pressed, have keys be cmd+a instead of cmd+command+⌘+meta+a
                    if( !contains(state[type], multiples) && !("meta" in state[type]) ) for(var i in state[type]) keys.push(i);
                    else 
                    {
                        for(var i in multiples) if(contains(state[type], multiples[i]) && !contains(keys, multiples[i])) { keys.push(multiples[i][0]);} 
                        for(var i in state[type])  if(!contains([multiples, "meta"], i)) keys.push(i); 
                    }
                
                    e.keys = keys.join("+");
                }
                return true;
            }

            //split comma-separated into multiple
            var keys = typeof key === "string" ? key.split(Key.separator) : key;
            
            //split plus-separated into multiple inside parent multiple
            for(var i = 0; i < keys.length; i++) if(keys[i].split("+").length>1) keys[i] = keys[i].split("+");

            //recursively narrow down to one key
            if(keys.length > 1)
            {
                for(var i = 0; i < keys.length; i++) if(is(keys[i])) return true;
                return false;
            }

            else return is(keys[0]);

            function is(key, m)
            {
                //convert custom user-defined map keys (if defined) to keyboard keys
                if(!m && map[key])
                {          
                    function convert(key)
                    {
                        var nKey = [];
                        if(Array.isArray(map[key])) _.each(map[key], function(val){ nKey.push(val) });
                        else if(typeof map[key] === "string") nKey.push(map[key]);
                        if(nKey.length !== 0) key = nKey;
                        return key;
                    }   

                    if(!Array.isArray(key)) key = convert(key);
                    else key = key.map(function(val, key){ return convert(val) });

                    if(Array.isArray(key))
                    {
                        for(var i = 0; i < key.length; i++)
                        {
                            if(Array.isArray(key[i])){ for(var j = 0; j < key[i].length; j++) if(is(key[i][j], true)) return true;}
                            else if(is(key[i], true)) return true;
                        }

                        return false;
                    }
                }

                //get all values of current state type, and add to event keys
                if(e) e.keys = removeUndefined(Object.keys(state[type]).map(function(key){ for(var k in multipleModifiers){ if(multipleModifiers[k].indexOf(key) !== -1) return undefined; } return key; })).join("+");

                //do not trigger if the key/s specified does not contain a modifier key, yet a modifier key is down/up
                if(e && (e.metaKey || e.ctrlKey || e.shiftKey) && !contains(key, [keyMap[modifierMap["metaKey"]],keyMap[modifierMap["ctrlKey"]],keyMap[modifierMap["shiftKey"]]])) return false;
                
                //do not trigger if meta key down and the other key down is not key specified to check for
                //needed because when meta + other key are down, when other key is unpressed while meta key is still down, keyup event not called for that unpressing
                if(e && e.metaKey && contains(key, keyMap[modifierMap["metaKey"]]) && !contains(key, Key.toString(e.keyCode))) return false;
                
                //determine if key or keys are down/up based on state.down/up
                if(Array.isArray(key) && key.length === 1) return is(key[0]);
                
                else if(typeof key === "string" && (!e || (Key.toString(e.keyCode) === key))) 
                {
                    return key in state[type];
                }
                
                else if(typeof key === "string" && (Key.toString(e.keyCode) !== key))
                {
                    return false;
                }

                else if(Array.isArray(key))
                {
                    for(var i = 0; i < key.length; i++) if(!(key[i] in state[type])) return false;
                }
                
                return true;
            }
        }

        Key.isDown = function(key, e) { return process(key, "down", e); }
        Key.isUp = function(key, e) { return process(key, "up", e); }

        Key.on = function(key, callback)
        {

            //process both events if down and up events separated by comma
            if(key.indexOf("keydown") !== -1 && key.indexOf("keyup") !== -1)
            {
                var up = "keyup"+key.split(Key.separator+"keyup")[1];
                var down = key.split(Key.separator+"keyup")[0];
                if(typeof up === "string") Key.on(up, callback);
                if(typeof down === "string") Key.on(down, callback);
            }
            else
            {
                var type = key.split(":").length === 1 ? (key === "keyup" ? "keyup" : "keydown") : key.split(":")[0];
                var keys = key.split(":").length > 1 ? key.split(":")[1] : (key === "keydown" || key === "keyup" ? false : key);
                root.addEventListener(type, function(e)
                {
                    var triggered = type === "keydown" ? Key.isDown(keys, e) : Key.isUp(keys, e);
                    if(triggered) callback(e);
                });
            }
            
        }

        Key.one = function(key, callback)
        {
            //process both events if down and up events separated by comma
            if(key.indexOf("keydown") !== -1 && key.indexOf("keyup") !== -1)
            {
                var up = "keyup"+key.split(Key.separator+"keyup")[1];
                var down = key.split(Key.separator+"keyup")[0];
                if(typeof up === "string") Key.on(up, callback);
                if(typeof down === "string") Key.on(down, callback);
            }
            else
            {
                var type = key.split(":").length === 1 ? "keydown" : key.split(":")[0];
                var keys = key.split(":").length > 1 ? key.split(":")[1] : (key === "keydown" || key === "keyup" ? false : key);
                root.addEventListener(type, func);
                function func(e)
                {
                    var triggered = type === "keydown" ? Key.isDown(keys, e) : Key.isUp(keys, e);
                    if(triggered) 
                    {
                        callback(e);
                        root.removeEventListener(type, func);
                    }
                }
            }
        }

        Key.off = function(type, callback)
        {
            root.removeEventListener(type, callback);
        }

        return Key;
    })();

    root.mouse = (function()
    {
        var Mouse = {};

        var root;

        Mouse.setRoot = function(r)
        {
            if(typeof r === "undefined" || typeof r.addEventListener !== "function") console.warn("Invalid root, setting to window.");
            //Get root element to add event listeners to
            root = (typeof r !== "undefined" && typeof r.addEventListener === "function") ? r : (typeof window.addEventListener === "function" ? window : "nosupport");
            //handle if browser doesn't support event listeners(old ie), or if no window (not in browser)
            if(typeof root === "undefined") throw new Error("Mouse must be run in a browser");
            if(root === "nosupport") throw new Error("Mouse must be run in a browser with support for addEventListener. IE8 and below, and similar old browsers are not supported.");
            return Mouse;
        };

        Mouse.setRoot(window);
        Mouse.root = root;

        Mouse.state = {
           moving: false,
           down: false,
           up: true,
           left:false,
           right:false,
           x:0,
           y:0,
           pos:{
              x:0,
              y:0,
              window:{
                  x:0,
                  y:0
              },
              screen:{
                  x:0,
                  y:0
              },
              last:{
                  x:0,
                  y:0,
                  window:{
                      x:0,
                      y:0
                  },
                  down:{
                      x:0,
                      y:0,
                      window:{
                          x:0,
                          y:0
                      }
                  },
                  up:{
                      x:0,
                      y:0,
                      window:{
                          x:0,
                          y:0
                      },
                  }
              },
              
           },
        };

        Mouse.events = {
           move:['mousemove', 'touchmove'],
           down:['mousedown', 'touchstart'],
           up:['mouseup', 'touchend']        
       };

        var initialMouseEvents = {
            move:['mousemove', 'touchmove'],
            down:['mousedown', 'touchstart'],
            up:['mouseup', 'touchend']        
        };

        Mouse.onlyTouch = function()
        {
            initialMouseEvents.move = ['touchmove'];
            initialMouseEvents.down = ['touchstart'];
            initialMouseEvents.up = ['touchend'];
            return Mouse;
        };

        Mouse.onlyMouse = function()
        {
            initialMouseEvents.move = ['mousemove'];
            initialMouseEvents.down = ['mousedown'];
            initialMouseEvents.up = ['mouseup'];
            return Mouse;
        };

        function getOffset(obj) 
        {
            try { var box = obj.getBoundingClientRect() }
            catch(e) { throw new Error("Invalid DOM Element") };

            var left = box.left;
            var top = box.top;

            return [left, top];
        }

        /**
         * @method run - Starts the engine to record the state to Mouse.state
         * @param rejections - an array of event types to not listen to. Can be mousemove, touchmove, mousedown, touchstart, mouseup, touchend
         */
        Mouse.run = function(rejections)
        {
            var thisRoot = root;
            if(typeof rejections === "string") rejections = rejections.split(",");
            var rejections = typeof rejections === "object" ? rejections : [];

            //add event listeners, apply to Mouse.states
            var state = Mouse.state;

            var listeners = {
                init:function(e)
                {
                    //if root was changed
                    if(thisRoot !== root || rejections.indexOf(e.type) !== -1) return false;

                    //right click / mousedown
                    if (e.which === 3 || e.button === 2) state.right = true;
                    else state.left = true;

                    if(e.changedTouches && e.changedTouches[0])
                    {
                        var x = e.changedTouches[0].clientX;
                        var y = e.changedTouches[0].clientY;
                    }

                    else
                    {
                        var x = e.clientX;
                        var y = e.clientY;
                    }

                    state.pos.last.window.x = state.pos.window.x;
                    state.pos.last.window.y = state.pos.window.y;

                    state.pos.window.x = x;
                    state.pos.window.y = y;

                    if(root !== window)
                    {
                       var offset = getOffset(root);
                        x = x - offset[0];
                        y = y - offset[1];                        
                    }

                    //prevent duplicate events from messing up last values
                    if(state.x === x && state.y === y) return false;

                    state.pos.last.x = state.x;
                    state.pos.last.y = state.y;

                    state.x = state.pos.x = x;
                    state.y = state.pos.y = y;

                    state.pos.screen.x = e.screenX;
                    state.pos.screen.y = e.screenY;

                    return true;
                },
                move: function(e)
                {
                    //call init method. if root has changed, remove old root's event listener
                    if(!listeners.init(e)) thisRoot.removeEventListener(e.type, listeners.move);
                    
                    state.moving = true;

                    var time = 20;

                    //set moving to false after specified time in ms
                    setTimeout(function() { if(state.moving)state.moving = false; }, time);
                },
                down:function(e)
                {
                    state.right = false;
                    state.left = false;
                    
                    //call init method. if root has changed, remove old root's event listener
                    if(!listeners.init(e)) thisRoot.removeEventListener(e.type, listeners.down);
                    
                    state.down = true;
                    state.up = false;
                    state.pos.last.down.x = state.x;
                    state.pos.last.down.y = state.y;
                    state.pos.last.down.window.x = state.pos.window.x;
                    state.pos.last.down.window.y = state.pos.window.y;
                },
                up:function(e)
                {
                    //call init method. if root has changed, remove old root's event listener
                    if(!listeners.init(e)) thisRoot.removeEventListener(e.type, listeners.up);
                    
                    state.down = false;
                    state.up = true;
                    state.pos.last.up.x = state.x;
                    state.pos.last.up.y = state.y;
                    state.pos.last.down.window.x = state.pos.window.x;
                    state.pos.last.down.window.y = state.pos.window.y;
                }
            };

            for(var name in initialMouseEvents)
            {
                for(var j in initialMouseEvents[name])
                {
                    //remove previous events if defined
                    root.removeEventListener(initialMouseEvents[name][j], listeners[name]);
                    //add new events
                    root.addEventListener(initialMouseEvents[name][j], listeners[name], true);
                }
            }

            return Mouse;
        };

        //sets root element as DOM element to listen to events from
        function getArgs(args)
        {
            Array.prototype.splice.call(args,1,0,root);
            return args;
        }

        Mouse.on = function(){ self.on.apply(Mouse, getArgs(arguments)); return Mouse; };
        Mouse.one = function(){ self.one.apply(Mouse, getArgs(arguments)); return Mouse; };
        Mouse.off = function(){ self.off.apply(Mouse, getArgs(arguments)); return Mouse; };

        return Mouse;
  
    })();
};


// ---------------------- \\
// Array.indexOf polyfill \\
// ---------------------- \\

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var i, m;
        pivot = fromIndex ? fromIndex : 0, length;
        if (!this) {
            throw new TypeError
        }
        length = this.length;
        if (length === 0 || pivot >= length) {
            return -1
        }
        if (pivot < 0) {
            pivot = length - Math.abs(pivot)
        }
        for (i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i
            }
        }
        return -1
    }
}


// ------------------------------ \\
// requestAnimationFrame polyfill \\
// ------------------------------ \\

(function() {
    var lastTime = 0;
    var vendors = ["webkit", "moz"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = (new Date).getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime +
                timeToCall)
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id)
    }
})();

// -------------------- \\
// Object.keys Polyfill \\
// -------------------- \\

Object.keys = Object.keys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj)
        if (Object.prototype.hasOwnProperty.call(obj, key)(obj, key)) keys.push(key);
    return keys;
};

//math average (not polyfill)
Math.avg = Math.avg || function()
{
    var sum = 0;
    for(var i in arguments) sum += arguments[i];
    return sum/arguments.length;
}

// ---------------------- \\
// Stats.js FPS Benchmark \\
// ---------------------- \\

/* 
  http://github.com/mrdoob/stats.js

  API:

initialize: 

    var stats=new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.cssText="padding:3px;z-index:100;position:absolute;left:0;top:0;cursor:pointer;background-color:#fff;font: 12px 'Helvetica Neue', Helvetica, Arial, sans-serif;";

Every Frame:

    stats.update();

*/
var Stats = function()
{
    var a = Date.now(),
        b = a,
        c = 0,
        d = 1 / 0,
        e = 0,
        f = 0,
        g = 1 / 0,
        h = 0,
        i = 0,
        j = 0,
        k = document.createElement("div");
    k.id = "stats", k.addEventListener("mousedown", function(a)
    {
        a.preventDefault(), p(++j % 2)
    }, !1), k.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var l = document.createElement("div");
    l.id = "fps", k.appendChild(l);
    var m = document.createElement("div");
    m.id = "fpsText", m.innerHTML = "FPS", l.appendChild(m);
    var n = document.createElement("div");
    n.id = "ms", n.style.cssText = "display:none", k.appendChild(n);
    var o = document.createElement("div");
    o.id = "msText", o.innerHTML = "MS", n.appendChild(o);
    var p = function(a)
    {
        switch (j = a)
        {
            case 0:
                l.style.display = "block", n.style.display = "none";
                break;
            case 1:
                l.style.display = "none", n.style.display = "block"
        }
    };
    return {
        REVISION: 11,
        domElement: k,
        setMode: p,
        begin: function()
        {
            a = Date.now()
        },
        end: function()
        {
            var j = Date.now();
            return c = j - a, d = Math.min(d, c), e = Math.max(e, c), o.textContent = c + " MS (" + d + "-" + e + ")", i++, j > b + 1e3 && (f = Math.round(1e3 * i / (j - b)), g = Math.min(g, f), h = Math.max(h, f), m.textContent = f + " FPS (" + g + "-" + h + ")", b = j, i = 0), j
        },
        update: function()
        {
            a = this.end()
        }
    }
};

//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  if(root._) return root._;

  var breaker = {};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  _.each = function(obj, iterator, context) {
    if (obj == null) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  _.flatten = function(array)
  {
      var flat = [];
      for (var i = 0, l = array.length; i < l; i++){
          var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
          if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]); }
      }
      return flat;
  }

  _.contains = function(arr, str)
  {
      if(Array.isArray(str)) 
      {
          for(var i = 0; i < str.length; i++) if(contains(arr, str[i])) return true;
          return false;
      }
      else
      {
          return Array.isArray(arr) ? flatten(arr).indexOf(str) !== -1 : (arr[str] ? true : false);
      }
  }

  _.clone = function(obj)
  {
    if(obj instanceof Array) return obj.slice(0);
    return _.extend({}, obj);
  }

  // Object Functions
  // ----------------

  // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = Object.keys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    _.each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
    var eq = function(a, b, aStack, bStack) {
      // Identical objects are equal. `0 === -0`, but they aren't identical.
      // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
      if (a === b) return a !== 0 || 1 / a == 1 / b;
      // A strict comparison is necessary because `null == undefined`.
      if (a == null || b == null) return a === b;
      // Unwrap any wrapped objects.
      if (a instanceof _) a = a._wrapped;
      if (b instanceof _) b = b._wrapped;
      // Compare `[[Class]]` names.
      var className = toString.call(a);
      if (className != toString.call(b)) return false;
      switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return a == String(b);
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
          // other numeric values.
          return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
          return a.source == b.source &&
                 a.global == b.global &&
                 a.multiline == b.multiline &&
                 a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != 'object' || typeof b != 'object') return false;
      // Assume equality for cyclic structures. The algorithm for detecting cyclic
      // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      var length = aStack.length;
      while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a) return bStack[length] == b;
      }
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Add the first object to the stack of traversed objects.
      aStack.push(a);
      bStack.push(b);
      var size = 0, result = true;
      // Recursively compare objects and arrays.
      if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
          // Deep compare the contents, ignoring non-numeric properties.
          while (size--) {
            if (!(result = eq(a[size], b[size], aStack, bStack))) break;
          }
        }
      } else {
        // Deep compare objects.
        for (var key in a) {
          if (_.has(a, key)) {
            // Count the expected number of properties.
            size++;
            // Deep compare each member.
            if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
          }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
          for (key in b) {
            if (_.has(b, key) && !(size--)) break;
          }
          result = !size;
        }
      }
      // Remove the first object from the stack of traversed objects.
      aStack.pop();
      bStack.pop();
      return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
      return eq(a, b, [], []);
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function(obj) {
      var copy = {};
      var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
      for (var key in obj) {
        if (!_.contains(keys, key)) copy[key] = obj[key];
      }
      return copy;
    };

}).call(this);


//Object Module
//-------------


G.Object = G.Class.extend({

    initialize:function(obj, defaults)
    {
        this.mergeValues(obj, defaults);

        if(this.addToStage !== false) this.add(this.addToCollection);
        delete this.addToCollection;
        delete this.addToStage;
    },

    mergeValues:function(obj, defaults)
    {        
        //exit if nothing to merge
        if(!obj && !defaults) return;

        //prevent sub-objects from being modified if obj used again (e.g. if an object is used to create a shape, and that objects's pos is changed afterwards, this shape's ops would normally be that obj's pos. prevent that)
        //this also get's rid of functions... consider changing to allow functions?
        obj = JSON.parse(JSON.stringify(obj));
        // defaults = JSON.parse(JSON.stringify(defaults||{}));

        var rootDefaults = {collections:[],events:true};
        var params = rootDefaults;

        //merge custom defauts with root defaults if custom defaults exist
        var defaults = defaults || {};
        //deep extend
        params = _.extend(params, defaults, obj);

        for (var param in params) 
        {
            if(typeof obj[param] !== "undefined") 
            {
                //if current parameter is an object, set all of params[param]'s keys that are in obj[params] keys to obj[param]'s key
                if(typeof obj[param] === "object" && typeof params[param] === "object")
                {
                    for(var key in obj[param]) 
                    {
                        params[param][key] = obj[param][key]; 
                    }
                }
                else params[param]=obj[param];
            }
            //Sets this.param to vector of param if object literal such as {x:0,y:0}
            if(typeof params[param] === "object" && params[param].x && params[param].y && _.keys(params[param]).length===2 ) this[param] = new G.Vector(params[param].x,params[param].y);
            else this[param] = params[param];
        }
    },

    add:function(collection)
    {        
        if(collection === false) return false;

        if(collection && collection instanceof G.Collection) 
        {
            var id = collection.add(this);
            if(typeof id === "number") 
            {
                if(this.events) this.trigger("add", collection);
                if(collection.addToObjectCollections !== false && this.collections.indexOf(collection) === -1) this.collections.push(collection);
            }
        }

        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var id = collection.add(this);
                if(typeof id === "number") 
                {
                    if(this.events) this.trigger("add", collection);
                }
            }, this);
        }

        if(G.stage && this.addToStage !== false && G.stages.length === 1) 
        {
            var id = G.stage.add(this);
            if(typeof id === "number" && this.events) 
            {
                if(this.events) this.trigger("add", G.stage);  
                if(G.stage.addToObjectCollections !== false && this.collections.indexOf(G.stage) === -1) this.collections.push(G.stage);
            }              
            if(typeof id !== "undefined") this.stageId = id; 
        }            
    },

    remove:function(collection)
    {        
        var self = this;  
        //delete collection specified if specified
        if(collection && collection instanceof G.Collection)
        {
            var success = collection.remove(this);
            if(typeof success === "number" && this.events) this.trigger("remove", collection);
        }

        //delete all collections this shape belongs to
        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var success = collection.remove(self);
                if(typeof success === "number" && self.events) self.trigger("remove", collection);

            });
        }

        //delete this shape from the root stage
        if(!collection && this.stage) 
        {
            var success = this.stage.remove(this);
            if(typeof success === "number" && this.events) this.trigger("remove", this.stage);
        }

    },

    set:function(key, val)
    {
        var self = this;
        //handle of object passed in, set all keys in that object
        if(typeof key === "object") { _.each(arguments[0], function(val, key){ self.set(key, val) }); return; }

        var current = this[key];
        if((typeof val !== "object" && val !== current) || (typeof val === "object" && !_.isEqual(current, val)) )
        {
            if(typeof val === "object") this[key] = _.extend(current, val);
            else this[key] = val;

            if(this.events)
            {
                this.trigger("change", [current, key]);
                this.trigger("change:"+key, [current, key]);
                for(var i = 0; i < this.colections.length; i++) 
                { 
                    if(this.collections[i].events)
                    {
                        this.collections[i].trigger("change:any", [current, key]); 
                        this.collections[i].trigger("change:"+key, [current, key]);
                    }
                };
            }

            return current;
        }
        return false;
    },

    get:function(name)
    {
        if(typeof this[name] === "undefined") return false;
        if(typeof this[name] === "object") return _.clone(obj);
        return this[name];
    }
});


/**
 * [poop description]
 * @param  {[type]} arg
 * @return {[type]}
 */

G.Camera=G.Class.extend
({
    initialize:function(obj)
    {
        if(obj.stage) this.stage = obj.stage;
        else this.stage = G.stage;
        //assign parameters based on defaults and passed in object
        var params = {pos:new G.Vector(),vel:{x:0,y:0},scrollRatio:{x:2,y:2},focus:0,frame:{left:0,right:this.stage.width,top:0,bottom:this.stage.height},bounds:{left:0,right:this.stage.width,top:0,bottom:this.stage.height}};
        for (i in params) this[i] = params[i];
        for (i in obj) this[i] = obj[i];
    },

    translate:function()
    {
        this.trigger("update");

        if(this.focus && this.focus.pos)
        {
            //find new camera coordinates based on focus's position
            this.pos.x=this.focus.pos.x-this.frame.right/this.scrollRatio.x;
            this.pos.y=this.focus.pos.y-this.frame.bottom/this.scrollRatio.y;
        }
        //if camera is before start or after end of level bounds, make it stop at start or end

        //make sure to stop translating if gone over level bounds
        if(typeof this.bounds.left === "number" && this.pos.x+this.frame.left < this.bounds.left) this.pos.x = this.bounds.left;
        if(typeof this.bounds.top === "number" && this.pos.y+this.frame.top < this.bounds.top) this.pos.y = this.bounds.top;
        if(typeof this.bounds.right === "number" && this.pos.x+this.frame.right > this.bounds.right) this.pos.x = this.bounds.right-this.frame.right;
        if(typeof this.bounds.bottom === "number" && this.pos.y+this.frame.bottom > this.bounds.bottom) this.pos.y = this.bounds.bottom-this.frame.bottom;
    
        var ctx = (this.stage ? this.stage.ctx : (this.focus ? (this.focus.stage ? this.focus.stage.ctx : false) : (G.stage ? G.stage.ctx : false)));
        if(!ctx) return false;
        //apply translation of canvas to simulate camera
        ctx.translate(-this.pos.x,-this.pos.y);
    },

    resetTranslation:function()
    {
        var ctx = (this.stage ? this.stage.ctx : (this.focus ? (this.focus.stage ? this.focus.stage.ctx : false) : (G.stage ? G.stage.ctx : false)));
        if(!ctx) return false;
        //reset translation of
        ctx.translate(this.pos.x,this.pos.y);
    }
});


//Collection Module
//-----------------

G.Collection = G.Class.extend({
    initialize:function(addToCollections, addToObjectCollections, addPhysics)
    {
        this.objects = [];
        this._currentId = 0;
        this._length = 0;
        this._visibleHashEnabled = false;

        this.addToCollections = typeof addToCollections === "boolean" ? addToCollections : ((typeof addToCollections === "object" && typeof addToCollections.addToCollections === "boolean") ? addToCollections.addToCollections : true);
        this.addToObjectCollections = typeof addToObjectCollections === "boolean" ? addToObjectCollections : ((typeof addToSCollections === "object" && typeof addToCollections.addToObjectCollections === "boolean") ? addToCollections.addToObjectCollections : true);
        this.add.apply(this, arguments);
        if(this.addToCollections !== false) 
        {
            G.collections.push(this);
            this._initLoader();
        }

        this.events = true;
        var obj = this.addToCollections;
        if(obj && typeof obj.events !== "undefined" && !obj.events) this.events = false;

        if(addPhysics || typeof this.addToCollections === "object" && this.addToCollections.physics)
        {
            this.physics = true;
            this.world = new G.Physics.World(addToCollections);
        }
    },

    //trigger load when all images in stage have been loaded
    _initLoader:function()
    {
        var self = this;
        var assets = new G.Collection(false, false), loaded = new G.Collection(false, false), loading = new G.Collection(false, false);
        this.loaded = true;

        this.on('add', function(shape)
        {            
            if(shape.src) 
            {
                assets.add(shape);
                if(!shape.loaded) 
                {
                    self.loaded = false;
                    loading.add(shape);
                    shape.on('load', function()
                    { 
                        loading.remove(shape);
                        loaded.add(shape);
                        checkLoaded(shape) 
                    });
                }
                else loaded.add(shape);
                
                checkLoaded(shape);
            }
        });

        function checkLoaded(shape)
        {
            if(assets.length() === loaded.length()) 
            {
                self.loaded = true;
                if(self.events) self.trigger('load', [assets]);
                if(self === G.stage && G.events) G.trigger('load', [assets]);
            }
            else 
            {
                if(self.events) self.trigger('loading', [loading, loaded, assets]);                
                if(self === G.stage && G.events) G.trigger('loading', [loading, loaded, assets]);
            }
        }
    },

    config:function(obj)
    {
        if(typeof obj !== "object") return false;

        //physics
        if(obj.physics) 
        {
            if(obj.physics) 
            {
                if(!this.world) this.world = new G.Physics.World(obj.physics);
                else this.world.config(obj.Physics);
            }
        }
    },

    update:function()
    {
        if((this.world && ((this !== G.stage && this.physics) || (this === G.stage && G.physics && this.physics)))) this.world.update();
        //prevent update from being called more than once
        else if(this.get(0) && !(this.get(0).stage && this.get(0).stage.world))
        {
            this.each(function(shape)
            {
                if(shape.update) shape.update();
            });
        }
        return this;
    },

    render:function()
    {
        if(this.isPaused) return;

        var self = this;

        if(self.events) self.trigger("render");

        //retrieve all visible shapes, very efficient if thousands of static shapes
        //only enabled if stage._visibleHashEnabled is set to true
        if(this.visibleHash && this._visibleHashEnabled)
        {
            this.visibleHash.moving.clear().insert(this.visibleHash.moving.shapes);
            var obj = {};
            if(this.visibleHash.stage.camera) 
            {
                var camera = this.visibleHash.stage.camera;
                obj.bounds = function(){
                return {
                    top:camera.pos.y-camera.frame.top,
                    left:camera.pos.x-camera.frame.left,
                    bottom:camera.pos.y+camera.frame.bottom,
                    right:camera.pos.x+camera.frame.right
                }};
            }
            else 
            {
                obj.bounds = function(){
                return {
                    top:0,
                    left:0,
                    bottom:self.visibleHash.stage.height,
                    right:self.visibleHash.stage.width
                }};
            }

            _.each(this.visibleHash.static.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type !== "static") 
                {
                    _.each(self.visibleHash.static.retrieve(), function(shape)
                    {
                        if(shape.type === "static") return;
                        self.visibleHash.static.remove(shape);
                        self.visibleHash.moving.insert(shape); 
                        self.visibleHash.moving.shapes.push(shape);
                    });
                }
                if(self.events) self.trigger("renderShape", [shape]);
                shape.render();
            });

            _.each(this.visibleHash.moving.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type === "static") 
                {
                    _.each(self.visibleHash.moving.retrieve(), function(shape)
                    {
                        if(shape.type !== "static") return;
                        self.visibleHash.moving.remove(shape); 
                        var index = self.visibleHash.moving.shapes.indexOf(shape);
                        if(index !== -1) self.visibleHash.moving.shapes.splice(index, 1);
                        self.visibleHash.static.insert(shape);
                    });
                }
                if(self.events) self.trigger("renderShape", [shape]);
                shape.render();
            });
            return this;
        }

        //draw and update all objects in stage
        for(var i = 0; i < this.objects.length; i++)
        {
            var shape = this.objects[i];
            if(!(shape instanceof G.Shape)) continue;
            if(self.events) self.trigger("renderShape", [shape]);
            shape.render();
        }
        return this;
    },

    add:function(object)
    {
        var self = this;
        //if multiple in arguments
        if(arguments.length > 1)
        {
            for(var i = 0; i < arguments.length; i++)
            {
                if(arguments[i] instanceof Array || arguments[i] instanceof G.Object) this.add(arguments[i]);
            }
        }
        //if passing in array of objects
        else if(object instanceof Array)
        {
            for(var i = 0; i < object.length; i++)
            {
                if(object[i] instanceof G.Object) this.add(object[i]);
            }
        }

        else if(object instanceof G.Collection) object.each(function(obj){self.add(obj)});
        
        else
        {
            if(!(object instanceof G.Object)) return false;

            if(this.world && this.physics !== false) this.world.add(object);

            if(this.has(object)) 
            {
                // console.warn("Warning: " + object.object + " already in collection. Not re-adding." )
                return false;
            }

            if(!(object instanceof G.Object)) return false;

            var id = this._currentId;

            this.objects[id] = object;
            this._currentId++;
            this._length = this._length+1;  

            //add to visible visibleHash
            if(this._visibleHashEnabled && (this.canvas || (this.get(0) && this.get(0).stage && this.get(0).stage.canvas)) && object instanceof G.Shape)
            {
                this.addToVisibleHash(object);
            }

            //add to object's collections if necessary
            if(object.collections && this.addToObjectCollections !== false && object.collections.indexOf(this)===-1) object.collections.push(this);

            //set object's stage to this if this is stage
            if(this instanceof G.Stage) object.stage = this;

            if(this.events) this.trigger("add", arguments);
            if(this.events) this.trigger("change", arguments);

            return id;        
        }
    },

    remove:function(object, fromObject)
    {
        if(this.length() === 0) return false;
        //if index, get object
        if(typeof object === "number") object = this.get(object);

        //exit if object not in objects
        if(object instanceof G.Object && !this.has(object)) return false;

        //remove all if no object specified
        var self = this;
        if(!object || typeof object === "boolean") 
        {
            var index = 0;
            var objects = [];
            this.each(function(object)
            {
                objects.push(object);
                self.remove(object);
                //force removal
                if(object) object.remove();
            });
            return objects;
        }

        if(this.world && this.physics !== false) this.world.remove(object);

        var index = this.getId(object);

        if(this.events) this.trigger("remove", arguments);
        if(this.events) this.trigger("change", arguments);

        delete this.objects[index];
        this._length = this._length-1;

        //remove from visible visibleHash
        if(this.enableVisibleHash && object instanceof G.Shape && this.visibleHash)
        {
            this.removeFromVisibleHash(object);
        }

        //handle collections and stage removal if necessary
        if(!object.collections || (object.collections && object.collections.length === 0)) return object;

        //remove current collection from object's collection list
        var index = object.collections.indexOf(this);
        if(index !== -1)
        {
            object.collections.splice(index, 1);
            if(!fromObject && object.events) object.trigger("remove", this);
        }
        //remove object from all of its collections if this is root stage
        if(this === G.stage || this.queryParent === G.stage) object.remove();

        return object;
    },

    addToVisibleHash:function(object)
    {
        var stage = this.canvas ? this : this.get(0).stage;
        var canvas = stage.canvas;

        //determine if visible hases required
        var b = object.bounds();

        if(!this.visibleHash) 
        {
            this.visibleHash = {stage:stage,static:new SpatialHash().setCellSize(stage.width, stage.height), moving:new SpatialHash().setCellSize(stage.width, stage.height)};
            this.visibleHash.moving.shapes = [];
        }
        if(object.type === "static") this.visibleHash.static.insert(object); 
        else 
        {
            this.visibleHash.moving.insert(object); 
            this.visibleHash.moving.shapes.push(object);
        }
    },

    removeFromVisibleHash:function(object)
    {
        if(object.type === "static") this.visibleHash.static.remove(object); 
        else 
        {
            this.visibleHash.static.remove(object); 
            this.visibleHash.moving.remove(object); 
            var index = this.visibleHash.moving.shapes.indexOf(object);
            if(index !== -1) this.visibleHash.moving.shapes.splice(index, 1);
        }
    },

    enableVisibleHash:function()
    {
        this._visibleHashEnabled = true;
        var self = this;
        this.each(function(shape)
        {
            self.addToVisibleHash(shape);
        });
    },

    disableVisibleHash:function()
    {
        this._visibleHashEnabled = false;
        var self = this;
        this.each(function(shape)
        {
            self.removeFromVisibleHash(shape);
        });
    },

    has:function(obj)
    {
        if(obj instanceof Array) var output = obj.map(function(object){return this.has(object)}, this);
        else output = this.objects.indexOf(obj) !== -1;
        return output;
    },

    get:function(index)
    {
        if(typeof index === "number")
        {
            if(index >= 0)return this.objects[index];
            return this.objects[this.objects.length+index];
        }
        if(this.objects.indexOf(undefined) === -1) return this.objects.slice(0);
        var objects = [];
        for(var i = 0; i < this.objects.length; i++)
        {
            var object = this.objects[i];
            if(object)objects.push(object);
        }
        return objects;
    },

    getId:function(object)
    {
        return this.objects.indexOf(object);
    },

    each:function(callback)
    {
        for(var i = 0; i < this.objects.length; i++)
        {
            if(typeof this.objects[i] !== "undefined") 
            {
                var res = callback.call(this, this.objects[i]);
                if(res === false) break;
            }
        }
        return this;
    },

    length:function()
    {
        //get length cache
        if(typeof this._length === "number") return this._length;

        //if no deleted objects
        if(this.objects.indexOf(undefined) === -1) return this.objects.length;

        var count = 0;
        for(var i = 0; i < this.objects.length; i++)
        {
            if(typeof this.objects[i] !== "undefined") count++;
        }
        this._length = cound;
        return count;
    },

    shapeContainingPoint:function(x,y,reverse)
    {
        var shape;
        this.each(function(s)
        {
            if(!(s instanceof G.Shape)) return;
            if(s.posInBounds(x,y,reverse)) 
            {
                shape = s;
                return false;
            }
            
        });
        if(shape) 
        {
            return shape;
        }
        return false;
    },

    getIntersections:function()
    {
        var collection = this, cb = function(){}, none = true, collisions = [];
        for(var i = 0; i < arguments.length; i++){ if(arguments[i] instanceof G.Collection) collection = arguments[i]; if(typeof arguments[i] === "function") cb = arguments[i] }
        this.each(function(shape)
        {
            if(!(shape instanceof G.Shape)) return;
            var intersections = shape.getIntersections(collection, cb);
            if(intersections)
            {
                collisions.push([shape, intersections]);
                none = false;
            }
        });

        if(none) return false;
        return collisions;
    },

    query:function(obj, cb)
    {
        if(typeof obj !== "string" && typeof obj !== "object" && typeof obj !== "function") return false;

        if(typeof obj === "string") var match = obj.split(",");
        if(typeof obj === "function") var custom = obj;

        var cb = cb || function(){};
        var collection = new G.Collection(false, false);
        collection.queryParent = this;
        var none = true;

        for(var i = 0; i < this.objects.length; i++)
        {
            if(!this.objects[i]) continue;
            var object = this.objects[i];

            var not = false;
            
            //handle if string
            if(match) 
            {
                for(var i = 0; i < match.length; i++)
                {
                    if(typeof object[match[i]] === "undefined") not = true;
                }
            }

            //handle if obj
            else if(custom) not = custom(object) ? false : true;

            else _.each(obj, function(val, key)
            {
                if(typeof val === "object") _.each(val, function(val2, key2){ process(val2, key2, object[key]) });
                else process(val, key, object);
            });

            function process(val, key, parent)
            { 
                if(!parent) return;

                var range = false;
                //if number range - e.g. "range:10:20" in between 10 and 20
                if(typeof val === "string" && val.indexOf("range") !== -1)
                {
                    var range = val.split("range:").join("").split(":").map(function(val){return parseFloat(val)});
                    if(range && parent[key] >= range[0] && parent[key] <= range[1]) not = false;
                    else not = true; 
                }
                if(!range && parent[key] !== val) not = true; 
            }

            if(!not) 
            {
                cb(object, obj);
                collection.add(object);
                none = false;
            }
        }

        return collection;
    }
});

//shortcut to configure root stage
G.config = function(obj)
{
    if(typeof obj !== "object") return false;

    //physics
    if(obj.physics) 
    {
        if(typeof obj.physics === "boolean") G.physics = obj.physics;
        else if(typeof obj.physics === "object")
        {
            G.physics = true;

            //gravity
            if(typeof obj.physics.gravity === "number") G.gravity = new G.Vector(G.gravity ? G.gravity.x : 0, obj.physics.gravity);
            if(typeof obj.physics.gravity === "object") G.gravity = new G.Vector(obj.physics.gravity.x, obj.physics.gravity.y);

            //hashmap bucket cellsize
            if(typeof obj.physics.cellSize === "number") G.cellSize = obj.physics.cellSize;
        }
    }

    if(typeof obj.showFramerate === "boolean") 
    {
        G.showFramerate = obj.showFramerate;
        if(G.stage) G.stage.showFramerate = obj.showFramerate;
    }
}


//Shape Module
//-------------


var Shape = G.Shape = G.Object.extend
({
    initialize:function(type)
    {
        //if creating shape from G.Shape(shape, obj);
        if(typeof type === "string" && ["bounds", "circle", "rect", "polygon", "image", "sprite", "text", "line"].indexOf("type") !== -1)
        {
            return new G[ type[0].toUpperCase()+type.substr(1) ](Array.prototype.slice.call(arguments, 1));
        }

        this._super.apply(this, arguments);
    },

    mergeValues:function(obj, defaults)
    {        
        var defaults = _.extend({pos:new G.Vector(),vel:new G.Vector(),width:0,height:0,rotation:0,color:"#000",fill:true,hidden:false,_bounds:{top:1,left:1,right:1,bottom:1}}, defaults||{});

        this._super(obj, defaults);
    },

    //top left right bottom bounds
    bounds:function(bounds)
    {
        if(bounds)
        {
            if(typeof bounds !== "object") return;

            //iterate through new bounds to be set, applying all
            for (var key in bounds)
            {
                //set position based on new key
                if(key==="top") 
                {
                    this.pos.y=bounds[key]+this.height/2;
                    this._bounds[key] = bounds[key];
                }
                else if(key==="bottom") 
                {
                    this.pos.y=bounds[key]-this.height/2;
                    this._bounds[key] = bounds[key];
                }
                else if(key==="left") 
                {
                    this.pos.x=bounds[key]+this.width/2;
                    this._bounds[key] = bounds[key];
                }
                else if(key==="right") 
                {
                    this.pos.x=bounds[key]-this.width/2;
                    this._bounds[key] = bounds[key];                    
                }
            }
        }

        else
        {
            //if doesn't have bounds, return
            if(!this.width) return false;
            var w = this.width/2, h = this.height/2;

            this._bounds.left = this.pos.x-w;
            this._bounds.right = this.pos.x+w;
            this._bounds.top = this.pos.y-h;
            this._bounds.bottom = this.pos.y+h;
            return this._bounds;
        }
        
    },

    posInBounds:function(x, y)
    {
        var radius = 0.01, reverse = false;
        for(var i = 2; i < arguments.length; i++) {if(typeof arguments[i] === "number") var radius = arguments[i]; if(typeof arguments[i] === "boolean") reverse = arguments[i]}
        var bounds = this.bounds();
        if(this.shape === "rect") return x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom;
        
        var point = new G.Circle({
            pos:{
                x:x,
                y:y
            },
            radius:radius,
            addToStage:false,
            hidden:true
        });

        return G.intersecting(point, this, reverse);
            
    },

    getIntersections:function()
    {
        var collection = G.stage, cb = function(){}, none = true, collisions = [];
        for(var i = 0; i < arguments.length; i++){ if(arguments[i] instanceof G.Stage || Array.isArray(arguments[i])) collection = arguments[i]; if(typeof arguments[i] === "function") cb = arguments[i] }
        
        var self = this;

        if(Array.isArray(collection)) for(var i = 0; i < collection.length; i++) getIntersections(collection[i]); 
        else getIntersections(collection);


        function getIntersections(collection)
        {
            collection.each(function(shape)
            {
                var intersection = G.intersecting(shape, self);
                if(intersection)
                {
                    cb(intersection, shape);
                    collisions.push([intersection, shape]);
                    none = false;
                }
            });
        }

        if(none) return false;
        return collisions;
    },

    update:function()
    {
        this.trigger("update", []);
    },
    
    render:function()
    {        
        //if is image and not loaded, or image not 
        if(this.loaded === false || this.hidden === true) return;

        //warn if no canvas to render to
        if((this.stage && !this.stage.ctx) && !G.stage.ctx) throw new Error("No canvas to render to.");

        if(this.events) this.trigger("render", arguments);
        if(G.events) G.trigger("renderShape", [this]);

        if(this.rotation !== 0) this.rotate(this.rotation);
        else this._render();

        return this;
    },

    rotate:function(radians)
    {
        var ctx = this.stage.ctx||G.stage.ctx;

        if(this.events) this.trigger("rotate", arguments);

        ctx.save();
        ctx.translate(this.pos.x,this.pos.y);
        ctx.rotate(radians);
        this._render(0,0);
        ctx.restore();
    },

    hide:function()
    {
        if(this.events) this.trigger("hide", arguments);
        this.hidden = true;
    },

    show:function()
    {
        if(this.events) this.trigger("show", arguments);
        this.hidden = false;
    },

    toggleHidden:function()
    {
        if(this.hidden && this.events) this.trigger("show", arguments);
        else if(this.events) this.trigger("hide", arguments);
        this.hidden = !this.hidden;
    }
});



//Sound Module
//-------------


(function(G)
{
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    //use WebAudio API if available
    var context = new AudioContext();

    var test = new Audio;

    var types = {
        mp3: "audio/mpeg",
        ogg: "audio/ogg",
        wav: "audio/wav"
    }

    function playable(type)
    {
        return test.canPlayType(types[type]) !== "";
    }

    G.Sound = G.Object.extend
    ({
        initialize: function(src, extensions)
        {
            this._super();
            var self = this;
            if (typeof src !== "string") return console.warn("Warning: A sound must have a source... ", this);

            //get a playable source
            for (var i = 0; i < extensions.length; i++) if (playable(extensions[i], audio)) { this.src = src+"."+extensions[i]; break; }

            //create audio
            function createAudio(){
                var audio = new Audio;
                audio.src = self.src;
                return audio;
            }

            var audio = this.audio = createAudio();

            var channels = [];
            
            //trigger when loaded
            this.loaded = false;
            audio.addEventListener("canplaythrough", function(){ self.trigger("load"); });
            this.on("load", function(){ self.loaded = true; });

            //BUG - Safari Mac (only tested on 7) has a major delay in playing sounds through solely html5 Audio
            //second method is much better in Safari, but not perfect (still delay)
            if(!context || (navigator.userAgent.match("Safari") === null || navigator.userAgent.match("Chrome") !== null))
            {
                //trigger playing
                audio.addEventListener("play", function() { self.playing = true; });
                audio.addEventListener("ended", function() { self.playing = false; });

                //mobile browsers must have an input event happen to load audio
                if(G.isMobile && G.stages[0]) G.stages[0].event.one("touchstart", window, function(){ audio.muted = true; audio.play(); audio.muted = false; }) 

                this.play = function()
                {
                    //if currently playing, play new channel simultaneously
                    if (this.playing) 
                    {
                        var n = new Audio;
                        n.src = this.src;
                        channels.push(n);
                        n.play();
                        return;
                    }
                    else channels = [];
                    if (!this.loaded) return this.on("load", function() { self.play(); });
                    channels.push(audio);
                    return audio.play();
                };
                //stops all
                this.stop = function()
                {
                    if (!this.loaded && !this.playing) return false;
                    for(var i in channels) channels[i].pause();
                };
            }

            else
            {
                this.context = context;
                var source = self.source = context.createMediaElementSource(audio);
                this.playing = false;
                source.mediaElement.addEventListener("play", function(){self.playing = true;});
                source.mediaElement.addEventListener("ended", function(){self.playing = false;});

                //mobile browsers must have an input event happen to load audio
                if(G.isMobile && G.stages[0]) G.stages[0].event.one("touchstart", window, function(){ source.mediaElement.muted = true; source.mediaElement.play(); source.mediaElement.muted = false; }) 

                this.play = function()
                {
                    //if currently playing, play new sound simultaneously
                    if(this.playing) 
                    {
                        var newSource = context.createMediaElementSource(createAudio());
                        channels.push(newSource);
                        return newSource.mediaElement.play();
                    }
                    else channels = [];
                    if (!self.loaded) return self.on("load", function(){self.play()});
                    channels.push(source);
                    return source.mediaElement.play();
                };
                this.pause = function()
                {
                    if (!self.loaded) return false;
                    for(var i in channels) channels[i].mediaElement.pause();
                };
            }            
        }
    })
})(G);


//Stage Shortcut
//--------------


G.animate = function(time)
{
    G.stage.animate(time);
    G.stage.on("animate", function()
    {
        G.framerate = G.stage.framerate;
        G.deltaFramerate = G.stage.deltaFramerate;
        G.deltaTime = G.stage.deltaTime;
        G.desiredFramerate = G.stage.desiredFramerate;
        G.trigger("animate", arguments);
    });
    return this;
};

G.pause = function()
{
    if(G.stage.pause() !== false)
    {
        G.isPaused = true;            
        G.trigger("pause", arguments);
    }
    return this;
};

G.unPause = function()
{
    G.stage.unPause();
    G.isPaused = false;
    G.trigger("unpause", arguments);
    return this;
};

G.togglePaused = function()
{
    if(G.isPaused) G.unPause();
    else G.pause();
    return this;
}

G.update = function()
{
    if(G.stage.length() === 0) return false;
    G.trigger("update");
    G.stage.update();
    _.each(G.collections, function(collection)
    {
        collection.update();
    });
    return this;
}

//renders all shapes created (in stage)
G.render = function(noClear)
{
    if(G.stage.length() === 0) return false;
    G.trigger("render");
    G.stage.render(noClear);
    return this;
}

G.setCanvas = function()
{
    if(!G.stage) 
    {
        new G.Stage();
        G.stage.event = G.event;
    }

    G.stage.setCanvas.apply(G.stage, arguments);

    this.canvas = G.stage.canvas;
    this.ctx = G.stage.ctx;

    if(G.showFramerate) G.stage.showFramerate = true;
    if(typeof G.desiredFramerate === "number") G.stage.desiredFramerate = G.desiredFramerate;
    G.framerate = G.stage.framerate;
    G.deltaFramerate = G.stage.deltaFramerate;
    G.deltaTime = G.stage.deltaTime;
    G.desiredFramerate = G.stage.desiredFramerate;
    //set root mouse event listener to canvas, and start running mouse engine
    

}

G.clearCanvas = function()
{
    this.stage.clearCanvas();
}

G.getCanvas = function()
{
    return this.canvas || (G.stage ? G.stage.canvas : false);
}

G.getContext = function()
{
    return this.ctx || (G.stage ? G.stage.canvas : false);
}


//Stage Module
//-------------


;(function(G){

function createStats(offset)
{

    var stats = new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.cssText="padding:3px;z-index:100;position:absolute;left:"+offset[0]+"px;top:"+offset[1]+"px;cursor:pointer;background-color:#fff;font: 12px 'Helvetica Neue', Helvetica, Arial, sans-serif;";
    return stats;
}

function removeStats(stats)
{
    if(stats.domElement && stats.domElement.parentNode === document.body) document.body.removeChild(stats.domElement);
}

G.Stage = G.Collection.extend({

    initialize:function(obj)
    {
        if(G.stages.length === 0) 
        {
            G.stage = this;
            this.name = "G Main Stage";
        }
        else
        {
            delete G.stage;
            delete G.stages[0].name;
        }

        this.objects = [];
        this.physics = false;
        this._currentId = 0;
        this._length = 0;
        this._initLoader(); 
        this.addToCollections = false;
        this.addToObjectCollections = false;
        this.events = true;
        this._visibleHashEnabled = false;

        if(obj && typeof obj.events !== "undefined" && !obj.events) this.events = false;

        //mouse/key events
        this.event = new Event();

        //framerate
        this.framerate = this.desiredFramerate = 60;
        this.timeScale = 1;
        this.deltaFramerate = 1;
        this.deltaTime = 1000/this.framerate;
        this.time = 0;
        if(G.stage && this === G.stage) this.showFramerate = G.showFramerate;

        //physics 
        if((obj && obj.physics) || (G.stages.length === 0 && G.physics))
        {
            if(this === G.stage) G.physics = true;
            this.physics = true;
            this.world = new G.Physics.World(obj);
        }

        this.backgroundColor = "";

        //add to stage list
        G.stages.push(this);
    },


    config:function(obj)
    {
        if(typeof obj !== "object") return false;

        //physics
        if(obj.physics) 
        {
            if(obj.physics) 
            {
                if(!this.world) this.world = new G.Physics.World(obj.physics);
                else this.world.config(obj.Physics);
            }
        }

        if(typeof obj.showFramerate === "boolean") 
        {
            if(this === G.stage) G.showFramerate = obj.showFramerate;
            this.showFramerate = obj.showFramerate;
        }

        if(obj.camera)
        {
            if(!this.camera) this.camera = new G.Camera(_.extend(obj.camera, {stage:this}));
            else this.camera.initialize(_.extend(obj.camera, {stage:this}));
        }
    },

    setCanvas:function()
    {
        var args = [];
        _.each(arguments, function(arg){ args.push(arg) });   

        var initiating = this.canvas ? false : true;     

        for(var i  = 0; i < args.length; i++)
        {
            var arg = args[i];

            //
            // Get Canvas 
            //
            
            if(!this.canvas && !this.ctx)
            {
                //if canvas object passed in
                if(arg.tagName && arg.tagName === "CANVAS")
                {
                    this.canvas = arg;
                }

                //else if queryselector passed in
                else if(typeof arg === "string" && arg !== "smooth" && arg !== "crisp" && arg !== "lowres")
                {
                    this.canvas = document.querySelector(arg);
                    if(!this.canvas || this.canvas.tagName !== "CANVAS") throw new Error("Selector does not match a canvas" + arg);
                }

                else
                {
                    this.canvas = document.body.appendChild(document.createElement('canvas'));
                }

                //get canvas's 2d context
                this.ctx = this.canvas.getContext('2d');
            }

            //
            //get width and/or height
            //
            if(typeof arg === "number" && this.canvas)
            {
                if(typeof args[i+1] === "number")
                {
                    this.canvas.width = args[i];
                    this.canvas.height = args[i+1];
                    i++;
                }
                else this.canvas.width = args[i];
            }
        }

        //if no arguments
        if(!this.canvas && !this.ctx)
        {
            this.canvas = document.body.appendChild(document.createElement('canvas'));
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
        }

        //set drawing mode to either pixellated or smooth, defaults to pixellated
        if(args.indexOf("smooth") !== -1)  
        {
            this.canvas.style.imageRendering = '';
            this.canvas.style.msInterpolationMode = '';
        }

        else if(args.indexOf("crisp") !== -1)
        {
            this.canvas.style.imageRendering = '-moz-crisp-edges';
            this.canvas.style.imageRendering = '-o-crisp-edges';
            this.canvas.style.imageRendering = '-webkit-optimize-contrast';
            this.canvas.style.imageRendering = 'crisp-edges';
            this.canvas.style.msInterpolationMode = 'nearest-neighbor';
        }

        if(initiating)
        {
            //make sure w/h are right
            this.width = this.canvas.width = this.canvas.clientWidth;
            this.height = this.canvas.height = this.canvas.clientHeight;
        }

        
        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                                this.ctx.mozBackingStorePixelRatio ||
                                this.ctx.msBackingStorePixelRatio ||
                                this.ctx.oBackingStorePixelRatio ||
                                this.ctx.backingStorePixelRatio || 1,
            ratio = devicePixelRatio / backingStoreRatio;

        if(args.indexOf("lowres") === -1 && devicePixelRatio !== backingStoreRatio)
        {
            this.setScale(ratio);
        }

        //run mouse event engine, setting root to canvas
        this.event.mouse.setRoot(this.canvas).run();

        this.clearCanvas();

        return this;
    },

    getCanvasOffset:function()
    {
        var obj = this.canvas;
        if(!obj) return false;

        try { var box = obj.getBoundingClientRect() }
        catch(e) { throw new Error("Invalid DOM Element") };

        var left = box.left;
        var top = box.top;

        return [left, top];
    },

    clearCanvas:function()
    {
        if(this.canvas && this.ctx) 
        {
            this._canvasCleared = true;
            if(this.backgroundColor === "") this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            else
            {
                this.ctx.fillStyle = this.backgroundColor;
                this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            }
        }
        return this;
    },

    setScale:function(x, y)
    {

        if(this.ctx && typeof x === "number")
        {
            var canvas = this.canvas, ctx = this.ctx;
            if(typeof y !== "number") var y = x;
            var oldWidth = canvas.width;
            var oldHeight = canvas.height;

            canvas.width = oldWidth * x;
            canvas.height = oldHeight * y;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            this.width = oldWidth;
            this.height = oldHeight;

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            ctx.scale(x, y);
        }
    },

    render:function(noClear)
    {
        if(this.isPaused) return;

        if(noClear !== false || !this._canvasCleared) 
        {
            this._canvasCleared = true;
            this.clearCanvas();
        }
        this._super.apply(this, arguments);
        return this;
    },

    animate:function(time)
    {
        var self = this;
        this._canvasCleared = false;

        //when user calls stage.animate(callback) with a callback as parameter, initializes animation, and callback is called every animation frame
        if(typeof time === "function") 
        {
            //prevents starting animation more than once
            if(this._events.animate) return this.on("animate", time);
            this.on("animate", time);
        }

        if(this.camera) 
        {
            this.clearCanvas()._canvasCleared = true;
            this.camera.translate();
        }
        this.trigger("animate", arguments);
        if(this.camera) this.camera.resetTranslation();

        //get framerate properties unless specified not to
        if(typeof time === "number")
        {
            var dt = Math.avg(this.deltaTime, time - this.time);
            //refresh delta time if not sudden change
            this.deltaTime = Math.abs(dt-this.deltaTime) > 10 ? this.deltaTime : dt;
            // this.deltatime = time - this.time;
            this.framerate = 1000/this.deltaTime;
            this.deltaFramerate = (this.desiredFramerate/this.framerate)*this.timeScale;            
            this.time = time;
        }

        //stats mode
        if(this.showFramerate === true && !this.stats) this.stats = createStats(this.getCanvasOffset()); 
        else if(this.showFramerate && this.stats) this.stats.update();
        else if(!this.showFramerate && this.stats) removeStats(this.stats);

        if(!this.isPaused)
        {
            //framerate gets wonky sometimes while using requestanimframe in browsers other than chrome.... :| (dissatisfied face)
            //TODO - fix ^
            if(this.desiredFramerate === 60) this._frameId = window.requestAnimationFrame(function(time){ self.animate.call(self, time) });
            else 
            {
                var currTime = (new Date).getTime();
                var timeToCall = Math.max(0, 1000/this.desiredFramerate - (currTime - this.time));
                this._frameId = window.setTimeout(function() {
                    self.animate.call(self, currTime + timeToCall)
                }, timeToCall);
            }
        }
    },

    pause:function()
    {
        this.isPaused = true;  
        this.desiredFramerate === 60 ? window.cancelAnimationFrame(this._frameId) : window.clearTimeout(this._frameId);       
        this.trigger("pause", arguments);
        return this;
    },

    unPause:function()
    {
        //if wasn't already paused before, exit
        if(typeof this.isPaused === "undefined") return false;
        this.isPaused = false;
        this.framerate = this.desiredFramerate;
        this.deltaFramerate = 1;
        this.deltaTime = 1000/this.framerate;
        this.animate(true);            
        this.trigger("unpause", arguments);
        return this;
    },

    togglePaused:function()
    {
        if(this.isPaused) this.unPause();
        else this.pause();
        return this;
    }
});

})(G);


//Ticker Module
//-------------

G.Ticker = G.Class.extend(
{
    //arguments can be a callback and interval, in any order
    initialize: function(interval)
    {
        this.interval = interval || 1000 / 60;
        for (var i = 0; i < arguments.length; i++)
        {
            if (typeof arguments[i] === "function") this.on("tick", arguments[i]);
            if (typeof arguments[i] === "number") this.interval = arguments[i];
        }
        return this;
    },

    start: function(time) 
    {
        var self = this;

        //prevent multiple starting
        if(typeof time !== "number" && this.isStopped === false) return;

        //restarting (not reseting)
        else if(typeof time !== "number" && this.isStopped === true)
        {
            this.isStopped = false;
            this._time = Date.now();
            this.trigger("start");
        }

        //start ticker
        if(!this._time) this.trigger("start");
        if (!this._time) this._time = Date.now();
        if (!this.elapsedTime) this.elapsedTime = 0;
        this.deltaTime = Date.now() - this._time;
        this.elapsedTime = parseFloat((this.elapsedTime + this.deltaTime/1000).toFixed(3));
        this._time = Date.now();

        this.trigger("tick", arguments);

        if (!this.isStopped)
        {
            if (this.interval === 1000/60) window.requestAnimationFrame(function(time)
            {
                self.start.call(self, time)
            });
            else window.setTimeout(function(time)
            {
                self.start.call(self, self.elapsedTime)
            }, this.interval);
        }

        return this;
    },

    stop: function() 
    {
        this.isStopped = true;
        this.trigger("stop");
    },

    reset:function()
    {
        this.elapsedTime = 0;
        this.trigger("reset");
    }
});

G.Rect = Shape.extend({

    initialize:function(obj, defaults)
    {
        //if not passing in object literal, assign arguments as x,y,w,h,color,vx,vy
        if(typeof obj !== "object" && arguments.length >= 4)
        {
            var a = {};
            //necessary
            a.pos=new G.Vector(arguments[0], arguments[1]);
            
            //optional
            if(arguments[2])a.width = arguments[2];
            if(arguments[3])a.height = arguments[3];
            if(typeof arguments[4] === "string") a.color = arguments[4];
            if(typeof arguments[5] === "number") a.vel = {x:arguments[5]};
            if(typeof arguments[6] === "number" && a.vel) a.vel.y = arguments[6];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        //set shape-specific properties
        this.shape="rect";

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments);   

        //fix for user entering in a negative height or width (eg for making a box start at bottom and go up)
        if(this.pos.y>this.pos.y+this.height)
        {
            this.pos.y=this.pos.y+this.height;
            this.height=Math.abs(this.height);
        }

        if(this.pos.x>this.pos.x+this.width)
        {
            this.pos.x=this.pos.x+this.width;
            this.width=Math.abs(this.width);
        }
    },

    _render:function(x,y,w,h)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;

        if(this.thickness) ctx.lineWidth = this.thickness;

        // //draw at new position and dimensions if specified (does not set position of object), (used in rotating)
        //using typeof is costly, before was doing if typeof x !== "number"
        if(this.fill)
        {
            ctx.fillStyle = this.color;
            if(x !== undefined && y !== undefined) ctx.fillRect(x-this.width/2,y-this.width/2,this.width,this.height);
            else if(w !== undefined && h !== undefined) ctx.fillRect(x-w/2,y-h/2,w,h);
            else ctx.fillRect(this.pos.x-this.width/2,this.pos.y-this.height/2,this.width,this.height);
        }
        else
        {
            ctx.strokeStyle = this.strokeColor||this.color;
            if(x !== undefined && y !== undefined) ctx.strokeRect(x-this.width/2,y-this.width/2,this.width,this.height);
            else if(w !== undefined && h !== undefined) ctx.strokeRect(x-w/2,y-h/2,w,h);
            else ctx.strokeRect(this.pos.x-this.width/2,this.pos.y-this.height/2,this.width,this.height);
        }
        
    }
});

//image (with rect body)
G.Image=G.Rect.extend({

    initialize:function(obj)
    {            
        //if not passing in object literal, assign arguments as src,x,y,width,height,vx,vy,clip
        if(arguments.length > 2)
        {
            var a = {};
            //necessary
            a.src = arguments[0];
            a.pos=new G.Vector(arguments[1], arguments[2]);

            //optional
            if(arguments[3]) a.width = arguments[3];
            if(arguments[4]) a.height = arguments[4];
            if(arguments[5]) a.vel = {x:arguments[5]};
            if(arguments[6] && a.vel) a.vel.y = arguments[6];
            if(arguments[7]) a.clip = arguments[7];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }
        else if(typeof obj !== "object") throw new Error("You must pass in either an object or multiple arguments src,x,y,width,height,vx,vy");

        if(!obj.src) throw new Error("A G.Image must have a 'src' attribute.");

        var defaults = {src:"",clip:{x:0,y:0,width:0,height:0}};
        var args = Array.prototype.slice.call(arguments, 0);
        args[1] = typeof args[1] === "object" ? _.extend(args[1], defaults) : defaults;


        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, args); 

        //set values
        this.image = new Image();
        this.image.src = this.src;
        this.loaded = false;

        var self = this;

        function onload()
        {
            this.loaded = true;
            if(this.width === 0) this.width = this.image.naturalWidth;
            //make sure if only width provided, to scale height according to aspect ratio
            if(this.height === 0) this.height = this.width / (this.image.naturalWidth / this.image.naturalHeight);
            self.trigger("load");
        }

        this.image.addEventListener("load", function(){ onload.call(self); });

    },

    _render:function(x,y,w,h)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;
        
        if(!this.loaded) return;

        //draw at specified position and dimensions if specified (does not set position of object), (used in rotating)
        if(x === undefined) var x = this.pos.x;
        if(y === undefined) var y = this.pos.y;
        if(w === undefined) var w = this.width;
        if(h === undefined) var h = this.height;

        if(this.clip.width !== 0 && this.clip.height !== 0)
        {
            ctx.drawImage(this.image, this.clip.x, this.clip.y, this.clip.width, this.clip.height, x-w/2, y-h/2, w, h);
        }
        else
        {
            ctx.drawImage(this.image, x-w/2, y-h/2, w, h);
        }  
    }  

});


G.Bounds = (function(){

return G.Collection.extend
({
    initialize:function(x1,y1,x2,y2,restitution,friction,thickness)
    {
        this._super(false, true);

        this.thickness = thickness || 2;

        var hidden = typeof hidden === "boolean" ? hidden : true;
        this.friction = typeof friction === "number" ? friction : 0;
        this.restitution = typeof restitution === "number" ? restitution : 0;
        
        //default dimensions
        if(arguments.length < 4)
        {
            //set if no defaults
            if(arguments[2]) this.thickness = arguments[2] || this.thickness;
            if(arguments[1]) this.friction = arguments[1] || this.friction;
            if(arguments[0]) this.restitution = arguments[0] || this.restitution;


            x1 = 0;
            x2 = G.stage.canvas ? G.stage.width : 0;
            y1 = 0;
            y2 = G.stage.canvas ? G.stage.height : 0;
        } 
        
        this.name = "Bounds Shape";

        var line = {
            pos:{
                x:(x2+x1)/2,
                y:y1
            },
            width:x2-x1,
            height:this.thickness,
            type:"static",
            hidden:hidden,
            friction: this.friction,
            restitution: this.restitution
        };

        for(var i = 0; i < arguments.length; i++) if(typeof arguments[i] === "string") var rejections = arguments[i].split(",");

        var a,b,c,d;

        //in order of top, left, bottom, right
        if(!rejections || rejections.indexOf("top") === -1) a = new G.Rect(line);
        
        line.pos.x = x1, line.pos.y = (y2+y1)/2, line.width = this.thickness, line.height = y2-y1;
        if(!rejections || rejections.indexOf("left") === -1) b = new G.Rect(line);

        line.pos.x = (x2+x1)/2, line.pos.y = y2, line.width = x2-x1, line.height = this.thickness;
        if(!rejections || rejections.indexOf("bottom") === -1) c = new G.Rect(line);

        line.pos.x = x2, line.pos.y = (y2+y1)/2, line.width = this.thickness, line.height = y2-y1;
        if(!rejections || rejections.indexOf("right") === -1) d = new G.Rect(line);

        this.add(a,b,c,d);

        var self = this;

        this.bounds = {
            top:a,
            left:b,
            bottom:c,
            right:d
        };

        this.top = a;
        this.left = b;
        this.bottom = c;
        this.right = d;
    },

    resize:function()
    {
        this.remove(true);
        this.initialize.apply(this, arguments);
    }
});

})();

G.Circle = Shape.extend({

    initialize:function(obj)
    {
        //if not passing in object literal, assign arguments as x,y,radius,color,vx,vy
        if(typeof obj !== "object" && arguments.length > 2)
        {
            var a = {};
            a.pos=new G.Vector(arguments[0], arguments[1]);
            a.radius = arguments[2];
            if(typeof arguments[3] === "string") a.color = arguments[3];
            if(typeof arguments[4] === "number") a.vel = {x:arguments[4]};
            if(typeof arguments[5] === "number" && a.vel) a.vel.y = arguments[5];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        //set shape-specific properties
        this.shape="circle";
        this.radius = obj.radius;      

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments); 

        //set w/h based on radius
        this.width = this.height = this.radius*2;
    },

    _render:function(x,y,w,h)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;

        if(this.fill) ctx.fillStyle = this.color;
        else ctx.strokeStyle = this.strokeColor||this.color;
        if(this.thickness) ctx.lineWidth = this.thickness;
        
        //draw at specified position and dimensions if specified (does not set position of object), (used in rotating)
        if(x === undefined) var x = this.pos.x;
        if(y === undefined) var y = this.pos.y;
        if(w === undefined) var w = this.radius;

        ctx.beginPath();
        ctx.arc(x,y,w,0,Math.PI*2,false);
        if(this.fill) ctx.fill();
        else ctx.stroke();
    }
});

G.Line = Shape.extend({

    initialize:function(obj)
    {
        var defaults = {pos:{x1:0,y1:0,x2:0,y2:0,x:0,y:0}, thickness:1,endStyle:"butt"};

        //if not passing in object literal, assign arguments as x1,y1,x2,y2,strokeColor,thickness,vx,vy
        if(typeof obj !== "object" && arguments.length > 3)
        {
            var a = {};
            //necessary
            a.pos={x1:arguments[0], y1:arguments[1], x2:arguments[2], y2:arguments[3]};

            //optional
            if(typeof arguments[4] === "string") a.color = arguments[4];
            if(typeof arguments[5] === "number") a.thickness = arguments[5];
            if(typeof arguments[6] === "number") a.vel = {x:arguments[6]};
            if(typeof arguments[7] === "number" && a.vel) a.vel.y = arguments[7];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        this.shape="line";

        arguments[1] = typeof arguments[1] === "object" ? _.extend(arguments[1], defaults) : defaults;

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments);  

        //set center xy and dimensions initially
        this.setDimensions().setCenter();
    },

    bounds:function()
    {
        return {
            top:this.pos.y1,
            left:this.pos.x1,
            right:this.pos.x1+10,
            bottom:this.pos.y2+10
        };
    },

    setCenter:function(x,y)
    {
        if(x && y)
        {
            var difx = ((this.pos.x2+this.pos.x1)/2)-x;
            this.pos.x1 -= difx;
            this.pos.x2 -= difx;

            var dify = ((this.pos.y2+this.pos.y1)/2)-y;
            this.pos.y1 -= dify;
            this.pos.y2 -= dify;
        }

        this.pos.x = typeof x !== "number" ? (this.pos.x2+this.pos.x1)/2 : x;
        this.pos.y = typeof y !== "number" ? (this.pos.y2+this.pos.y1)/2 : y;

        return this;
    },

    setWidth:function(width)
    {
        if(width)
        {
            var hw = (this.pos.x2-this.pos.x1)/2 - width/2;
            this.pos.x1 += hw, this.pos.x2 -= hw;
        }

        this.width = typeof width !== "number" ? this.pos.x2-this.pos.x1 : width;
        
        return this;
    },

    setHeight:function(height)
    {
        if(height)
        {
            var hh = (this.pos.y2-this.pos.y1)/2 - height/2;
            this.pos.y1 += hh, this.pos.y2 -= hh;
        }

        this.height = typeof height !== "number" ? this.pos.y2-this.pos.y1 : height;
        
        return this;
    },

    setDimensions:function(w,h)
    {
        this.setWidth(w).setHeight(h);

        return this;
    },

    _render:function(x,y)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;

        ctx.beginPath();

        //TODO - Rotation
        // if(x !== undefined && y !== undefined)
        // {

        // }

        ctx.moveTo(this.pos.x1,this.pos.y1);
        ctx.lineTo(this.pos.x2,this.pos.y2);

        //change color
        ctx.strokeStyle = this.color;
        //change thickness
        ctx.lineWidth = this.thickness;
        //change end style
        ctx.lineCap = this.endStyle;

        ctx.stroke();
        ctx.closePath();
    }
});

G.Polygon = Shape.extend({
    initialize:function(obj)
    {
        //if not passing in object literal, assign arguments as x,y,vertices,color,vx,vy
        if(arguments.length > 2 && Array.isArray(arguments[2]))
        {
            var a = {};
            //necessary
            a.pos=new G.Vector(arguments[0], arguments[1]);
            a.vertices=arguments[2];

            //optional
            if(typeof arguments[3] === "string") a.color = arguments[3];
            if(typeof arguments[4] === "number") a.vel = {x:arguments[4]};
            if(typeof arguments[5] === "number" && a.vel) a.vel.y = arguments[5];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        this.shape="polygon";

        var defaults = {vertices:[]};
        arguments[1] = typeof arguments[1] === "object" ? _.extend(arguments[1], defaults) : defaults;

        this.relativeVertices = true;
        if(!obj.pos || (obj.pos && typeof obj.pos.x !== "number" && typeof obj.pos.y !== "number")) this.relativeVertices = false;

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments);  

        if(this.vertices.length < 3) throw new Error("A line must have 3 or more vertices");
    },

    computeCentroid:function(vertices)
    {
        var vertices = vertices ? G.toVectors(vertices) : G.toVectors(this.vertices);
        var vertexCount = vertices.length;
        var centroid = new G.Vector();
        var signedArea = 0.0;
        var x0 = 0.0; // Current vertex X
        var y0 = 0.0; // Current vertex Y
        var x1 = 0.0; // Next vertex X
        var y1 = 0.0; // Next vertex Y
        var a = 0.0;  // Partial signed area

        // For all vertices except last
        var i=0;
        for (i=0; i<vertexCount-1; ++i)
        {
            x0 = vertices[i].x;
            y0 = vertices[i].y;
            x1 = vertices[i+1].x;
            y1 = vertices[i+1].y;
            a = x0*y1 - x1*y0;
            signedArea += a;
            centroid.x += (x0 + x1)*a;
            centroid.y += (y0 + y1)*a;
        }

        // Do last vertex
        x0 = vertices[i].x;
        y0 = vertices[i].y;
        x1 = vertices[0].x;
        y1 = vertices[0].y;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.x += (x0 + x1)*a;
        centroid.y += (y0 + y1)*a;

        signedArea *= 0.5;
        centroid.x /= (6.0*signedArea);
        centroid.y /= (6.0*signedArea);

        return centroid;
    },

    //custom bounds function for polygon
    bounds:function(nbounds)
    {
        if(nbounds)
        {
            if(!this.pos || !this.pos.x || !this.pos.y) return false;
            var bounds = this.bounds(),
                hw = (this.pos.x-bounds.left),
                hh = (this.pos.y-bounds.top);
            if(typeof nbounds.left === "number") this.pos.x = nbounds.left+hw;       
            if(typeof nbounds.right === "number") this.pos.x = nbounds.right-hw;
            if(typeof nbounds.top === "number") this.pos.y = nbounds.top+hh;       
            if(typeof nbounds.bottom === "number") this.pos.y = nbounds.bottom-hh;
        }
        else
        {
            var x = [], y = [];
            if(this.pos && this.pos.x !== undefined && this.pos.y !== undefined) for(var i = 0; i < this.vertices.length-1; i+=2) { x.push(this.pos.x+this.vertices[i]); y.push(this.pos.y+this.vertices[i+1]); }
            else for(var i = 0; i < this.vertices.length-1; i+=2) { x.push(this.vertices[i]); y.push(this.vertices[i+1]); }

            return {
                left:Math.min.apply(Math, x),
                right:Math.max.apply(Math, x),
                top:Math.min.apply(Math, y),
                bottom:Math.max.apply(Math, y)
            };
        }
    },

    // getCenter:function()
    // {
    //     //set center pos
    //     var newX = this.vertices[2]-(this.vertices[2]-this.vertices[0])/2; 
    //     var newY = this.vertices[3]-(this.vertices[3]-this.vertices[1])/2; 

    //     if(this.pos.x !== newX) this.pos.x = newX;
    //     if(this.pos.y !== newY) this.pos.y = newY;

    //     return this;
    // },


    // //watch for all pos values, width, height
    // setValues:function(prop, action, newvalue, oldvalue)
    // {
    //     if(["x, y, width","height"].indexOf(prop) !== -1) 
    //     {
    //         //stop infinite loop, or props that shouldn't be called from being called
    //         WatchJS.noMore = true;

    //         this.setPoints.apply(this, arguments);
    //     }

    //     //if vertices change
    //     else
    //     {
    //         //stop infinite loop, or props that shouldn't be called from being called
    //         WatchJS.noMore = true;

    //         this.setDimensions().setCenter();
    //     }     
    // },

    // setPoints:function(prop, action, newvalue, oldvalue)
    // {
    //     //if center x pos changes (translate)
    //     if(prop === "x")
    //     {
    //         var newX1 = this.vertices[0]+(newvalue-oldvalue); 
    //         var newX2 = this.vertices[2]+(newvalue-oldvalue); 

    //         if(Math.round(this.vertices[0]) !== Math.round(newX1)) this.vertices[0] = Math.round(newX1);
    //         if(Math.round(this.vertices[2]) !== Math.round(newX2)) this.vertices[2] = Math.round(newX2);
    //     }

    //     if(prop === "y")
    //     {
    //         var newY1 = this.vertices[1]+(newvalue-oldvalue); 
    //         var newY2 = this.vertices[3]+(newvalue-oldvalue); 

    //         if(Math.round(this.vertices[1]) !== Math.round(newY1)) this.vertices[1] = Math.round(newY1);
    //         if(Math.round(this.vertices[3]) !== Math.round(newY2)) this.vertices[3] = Math.round(newY2);
    //     }

    //     if(prop === "width")
    //     {
    //         var newX1 = this.vertices[0]-(newvalue-oldvalue)/2; 
    //         var newX2 = this.vertices[2]+(newvalue-oldvalue)/2; 

    //         if(this.vertices[0] !== newX1) this.vertices[0] = newX1;
    //         if(this.vertices[2] !== newX2) this.vertices[2] = newX2;
    //     }

    //     if(prop === "height")
    //     {
    //         var newY1 = this.vertices[1]-(newvalue-oldvalue)/2; 
    //         var newY2 = this.vertices[3]+(newvalue-oldvalue)/2; 

    //         if(this.vertices[1] !== newY1) this.vertices[1] = newY1;
    //         if(this.vertices[3] !== newY2) this.vertices[3] = newY2;
    //     }
    // },

    // setDimensions:function()
    // {
    //     //set dimensions
    //     var mostLeft, mostRight, mostTop, mostBottom;
    //     for(var i = 0; i < this.vertices.length; i+= 2)
    //     {
    //         if()
    //     }
    //     var newWidth = Math.abs(this.vertices[2]-this.vertices[0]);
    //     var newHeight = Math.abs(this.vertices[3]-this.vertices[1]);
    //     if(this.width !== newWidth) this.width = newWidth;
    //     if(this.height !== newHeight) this.height = newHeight;

    //     return this;
    // },

    // setCenter:function()
    // {
    //     //set center pos
    //     var newX = this.vertices[2]-(this.vertices[2]-this.vertices[0])/2; 
    //     var newY = this.vertices[3]-(this.vertices[3]-this.vertices[1])/2; 

    //     if(this.pos.x !== newX) this.pos.x = newX;
    //     if(this.pos.y !== newY) this.pos.y = newY;

    //     return this;
    // },

    _render:function(x,y)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;
        
        if(this.fill) ctx.fillStyle = this.color;
        else ctx.strokeStyle = this.strokeColor||this.color;

        ctx.beginPath();

        if(this.pos && this.relativeVertices)
        {
            var x = typeof x === "number" ? x : this.pos.x;
            var y = typeof y === "number" ? y : this.pos.y;
        }
        else
        {
            var x = typeof x === "number" ? x : 0;
            var y = typeof y === "number" ? y : 0;
        }
            
        ctx.moveTo(x+this.vertices[0],y+this.vertices[1]);

        for(var i = 2; i < this.vertices.length; i += 2)
        {
            ctx.lineTo(x+this.vertices[i],y+this.vertices[i+1]);
        }

        ctx.lineTo(x+this.vertices[0],y+this.vertices[1]);


        if(this.thickness) ctx.lineWidth = this.thickness;
        if(this.fill) ctx.fill();
        else ctx.stroke();

        ctx.closePath();
    }
});

G.Sprite = G.Image.extend
({
    //either pass in an array of frames or 3 arguments to automate (frames must all have same width, and all have same height, for second option)
    
    //a frame should look something like this: { pos:{x:12,y:30}, clip:{x:0,y:0,width:20,height:20}, width:20,height:20 }, w/h are optional, default to clip w/h
    //pos is position of frame in stage, defaults to 0,0
    //clip is dimensions and location of sprite inside actual image spritesheet coordinates

    //args (in automation) - stepSize (width/height of each frame clip)(either number (x) or xy obj) width(default:stepsize.x), height(default:stepsize.y), columns (default:1), rows (default:1), framecount(default:columns*rows)
    //only stepSize is required

    //other arguments (inside of obj: 
    //default: the default frame to use, defaults to 0
    //animations: the animations to use
    
    initialize:function(obj, addToStage)
    {
        this._super(obj.src, obj.pos?obj.pos.x:0, obj.pos?obj.pos.y:0, obj.width||undefined, obj.height||undefined, addToStage);

        this.frames = [];
        if(obj[frames]) this.frames = obj[frames];
        var frames = this.frames;

        if(!obj.frames)
        {
            if(!obj.stepSize) throw new Error("Not enough info. Must contain stepSize.");
            var stepSize = {x:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.x, y:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.y},
                width = obj.width||stepSize.x,
                height = obj.height||stepSize.y,
                pos = obj.pos||{x:0,y:0},
                columns = obj.columns||1,
                rows = obj.rows||1,
                framecount = obj.framecount || columns*rows;

            var curX = 0, curY = 0, curFrame = 0;

            //compute frames
            for (var i = 0; i < rows; i++)
            {
                for (var j = 0; j < columns; j++)
                {
                    if(frames.length >= framecount) break;

                    frames.push
                    ({
                        clip:{x:curX,y:curY,width:stepSize.x,height:stepSize.y},
                        width:width,
                        height:height,
                        pos:pos
                    });      
                    
                    //change to next column
                    curX+=stepSize.x;
                }
                //reset x to 0
                curX=0;
                //change to next row
                curY+=stepSize.y;
            } 
        }

        //make sure frames are formatted correctly
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            if(!frame.clip) throw new Error("Frame must have a clip with x,y,width,height attributes", frames, frame);
            if(!frame.width) frame.width = this.width || frame.clip.width;
            if(!frame.height) frame.height = this.height || frame.clip.height;
        }

        //set default image to first frame or user-specified
        this.setFrame(obj.default||0);

        //create animations
        if(obj.animations)
        {
            this.animations = {};
            this.addAnimations(obj.animations);
        }
    },

    addAnimations:function(animations)
    {
        for(var key in animations)
        {
            var obj = animations[key];
            var name = typeof obj.name === "string" ? obj.name : key;
            var anim = this.animations[name] = {};
            anim.name = name;
            anim.frames = [];
            if(obj.range) 
            {
                if(obj.range[1] > obj.range[0]) for (var i = obj.range[0]; i <= obj.range[1]; i++) anim.frames.push(i);
                else for (var i = obj.range[0]; i >= obj.range[1]; i--) anim.frames.push(i);
            }
            else if(obj.sequence) anim.frames = obj.sequence.slice(0);
            anim.currentFrame = anim.currentStep = 0;
            anim.speed = obj.speed||1;
            anim.repeat = typeof obj.repeat !== "undefined" ? anim.repeat : true;
        }
    },

    setAnimation:function(key)
    {
        if(this.animation === this.animations[key]) return;
        this.animation = this.animations[key];
        this.animation.currentFrame = 0;
        return this;
    },

    removeAnimation:function(frame)
    {
        if(!this.animation) return this;
        this.setFrame(typeof frame === "number" ? frame : this.animation.frames[0]);
        this.animation = false;
        return this;
    },

    setFrame:function(frame)
    {
        if(typeof frame !== "number" || !this.frames[frame]) return false;
        this.currentFrame = frame;
        this.clip = this.frames[frame].clip;
        this.width = this.frames[frame].width;
        this.height = this.frames[frame].height;

        return this;
    },

    _render:function()
    {
        if(this.animation)
        {
            var anim = this.animation;
            if(anim.currentStep > anim.frames.length-1) anim.currentStep = 0;

            this.setFrame(anim.frames[anim.currentFrame]);

            anim.currentStep+=anim.speed;
            anim.currentFrame = Math.round(anim.currentStep);
        }

        this._super.apply(this, arguments);
    }
});G.SpriteSheet = G.Image.extend
({
    //either pass in an array of frames or 3 arguments to automate (frames must all have same width, and all have same height, for second option)
    
    //a frame should look something like this: { pos:{x:12,y:30}, clip:{x:0,y:0,width:20,height:20}, width:20,height:20 }, w/h are optional, default to clip w/h
    //pos is position of frame in stage, defaults to 0,0
    //clip is dimensions and location of sprite inside actual image spritesheet coordinates

    //args (in automation) - stepSize (width/height of each frame clip)(either number (x) or xy obj) width(default:stepsize.x), height(default:stepsize.y), columns (default:1), rows (default:1), framecount(default:columns*rows)
    //only stepSize is required

    //other arguments (inside of obj: 
    //default: the default frame to use, defaults to 0
    //animations: the animations to use
    
    initialize:function(obj, addToStage)
    {
        this._super(obj.src, obj.pos?obj.pos.x:0, obj.pos?obj.pos.y:0, obj.width||undefined, obj.height||undefined, addToStage);

        console.log(this.pos instanceof G.Vector)

        this.frames = [];
        if(obj[frames]) this.frames = obj[frames];
        var frames = this.frames;

        if(!obj.frames)
        {
            if(!obj.stepSize) throw new Error("Not enough info. Must contain stepSize.");
            var stepSize = {x:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.x, y:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.y},
                width = obj.width||stepSize.x,
                height = obj.height||stepSize.y,
                pos = obj.pos||{x:0,y:0},
                columns = obj.columns||1,
                rows = obj.rows||1,
                framecount = obj.framecount || columns*rows;

            var curX = 0, curY = 0, curFrame = 0;

            //compute frames
            for (var i = 0; i < rows; i++)
            {
                for (var j = 0; j < columns; j++)
                {
                    if(frames.length >= framecount) break;

                    frames.push
                    ({
                        clip:{x:curX,y:curY,width:stepSize.x,height:stepSize.y},
                        width:width,
                        height:height,
                        pos:pos
                    });      
                    
                    //change to next column
                    curX+=stepSize.x;
                }
                //reset x to 0
                curX=0;
                //change to next row
                curY+=stepSize.y;
            } 
        }

        //make sure frames are formatted correctly
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            if(!frame.clip) throw new Error("Frame must have a clip with x,y,width,height attributes", frames, frame);
            if(!frame.width) frame.width = this.width || frame.clip.width;
            if(!frame.height) frame.height = this.height || frame.clip.height;
        }

        //set default image to first frame or user-specified
        this.setFrame(obj.default||0);

        //create animations
        if(obj.animations)
        {
            this.animations = {};
            this.addAnimations(obj.animations);
        }

        console.log(this);
    },

    addAnimations:function(animations)
    {
        for(var key in animations)
        {
            var obj = animations[key];
            var name = typeof obj.name === "string" ? obj.name : key;
            var anim = this.animations[name] = {};
            anim.frames = [];
            if(obj.range) 
            {
                if(obj.range[1] > obj.range[0]) for (var i = obj.range[0]; i <= obj.range[1]; i++) anim.frames.push(i);
                else for (var i = obj.range[0]; i >= obj.range[1]; i--) anim.frames.push(i);
            }
            else if(obj.sequence) anim.frames = obj.sequence.slice(0);
            anim.currentFrame = anim.currentStep = 0;
            anim.speed = obj.speed||1;
            anim.repeat = typeof obj.repeat !== "undefined" ? anim.repeat : true;
        }
    },

    setAnimation:function(key)
    {
        if(this.animation === this.animations[key]) return;
        this.animation = this.animations[key];
        this.animation.currentFrame = 0;
    },

    removeAnimation:function(frame)
    {
        if(!this.animation) return;
        this.setFrame(typeof frame === "number" ? frame : this.animation.frames[0]);
        this.animation = false;
    },

    setFrame:function(frame)
    {
        if(typeof frame !== "number" || !this.frames[frame]) return false;

        this.clip = this.frames[frame].clip;
        this.width = this.frames[frame].width;
        this.height = this.frames[frame].height;
    },

    _render:function()
    {
        if(this.animation)
        {
            var anim = this.animation;
            if(anim.currentStep > anim.frames.length-1) anim.currentStep = 0;

            this.setFrame(anim.frames[anim.currentFrame]);

            anim.currentStep+=anim.speed;
            anim.currentFrame = Math.round(anim.currentStep);
        }

        this._super.apply(this, arguments);
    }
});

G.Text = Shape.extend({

    initialize:function(obj)
    {
        //if not passing in object literal, assign arguments as text,x,y,size,font,weight,color,align,baseline
        if(typeof obj !== "object")
        {
            var a = {};
            //necessary
            a.text=arguments[0];
            
            //optional
            if(typeof arguments[1] === "number") a.pos = {x:arguments[1]};
            if(typeof arguments[2] === "number" && a.pos) a.pos.y = arguments[2];
            if(typeof arguments[3] === "string") a.size = arguments[3];
            if(typeof arguments[4] === "string") a.font = arguments[4];
            if(typeof arguments[5] === "string") a.weight = arguments[5];
            if(arguments[6]) a.color = arguments[6];
            if(typeof arguments[7] === "string") a.align = arguments[7];
            if(typeof arguments[8] === "string") a.baseline = arguments[8];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        //set shape-specific properties
        this.shape="text";

        var defaults = {text:"", size:"12px", font:"Helvetica", weight:"normal",pos:{x:0,y:0},rotation:0,color:"#000",collections:[],hidden:false,events:true};

        //Merge default values with obj passed in
        for(var i in defaults) this[i] = defaults[i];
        for(var i in arguments[0]) this[i] = typeof arguments[0][i] === "object" ? _.clone(arguments[0][i]) : arguments[0][i];

            if(arguments[0].addToStage !== false) this.add();
    },

    bounds:function()
    {
        return {
            top:this.pos.y,
            left:this.pos.x,
            right:this.pos.x+10,
            bottom:this.pos.y+10
        };
    },

    _render:function()
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;

        // testing if the fillstyle is not this color is costly
        ctx.fillStyle = this.color;
        ctx.font = this.weight + " " + this.size + " " + this.font;
        if(this.align) ctx.textAlign = this.align;
        if(this.baseline) ctx.textBaseline = this.baseline;
        ctx.fillText(typeof this.text === "function" ? this.text() : this.text, this.pos.x, this.pos.y);
    }
});

var Physics = G.Physics = {};

var SpatialHash = Physics.SpatialHash = (function(){

    return G.Class.extend
    ({
        //argument is size of each hash cell
        initialize:function(cellSize)
        {
            //default size if none specified or no canvas
            this.setCellSize(cellSize);
            this.length = 0;

            this.buckets = {};
        },

        hash:function(x,y)
        {
            return [Math.floor(x/this.cellWidth), Math.floor(y/this.cellHeight)];
        },

        //converts object to hash
        insert:function(obj)
        {
            var self = this;
            if(obj instanceof Array) _.each(obj, function(obj){ self.insert(obj) });
            else if(obj instanceof G.Collection) obj.each(function(obj){ self.insert(obj) });

            else
            {
                if(!obj || !obj.bounds) 
                {
                    console.log(this);
                    throw new Error("The object to insert must have a bounds function that returns {top,left,bottom,right}");
                }

                this.length++;

                var bounds = obj.bounds();

                //get xy hashes
                var min = this.hash(bounds.left, bounds.top);
                var max = this.hash(bounds.right, bounds.bottom);

                for(var x = min[0]; x <= max[0]; x++)
                {
                    for(var y = min[1]; y <= max[1]; y++)
                    {
                        var key = x+":"+y;
                        if(!this.buckets[key]) this.buckets[key] = [];
                        this.buckets[key].push(obj);
                    }
                }
            }

            return this;
        },

        retrieve:function(obj)
        {
            if(!obj) return this.retrieveAll();

            var bounds = obj.bounds();

            var min = this.hash(bounds.left, bounds.top);
            var max = this.hash(bounds.right, bounds.bottom);

            var matches = [];

            for(var x = min[0]; x < max[0]+1; x++)
            {
                for(var y = min[1]; y < max[1]+1; y++)
                {
                    var key = x+":"+y;

                    if(!this.buckets[key]) continue;

                    for(var i = 0; i < this.buckets[key].length; i++)
                    {
                        if(matches.indexOf(this.buckets[key][i]) === -1) matches.push(this.buckets[key][i]);
                    }
                }
            }

            return matches;
        },

        retrieveAll:function()
        {
            var objects = [];

            _.each(this.buckets, function(bucket)
            {
                for(var i = 0; i < bucket.length; i++)
                {
                    if(objects.indexOf(bucket[i]) === -1) objects.push(bucket[i]);
                }
            });

            return objects;
        },

        remove:function(obj)
        {
            if(!obj) return;

            var bounds = obj.bounds();

            var min = this.hash(bounds.left, bounds.top);
            var max = this.hash(bounds.right, bounds.bottom);

            for(var x = min[0]; x < max[0]+1; x++)
            {
                for(var y = min[1]; y < max[1]+1; y++)
                {
                    var key = x+":"+y;
                    var index = this.buckets[key] ? this.buckets[key].indexOf(obj) : -1;
                    if(this.buckets[key] && index !== -1) 
                    {
                        this.buckets[key].splice(index, 1);
                        if(this.buckets[key].length === 0) delete this.buckets[key];
                    }
                }
            }

            return this;
        },

        clear:function()
        {
            this.length = 0;
            this.buckets = {};
            return this;
        },

        //horrible performance compared to clearing and reinserting
        // reset:function()
        // {
        //     var objects = this.retrieveAll();
        //     this.clear().insert(objects);
        //     return this;
        // },

        setCellSize:function(cellWidth, cellHeight)
        {
            this.cellWidth = cellWidth || (G.isMobile ? 30 : 60);
            this.cellHeight = cellHeight || this.cellWidth;
            var obj = this.retrieveAll();
            this.clear().insert(obj);
            return this;
        }
    });
})();

Physics.World = (function(){

    var outerBound = 0,
        shapeMethods = 
        {

        },
        shapeDefaults = 
        {
            acc:{x:0,y:0},
            restitution:0,
            friction:0,
            mass:1
        },
        fn,
        update = 
        {
            update: function()
            {
                if (fn && fn !== update.update) fn.apply(this, arguments);
                if (this.type === "kinematic") update.kinematic.apply(this, arguments);
                else if (this.type === "dynamic") update.dynamic.apply(this, arguments)
            },
            kinematic:function()
            {
                var shape = this;
                //make sure pos, vel, and acc are all vectors
                if(!(shape.pos instanceof G.Vector) || !(shape.vel instanceof G.Vector))
                {
                    shape.pos = new G.Vector(shape.pos ? shape.pos.x : 0, shape.pos ? shape.pos.y : 0);
                    shape.vel = new G.Vector(shape.vel ? shape.vel.x : 0, shape.vel ? shape.vel.y : 0);
                }
                //perform euler integration - ish - (pos = pos + vel)
                shape.pos.add(shape.vel.multiply(shape.stage?shape.stage.deltaFramerate:1));
            },
            dynamic:function()
            {
                var shape = this;
                //make sure pos, vel, and acc are all vectors
                if(!(shape.pos instanceof G.Vector) || !(shape.vel instanceof G.Vector) || !(shape.acc instanceof G.Vector))
                {
                    shape.pos = new G.Vector(shape.pos ? shape.pos.x : 0, shape.pos ? shape.pos.y : 0);
                    shape.vel = new G.Vector(shape.vel ? shape.vel.x : 0, shape.vel ? shape.vel.y : 0);
                    shape.acc = new G.Vector(shape.acc ? shape.acc.x : 0, shape.acc ? shape.acc.y : 0);
                }
                //perform euler integration - ish - (acc = gravity + force, vel = vel + acc, pos = pos + vel)
                shape.vel.add(shape.acc);
                shape.pos.add(shape.vel.multiply(shape.stage?shape.stage.deltaFramerate:1));
            }
        };

    return G.Class.extend
    ({
        //constructor
        initialize:function(obj)
        {
            var self = this;

            obj = obj || {};

            this.setGravity(obj.gravity);

            this.setCellSize(obj.cellSize);           

            this.collisions = 
            {
                dynamicdynamic:true,
                dynamicstatic:true,
                dynamickinematic:true
            };

            this.config(obj);

            this.shapes = {
                static:new G.Collection(false, true),
                kinematic:new G.Collection(false, true),
                dynamic:new G.Collection(false, true),
                all:new G.Collection(false, true)
            };

            this.shapes.static.name = "Static Collision Shapes";
            this.shapes.kinematic.name = "Kinematic Collision Shapes";
            this.shapes.dynamic.name = "Dynamic Collision Shapes";
            this.shapes.all.name = "All Collision Shapes";

            //set update functions
            fn = G.Shape.prototype.update;
            if(fn !== update.update) G.Shape.prototype.update = update.update;
        },

        setCellSize:function(cellSize)
        {
            if(!cellSize && G.cellSize) cellSize = G.cellSize;
            this.staticHash = this.staticHash instanceof SpatialHash ? this.staticHash.setCellSize(cellSize) : new SpatialHash(cellSize);
            this.kinematicHash = this.kinematicHash instanceof SpatialHash ? this.kinematicHash.setCellSize(cellSize) : new SpatialHash(cellSize);
            this.dynamicHash = this.dynamicHash instanceof SpatialHash ? this.dynamicHash.setCellSize(cellSize) : new SpatialHash(cellSize);
        },

        setGravity:function(gravity)
        {
            var x = typeof gravity !== "undefined" ? (typeof gravity.x === "number" ? gravity.x : (typeof arguments[0] === number ? arguments[0] : 0)) : (typeof G.gravity !== "undefined" ? G.gravity.x : 0);
            var y = typeof gravity !== "undefined" ? (typeof gravity.y === "number" ? gravity.y : (typeof arguments[1] === number ? arguments[1] : 0)) : (typeof G.gravity !== "undefined" ? G.gravity.y : 0);
            this.gravity = new G.Vector(x, y);
        },

        config:function(obj)
        {
            var self = this;

            if(typeof obj !== "object") return false;

            //set gravity, defaults to none
            if(typeof obj.gravity !== "undefined") this.setGravity(obj.gravity);

            //collision handling
            if(typeof obj.collisions !== "undefined")
            {
                //remove collisions
                if(!obj.collisions) this.collisions = false;
                else if(typeof obj.collisions === "object")
                {
                    _.each(obj.collisions, function(val, key)
                    {
                        if(val === false) self.collisions[key] = false;
                    });
                }
            }
        },

        add:function(shape)
        {
            if(shape instanceof G.Text) {shape.type = "static"; return;};
            if (shape instanceof G.Collection) shape.each(function(shape){self.add(shape)});
            else if(!(shape instanceof G.Shape) || (shape instanceof G.Shape && shape.physics === false)) return false;

            //set default type
            if(!shape.type) 
            {
                if(shape.shape === "line") shape.type = "static";
                else shape.type = "dynamic";
            }

            shape.on("collision", function(){ shape.colliding = true; })

            this.shapes.all.add(shape);
            if(shape.type === "static") 
            {
                this.shapes.static.add(shape);
                this.staticHash.insert(shape);
            }
            if(shape.type === "kinematic") 
            {
                this.shapes.kinematic.add(shape);
                this.kinematicHash.insert(shape);
            }
            if(shape.type === "dynamic") 
            {
                this.shapes.dynamic.add(shape);
                this.dynamicHash.insert(shape);
            }

            _.each(shapeDefaults, function(val, key){ shape[key] = typeof shape[key] === "undefined" ? val : shape[key] });
            _.each(shapeMethods, function(val, key){ shape[key] = shape[key]||val });

            return this;
        },

        remove:function(shape)
        {
            if(!(shape instanceof G.Shape)) return false;
            if(this.shapes.all.has(shape)) this.shapes.all.remove(shape);
            else return false;
            
            if(shape.type==="static") 
            {
                this.shapes.static.remove(shape);
                this.staticHash.remove(shape);
            }
            else if(shape.type==="kinematic") 
            {
                this.shapes.kinematic.remove(shape);
                this.kinematicHash.remove(shape);
            }
            else if(shape.type==="dynamic") 
            {
                this.shapes.dynamic.remove(shape);
                this.dynamicHash.remove(shape);
            }
            //remove shape physics methods
            _.each(shape, function(val, key){ if(key in shapeMethods) delete shape[key]; });

            return this;
        },

        update:function()
        {            
            var self = this;

            //with hash
            if(this.collisions.dynamicstatic !== false && self.staticHash.length !== self.shapes.static.length()) self.staticHash.clear().insert(self.shapes.static);
            if(this.collisions.dynamickinematic !== false) self.kinematicHash.clear().insert(self.shapes.kinematic);
            if(this.collisions.dynamicdynamic !== false || this.collisions.dynamicstatic !== false) self.dynamicHash.clear().insert(self.shapes.dynamic);

            //resolve collisions
            if(self.collisions.dynamicstatic && self.collisions !== false && self.shapes.dynamic.length() >= self.shapes.static.length())
            {
                self.shapes.static.each(function(shape)
                {
                    shape.colliding = false;
                    if(shape.enableCollisions === false || shape.physics === false) return;
                    //retrieve shapes in position range
                    _.each(self.dynamicHash.retrieve(shape), function(shape2)
                    {
                        if(shape2.physics === false || shape2.enableCollisions === false) return;
                        self.handleCollisions(shape, shape2);
                    });
                });
            }

            self.shapes.kinematic.each(function(shape)
            {
                //if shape changed, reset
                if(shape.type !== "kinematic") { self.shapes.kinematic.remove(shape); shape.type === "static" ? self.shapes.static.add(shape) : self.shapes.dynamic.add(shape); return; }

                //don't do physics if shape says so
                if(shape.physics === false) return;

                shape.update();

                if(self.collisions !== false && shape.enableCollisions !== false && self.collisions.dynamickinematic && self.shapes.dynamic.length() >= self.shapes.kinematic.length()) 
                {
                    shape.colliding = false;
                    //retrieve shapes in position range
                    _.each(self.dynamicHash.retrieve(shape), function(shape2)
                    {
                        if(shape2.physics === false || shape2.enableCollisions === false) return;
                        self.handleCollisions(shape, shape2);
                    });
                }
            });

            self.shapes.dynamic.each(function(shape)
            {
                //if shape changed, reset
                if(shape.type !== "dynamic") { self.shapes.dynamic.remove(shape); shape.type === "static" ? self.shapes.static.add(shape) : self.shapes.kinematic.add(shape); return; }

                //don't do physics if shape says so
                if(shape.physics === false) return;

                if(shape.gravity !== false) shape.acc = self.gravity;

                shape.update();

                //resolve collisions
                if(self.collisions !== false && shape.enableCollisions !== false)
                {
                    shape.colliding = false;
                    if(self.collisions.dynamicstatic && self.shapes.dynamic.length() < self.shapes.static.length()) 
                    {
                        //retrieve shapes in position range
                        _.each(self.staticHash.retrieve(shape), function(shape2)
                        {
                            if(shape2.physics === false || shape2.enableCollisions === false) return;
                            self.handleCollisions(shape, shape2);
                        });
                    }

                    if(self.collisions.dynamickinematic && self.shapes.dynamic.length() < self.shapes.kinematic.length()) 
                    {
                        //retrieve shapes in position range
                        _.each(self.kinematicHash.retrieve(shape), function(shape2)
                        {
                            if(shape2.physics === false || shape2.enableCollisions === false) return;
                            self.handleCollisions(shape, shape2);
                        });
                    }

                    if(self.collisions.dynamicdynamic) 
                    {
                        //retrieve shapes in position range
                        _.each(self.dynamicHash.retrieve(shape), function(shape2)
                        {
                            if(shape2.physics === false || shape2.enableCollisions === false) return;
                            self.handleCollisions(shape, shape2);
                        });
                    }
                }
            });

            //debug
            // G.pause();
        },

        handleCollisions:function(shape1, shape2)
        {
            var self = this;

            if(!shape1 || !shape2 || shape1 === shape2 || (shape1.type !== "dynamic" && shape2.type !== "dynamic")) return false;

            // * * * * * * * 
            //TODO - Make collision detection more efficient, better in general etc.
            //TODO - Add good support for dynamic-dynamic collisions, for now no support
            // * * * * * * * 
            //Perform Collision Detection

            //make sure shape2 is dynamic
            if (shape2.type !== "dynamic"){  var temp = shape2 ; shape2 = shape1; shape1 = temp; }

            //trigger collision check start on shapes
            if(shape1.events) var res1 = shape1.trigger("collisionCheck", [shape2]);
            if(shape2.events) var res2 = shape2.trigger("collisionCheck", [shape1]);
            //exit if shapes want to exit
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true; 

            //TODO - add swept collisions
            var mtv = G.intersecting(shape1, shape2);
            if(!mtv) 
            {
                return false;
            }

            //trigger collision event on shapes
            if(shape1.type !== "dynamic")
            {
                if(shape1.events) var res1 = shape1.trigger("collision", [shape2, mtv]);
                if(shape2.events) var res2 = shape2.trigger("collision", [shape1, mtv]);
            }
            else
            {
                if(shape1.events) var res1 = shape1.trigger("collision", [shape2, mtv.divide(2).multiply(-1)]);
                if(shape2.events) var res2 = shape2.trigger("collision", [shape1, mtv.divide(2)]);
            }
            
            //exit if shapes want to exit
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true; 
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true;

            //Perform Collision Response
            //TODO - Make realistic response, handle slopes, handle rotation, handle friction, handle non-AABB

            var restitution = (shape1.restitution && shape2.restitution) ? 1 * shape1.restitution * shape2.restitution : Math.max(shape1.restitution, shape2.restitution);
            var friction = (shape1.friction + shape2.friction)/2;

            if(shape1.type !== "dynamic")
            {
                if(shape2.vel.y > 0 && mtv.y > 0 || shape2.vel.y < 0 && mtv.y < 0) return;
                //push shape2's position to be outside of shape1
                shape2.pos.add(mtv);

                //Handle for simple AABB's
                //simple aabb velocity reversing, does not work with rotating shapes or non-box shapes
                if(shape2.rotation === 0 && shape1.rotation === 0) 
                {
                    //reverse vel, and apply restitution
                    if((shape2.vel.x !== 0) && (Math.abs(mtv.x) > 0)) shape2.vel.x *= -1*restitution;
                    if((shape2.vel.y !== 0) && (Math.abs(mtv.y) > 0)) shape2.vel.y *= -1*restitution;

                    //friction
                    if(shape2.vel.x<0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x>-0.01)shape2.vel.x=0;
                    }
                    else if(shape2.vel.x>0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x<0.01)shape2.vel.x=0;
                    }
                }
            }

            //set dynamicdynamic to true to enable this code
            else
            {
                //push shape2's position to be outside of shape1
                shape2.pos.add(mtv.divide(2));
                shape1.pos.subtract(mtv.divide(2));

                //Handle for simple AABB's
                //simple aabb velocity reversing, does not work with rotating shapes or non-box shapes
                if((shape2.shape === "circle" || shape2.shape === "rect") && shape2.rotation === 0 ) 
                {
                    if(shape2.vel.x !== 0 && mtv.x !== 0) 
                    {
                        //reverse
                        var temp = shape1.vel.x;
                        shape1.vel.x = shape2.vel.x;
                        shape2.vel.x = temp;

                        //restitution
                        shape2.vel.x *= 1*restitution;
                        shape1.vel.x *= 1*restitution;
                    }

                    if(shape2.vel.y !== 0 && mtv.y !== 0) 
                    {
                        //reverse
                        var temp = shape1.vel.y;
                        shape1.vel.y = shape2.vel.y;
                        shape2.vel.y = temp;

                        //restitution
                        shape2.vel.y *= 1*restitution;
                        shape1.vel.y *= 1*restitution;
                    }
                    
                    //friction
                    if(shape2.vel.x<0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x>-0.001)shape2.vel.x=0;
                    }
                    else if(shape2.vel.x>0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x<0.001)shape2.vel.x=0;
                    }
                    //friction
                    if(shape1.vel.x<0 && friction)
                    {
                        shape1.vel.x*=1-(friction/10);
                        if(shape1.vel.x>-0.001)shape1.vel.x=0;
                    }
                    else if(shape1.vel.x>0 && friction)
                    {
                        shape1.vel.x*=1-(friction/10);
                        if(shape1.vel.x<0.001)shape1.vel.x=0;
                    }
                }
            }
        }

    });

})();

G.intersecting = (function()
{

//parameters are pointx, pointy, centerx, centery, rotation in radians (center is pivot point)
function rotatePoint(point, origin, angle)
{
    var X = origin.x + ((point.x - origin.x) * Math.cos(angle) - (point.y - origin.y) * Math.sin(angle));
    var Y = origin.y + ((point.x - origin.x) * Math.sin(angle) + (point.y - origin.y) * Math.cos(angle));
    return new G.Vector(X,Y);
}

return function(shape1, shape2, reverseVertices)
{
    if(shape2 instanceof G.Vector) shape2 = new G.Circle(shape2.x,shape2.y,0.1,false);
    if ((shape1 instanceof G.Collection)) 
    {

    }
    else if (shape1 instanceof Array)
    {
        var bool = false;
        _.each(shape1, function(shape)
        {
            if(!(shape instanceof G.Shape)) return;
            if (shape2 instanceof G.Shape) 
            {
                var intersecting = G.intersecting(shape, shape2, reverseVertices);
            }
            else _.each(shape1, function(shape1)
            {
                if (shape1 instanceof G.Shape) var intersecting = G.intersecting(shape, shape1, shape2);
                if(intersecting) bool = intersecting;
                if(bool) return false;
            });
            if(intersecting) bool = intersecting;
            if(bool) return false;
        });
        return bool;
    }

    //if shapes are the same, exit
    if(shape1 === shape2) return false;

    //detect simple aabb collision, saves compute time for complex shapes
    if(!aabb(shape1, shape2)) return false;

    //if one is static, return mtv for other one, defaults to returning shape1's mtv from shape2
    if(shape2.shape === "static"){ var temp = shape2; shape2 = shape1; shape1 = temp;}

    //circle vs circle
    if(shape1.shape === "circle" && shape2.shape === "circle") return circle2circle(shape1, shape2);

    //if no circles, do SAT (separating axis test) polygon against polygon
    else if(shape1.shape !== "circle" && shape2.shape !== "circle") return polygon2polygon(shape1, shape2);

    //if one circle and one polygon, do SAT (separating axis test) polygon against circle (different from above)
    else if(shape1.shape === "circle" || shape2.shape === "circle") return polygon2circle(shape1, shape2);

    //otherwise, not objects able to be tested
    else return false;

    //simple broad phase check
    function aabb(shape1, shape2)
    {
        //quick method
        if(shape1.shape === "circle" || shape1.shape === "rect") return shape2.pos.x-shape2.width/2<shape1.pos.x+shape1.width/2&&shape2.pos.x+shape2.width/2>shape1.pos.x-shape1.width/2&&shape2.pos.y-shape2.height/2<shape1.pos.y+shape1.height/2&&shape2.pos.y+shape2.height/2>shape2.pos.y-shape2.height/2;

        //slow method, for other shapes like polygon and line
        var b1 = shape1.bounds(), b2 = shape2.bounds();
        return b2.left<b1.right&&b2.right>b1.left&&b2.top<b1.bottom&&b2.bottom>b2.top;
    }

    function circle2circle(circle1, circle2)
    {
        //algorithm from http://cgp.wikidot.com/circle-to-circle-collision-detection
        var x1 = circle1.pos.x, y1 = circle1.pos.y, x2 = circle2.pos.x, y2 = circle2.pos.y, r1 = circle1.radius, r2 = circle2.radius;
        var distanceSq = Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2);
        var intersection = distanceSq < Math.pow(r1+r2, 2);
        if (!intersection) return false;

        var overlapDistance = (r2+r1) - Math.sqrt(distanceSq);
        var axis = new G.Vector(x2-x1, y2-y1).normalize();
        return new G.Vector( axis.x * (overlapDistance+0.01), axis.y * (overlapDistance+0.01) );
    }

    //uses SAT (separating axis test)
    // Referenced from many resources, step by step at http://www.sevenson.com.au/actionscript/sat/
    // Basically, if a line can be drawn in between shape 1 and shape 2, they are not intersecting
    // Steps: Get normals to all shape edges, project all vertices of both shapes onto that normal, if there is a gap in any axis, the shapes do not intersect
    function polygon2polygon(shape1, shape2)
    {
        //Get Vertices
        var vertices1 = getVertices(shape1),
            vertices2 = getVertices(shape2);

        //used for collision response
        var shortestDist = Number.MAX_VALUE;

        //test all normals of shape 1's sides
        for(var i = 0; i < vertices1.length; i++)
        {
            //Compute Normal

            // to generate normal of edge, get the length from point a to point b on edge, as [x, y]. the normal is [-y, x] of that vector
            // e.g. if len = [ x2-x1, y2-y1 ], then normal = [ -len[1], len[0] ]. Slope = rise/run, normal's slope = -run/rise

            //get length and height of edge
            var len = new G.Vector((vertices1[i+1] ? vertices1[i+1].x : vertices1[0].x) - vertices1[i].x, (vertices1[i+1] ? vertices1[i+1].y : vertices1[0].y) - vertices1[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            //Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices1);
            var projection2 = getProjection(axis, vertices2);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] >= projection2[1] || projection2[0] >= projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            //1 is max of projection, 0 is min
            var dist = (projection2[1]-projection1[0]) * -1;
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (dist-0.01), axis.y * (dist-0.01));
            }
        }

        //test all normals of shape 2's sides
        for(var i = 0; i < vertices2.length; i++)
        {
            //Compute Normal
            //get length and height of edge
            var len = new G.Vector((vertices2[i+1] ? vertices2[i+1].x : vertices2[0].x) - vertices2[i].x, (vertices2[i+1] ? vertices2[i+1].y : vertices2[0].y) - vertices2[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            //Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices1);
            var projection2 = getProjection(axis, vertices2);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] >= projection2[1] || projection2[0] >= projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            var dist = (projection2[1]-projection1[0]);
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (dist-0.01), axis.y * (dist-0.01));
            }
        }

        if(typeof mtv === "undefined") console.log(shape1, shape2);

        return mtv;
    }

    //uses SAT (separating axis test)
    function polygon2circle(shape1, shape2)
    {
        var circle = shape1.shape === "circle" ? shape1 : shape2;
        var polygon = shape1.shape === "circle" ? shape2 : shape1;

        //Get Vertices of polygon
        var vertices = getVertices(polygon);

        //used for collision response
        var shortestDist = Number.MAX_VALUE;

        // find the vertex of the polygon closest to the circle
        var x = circle.pos.x, y = circle.pos.y;
        var closestPoint = vertices[0];

        var closestDist = Math.pow(circle.pos.x - closestPoint.x, 2) + Math.pow(circle.pos.y - closestPoint.y, 2);
        for(var i = 1; i < vertices.length; i++) 
        {
            var point = vertices[i];
            var currentDist = Math.pow(circle.pos.x - point.x, 2) + Math.pow(circle.pos.y - point.y, 2);
            if (currentDist < closestDist) 
            {
                closestDist = currentDist;
                closestPoint = vertices[i];
            }
        }
        
        // make an axis of this vector
        var axis = new G.Vector(x-closestPoint.x, y-closestPoint.y).normalize();
        
        // Project Vertices of both shapes onto axis
        var projection1 = getProjection(axis, vertices);
        var projection2 = getProjection(axis, circle);
        
        //test for gaps, if gaps then no intersection
        if (projection1[0] > projection2[1] || projection2[0] > projection1[1]) return false;

        //calculate MTV (minimum translation vector) - for collision response
        if(circle === arguments[0]) var dist = (projection2[1]-projection1[0]);
        else  var dist = (projection2[1]-projection1[0]) * -1;
        var distAbs = Math.abs(dist);

        shortestDist = distAbs;
        mtv = new G.Vector(axis.x * (circle===shape1?(dist+0.01):(dist-0.01)), axis.y * (circle===shape1?(dist+0.01):(dist-0.01)));

        //do normal axises of all edges as usual
        for(var i = 0; i < vertices.length; i++)
        {
            // Compute Normal / Get Axis
            //get length and height of edge
            var len = new G.Vector((vertices[i+1] ? vertices[i+1].x : vertices[0].x) - vertices[i].x, (vertices[i+1] ? vertices[i+1].y : vertices[0].y) - vertices[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            // Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices);
            var projection2 = getProjection(axis, circle);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] > projection2[1] || projection2[0] > projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            if(circle === arguments[0]) var dist = (projection2[1]-projection1[0]);
            else  var dist = (projection2[1]-projection1[0]) * -1;
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (circle===shape1?(dist+0.01):(dist-0.01)), axis.y * (circle===shape1?(dist+0.01):(dist-0.01)));
            }
        }

        return mtv;
    }

    //helper functions

    //Get Vertices - from different types of shapes, must be in clockwise order
    function getVertices(shape)
    {
        var vertices = [];

        //line contains x1,y1,x2,y2 in pos
        if(shape.shape === "line") 
        {
            //simulate rect for collision response's sake
            var len = new G.Vector(shape.pos.x2-shape.pos.x1, shape.pos.y2-shape.pos.y1);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize(0.01);

            vertices = [shape.pos.x1, shape.pos.y1, shape.pos.x2, shape.pos.y2, shape.pos.x2+axis.x, shape.pos.y2+axis.y, shape.pos.x1+axis.x, shape.pos.y1+axis.y];
        }

        //polygon contains sequence in vertices array, relative to pos, e.g. [pos.x-x1,pos.y-y1,pos.x-x2,pos.y-y2]
        else if(shape.shape === "polygon") 
        {
            for(var i = 0; i < shape.vertices.length-1; i += 2) vertices.push((shape.pos.x||0)+shape.vertices[i], (shape.pos.y||0)+shape.vertices[i+1]);
            if(reverseVertices)
            {
                var n = [], arr = vertices;
                for(var i = arr.length-1; i > 0; i -= 2)
                {
                    n.push(arr[i-1], arr[i]);
                }
                vertices = n;
            }
        }

        //box contains pos -> x,y at center, width and height
        else if(shape.shape === "rect") 
        {
            var hw = shape.width/2, hh = shape.height/2;
            //clockwise order from top left
            vertices = [shape.pos.x-hw, shape.pos.y-hh, shape.pos.x+hw, shape.pos.y-hh, shape.pos.x+hw, shape.pos.y+hh, shape.pos.x-hw, shape.pos.y+hh];
        }

        //if invalid shape
        else throw new Error("Shape does not contain vertices");

        //convert to vectors
        var vecVertices = [];
        for(var i = 0; i < vertices.length; i+=2) vecVertices.push(new G.Vector(vertices[i], vertices[i+1]));

        //account for rotation
        if(shape.rotation !== 0)
        {
            for(var i = 0; i < vecVertices.length; i++)
            {
                vecVertices[i] = rotatePoint(vecVertices[i], shape.pos, shape.rotation);
            }
        }

        return vecVertices;
    }

    function getProjection(axis, vertices)
    {
        var max, min;

        //if circle
        if(vertices.shape === "circle")
        {
            var circle = vertices;
            min = axis.dot(circle.pos) - circle.radius;
            max = min + circle.radius*2;
        }

        //if polygon
        else
        {
            max = min = axis.dot(vertices[0]);

            //get start and end of projection
            for (var j = 0; j < vertices.length; j++) 
            {
                var currentPoint = axis.dot(vertices[j]);
                if (currentPoint < min) min = currentPoint;
                if (currentPoint > max) max = currentPoint;
            }
        }

        return [min, max];
    }            
}

})();


G.toDegrees = function(radians)
{
    return radians * (180 / Math.PI);
}

G.toRadians = function(degrees)
{
    return degrees * (Math.PI / 180);
}


G.random=function(max, min)
{
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return Math.round(min+(Math.random()*(max-min)));
}

G.random.float = function(max,min)
{
    var min = typeof min === "number" ? min : 0;
    var max = typeof max === "number" ? max : 1;
    return min+(Math.random()*(max-min));
};

G.random.color = function()
{
    return "rgb("+G.random(255)+","+G.random(255)+","+G.random(255)+")";
};

G.random.choice = function(arr)
{
    if(Array.isArray(arr)) return arr[G.random(arr.length-1)];
    return arguments[G.random(arguments.length-1)];
}

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

//G Main / initialize

//add event methods to G
Emit.mixin(G);
Emit.mixin(G.Class);

G.events = true;

G.stages = [];
G.collections = [];

G.isMobile = (function() 
{
        //from Modernizr
        try 
        {  
            document.createEvent("TouchEvent");  
            return true;  
        } 
        catch (e) 
        {  
            return false;  
        } 
})();

//add root stage events
G.event = new Event();

//prevent mouse and only allow touch events if on mobile, disable default browser touch events (includes annoying zooming when clicked)
// if(G.isMobile) G.event.mouse.onlyTouch().on('touchstart,touchend,touchmove', function(e){ e.preventDefault(); })

return G;


});