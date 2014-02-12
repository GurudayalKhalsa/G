//image (with rect body)
G.Image=G.Rect.extend({

    initialize:function(obj)
    {            
        //if not passing in object literal, assign arguments as src,x,y,width,height,vx,vy,clip
        if(typeof arguments[0] === "string")
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
        if(!obj.image)
        {
            this.image = new Image();
            this.image.src = this.src;
            this.loaded = false;
            this.image.addEventListener("load", function(){ onload.call(self); });
        }
        
        else onload(true);
        
        var self = this;

        function onload(loaded)
        {
            this.loaded = true;
            if(this.width === 0) this.width = this.image.naturalWidth;
            //make sure if only width provided, to scale height according to aspect ratio
            if(this.height === 0) this.height = this.width / (this.image.naturalWidth / this.image.naturalHeight);
            if(!loaded)self.trigger("load");
        }
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
