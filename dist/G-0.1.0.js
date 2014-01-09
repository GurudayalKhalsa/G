/**
 * G 0.1.0, 2013-12-10
 * A lightweight, modular, extendable HTML5 Canvas renderer and library
 *
 * Copyright (c) 2013 Gurudayal Khalsa, gurudayalkhalsa@gmail.com
 * Licensed MIT
 */
! function(name, root, factory) {
    //expose module to either Node/CommonJS or AMD if available, and root object of choosing (e.g. Window)
    (typeof define === "function" && define.amd) ? define(function(){ return root.call(factory) }) : (typeof module === "object" && typeof module.exports === "object") ? module.exports = factory.call(root) : root[name] = factory.call(root)
}
("G", this, function() {
// --------------------------------- \\
// JS Class method (from John Resig) \\
// --------------------------------- \\

(function() {
    var initializing = false,
        fnTest = /xyz/.test(function() {
            xyz
        }) ? /\b_super\b/ : /.*/;
    this.Class = function() {};
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this;
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function(name, fn) {
                return function() {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret
                }
            }(name, prop[name]) : prop[name]
        }

        function Class() {
            if (!initializing && this.initialize) this.initialize.apply(this, arguments)
        }
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class
    }
})();
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
            if (event in this._events === false) return;
            for (var i = 0; i < this._events[event].length; i++)
            {
                //if one, remove
                if(typeof this._events[event][i] === "object") 
                {
                    this._events[event][i][1].apply(this, arguments[1]||undefined);
                    this._events[event].splice(this._events[event][i], 1);
                }
                else this._events[event][i].apply(this, arguments[1]||undefined);
            }
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
var Stats=function(){var a=Date.now(),b=a,c=0,d=1/0,e=0,f=0,g=1/0,h=0,i=0,j=0,k=document.createElement("div");k.id="stats",k.addEventListener("mousedown",function(a){a.preventDefault(),p(++j%2)},!1),k.style.cssText="width:80px;opacity:0.9;cursor:pointer";var l=document.createElement("div");l.id="fps",k.appendChild(l);var m=document.createElement("div");m.id="fpsText",m.innerHTML="FPS",l.appendChild(m);var n=document.createElement("div");n.id="ms",n.style.cssText="display:none",k.appendChild(n);var o=document.createElement("div");o.id="msText",o.innerHTML="MS",n.appendChild(o);var p=function(a){switch(j=a){case 0:l.style.display="block",n.style.display="none";break;case 1:l.style.display="none",n.style.display="block"}};return{REVISION:11,domElement:k,setMode:p,begin:function(){a=Date.now()},end:function(){var j=Date.now();return c=j-a,d=Math.min(d,c),e=Math.max(e,c),o.textContent=c+" MS ("+d+"-"+e+")",i++,j>b+1e3&&(f=Math.round(1e3*i/(j-b)),g=Math.min(g,f),h=Math.max(h,f),m.textContent=f+" FPS ("+g+"-"+h+")",b=j,i=0),j},update:function(){a=this.end()}}};

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

}).call(this);
// -------- \\
// Watch.js \\
// -------- \\

