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

        if(this.stroke) ctx.lineWidth = this.thickness;

        // //draw at new position and dimensions if specified (does not set position of object), (used in rotating)
        if(w === undefined) w = this.width;
        if(h === undefined) h = this.height;
        if(x === undefined) x = this.pos.x-w/2;
        if(y === undefined) y = this.pos.y-h/2;

        if(this.fill)
        {
            ctx.fillStyle = this.color;
            ctx.fillRect(x,y,w,h);
        }
        if(this.stroke)
        {
            ctx.strokeStyle = this.strokeColor||this.color;
            ctx.strokeRect(x,y,w,h);
        }
        
    }
});