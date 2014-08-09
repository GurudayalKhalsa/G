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
        if(this.lineWidth) ctx.lineWidth = this.lineWidth;
        
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