(function(e){if(typeof exports==="object"){module.exports=e()}else if(typeof define==="function"&&define.amd){define(e)}else{window.WatchJS=e();window.watch=window.WatchJS.watch;window.unwatch=window.WatchJS.unwatch;window.callWatchers=window.WatchJS.callWatchers}})(function(){"use strict";var e={noMore:false},r=[];var t=function(e){var r={};return e&&r.toString.call(e)=="[object Function]"};var n=function(e){return e%1===0};var a=function(e){return Object.prototype.toString.call(e)==="[object Array]"};var o=function(e,r){var t=[],n=[];if(!(typeof e=="string")&&!(typeof r=="string")){if(a(e)){for(var o=0;o<e.length;o++){if(r[o]===undefined)t.push(o)}}else{for(var o in e){if(e.hasOwnProperty(o)){if(r[o]===undefined){t.push(o)}}}}if(a(r)){for(var i=0;i<r.length;i++){if(e[i]===undefined)n.push(i)}}else{for(var i in r){if(r.hasOwnProperty(i)){if(e[i]===undefined){n.push(i)}}}}}return{added:t,removed:n}};var i=function(e){if(null==e||"object"!=typeof e){return e}var r=e.constructor();for(var t in e){r[t]=e[t]}return r};var f=function(e,r,t,n){try{Object.observe(e[r],function(e){n(e)})}catch(a){try{Object.defineProperty(e,r,{get:t,set:n,enumerable:true,configurable:true})}catch(o){try{Object.prototype.__defineGetter__.call(e,r,t);Object.prototype.__defineSetter__.call(e,r,n)}catch(i){throw new Error("watchJS error: browser not supported :/")}}}};var c=function(e,r,t){try{Object.defineProperty(e,r,{enumerable:false,configurable:true,writable:false,value:t})}catch(n){e[r]=t}};var u=function(){if(t(arguments[1])){s.apply(this,arguments)}else if(a(arguments[1])){l.apply(this,arguments)}else{h.apply(this,arguments)}};var s=function(e,r,t,n){if(typeof e=="string"||!(e instanceof Object)&&!a(e)){return}var o=[];if(a(e)){for(var i=0;i<e.length;i++){o.push(i)}}else{for(var f in e){if(e.hasOwnProperty(f)){o.push(f)}}}l(e,o,r,t,n);if(n){S(e,"$$watchlengthsubjectroot",r,t)}};var l=function(e,r,t,n,o){if(typeof e=="string"||!(e instanceof Object)&&!a(e)){return}for(var i in r){if(r.hasOwnProperty(i)){h(e,r[i],t,n,o)}}};var h=function(e,r,n,o,i){if(typeof e=="string"||!(e instanceof Object)&&!a(e)){return}if(t(e[r])){return}if(e[r]!=null&&(o===undefined||o>0)){s(e[r],n,o!==undefined?o-1:o)}w(e,r,n,o);if(i&&(o===undefined||o>0)){S(e,r,n,o)}};var p=function(){if(t(arguments[1])){v.apply(this,arguments)}else if(a(arguments[1])){d.apply(this,arguments)}else{m.apply(this,arguments)}};var v=function(e,r){if(e instanceof String||!(e instanceof Object)&&!a(e)){return}var t=[];if(a(e)){for(var n=0;n<e.length;n++){t.push(n)}}else{for(var o in e){if(e.hasOwnProperty(o)){t.push(o)}}}d(e,t,r)};var d=function(e,r,t){for(var n in r){if(r.hasOwnProperty(n)){m(e,r[n],t)}}};var w=function(r,t,n,a){var o=r[t];j(r,t);if(!r.watchers){c(r,"watchers",{})}if(!r.watchers[t]){r.watchers[t]=[]}for(var i=0;i<r.watchers[t].length;i++){if(r.watchers[t][i]===n){return}}r.watchers[t].push(n);var u=function(){return o};var l=function(i){var f=o;o=i;if(a!==0&&r[t]){s(r[t],n,a===undefined?a:a-1)}j(r,t);if(!e.noMore){if(f!==i){g(r,t,"set",i,f);e.noMore=false}}};f(r,t,u,l)};var g=function(e,r,t,n,a){if(r){for(var o=0;o<e.watchers[r].length;o++){e.watchers[r][o].call(e,r,t,n,a)}}else{for(var r in e){if(e.hasOwnProperty(r)){g(e,r,t,n,a)}}}};var b=["pop","push","reverse","shift","sort","slice","unshift"];var y=function(e,r,t,n){c(e[r],n,function(){var a=t.apply(e[r],arguments);h(e,e[r]);if(n!=="slice"){g(e,r,n,arguments)}return a})};var j=function(e,r){if(!e[r]||e[r]instanceof String||!a(e[r])){return}for(var t=b.length,n;t--;){n=b[t];y(e,r,e[r][n],n)}};var m=function(e,r,t){for(var n=0;n<e.watchers[r].length;n++){var a=e.watchers[r][n];if(a==t){e.watchers[r].splice(n,1)}}P(e,r,t)};var O=function(){for(var e=0;e<r.length;e++){var t=r[e];if(t.prop==="$$watchlengthsubjectroot"){var n=o(t.obj,t.actual);if(n.added.length||n.removed.length){if(n.added.length){l(t.obj,n.added,t.watcher,t.level-1,true)}t.watcher.call(t.obj,"root","differentattr",n,t.actual)}t.actual=i(t.obj)}else{var n=o(t.obj[t.prop],t.actual);if(n.added.length||n.removed.length){if(n.added.length){for(var a=0;a<t.obj.watchers[t.prop].length;a++){l(t.obj[t.prop],n.added,t.obj.watchers[t.prop][a],t.level-1,true)}}g(t.obj,t.prop,"differentattr",n,t.actual)}t.actual=i(t.obj[t.prop])}}};var S=function(e,t,n,a){var o;if(t==="$$watchlengthsubjectroot"){o=i(e)}else{o=i(e[t])}r.push({obj:e,prop:t,actual:o,watcher:n,level:a})};var P=function(e,t,n){for(var a=0;a<r.length;a++){var o=r[a];if(o.obj==e&&o.prop==t&&o.watcher==n){r.splice(a,1)}}};setInterval(O,50);e.watch=u;e.unwatch=p;e.callWatchers=g;return e});
var canvas,
    ctx,
    shapes,
    framerate;

