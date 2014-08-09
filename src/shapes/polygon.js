G.Polygon = Shape.extend({
    initialize:function(obj)
    {
        //if not passing in object literal, assign arguments as x,y,vertices,color,vx,vy
        if(arguments.length > 2 && Array.isArray(arguments[2]))
        {
            var a = {};
            //necessary
            a.pos=new G.Vector(arguments[0], arguments[1]);
            a.vertices=arguments[2];

            //optional
            if(typeof arguments[3] === "string") a.color = arguments[3];
            if(typeof arguments[4] === "number") a.vel = {x:arguments[4]};
            if(typeof arguments[5] === "number" && a.vel) a.vel.y = arguments[5];
            if(Array.prototype.indexOf.call(arguments, false) !== -1) a.addToStage = false;

            var obj = arguments[0] = a;
        }

        this.shape="polygon";

        var defaults = {vertices:[]};
        arguments[1] = typeof arguments[1] === "object" ? _.extend(arguments[1], defaults) : defaults;

        this.relativeVertices = true;
        if(!obj.pos || (obj.pos && typeof obj.pos.x !== "number" && typeof obj.pos.y !== "number")) this.relativeVertices = false;

        //Merge default values from Shape with obj passed in
        if(this._super) this._super.apply(this, arguments);  

        if(this.vertices.length < 3) throw new Error("A line must have 3 or more vertices");
    },

    computeCentroid:function(vertices)
    {
        var vertices = vertices ? G.toVectors(vertices) : G.toVectors(this.vertices);
        var vertexCount = vertices.length;
        var centroid = new G.Vector();
        var signedArea = 0.0;
        var x0 = 0.0; // Current vertex X
        var y0 = 0.0; // Current vertex Y
        var x1 = 0.0; // Next vertex X
        var y1 = 0.0; // Next vertex Y
        var a = 0.0;  // Partial signed area

        // For all vertices except last
        var i=0;
        for (i=0; i<vertexCount-1; ++i)
        {
            x0 = vertices[i].x;
            y0 = vertices[i].y;
            x1 = vertices[i+1].x;
            y1 = vertices[i+1].y;
            a = x0*y1 - x1*y0;
            signedArea += a;
            centroid.x += (x0 + x1)*a;
            centroid.y += (y0 + y1)*a;
        }

        // Do last vertex
        x0 = vertices[i].x;
        y0 = vertices[i].y;
        x1 = vertices[0].x;
        y1 = vertices[0].y;
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.x += (x0 + x1)*a;
        centroid.y += (y0 + y1)*a;

        signedArea *= 0.5;
        centroid.x /= (6.0*signedArea);
        centroid.y /= (6.0*signedArea);

        return centroid;
    },

    //custom bounds function for polygon
    bounds:function(nbounds)
    {
        if(nbounds)
        {
            if(!this.pos || !this.pos.x || !this.pos.y) return false;
            var bounds = this.bounds(),
                hw = (this.pos.x-bounds.left),
                hh = (this.pos.y-bounds.top);
            if(typeof nbounds.left === "number") this.pos.x = nbounds.left+hw;       
            if(typeof nbounds.right === "number") this.pos.x = nbounds.right-hw;
            if(typeof nbounds.top === "number") this.pos.y = nbounds.top+hh;       
            if(typeof nbounds.bottom === "number") this.pos.y = nbounds.bottom-hh;
        }
        else
        {
            var x = [], y = [];
            if(this.pos && this.pos.x !== undefined && this.pos.y !== undefined) for(var i = 0; i < this.vertices.length-1; i+=2) { x.push(this.pos.x+this.vertices[i]); y.push(this.pos.y+this.vertices[i+1]); }
            else for(var i = 0; i < this.vertices.length-1; i+=2) { x.push(this.vertices[i]); y.push(this.vertices[i+1]); }

            return {
                left:Math.min.apply(Math, x),
                right:Math.max.apply(Math, x),
                top:Math.min.apply(Math, y),
                bottom:Math.max.apply(Math, y)
            };
        }
    },

    // getCenter:function()
    // {
    //     //set center pos
    //     var newX = this.vertices[2]-(this.vertices[2]-this.vertices[0])/2; 
    //     var newY = this.vertices[3]-(this.vertices[3]-this.vertices[1])/2; 

    //     if(this.pos.x !== newX) this.pos.x = newX;
    //     if(this.pos.y !== newY) this.pos.y = newY;

    //     return this;
    // },


    // //watch for all pos values, width, height
    // setValues:function(prop, action, newvalue, oldvalue)
    // {
    //     if(["x, y, width","height"].indexOf(prop) !== -1) 
    //     {
    //         //stop infinite loop, or props that shouldn't be called from being called
    //         WatchJS.noMore = true;

    //         this.setPoints.apply(this, arguments);
    //     }

    //     //if vertices change
    //     else
    //     {
    //         //stop infinite loop, or props that shouldn't be called from being called
    //         WatchJS.noMore = true;

    //         this.setDimensions().setCenter();
    //     }     
    // },

    // setPoints:function(prop, action, newvalue, oldvalue)
    // {
    //     //if center x pos changes (translate)
    //     if(prop === "x")
    //     {
    //         var newX1 = this.vertices[0]+(newvalue-oldvalue); 
    //         var newX2 = this.vertices[2]+(newvalue-oldvalue); 

    //         if(Math.round(this.vertices[0]) !== Math.round(newX1)) this.vertices[0] = Math.round(newX1);
    //         if(Math.round(this.vertices[2]) !== Math.round(newX2)) this.vertices[2] = Math.round(newX2);
    //     }

    //     if(prop === "y")
    //     {
    //         var newY1 = this.vertices[1]+(newvalue-oldvalue); 
    //         var newY2 = this.vertices[3]+(newvalue-oldvalue); 

    //         if(Math.round(this.vertices[1]) !== Math.round(newY1)) this.vertices[1] = Math.round(newY1);
    //         if(Math.round(this.vertices[3]) !== Math.round(newY2)) this.vertices[3] = Math.round(newY2);
    //     }

    //     if(prop === "width")
    //     {
    //         var newX1 = this.vertices[0]-(newvalue-oldvalue)/2; 
    //         var newX2 = this.vertices[2]+(newvalue-oldvalue)/2; 

    //         if(this.vertices[0] !== newX1) this.vertices[0] = newX1;
    //         if(this.vertices[2] !== newX2) this.vertices[2] = newX2;
    //     }

    //     if(prop === "height")
    //     {
    //         var newY1 = this.vertices[1]-(newvalue-oldvalue)/2; 
    //         var newY2 = this.vertices[3]+(newvalue-oldvalue)/2; 

    //         if(this.vertices[1] !== newY1) this.vertices[1] = newY1;
    //         if(this.vertices[3] !== newY2) this.vertices[3] = newY2;
    //     }
    // },

    // setDimensions:function()
    // {
    //     //set dimensions
    //     var mostLeft, mostRight, mostTop, mostBottom;
    //     for(var i = 0; i < this.vertices.length; i+= 2)
    //     {
    //         if()
    //     }
    //     var newWidth = Math.abs(this.vertices[2]-this.vertices[0]);
    //     var newHeight = Math.abs(this.vertices[3]-this.vertices[1]);
    //     if(this.width !== newWidth) this.width = newWidth;
    //     if(this.height !== newHeight) this.height = newHeight;

    //     return this;
    // },

    // setCenter:function()
    // {
    //     //set center pos
    //     var newX = this.vertices[2]-(this.vertices[2]-this.vertices[0])/2; 
    //     var newY = this.vertices[3]-(this.vertices[3]-this.vertices[1])/2; 

    //     if(this.pos.x !== newX) this.pos.x = newX;
    //     if(this.pos.y !== newY) this.pos.y = newY;

    //     return this;
    // },

    _render:function(x,y)
    {
        var ctx = this.stage?this.stage.ctx:G.stage.ctx;
        if(!ctx) return;
        
        if(this.fill) ctx.fillStyle = this.color;
        else ctx.strokeStyle = this.strokeColor||this.color;

        ctx.beginPath();

        if(this.pos && this.relativeVertices)
        {
            var x = typeof x === "number" ? x : this.pos.x;
            var y = typeof y === "number" ? y : this.pos.y;
        }
        else
        {
            var x = typeof x === "number" ? x : 0;
            var y = typeof y === "number" ? y : 0;
        }
            
        ctx.moveTo(x+this.vertices[0],y+this.vertices[1]);

        for(var i = 2; i < this.vertices.length; i += 2)
        {
            ctx.lineTo(x+this.vertices[i],y+this.vertices[i+1]);
        }

        ctx.lineTo(x+this.vertices[0],y+this.vertices[1]);


        if(this.lineWidth) ctx.lineWidth = this.lineWidth;
        if(this.fill) ctx.fill();
        else ctx.stroke();

        ctx.closePath();
    }
});