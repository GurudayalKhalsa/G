G.Bounds = (function(){

return G.Collection.extend
({
    initialize:function(x1,y1,x2,y2,restitution,friction,lineWidth)
    {
        this._super(false, true);

        this.lineWidth = lineWidth || 2;

        var hidden = typeof hidden === "boolean" ? hidden : true;
        this.friction = typeof friction === "number" ? friction : 0;
        this.restitution = typeof restitution === "number" ? restitution : 0;
        
        //default dimensions
        if(arguments.length < 4)
        {
            //set if no defaults
            if(arguments[2]) this.lineWidth = arguments[2] || this.lineWidth;
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
            height:this.lineWidth,
            type:"static",
            hidden:hidden,
            friction: this.friction,
            restitution: this.restitution
        };

        for(var i = 0; i < arguments.length; i++) if(typeof arguments[i] === "string") var rejections = arguments[i].split(",");

        var a,b,c,d;

        //in order of top, left, bottom, right
        if(!rejections || rejections.indexOf("top") === -1) a = new G.Rect(line);
        
        line.pos.x = x1, line.pos.y = (y2+y1)/2, line.width = this.lineWidth, line.height = y2-y1;
        if(!rejections || rejections.indexOf("left") === -1) b = new G.Rect(line);

        line.pos.x = (x2+x1)/2, line.pos.y = y2, line.width = x2-x1, line.height = this.lineWidth;
        if(!rejections || rejections.indexOf("bottom") === -1) c = new G.Rect(line);

        line.pos.x = x2, line.pos.y = (y2+y1)/2, line.width = this.lineWidth, line.height = y2-y1;
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