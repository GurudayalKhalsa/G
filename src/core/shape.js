
//Shape Module
//-------------


var Shape = G.Shape = G.Object.extend
({
    initialize:function(type)
    {
        if(["bounds", "circle", "rect", "polygon", "image", "sprite", "text", "line"].indexOf("type") === -1) throw new Error("Type must be one of bounds, circle, rect, polygon, image, sprite, text, line");
        return new G[ type[0].toUpperCase()+type.substr(1) ](Array.prototype.slice.call(arguments, 1));
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
