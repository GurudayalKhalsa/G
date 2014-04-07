G.Ellipse = G.Rect.extend
({
  initialize: function()
  {
    this._super.apply(this, arguments);
    
    //set shape-specific properties
    //shape defaults to rect for physics intersecting reasons
    // this.shape="ellipse";
    
  },
  
  _render: function(x,y,w,h)
  {
    var ctx = this.stage?this.stage.ctx:G.stage.ctx,
    canvas = this.stage?this.stage.canvas:G.stage.canvas,
    stage = this.stage || G.stage;
    
    if(!ctx) return;
    
    if(this.fill) ctx.fillStyle = this.color;
    if(this.stroke)
    {
        ctx.strokeStyle = this.strokeColor||this.color;
        ctx.lineWidth = this.thickness;
    } 
    

    // //draw at new position and dimensions if specified (does not set position of object), (used in rotating)
    if(w === undefined) w = this.width;
    if(h === undefined) h = this.height;
    if(x === undefined) x = this.pos.x;
    if(y === undefined) y = this.pos.y;

    ctx.save();
    ctx.scale(1, h/w);
    ctx.beginPath();
    ctx.arc(x, y/(h/w), w/2, 0, Math.PI*2, false);
    ctx.restore();
    if(this.fill) ctx.fill();
    if(this.stroke) ctx.stroke();
  }
  
});