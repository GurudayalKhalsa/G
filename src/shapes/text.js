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
        delete this.addToStage;
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