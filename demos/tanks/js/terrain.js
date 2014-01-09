//generate terrain
var Terrain = function(color, points, min, maxDist, friction, restitution)
{
    var points = points ? points*2 : G.random(10,5)*2;
    var min = min || G.stage.height/2;
    var maxDist = maxDist || points*5;
    var friction  = friction || .2;
    var restitution = restitution || 0.01;
    var vertices = [];
    
    //set bounds vertices
    vertices.push(0,G.stage.height,G.stage.width,G.stage.height,G.stage.width,G.random(G.stage.height-(min/3), min));
    
    var step = G.stage.width/points;

    //generate unsmoothed hill points
    for(var i = points-1; i >= 0; i-=2)
    {
        var x1 = Math.round(step*i);
        var y1 = G.random(vertices[vertices.length-1]+maxDist, vertices[vertices.length-1]-maxDist);
        var x2 = Math.round(step*(i-1));
        var y2 = G.random(y1+maxDist, y1-maxDist);

        while(y2 > G.stage.height-(min/3) || y1 > G.stage.height-(min/3) || y1 < min/1.5 || y2 < min/1.5)
        {
            y1 = G.random(vertices[vertices.length-1]+maxDist, vertices[vertices.length-1]-maxDist);
            y2 = G.random(y1+maxDist, y1-maxDist);
        }

        vertices.push(x1,y1,x2,y2);
    }

    //smooth points (Catmull-rom spline interpolation)
    function smooth(vertices, detail)
    {
        var detail = detail || 10;

        //convert to array of arrays of xy
        vertices = vertices.map(function(val, i, arr){ if(i % 2 === 0) return [val, arr[i+1]] });
        for(var i = vertices.length; i > 0; i--) if(typeof vertices[i] === "undefined") vertices.splice(i,1);


        /// Takes an array of input coordinates used to define a Catmull-Rom spline, and then
        /// samples the resulting spline according to the specified sample count (per span),
        /// populating the output array with the newly sampled coordinates. The returned boolean
        /// indicates whether the operation was successful (true) or not (false).
        /// NOTE: The first and last points specified are used to describe curvature and will be dropped
        /// from the resulting spline. Duplicate them if you wish to include them in the curve.

        if (vertices.length < 4) return false;
     
        var results = [];
     
        for (var n = 1; n < vertices.length - 2; n++) for (var i = 0; i < detail; i++) results.push(PointOnCurve(vertices[n - 1], vertices[n], vertices[n + 1], vertices[n + 2], (1 / detail) * i ));
     
        results.push(vertices[vertices.length - 2], vertices[vertices.length-1]);

        //convert results back to orig, round vals, return
        return Array.prototype.concat.apply([], results).map(function(val){return Math.round(val)});

        // Function returns a point on the curve between b and c with a and d describing curvature, at the normalized distance t.         
        function PointOnCurve(a, b, c, d, t)
        {
            var result = [];
         
            var t0 = ((-t + 2) * t - 1) * t * 0.5;
            var t1 = (((3 * t - 5) * t) * t + 2) * 0.5;
            var t2 = ((-3 * t + 4) * t + 1) * t * 0.5;
            var t3 = ((t - 1) * t * t) * 0.5;
         
            result[0] = a[0] * t0 + b[0] * t1 + c[0] * t2 + d[0] * t3;
            result[1] = a[1] * t0 + b[1] * t1 + c[1] * t2 + d[1] * t3;
         
            return result;
        }
    }

    vertices = vertices.slice(0,4).concat(smooth(vertices.slice(2).concat([vertices[vertices.length-2], vertices[vertices.length-1]])));

    this.vertices = vertices;

    //create collision shapes
    //convert to array of arrays of vertices
    this.collisionVertices = vertices.slice(4).map(function(val, i, arr){ if(i % 2 === 0) return [val, arr[i+1]] });
    for(var i = this.collisionVertices.length; i > 0; i--) if(typeof this.collisionVertices[i] === "undefined") this.collisionVertices.splice(i,1);
    this.collisionShapes = new G.Collection();
    //create a collision shape for each section of vertices that does not contain a turning point in y axis
    for(var i = 0; i < this.collisionVertices.length-1; i++)
    {
        var vertices = [];
        var v = this.collisionVertices;

        var a = v[i-1], b = v[i], c = v[i+1];
        if(a)vertices.push(a[0], a[1], b[0], b[1]);

        //exit if not a valid shape
        if(vertices.length <= 2) continue;

        //create bottom vertices
        vertices.push(vertices[vertices.length-2], G.stage.height, vertices[0], G.stage.height);

        //create collision shape
        this.collisionShapes.add(new G.Polygon
        ({
            pos:false,
            vertices:reverse(vertices),
            type:"static",
            hidden:true,
            friction:friction,
            restitution:restitution,
            // addToPhysics:false,
            color:G.random.color(),
            density:0
        }));
    }

    //create render shape
    this.shape = new G.Polygon({
        pos:false,
        vertices:this.vertices,
        color:color,
        type:"static",
        addToPhysics:false
    });

};

function reverse(arr)
{
    var n = [];
    for(var i = arr.length-1; i > 0; i -= 2)
    {
        n.push(arr[i-1], arr[i]);
    }
    return n;
}