var G = {};
G.setCanvas = function()
{
    var args = [];
    _.each(arguments, function(arg){ args.push(arg) });

    for(var i  = 0; i < args.length; i++)
    {
        var arg = args[i];

        //
        // Get Canvas 
        //
        
        if(!this.canvas && !this.ctx)
        {
            //if canvas object passed in
            if(args[i].tagName && arg.tagName === "CANVAS")
            {
                this.canvas = arg;
            }

            //else if id passed in
            else if(typeof arg === "string")
            {
                this.canvas = document.getElementById(arg);
            }

            else
            {
                this.canvas = document.body.appendChild(document.createElement('canvas'));
            }

            canvas = this.canvas;
            //get canvas's 2d context
            this.ctx = ctx = this.canvas.getContext('2d');
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
        this.canvas = canvas = document.body.appendChild(document.createElement('canvas'));
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = this.ctx = canvas.getContext('2d');
    }

    //depend on canvas
    if(!G.stage) G.stage = new G.Stage();

    this.width = G.stage.width = this.canvas.width;
    this.height = G.stage.height = this.canvas.height;

    return {canvas:this.canvas,ctx:ctx};
}

G.clearCanvas = function()
{
    if(G.canvas && G.ctx) G.ctx.clearRect(0,0,G.canvas.width, G.canvas.height);
}

G.getCanvas = function()
{
    return canvas;
}

G.getContext = function()
{
    return ctx;
}
G.Stage = Class.extend({

    initialize:function()
    {
        if(!canvas || !ctx) throw("Error: A canvas must be set before creating a Stage instance. Please call the G.setCanvas method first.");

        this.shapes = [];
        this._currentId = 0;
        this.width = canvas.width;
        this.height = canvas.height;
    },

    render:function(cb)
    {
        //shortcut for stage.on('render')
        // if(typeof cb === "function") G.on("render", cb);

        G.clearCanvas();

        var self = this;

        G.trigger("render");
        self.trigger("render");

        //draw and update all shapes in stage
        for(var i = 0; i < this.shapes.length; i++)
        {
            var shape = this.shapes[i];
            if(typeof shape !== "object") continue;
            G.trigger("renderShape", [shape]);
            self.trigger("renderShape", [shape]);
            shape.render();
        }

        G.trigger("renderComplete");
        self.trigger("renderComplete");
    },

    add:function(shape)
    {
        if(!shape) return false;
        if(this.has(shape)) 
        {
            // console.warn("Warning, shape is already in stage. Not re-adding.");
            return false;
        }

        this.trigger("add", arguments);

        var id = this._currentId;
        var index = this.shapes.indexOf(shape);
        shape = typeof shape === "object" ? shape : this.shapes[id];

        //if not in shapes, add to shapes
        if(index === -1 && typeof shape === "object")
        {
            this.shapes[id] = shape;
            this._currentId++;
        }

        else if(index > -1) 
        {
            console.log("Warning: " + shape.shape + " already exists. Not re-adding." )
            return false;
        }

        if(shape.collections && shape.collections.length === 0) 
        {
            return id;
        }
        
        shape.collections.push(this);

        return id;
    },

    remove:function(shape)
    {
        //if index, get shape
        if(typeof shape === "number") shape = this.get(shape);

        //exit if shape not an actual shape, or already in shapes
        if(typeof shape == "undefined" || !shape.render || !this.has(shape)) return false;

        var index = this.getId(shape);

        this.trigger("remove", arguments);
        shape.trigger("remove", this);

        delete this.shapes[index];

        if(!shape.collections || (shape.collections && shape.collections.length === 0)) return shape;
        var index = shape.collections.indexOf(this);
        shape.collections.splice(index, 1);

        return shape;
    },

    has:function(obj)
    {
        if(Array.isArray(obj)) var output = obj.map(function(shape){return this.has(shape)}, this);
        else output = this.shapes.indexOf(obj) !== -1;
        return output;
    },

    get:function(index)
    {
        return this.shapes[index];
    },

    getId:function(shape)
    {
        return this.shapes.indexOf(shape);
    },

    each:function(callback)
    {
        for(var i = 0; i < this.shapes.length; i++)
        {
            if(typeof this.shapes[i] !== "undefined") callback(this.shapes[i]);
        }
    },

    length:function()
    {
        //if no deleted shapes
        if(this.shapes.indexOf(undefined) === -1) return this.shapes.length;

        var count = 0;
        for(var i = 0; i < this.shapes.length; i++)
        {
            if(typeof this.shapes[i] !== "undefined") count++;
        }
        return count;
    }
});
//renders all shapes created (in stage)
G.render = function(cb)
{
    if(G.stage.length() === 0) return false;
    G.trigger("render");
    G.stage.render(cb);
}
G.animate = function(time)
{
    //prevent animating from being called many times
    if(typeof time === "function")window.cancelAnimationFrame(G.animate);
    //shortcut for G.on('animate'), adds callback
    if(typeof time === "function") G.on("animate", time);

    G.trigger("animate", arguments);
    G.trigger("animate:start", arguments);

    time = typeof time === "number" || undefined;

    G.deltaFramerate = G.getdeltaFramerate();

    //stats mode
    if(G.showFramerate === true && !G.stats.stats) G.stats.create(); 
    else if(G.showFramerate && G.stats.stats) G.stats.update();
    else if(!G.showFramerate && G.stats.stats) G.stats.remove();

    if(!G.isPaused)
    {
        if(G.desiredFramerate === 60) window.requestAnimationFrame(G.animate);
        else window.setTimeout( G.animate, 1000/G.desiredFramerate );
    }
    
    G.trigger("animate:end", arguments);
};

G.pause = function()
{
    G.isPaused = true;            
    G.trigger("pause", arguments);
};

G.unpause = function()
{
    //if wasn't already paused before, exit
    if(typeof G.isPaused === "undefined") return;
    G.isPaused = false;
    G.animate();            
    G.trigger("unpause", arguments);
};
var Shape = G.Shape = Class.extend({

    initialize:function(obj, defaults)
    {
        this.mergeValues(obj, defaults);

        this.add(this.addToCollection);
        if(this.addToCollection) delete this.addToCollection;
    },

    mergeValues:function(obj, defaults)
    {
        //exit if nothing to merge
        if(!obj && !defaults) return;

        var rootDefaults = {pos:{x:0,y:0},vel:{x:0,y:0},width:0,height:0,rotation:0,color:"#000",collections:[],isHidden:false};
        var params = rootDefaults;

        if(typeof defaults !== "object") defaults = {};

        //merge custom defauts with root defaults if custom defaults exist
        var defaults = defaults || {};
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

    //top left right bottom bounds
    bounds:function(bounds)
    {
        var hw = this.width/2;
        var hh = this.height/2;

        if(typeof bounds === "object")
        {
            //iterate through new bounds to be set, applying all
            for (var key in bounds)
            {
                //set position based on new key
                if(key==="top") this.pos.y=bounds[key]+hh;
                else if(key==="bottom") this.pos.y=bounds[key]-hh;
                else if(key==="left") this.pos.x=bounds[key]+hw;
                else if(key==="right") this.pos.x=bounds[key]-hw;
            }
        }

        else
        {
            return {
                left: this.pos.x-hw,
                right: this.pos.x+hw,
                top: this.pos.y-hh,
                bottom: this.pos.y+hh
            }
        }
        
    },

    posInBounds:function(x, y)
    {
        var bounds = this.bounds();
        return x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom;
    },
    
    render:function()
    {
        if(this.isHidden) return;

        this.trigger("render", arguments);

        if(this.rotation !== 0) this.rotate(this.rotation);
        else this._render();
    },

    rotate:function(radians)
    {
        this.trigger("rotate", arguments);

        ctx.save();
        ctx.translate(this.pos.x,this.pos.y);
        ctx.rotate(radians);
        this._render(0,0);
        ctx.restore();
    },
    
    remove:function(collection)
    {          
        //delete collection specified if specified
        if(collection && collection instanceof G.Collection)
        {
            var success = collection.remove(this);
            if(typeof success === "number") this.trigger("remove", collection);
        }

        //delete all collections this shape belongs to
        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var success = collection.remove(this);
                if(typeof success === "number") this.trigger("remove", collection);

            }, this);
        }

        //delete this shape from the root stage
        else if(G.stage) 
        {
            var success = G.stage.remove(this);
            if(typeof success === "number") this.trigger("remove", G.stage);
        }

    },

    add:function(collection)
    {
        if(collection === false) return false;

        if(collection && collection instanceof G.Collection) 
        {
            var id = collection.add(this);
            if(typeof id === "number") this.trigger("add", collection);
        }

        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var id = collection.add(this);
                if(typeof id === "number") this.trigger("add", collection);
            }, this);
        }

        if(G.stage) 
        {
            var id = G.stage.add(this);
            if(typeof id === "number") this.trigger("add", G.stage);                
            if(typeof id !== "undefined") this.stageId = id; 
        }            
    },

    hide:function()
    {
        this.trigger("hide", arguments);
        this.isHidden = true;
    },

    show:function()
    {
        this.trigger("show", arguments);
        this.isHidden = false;
    },

    toggleHidden:function()
    {
        if(this.isHidden) this.trigger("show", arguments);
        else this.trigger("hide", arguments);
        this.isHidden = !this.isHidden;
    },

    isVisible:function()
    {
        if(this.isHidden) return false;
        if(this.bounds().right > 0 && this.bounds().left < canvas.width && this.bounds().bottom > 0 && this.bounds().top < canvas.height ) return true;
        return false;
    }
});

