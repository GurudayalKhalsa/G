G.Physics.intersecting = (function()
{

//parameters are pointx, pointy, centerx, centery, rotation in radians (center is pivot point)
function rotatePoint(point, origin, angle)
{
    var X = origin.x + ((point.x - origin.x) * Math.cos(angle) - (point.y - origin.y) * Math.sin(angle));
    var Y = origin.y + ((point.x - origin.x) * Math.sin(angle) + (point.y - origin.y) * Math.cos(angle));
    return new G.Vector(X,Y);
}

return function(shape1, shape2, reverseVertices)
{
    if(shape2 instanceof G.Vector) shape2 = new G.Circle(shape2.x,shape2.y,0.1,false);
    if ((shape1 instanceof G.Collection)) 
    {

    }
    else if (shape1 instanceof Array)
    {
        var bool = false;
        _.each(shape1, function(shape)
        {
            if(!(shape instanceof G.Shape)) return;
            if (shape2 instanceof G.Shape) 
            {
                var intersecting = G.Physics.intersecting(shape, shape2, reverseVertices);
            }
            else _.each(shape1, function(shape1)
            {
                if (shape1 instanceof G.Shape) var intersecting = G.Physics.intersecting(shape, shape1, shape2);
                if(intersecting) bool = intersecting;
                if(bool) return false;
            });
            if(intersecting) bool = intersecting;
            if(bool) return false;
        });
        return bool;
    }

    //if shapes are the same, exit
    if(shape1 === shape2) return false;

    //detect simple aabb collision, saves compute time for complex shapes
    if(!aabb(shape1, shape2)) return false;

    //if one is static, return mtv for other one, defaults to returning shape1's mtv from shape2
    if(shape2.shape === "static"){ var temp = shape2; shape2 = shape1; shape1 = temp;}

    //circle vs circle
    if(shape1.shape === "circle" && shape2.shape === "circle") return circle2circle(shape1, shape2);

    //if no circles, do SAT (separating axis test) polygon against polygon
    else if(shape1.shape !== "circle" && shape2.shape !== "circle") return polygon2polygon(shape1, shape2);

    //if one circle and one polygon, do SAT (separating axis test) polygon against circle (different from above)
    else if(shape1.shape === "circle" || shape2.shape === "circle") return polygon2circle(shape1, shape2);

    //otherwise, not objects able to be tested
    else return false;

    //simple broad phase check
    function aabb(shape1, shape2)
    {
        //quick method
        if(shape1.shape === "circle" || shape1.shape === "rect") return shape2.pos.x-shape2.width/2<shape1.pos.x+shape1.width/2&&shape2.pos.x+shape2.width/2>shape1.pos.x-shape1.width/2&&shape2.pos.y-shape2.height/2<shape1.pos.y+shape1.height/2&&shape2.pos.y+shape2.height/2>shape2.pos.y-shape2.height/2;

        //slow method, for other shapes like polygon and line
        var b1 = shape1.bounds(), b2 = shape2.bounds();
        return b2.left<b1.right&&b2.right>b1.left&&b2.top<b1.bottom&&b2.bottom>b2.top;
    }

    function circle2circle(circle1, circle2)
    {
        //algorithm from http://cgp.wikidot.com/circle-to-circle-collision-detection
        var x1 = circle1.pos.x, y1 = circle1.pos.y, x2 = circle2.pos.x, y2 = circle2.pos.y, r1 = circle1.radius, r2 = circle2.radius;
        var distanceSq = Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2);
        var intersection = distanceSq < Math.pow(r1+r2, 2);
        if (!intersection) return false;

        var overlapDistance = (r2+r1) - Math.sqrt(distanceSq);
        var axis = new G.Vector(x2-x1, y2-y1).normalize();
        return new G.Vector( axis.x * (overlapDistance+0.01), axis.y * (overlapDistance+0.01) );
    }

    //uses SAT (separating axis test)
    // Referenced from many resources, step by step at http://www.sevenson.com.au/actionscript/sat/
    // Basically, if a line can be drawn in between shape 1 and shape 2, they are not intersecting
    // Steps: Get normals to all shape edges, project all vertices of both shapes onto that normal, if there is a gap in any axis, the shapes do not intersect
    function polygon2polygon(shape1, shape2)
    {
        //Get Vertices
        var vertices1 = getVertices(shape1),
            vertices2 = getVertices(shape2);

        //used for collision response
        var shortestDist = Number.MAX_VALUE;

        //test all normals of shape 1's sides
        for(var i = 0; i < vertices1.length; i++)
        {
            //Compute Normal

            // to generate normal of edge, get the length from point a to point b on edge, as [x, y]. the normal is [-y, x] of that vector
            // e.g. if len = [ x2-x1, y2-y1 ], then normal = [ -len[1], len[0] ]. Slope = rise/run, normal's slope = -run/rise

            //get length and height of edge
            var len = new G.Vector((vertices1[i+1] ? vertices1[i+1].x : vertices1[0].x) - vertices1[i].x, (vertices1[i+1] ? vertices1[i+1].y : vertices1[0].y) - vertices1[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            //Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices1);
            var projection2 = getProjection(axis, vertices2);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] >= projection2[1] || projection2[0] >= projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            //1 is max of projection, 0 is min
            var dist = (projection2[1]-projection1[0]) * -1;
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (dist-0.01), axis.y * (dist-0.01));
            }
        }

        //test all normals of shape 2's sides
        for(var i = 0; i < vertices2.length; i++)
        {
            //Compute Normal
            //get length and height of edge
            var len = new G.Vector((vertices2[i+1] ? vertices2[i+1].x : vertices2[0].x) - vertices2[i].x, (vertices2[i+1] ? vertices2[i+1].y : vertices2[0].y) - vertices2[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            //Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices1);
            var projection2 = getProjection(axis, vertices2);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] >= projection2[1] || projection2[0] >= projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            var dist = (projection2[1]-projection1[0]);
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (dist-0.01), axis.y * (dist-0.01));
            }
        }

        if(typeof mtv === "undefined") console.log(shape1, shape2);

        return mtv;
    }

    //uses SAT (separating axis test)
    function polygon2circle(shape1, shape2)
    {
        var circle = shape1.shape === "circle" ? shape1 : shape2;
        var polygon = shape1.shape === "circle" ? shape2 : shape1;

        //Get Vertices of polygon
        var vertices = getVertices(polygon);

        //used for collision response
        var shortestDist = Number.MAX_VALUE;

        // find the vertex of the polygon closest to the circle
        var x = circle.pos.x, y = circle.pos.y;
        var closestPoint = vertices[0];

        var closestDist = Math.pow(circle.pos.x - closestPoint.x, 2) + Math.pow(circle.pos.y - closestPoint.y, 2);
        for(var i = 1; i < vertices.length; i++) 
        {
            var point = vertices[i];
            var currentDist = Math.pow(circle.pos.x - point.x, 2) + Math.pow(circle.pos.y - point.y, 2);
            if (currentDist < closestDist) 
            {
                closestDist = currentDist;
                closestPoint = vertices[i];
            }
        }
        
        // make an axis of this vector
        var axis = new G.Vector(x-closestPoint.x, y-closestPoint.y).normalize();
        
        // Project Vertices of both shapes onto axis
        var projection1 = getProjection(axis, vertices);
        var projection2 = getProjection(axis, circle);
        
        //test for gaps, if gaps then no intersection
        if (projection1[0] > projection2[1] || projection2[0] > projection1[1]) return false;

        //calculate MTV (minimum translation vector) - for collision response
        if(circle === arguments[0]) var dist = (projection2[1]-projection1[0]);
        else  var dist = (projection2[1]-projection1[0]) * -1;
        var distAbs = Math.abs(dist);

        shortestDist = distAbs;
        mtv = new G.Vector(axis.x * (circle===shape1?(dist+0.01):(dist-0.01)), axis.y * (circle===shape1?(dist+0.01):(dist-0.01)));

        //do normal axises of all edges as usual
        for(var i = 0; i < vertices.length; i++)
        {
            // Compute Normal / Get Axis
            //get length and height of edge
            var len = new G.Vector((vertices[i+1] ? vertices[i+1].x : vertices[0].x) - vertices[i].x, (vertices[i+1] ? vertices[i+1].y : vertices[0].y) - vertices[i].y);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize();

            // Project Vertices of both shapes onto normal axis
            var projection1 = getProjection(axis, vertices);
            var projection2 = getProjection(axis, circle);
            
            //test for gaps, if gaps then no intersection
            if (projection1[0] > projection2[1] || projection2[0] > projection1[1]) return false;

            //calculate MTV (minimum translation vector) - for collision response
            if(circle === arguments[0]) var dist = (projection2[1]-projection1[0]);
            else  var dist = (projection2[1]-projection1[0]) * -1;
            var distAbs = Math.abs(dist);
            if(distAbs < shortestDist)
            {
                shortestDist = distAbs;
                mtv = new G.Vector(axis.x * (circle===shape1?(dist+0.01):(dist-0.01)), axis.y * (circle===shape1?(dist+0.01):(dist-0.01)));
            }
        }

        return mtv;
    }

    //helper functions

    //Get Vertices - from different types of shapes, must be in clockwise order
    function getVertices(shape)
    {
        var vertices = [];

        //line contains x1,y1,x2,y2 in pos
        if(shape.shape === "line") 
        {
            //simulate rect for collision response's sake
            var len = new G.Vector(shape.pos.x2-shape.pos.x1, shape.pos.y2-shape.pos.y1);
            //get normal of edge
            var axis = new G.Vector(-len.y, len.x).normalize(0.01);

            vertices = [shape.pos.x1, shape.pos.y1, shape.pos.x2, shape.pos.y2, shape.pos.x2+axis.x, shape.pos.y2+axis.y, shape.pos.x1+axis.x, shape.pos.y1+axis.y];
        }

        //polygon contains sequence in vertices array, relative to pos, e.g. [pos.x-x1,pos.y-y1,pos.x-x2,pos.y-y2]
        else if(shape.shape === "polygon") 
        {
            for(var i = 0; i < shape.vertices.length-1; i += 2) vertices.push((shape.pos.x||0)+shape.vertices[i], (shape.pos.y||0)+shape.vertices[i+1]);
            if(reverseVertices)
            {
                var n = [], arr = vertices;
                for(var i = arr.length-1; i > 0; i -= 2)
                {
                    n.push(arr[i-1], arr[i]);
                }
                vertices = n;
            }
        }

        //box contains pos -> x,y at center, width and height
        else if(shape.shape === "rect") 
        {
            var hw = shape.width/2, hh = shape.height/2;
            //clockwise order from top left
            vertices = [shape.pos.x-hw, shape.pos.y-hh, shape.pos.x+hw, shape.pos.y-hh, shape.pos.x+hw, shape.pos.y+hh, shape.pos.x-hw, shape.pos.y+hh];
        }

        //if invalid shape
        else throw new Error("Shape does not contain vertices");

        //convert to vectors
        var vecVertices = [];
        for(var i = 0; i < vertices.length; i+=2) vecVertices.push(new G.Vector(vertices[i], vertices[i+1]));

        //account for rotation
        if(shape.rotation !== 0)
        {
            for(var i = 0; i < vecVertices.length; i++)
            {
                vecVertices[i] = rotatePoint(vecVertices[i], shape.pos, shape.rotation);
            }
        }

        return vecVertices;
    }

    function getProjection(axis, vertices)
    {
        var max, min;

        //if circle
        if(vertices.shape === "circle")
        {
            var circle = vertices;
            min = axis.dot(circle.pos) - circle.radius;
            max = min + circle.radius*2;
        }

        //if polygon
        else
        {
            max = min = axis.dot(vertices[0]);

            //get start and end of projection
            for (var j = 0; j < vertices.length; j++) 
            {
                var currentPoint = axis.dot(vertices[j]);
                if (currentPoint < min) min = currentPoint;
                if (currentPoint > max) max = currentPoint;
            }
        }

        return [min, max];
    }            
}

})();
