/**
 * [poop description]
 * @param  {[type]} arg
 * @return {[type]}
 */

G.Camera=G.Class.extend
({
    initialize:function(obj)
    {
        if(obj.stage) this.stage = obj.stage;
        else this.stage = G.stage;
        //assign parameters based on defaults and passed in object
        var params = {pos:new G.Vector(),vel:{x:0,y:0},scrollRatio:{x:2,y:2},focus:0,frame:{left:0,right:this.stage.width,top:0,bottom:this.stage.height},bounds:{left:0,right:this.stage.width,top:0,bottom:this.stage.height}};
        for (i in params) this[i] = params[i];
        for (i in obj) this[i] = obj[i];
    },

    translate:function()
    {
        this.trigger("update");

        if(this.focus && this.focus.pos)
        {
            //find new camera coordinates based on focus's position
            this.pos.x=this.focus.pos.x-this.frame.right/this.scrollRatio.x;
            this.pos.y=this.focus.pos.y-this.frame.bottom/this.scrollRatio.y;
        }
        //if camera is before start or after end of level bounds, make it stop at start or end

        //make sure to stop translating if gone over level bounds
        if(typeof this.bounds.left === "number" && this.pos.x+this.frame.left < this.bounds.left) this.pos.x = this.bounds.left;
        if(typeof this.bounds.top === "number" && this.pos.y+this.frame.top < this.bounds.top) this.pos.y = this.bounds.top;
        if(typeof this.bounds.right === "number" && this.pos.x+this.frame.right > this.bounds.right) this.pos.x = this.bounds.right-this.frame.right;
        if(typeof this.bounds.bottom === "number" && this.pos.y+this.frame.bottom > this.bounds.bottom) this.pos.y = this.bounds.bottom-this.frame.bottom;
    
        var ctx = (this.stage ? this.stage.ctx : (this.focus ? (this.focus.stage ? this.focus.stage.ctx : false) : (G.stage ? G.stage.ctx : false)));
        if(!ctx) return false;
        //apply translation of canvas to simulate camera
        ctx.translate(-this.pos.x,-this.pos.y);
    },

    resetTranslation:function()
    {
        var ctx = (this.stage ? this.stage.ctx : (this.focus ? (this.focus.stage ? this.focus.stage.ctx : false) : (G.stage ? G.stage.ctx : false)));
        if(!ctx) return false;
        //reset translation of
        ctx.translate(this.pos.x,this.pos.y);
    }
});