G.Circle = Shape.extend({

    initialize:function(obj)
    {
        //if not passing in object literal, assign arguments as x,y,radius,vx,vy,color
        if(typeof obj !== "object" && arguments.length > 2)
        {
            var a = {};
            a.pos={x:arguments[0], y:arguments[1]};
            a.radius = arguments[2];
            if(typeof arguments[3] === "number") a.vel = {x:arguments[3]};
            if(typeof arguments[4] === "number") a.vel.y = arguments[4];
            if(typeof arguments[5] === "string") a.color = arguments[5];

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
        if(ctx.fillStyle!==this.color)ctx.fillStyle = this.color;

        //draw at specified position and dimensions if specified (does not set position of object), (used in rotating)
        if(typeof x !== "number") var x = this.pos.x;
        if(typeof y !== "number") var y = this.pos.y;
        if(typeof w !== "number") var w = this.radius;

        ctx.beginPath();
        ctx.arc(x,y,w,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
    }
});
G.Rect = Shape.extend({

    initialize:function(obj, defaults)
    {
        //if not passing in object literal, assign arguments as x,y,w,h,color
        if(typeof obj !== "object" && arguments.length > 4)
        {
            var a = {};
            //necessary
            a.pos={x:arguments[0], y:arguments[1]};
            a.width = arguments[2];
            a.height = arguments[3];
            //optional
            if(arguments[4]) a.vel = {x:arguments[4]};
            if(arguments[5]) a.vel.y = arguments[5];
            if(arguments[6]) a.color = arguments[6];

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
        if(ctx.fillStyle!==this.color)ctx.fillStyle = this.color;

        //draw at new position and dimensions if specified (does not set position of object), (used in rotating)
        if(typeof x === "number" && typeof y === "number") ctx.fillRect(x-this.width/2,y-this.width/2,this.width,this.height);
        else if(typeof x === "number" && typeof y === "number" && typeof w === "number" && typeof h === "number") ctx.fillRect(x-w/2,y-h/2,w,h);

        else ctx.fillRect(this.pos.x-this.width/2,this.pos.y-this.height/2,this.width,this.height);
    }

});
G.Line = Shape.extend({

    initialize:function(obj)
    {
        var defaults = {pos:{x1:0,y1:0,x2:0,y2:0,x:0,y:0}};
        arguments[1] = typeof arguments[1] === "object" ? _.extend(arguments[1], defaults) : defaults;

        //if not passing in object literal, assign arguments as x1,y1,x2,y2,strokeColor, fillColor
        if(typeof obj !== "object" && arguments.length > 3)
        {
            var a = {};
            //necessary
            a.pos={x1:arguments[0], y1:arguments[1], x2:arguments[2], y2:arguments[3]};

            //optional
            if(arguments[4]) a.vel = {x:arguments[4]};
            if(arguments[5]) a.vel.y = arguments[5];
            if(arguments[6]) a.color = arguments[6];

            var obj = arguments[0] = a;
        }

        this.shape="line";

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments);  


        //set center xy and dimensions initially
        this.setDimensions().setCenter();


        // //when shape changes, update values of dimensions and such
        var shape = this;
        watch(this, ["pos", "width", "height", "bounds"], function(){shape.setValues.apply(shape, arguments)});

    },

    //watch for all pos values, width, height
    setValues:function(prop, action, newvalue, oldvalue)
    {
        if(["x, y, width","height"].indexOf(prop) !== -1) 
        {
            //stop infinite loop, or props that shouldn't be called from being called
            WatchJS.noMore = true;

            this.setPoints.apply(this, arguments);
        }

        //if something changes
        if(["x1","y1","x2","y2"].indexOf(prop)!==-1)
        {
            //stop infinite loop, or props that shouldn't be called from being called
            WatchJS.noMore = true;

            this.setDimensions().setCenter().setPoints();
        }     
    },

    setPoints:function(prop, action, newvalue, oldvalue)
    {
        //if center x pos changes (translate)
        if(prop === "x")
        {
            var newX1 = this.pos.x1+(newvalue-oldvalue); 
            var newX2 = this.pos.x2+(newvalue-oldvalue); 

            if(Math.round(this.pos.x1) !== Math.round(newX1)) this.pos.x1 = Math.round(newX1);
            if(Math.round(this.pos.x2) !== Math.round(newX2)) this.pos.x2 = Math.round(newX2);
        }

        if(prop === "y")
        {
            var newY1 = this.pos.y1+(newvalue-oldvalue); 
            var newY2 = this.pos.y2+(newvalue-oldvalue); 

            if(Math.round(this.pos.y1) !== Math.round(newY1)) this.pos.y1 = Math.round(newY1);
            if(Math.round(this.pos.y2) !== Math.round(newY2)) this.pos.y2 = Math.round(newY2);
        }

        if(prop === "width")
        {
            var newX1 = this.pos.x1-(newvalue-oldvalue)/2; 
            var newX2 = this.pos.x2+(newvalue-oldvalue)/2; 

            if(this.pos.x1 !== newX1) this.pos.x1 = newX1;
            if(this.pos.x2 !== newX2) this.pos.x2 = newX2;
        }

        if(prop === "height")
        {
            var newY1 = this.pos.y1-(newvalue-oldvalue)/2; 
            var newY2 = this.pos.y2+(newvalue-oldvalue)/2; 

            if(this.pos.y1 !== newY1) this.pos.y1 = newY1;
            if(this.pos.y2 !== newY2) this.pos.y2 = newY2;
        }
    },

    setDimensions:function()
    {
        //set dimensions
        var newWidth = Math.abs(this.pos.x2-this.pos.x1);
        var newHeight = Math.abs(this.pos.y2-this.pos.y1);
        if(this.width !== newWidth) this.width = newWidth;
        if(this.height !== newHeight) this.height = newHeight;

        return this;
    },

    setCenter:function()
    {
        //set center pos
        var newX = this.pos.x2-(this.pos.x2-this.pos.x1)/2; 
        var newY = this.pos.y2-(this.pos.y2-this.pos.y1)/2; 

        if(this.pos.x !== newX) this.pos.x = newX;
        if(this.pos.y !== newY) this.pos.y = newY;

        return this;
    },

    _render:function(x,y)
    {
        //only change color if it needs to be changed
        if(ctx.fillStyle!==this.fillColor) ctx.fillStyle = this.fillColor;
        if(ctx.strokeStyle!==this.color) ctx.strokeStyle = this.color;

        ctx.beginPath();

        if(x && y)
        {

        }

        else
        {
            ctx.moveTo(this.pos.x1,this.pos.y1);
            ctx.lineTo(this.pos.x2,this.pos.y2);
        }

        ctx.stroke();
        ctx.closePath();
    }
});
//image (with rect body)
G.Image=G.Rect.extend({

    initialize:function(obj)
    {            
        //if not passing in object literal, assign arguments as src,x,y,vx,vy,width,height
        if(arguments.length > 2)
        {
            var a = {};
            //necessary
            a.src = arguments[0];
            a.pos={x:arguments[1], y:arguments[2]};

            //optional
            if(arguments[3]) a.vel = {x:arguments[3]};
            if(arguments[4]) a.vel.y = arguments[4];
            if(arguments[5]) a.width = arguments[5];
            if(arguments[6]) a.height = arguments[6];

            var obj = arguments[0] = a;
        }
        else if(typeof obj !== "object") throw new Error("You must pass in either an object or multiple arguments src,x,y,vx,vy,width,height");

        if(!obj.src) throw new Error("A G.Image must have a 'src' attribute.");

        this.shape = "image";

        var defaults = {src:"",clip:{x:0,y:0,width:0,height:0}};
        arguments[1] = typeof arguments[1] === "object" ? _.extend(arguments[1], defaults) : defaults;

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments); 

        //set values
        this.image = new Image();
        this.image.src = this.src;
        this.loaded = false;

        var object = this;

        function onload()
        {
            this.loaded = true;
            if(this.width === 0) this.width = this.image.naturalWidth;
            if(this.height === 0) this.height = this.image.naturalHeight;
        }

        this.image.addEventListener("load", function(){ onload.call(object); });

    },

    onload:function(cb)
    {
        //callback
        if(typeof cb === "function") this.image.addEventListener("load", cb);
    },

    _render:function(x,y,w,h)
    {
        if(this.loaded)
        {
            //draw at specified position and dimensions if specified (does not set position of object), (used in rotating)
            if(typeof x !== "number") var x = this.pos.x;
            if(typeof y !== "number") var y = this.pos.y;
            if(typeof w !== "number") var w = this.width;
            if(typeof h !== "number") var h = this.height;

            if(this.clip.width !== 0 && this.clip.height !== 0)
            {
                ctx.drawImage(this.image, this.clip.x, this.clip.y, this.clip.width, this.clip.height, x-w/2, y-h/2, w, h);
            }
            else
            {
                ctx.drawImage(this.image, x-w/2, y-h/2, w, h);
            }
            
        }
    }  

});

var getFramerate=function()
{
    var framerate = Math.ceil(1000/(Date.now()-time));
    time=Date.now();
    return framerate;
}

G.getdeltaFramerate = function()
{
    G.framerate = getFramerate();
    var deltaFramerate = (G.desiredFramerate/G.framerate)*G.timeScale;
    return deltaFramerate;
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
    if(Array.isArray(arr))
    {
        return arr[G.random(arr.length-1)];
    }
}
G.stats = {
    create:function()
    {
       var stats = this.stats = new Stats();
        this.el = stats.domElement;
        document.body.appendChild(this.el);
        this.el.style.cssText="padding:3px;z-index:100;position:absolute;left:0;top:0;cursor:pointer;background-color:#fff;font: 12px 'Helvetica Neue', Helvetica, Arial, sans-serif;";
    },
    update:function()
    {
        if(this.stats) this.stats.update();
    },
    remove:function()
    {
        if(this.el && this.el.parentNode === document.body) document.body.removeChild(this.el);
    }
}
//define a vector
G.Vector = function(x, y) 
{
    this.x = x;
    this.y = y;
}

G.Vector.prototype.dot = function (v) 
{
    return this.x * v.x + this.y * v.y;
};

G.Vector.prototype.length = function() 
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

G.Vector.prototype.normalize = function() 
{
    var s = 1 / this.length();
    this.x *= s;
    this.y *= s;
    return this;
};

G.Vector.prototype.multiply = function(s) {
    return new G.Vector(this.x * s, this.y * s);
};

G.Vector.prototype.tx = function(v) 
{
    this.x += v.x;
    this.y += v.y;
    return this;
};
//add event methods to G
Emit.mixin(G);
Emit.mixin(G.Stage);
Emit.mixin(Shape);

G.collections = [];

G.framerate = G.desiredFramerate = 60;
G.timeScale = 1;
var time = Date.now();

G.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

return G;

});