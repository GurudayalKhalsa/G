G.RoundRect = G.Rect.extend
({
  initialize: function()
  {
    //if not passing in object literal, assign arguments as x,y,w,h,color,vx,vy
    if(typeof obj !== "object" && arguments.length >= 5)
    {
      var a = {};
        //necessary
        a.pos=new G.Vector(arguments[0], arguments[1]);
        
        //optional
        if(arguments[2]) a.width = arguments[2];
        if(arguments[3]) a.height = arguments[3];
        if(arguments[4]) a.radius = arguments[4] || 0;
        if(typeof arguments[5] === "string") a.color = arguments[5];
        if(typeof arguments[6] === "number") a.vel = {x:arguments[6]};
        if(typeof arguments[7] === "number" && a.vel) a.vel.y = arguments[7];
        if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

        var obj = arguments[0] = a;
      }

    
    this._super.apply(this, arguments);
    
    //set shape-specific properties
    //shape defaults to rect for physics intersecting reasons
    // this.shape="round rect";
    
  },
  
  _render: function(x,y,w,h)
  {
    var ctx = this.stage?this.stage.ctx:G.stage.ctx,
    canvas = this.stage?this.stage.canvas:G.stage.canvas,
    stage = this.stage || G.stage;
    
    if(!ctx) return;
    
    if(this.stroke) ctx.lineWidth = this.thickness;

    // //draw at new position and dimensions if specified (does not set position of object), (used in rotating)
    if(w === undefined) w = this.width;
    if(h === undefined) h = this.height;
    if(x === undefined) x = this.pos.x-w/2;
    if(y === undefined) y = this.pos.y-h/2;


    //draw fill circles at all edges
    if(this.radius && this.radius < this.width/2 && this.radius < this.height/2)
    {
      
      //draws 2 rects without filling edges
      if(this.fill)
      {
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y + this.radius, this.width, this.height - (this.radius*2));
        ctx.fillRect(x + this.radius, y, this.width - (this.radius*2), this.height);
      }
      
      if(this.stroke)
      {
        ctx.strokeStyle = this.strokeColor || this.color;
        ctx.strokeRect(x, y + this.radius, this.width, this.height - (this.radius*2));
        ctx.strokeRect(x + this.radius, y, this.width - (this.radius*2), this.height);
      }
      
      var r = this.radius,
          t = this.thickness;
          
      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.strokeColor || this.color;
      
      //todo: fix render issue when width or height < r/2
      var drawCorner = function(x, y, xr, yr, a1, a2)
      {        
        var r = Math.abs(xr);
        var inc = 1;
        
        var tx = t ? (xr > 0 ? -t : t ) : 0;
        var ty = t ? (yr > 0 ? -t : t ) : 0;
        
        if(this.stroke) 
        {
          x += tx/2;
          y += ty/2;
          r /= 2;
        }
        
        //draw circle for roundedness with radius && color        
        ctx.beginPath();
        ctx.arc(x+xr, y+yr, r, a1, a2, true);
        if(this.fill) ctx.fill();
        if(this.stroke) ctx.stroke();
        
      }.bind(this);
      
      //draws top left, top right, bottom right, bottom left corners
      
      drawCorner(x,y,r,r,Math.PI/2,Math.PI);
      drawCorner(x+this.width,y,-r,r,0,Math.PI/2);
      drawCorner(x+this.width,y+this.height,-r,-r,Math.PI*1.5, Math.PI*2);
      drawCorner(x,y+this.height,r,-r,Math.PI, Math.PI*1.5);
    }
    else this._super.apply(this, arguments);
    
  }
  
});