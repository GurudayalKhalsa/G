if (typeof G !== "undefined" && (typeof b2 !== "undefined" || typeof Box2D !== "undefined"))
{
    var b2 = b2 || {};
    //first 2 are for emscripten version, last ones are for Box2DWeb
    var b2Vec2 = b2.Vec2 || Box2D.b2Vec2 || Box2D.Common.Math.b2Vec2,
        b2AABB = b2.AABB || Box2D.b2AABB || Box2D.Collision.b2AABB,
        b2BodyDef = b2.BodyDef || Box2D.b2BodyDef || Box2D.Dynamics.b2BodyDef,
        b2Body = b2.Body || Box2D.b2Body || Box2D.Dynamics.b2Body,
        b2FixtureDef = b2.FixtureDef || Box2D.b2FixtureDef || Box2D.Dynamics.b2FixtureDef,
        b2Fixture = b2.Fixture || Box2D.b2Fixture || Box2D.Dynamics.b2Fixture,
        b2World = b2.World || Box2D.b2World || Box2D.Dynamics.b2World,
        b2PolygonShape = b2.PolygonShape || Box2D.b2PolygonShape || Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape = b2.CircleShape || Box2D.b2CircleShape || Box2D.Collision.Shapes.b2CircleShape,
        b2EdgeShape = b2.EdgeShape || Box2D.b2EdgeShape || Box2D.Collision.Shapes.b2EdgeShape,
        b2MouseJointDef =  b2.MouseJointDef || Box2D.b2MouseJointDef ||  Box2D.Dynamics.Joints.b2MouseJointDef,

        //only for box2dweb
        b2DebugDraw = b2.DebugDraw || Box2D.b2DebugDraw || Box2D.Dynamics.b2DebugDraw,
        b2MassData = b2.MassData || Box2D.b2MassData || Box2D.Collision.Shapes.b2MassData,
        b2Math = Box2D.Common.Math.b2Math;

    var PTM = 32;

    (function()
    {

        var world;
        var velIterations = 8;
        var posIterations = 3;

        var init = G.Stage.prototype.initialize,
            add = G.Stage.prototype.add,
            remove = G.Stage.prototype.remove;

            G.gravity = {
                x:0, y:0
            };

        G.Stage = G.Stage.extend
        ({
            initialize:function(x, y, sleep, vel, pos)
            {
                init.apply(this, arguments);

                world = this.world = new b2World(new b2Vec2(G.gravity.x, G.gravity.y), typeof sleep !== "undefined" ? sleep : true);

                //debugging purposes
                var debugDraw = new b2DebugDraw();
                debugDraw.SetSprite(G.ctx);
                debugDraw.SetDrawScale(PTM);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                world.SetDebugDraw(debugDraw);

                if (typeof x !== "number") var x = G.gravity ? G.gravity.x : 0;
                if (typeof y !== "number") var y = G.gravity ? G.gravity.y : 0;

                this.gravity = new b2Vec2(x, y);
                world.SetGravity(this.gravity);

                if(typeof vel !== "undefined") velIterations = vel;
                if(typeof pos !== "undefined") posIterations = pos;
            },

            add:function(obj)
            {
                //add to stage if not already added
                var id = add.apply(this, arguments);
                if (typeof id !== "number" && !this.has(obj)) return false;

                if(obj.addToPhysics === false) return;

                // console.log(world.GetBodyList());

                //&& (world.GetBodyList().a === 0 || world.GetBodyList().indexOf(body) !== -1)

                if (obj.b2.body instanceof b2BodyDef && obj.b2.fixture instanceof b2FixtureDef)
                {
                    obj.b2.body = world.CreateBody(obj.b2.body);
                    obj.b2.fixture = obj.b2.body.CreateFixture(obj.b2.fixture);
                }

                return id;
            },

            remove:function(obj)
            {
                var obj = remove.apply(this, arguments);
                if (obj === false) return false;
                if (obj.b2.body) world.DestroyBody(obj.b2.body);
            }
        });

        var oldInit = G.Shape.prototype.initialize;
        G.Shape.prototype.initialize = function()
        {
            var defaults = {
                restitution: 0,
                friction: 0,
                mass: 1,
                density:0,
                type: "dynamic"
            };

            var args = Array.prototype.slice.call(arguments, 0);

            args[1] = typeof args[1] === "object" ? _.extend(args[1], defaults) : defaults;
            
            this.mergeValues.apply(this, args);

            this.b2 = {};

            if(this.addToPhysics !== false) this.setb2Properties.apply(this, args);

            if(this.addToStage !== false) this.add(this.addToCollection);
            if(this.addToCollection) delete this.addToCollection;

            var self = this;
            // watch(this, "type", function()
            // {
            //     self.resetb2Properties.apply(self, arguments)
            // });
            // watch(this, ["friction", "restitution", "vel", "rotation"], function()
            // {
            //     self.setb2Properties.apply(self, arguments);
            // });

            // if(oldInit)oldInit.apply(this, args);
        }

        G.Shape.prototype.setb2Properties = function(prop)
        {
            //example static line declaration and adding to b2 world
            // var floor = world.addShape(new b2.SegmentShape(world.staticBody, b2.v(0, window.innerHeight - 10), b2.v(window.innerWidth, window.innerHeight - 10), 0));

            //example dynamic ball declaration
            // var body = world.addBody(new b2.Body(mass, b2.momentForCircle(mass, 0, radius, b2.v(0, 0))));
            // body.setPos(v(200 + i, (2 * radius + 5) * i));
            // var circle = world.addShape(new b2.CircleShape(body, radius, v(0, 0)));
            // circle.setElasticity(0.8);
            // circle.setFriction(1);

            if (typeof prop === "string")
            {
                //&& (world.GetBodyList().a === 0 || world.GetBodyList(this.b2.body).indexOf(body) !== -1)
                if (this.b2.body )
                {
                    if (prop === "friction") this.b2.shape.setFriction(this.friction);
                    else if (prop === "restitution") this.b2.shape.setElasticity(this.restitution);
                    else if (prop === "rotation") this.b2.body.a = this.rotation;
                    //velocity
                    else if (prop === "x") this.b2.body.vx = this.vel.x;
                    else if (prop === "y") this.b2.body.vy = this.vel.y;
                }
            }

            else
            {
                //set body
                this.b2.bodyDef = this.b2.body = new b2BodyDef;
                if (this.type === "static") this.b2.body.type = b2Body.b2_staticBody;
                else if (this.type === "dynamic") this.b2.body.type = b2Body.b2_dynamicBody; 

                if(this.pos && this.pos.x && this.pos.y) this.b2.body.position.Set(this.pos.x/PTM, this.pos.y/PTM);
                if(typeof this.vel.x === "number" && typeof this.vel.y === "number" && this.b2.body)
                {
                    this.b2.body.linearVelocity = new b2Vec2(this.vel.x/PTM, this.vel.y/PTM);
                } 

                //set shape
                this.b2.fixtureDef = this.b2.fixture = new b2FixtureDef;
                if (this.shape === "circle") this.b2.fixture.shape = new b2CircleShape(this.radius/PTM);
                else if (this.shape === "rect") 
                {
                    this.b2.fixture.shape = new b2PolygonShape();
                    this.b2.fixture.shape.SetAsBox(this.width/2/PTM, this.height/2/PTM);
                }
                //some bug with lines...
                // else if (this.shape === "line")
                // {
                //     this.b2.fixture.shape = new b2EdgeShape(new b2Vec2(this.pos.x1/PTM, this.pos.y1/PTM), new b2Vec2(this.pos.x2/PTM, this.pos.y2/PTM));
                // }
                else if (this.shape === "polygon") 
                {
                    var vertices = [];
                    for(var i = 0; i < this.vertices.length-1; i+= 2){vertices.push(new b2Vec2(this.vertices[i]/PTM, this.vertices[i+1]/PTM))}
                    this.b2.fixture.shape = new b2PolygonShape();
                    this.b2.fixture.shape.SetAsArray(vertices, vertices.length);
                }

                this.b2.fixture.friction = this.friction || 0;
                this.b2.fixture.restitution = this.restitution || 0;
                this.b2.fixture.density = this.density || this.shape === "circle" ? 0 : 1;

            }

            return this;
        }

        G.Shape.prototype.resetb2Properties = function(prop)
        {
            var self = this;

            _.each(self.stages, function(stage)
            {
                if (stage.world) func(stage);
            });
            func(G.stage);

            function func(stage)
            {

                var world = stage.world;
                if (!world) return;

                //remove currents
                if (self.b2.body && world.containsBody(self.b2.body)) world.removeBody(self.b2.body);
                if (self.b2.shape && world.containsShape(self.b2.shape)) world.removeShape(self.b2.shape);

                this.setb2Properties.call(self, arguments);

                self.add();
            }
        }

        G.Rect.prototype.render = G.Polygon.prototype.render = function()
        {            
            if(this.addToPhysics === false) return G.Shape.prototype.render.apply(this, arguments);

            if(this.hidden) return;

            this.trigger("render", arguments);
            G.trigger("renderShape", [this]);

            //only change color if it needs to be changed
            G.ctx.fillStyle = this.color;

            G.ctx.beginPath();

            G.ctx.moveTo(this.vertices[0],this.vertices[1]);

            for(var i = 2; i < this.vertices.length; i += 2)
            {
                G.ctx.lineTo(this.vertices[i],this.vertices[i+1]);
            }

            G.ctx.fill();
        }

        G.Image.prototype.render = G.Shape.prototype.render;

        G.Bounds = G.Collection.extend
        ({
            initialize:function(x1,y1,x2,y2,restitution,friction)
            {
                this._super();

                var thickness = 1;
                this.friction = typeof friction === "number" ? friction : 0;
                this.restitution = typeof restitution === "number" ? restitution : 0.1;

                var line = {
                    pos:{
                        x:(x2+x1)/2,
                        y:y1-0.5
                    },
                    width:x2-x1,
                    height:thickness,
                    type:"static",
                    hidden:true,
                    friction:friction || this.friction,
                    restitution:restitution || this.restitution
                };

                for(var i = 0; i < arguments.length; i++) if(typeof arguments[i] === "string") var rejections = arguments[i].split(",");

                
                //in order of top, left, bottom, right
                if(!rejections || rejections.indexOf("top") === -1) var a = new G.Rect(line);
                
                line.pos.x = x1-0.5, line.pos.y = (y2+y1)/2, line.width = thickness, line.height = y2-y1;
                if(!rejections || rejections.indexOf("left") === -1) var b = new G.Rect(line);

                line.pos.x = (x2+x1)/2, line.pos.y = y2+0.5, line.width = x2-x1, line.height = thickness;
                if(!rejections || rejections.indexOf("bottom") === -1) var c = new G.Rect(line);

                line.pos.x = x2, line.pos.y = (y2+y1)/2, line.width = thickness, line.height = y2-y1;
                if(!rejections || rejections.indexOf("right") === -1) var d = new G.Rect(line);

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
                this.each(function(bound){world.DestroyBody(bound.b2.body); bound.remove()});
                this.initialize.apply(this, arguments);
            }           
        });

        G.on("animate", function(time)
        {
            if (world) 
            {
                world.Step(1/(G.desiredFramerate/1.5), velIterations, posIterations);
                world.ClearForces();
            }
            //box2d debugging purposes
            // world.DrawDebugData();
        });

        G.on("renderShape", function(shape)
        {
            if (shape.b2 && shape.b2.body)
            {
                shape.pos.x=shape.b2.body.GetPosition().x*PTM;
                shape.pos.y=shape.b2.body.GetPosition().y*PTM;
                shape.rotation=shape.b2.body.GetAngle();


                if(shape.shape === "rect" || shape.shape === "polygon")
                {
                    var s = shape.b2.body.GetFixtureList().GetShape();
                    for(var i = 0, localVertices = s.GetVertices(), vertices = []; i < localVertices.length; i++) 
                    {
                        var temp = b2Math.MulX(shape.b2.body.m_xf, localVertices[i]);
                        vertices.push(temp.x*PTM, temp.y*PTM);
                    }
                    shape.vertices = vertices;
                }
            }
        });

    })();
}

