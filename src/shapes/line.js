G.Line = Shape.extend({

    initialize:function(obj)
    {
        var defaults = {pos:{x1:0,y1:0,x2:0,y2:0,x:0,y:0}, lineWidth:1,lineCap:"butt"};

        //if not passing in object literal, assign arguments as x1,y1,x2,y2,strokeColor,lineWidth,vx,vy
        if(typeof obj !== "object" && arguments.length > 3)
        {
            var a = {};
            //necessary
            a.pos={x1:arguments[0], y1:arguments[1], x2:arguments[2], y2:arguments[3]};

            //optional
            if(typeof arguments[4] === "string") a.color = arguments[4];
            if(typeof arguments[5] === "number") a.lineWidth = arguments[5];
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
        //change lineWidth
        ctx.lineWidth = this.lineWidth;
        //change end style
        ctx.lineCap = this.lineCap;

        ctx.stroke();
        ctx.closePath();
    }
});