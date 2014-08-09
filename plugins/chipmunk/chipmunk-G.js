if (typeof G !== "undefined" && typeof cp !== "undefined")
{
    var space;

    var init = G.Stage.prototype.initialize,
        add = G.Stage.prototype.add,
        remove = G.Stage.prototype.remove;

        G.gravity = {
            x:0, y:0
        };

    G.Stage = G.Stage.extend
    ({
        initialize:function(x, y)
        {
            init.apply(this, arguments);

            space = this.space = new cp.Space();

            if (typeof x !== "number") var x = G.gravity ? G.gravity.x : 0;
            if (typeof y !== "number") var y = G.gravity ? G.gravity.y : 0;

            this.gravity = space.gravity = cp.v(x, y);
        },

        add:function(obj)
        {
            //add to stage if not already added
            var id = add.apply(this, arguments);
            if (typeof id !== "number" && !this.has(obj)) return false;

            if(obj.addToPhysics === false) return;

            if (obj instanceof cp.Body) var body = obj;
            else if (obj instanceof cp.Shape) var shape = obj;
            else
            {
                if (obj.cp && obj.cp.body instanceof cp.Body) var body = obj.cp.body;
                if (obj.cp && obj.cp.shape instanceof cp.Shape) var shape = obj.cp.shape;
            }

            if (body instanceof cp.Body && !space.containsBody(body))
            {
                space.addBody(body);
            }
            if (shape instanceof cp.Shape && !space.containsShape(shape))
            {
                shape = space.addShape(shape);
            }

            return id;
        },

        remove:function(obj)
        {
            var obj = remove.apply(this, arguments);
            if (obj === false) return false;
            if (obj.cp.body && space.containsBody(obj.cp.body)) space.removeBody(obj.cp.body);
            if (obj.cp.shape && space.containsShape(obj.cp.shape)) space.removeShape(obj.cp.shape);
        }
    });

    var oldInit = G.Shape.prototype.initialize;
    G.Shape.prototype.initialize = function()
    {
        var defaults = {
            restitution: 0.5,
            friction: 0.2,
            mass: 1,
            type: "dynamic"
        };

        var args = Array.prototype.slice.call(arguments, 0);

        args[1] = typeof args[1] === "object" ? _.extend(args[1], defaults) : defaults;
        
        this.mergeValues.apply(this, args);

        this.cp = {};

        if(this.addToPhysics !== false) this.setcpProperties.apply(this, args);

        if(this.addToStage !== false) this.add(this.addToCollection);
        if(this.addToCollection) delete this.addToCollection;

        var self = this;

        if(oldInit)oldInit.apply(this, args);
    }

    G.Shape.prototype.setcpProperties = function(prop)
    {
        //example static line declaration and adding to cp world
        // var floor = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(0, window.innerHeight - 10), cp.v(window.innerWidth, window.innerHeight - 10), 0));

        //example dynamic ball declaration
        // var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, cp.v(0, 0))));
        // body.setPos(v(200 + i, (2 * radius + 5) * i));
        // var circle = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
        // circle.setElasticity(0.8);
        // circle.setFriction(1);

        if (typeof prop === "string")
        {
            if (this.cp.body && space.containsBody(this.cp.body))
            {
                if (prop === "friction") this.cp.shape.setFriction(this.friction);
                else if (prop === "restitution") this.cp.shape.setElasticity(this.restitution);
                else if (prop === "rotation") this.cp.body.a = this.rotation;
                //velocity
                else if (prop === "x") this.cp.body.vx = this.vel.x;
                else if (prop === "y") this.cp.body.vy = this.vel.y;
            }
        }

        else
        {
            //set inertia
            if (this.shape === "circle" && typeof this.mass === "number" && this.type === "dynamic") this.inertia = cp.momentForCircle(this.mass, 0, this.radius, cp.vzero);
            else if (this.shape === "rect" && typeof this.mass === "number" && this.type === "dynamic") this.inertia = cp.momentForBox(this.mass, this.width, this.height);
            else if(this.shape === "polygon" && typeof this.mass === "number" && this.type === "dynamic") this.inertia = cp.momentForPoly(this.mass, this.vertices, cp.v(0,0));
            else if(this.shape === "line" && typeof this.mass === "number" && this.type === "dynamic") this.inertia = cp.momentForSegment(this.mass, new cp.v(this.pos.x1, this.pos.y1), new cp.v(this.pos.x2, this.pos.y2));


            //set body
            if (this.type === "static" && this.cp._body !== space.staticBody) this.cp._body = space.staticBody;
            else if (this.type === "dynamic" && this.inertia)
            {
                this.cp._body = new cp.Body(this.mass, this.inertia);
                if(this.pos && this.pos.x && this.pos.y) this.cp._body.setPos(cp.v(this.pos.x, this.pos.y));
                this.cp.body = this.cp._body;
            }
            if(typeof this.vel.x === "number" && typeof this.vel.y === "number" && this.cp._body)
            {
                this.cp._body.vx = this.vel.x;
                this.cp._body.vy = this.vel.y;
            } 

            //set shape
            if (this.shape === "circle") this.cp.shape = new cp.CircleShape(this.cp._body, this.radius, cp.vzero);
            else if (this.shape === "rect") this.cp.shape = new cp.BoxShape(this.cp._body, this.width, this.height);
            else if (this.shape === "line") this.cp.shape = new cp.SegmentShape(this.cp._body, cp.v(this.pos.x1, this.pos.y1), cp.v(this.pos.x2, this.pos.y2), 0);
            else if (this.shape === "polygon") this.cp.shape = new cp.PolyShape(this.cp._body, this.vertices, cp.v(0,0));

            if (typeof this.friction !== "undefined") this.cp.shape.setFriction(this.friction);
            if (typeof this.restitution !== "undefined") this.cp.shape.setElasticity(this.restitution);
        }

        return this;
    }

    G.Shape.prototype.resetcpProperties = function(prop)
    {
        var self = this;

        _.each(self.stages, function(stage)
        {
            if (stage.space) func(stage);
        });
        func(G.stage);

        function func(stage)
        {

            var space = stage.space;
            if (!space) return;

            //remove currents
            if (self.cp.body && space.containsBody(self.cp.body)) space.removeBody(self.cp.body);
            if (self.cp.shape && space.containsShape(self.cp.shape)) space.removeShape(self.cp.shape);

            this.setcpProperties.call(self, arguments);

            self.add();
        }
    }

    G.Bounds = G.Collection.extend
    ({
        initialize:function(x1,y1,x2,y2,restitution,friction)
        {
            this._super();

            var line = {
                pos:{
                    x1:x1,
                    y1:y1,
                    x2:x2,
                    y2:y1
                },
                type:"static",
                hidden:true,
                friction:friction || 0,
                restitution:restitution || 1
            };

            for(var i = 0; i < arguments.length; i++) if(typeof arguments[i] === "string") var rejections = arguments[i].split(",");

            //in order of top, left, bottom, right
            if(!rejections || rejections.indexOf("top") === -1) var a = new G.Line(line);
            line.pos.x2 = x1, line.pos.y2 = y2;
            if(!rejections || rejections.indexOf("left") === -1) var b = new G.Line(line);
            line.pos.x2 = x2, line.pos.y1 = y2;
            if(!rejections || rejections.indexOf("bottom") === -1) var c = new G.Line(line);
            line.pos.x1 = x2, line.pos.y1 = y1;
            if(!rejections || rejections.indexOf("right") === -1) var d = new G.Line(line);

            this.add(a,b,c,d);

            this.bounds = {
                top:a,
                left:b,
                bottom:c,
                right:d
            };
        },

        resize:function()
        {
            this.each(function(bound){space.removeShape(bound.cp.shape); bound.remove()});
            this.initialize.apply(this, arguments);
        }
    });

    G.on("animate", function(time)
    {
        if (space) space.step(0.15);
    });

    G.on("renderShape", function(shape)
    {
        if (shape.cp && shape.cp.body)
        {
            if (shape.cp.body.a) shape.rotation = shape.cp.body.a;
            shape.pos.x = shape.cp.body.getPos().x;
            shape.pos.y = shape.cp.body.getPos().y;
        }
    });
}
