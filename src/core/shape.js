
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
        var defaults = _.extend
        ({
          pos: new G.Vector(),
          vel: new G.Vector(),
          width: 0,
          height: 0,
          rotation: 0,
          zindex: 0,
          color: "#000",
          fill: true,
          hidden: false
        }, defaults ||
        {});
                
        this._super(obj, defaults);
        
        var self = this;
        
        //define custom properties
        //------------------------
        
        //zindex
        (function()
        {
            
            var zindex = this.zindex;
            Object.defineProperty(this, "zindex", 
            {
                get: function(){ return zindex },
                set: function(z)
                { 
                    zindex = z; 
                    if(this.stage) this.stage.sortByZindex();
                    _.each(this.collections, function(collection)
                    {
                        collection.sortByZindex();
                    })
                }.bind(this)
            })
            
        }).bind(this)();
        
        //bounds
        (function(){
            
            if(typeof this.width === "undefined" || typeof this.height === "undefined" || typeof this.pos.x === "undefined" || typeof this.pos.y === "undefined") return;
            
            if(typeof this.bounds.left !== "undefined") return;
            
            Object.defineProperty(this.bounds, "top",
            {
                set: function(val){ this.pos.y=val+this.height/2; }.bind(this),
                get: function(){ return this.pos.y-this.height/2; }.bind(this)
            });
            
            Object.defineProperty(this.bounds, "left",
            {
                set: function(val){ this.pos.x=val+this.width/2; }.bind(this),
                get: function(){ return this.pos.x-this.width/2; }.bind(this)
            });
            
            Object.defineProperty(this.bounds, "bottom",
            {
                set: function(val){ this.pos.y=val-this.height/2; }.bind(this),
                get: function(){ return this.pos.y+this.height/2; }.bind(this)
            });
            
            Object.defineProperty(this.bounds, "right",
            {
                set: function(val){ this.pos.x=val-this.width/2; }.bind(this),
                get: function(){ return this.pos.x+this.width/2; }.bind(this)
            });
            
        }).bind(this)();
        
        //physics
        (function(){
                        
            var physics = this.physics;
            
            var d = Object.getOwnPropertyDescriptor(this, "physics");
            if(d && d.configurable === false) return false;
            
            Object.defineProperty(this, "physics",
            {
                set: function(p)
                {
                    physics = p;
                    if(this.stage && this.stage.world && this.stage.world instanceof G.Physics.World)
                    {
                        p ? this.stage.world.add(this) : this.stage.world.remove(this);
                    }
                },
                get: function()
                {
                    return physics;
                }
            });
            
        }.bind(this))();
        
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
                }
                else if(key==="bottom") 
                {
                    this.pos.y=bounds[key]-this.height/2;
                }
                else if(key==="left") 
                {
                    this.pos.x=bounds[key]+this.width/2;
                }
                else if(key==="right") 
                {
                    this.pos.x=bounds[key]-this.width/2;
                }
            }
            
            return this;
        }

        else
        {
            //if doesn't have bounds, return
            if(!this.width) return false;
            var w = this.width/2, h = this.height/2;
            var bounds = {};

            bounds.left = this.pos.x-w;
            bounds.right = this.pos.x+w;
            bounds.top = this.pos.y-h;
            bounds.bottom = this.pos.y+h;
            return bounds;
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

        return G.Physics.intersecting(point, this, reverse);
            
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
                var intersection = G.Physics.intersecting(shape, self);
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
