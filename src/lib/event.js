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
