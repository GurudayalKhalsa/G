Physics.World = (function(){

    var outerBound = 0,
        shapeMethods = 
        {

        },
        shapeDefaults = 
        {
            acc:{x:0,y:0},
            restitution:0,
            friction:0,
            mass:1
        };

    return G.Class.extend
    ({
        //constructor
        initialize:function(obj)
        {
            var self = this;

            obj = obj || {};

            this.setGravity(obj.gravity);

            this.setCellSize(obj.cellSize);           

            this.collisions = 
            {
                dynamicdynamic:true,
                dynamicstatic:true,
                dynamickinematic:true
            };

            this.config(obj);

            this.shapes = {
                static:new G.Collection(false, true),
                kinematic:new G.Collection(false, true),
                dynamic:new G.Collection(false, true),
                all:new G.Collection(false, true)
            };

            this.shapes.static.name = "Static Collision Shapes";
            this.shapes.kinematic.name = "Kinematic Collision Shapes";
            this.shapes.dynamic.name = "Dynamic Collision Shapes";
            this.shapes.all.name = "All Collision Shapes";
        },

        setCellSize:function(cellSize)
        {
            if(!cellSize && G.cellSize) cellSize = G.cellSize;
            this.staticHash = this.staticHash instanceof SpatialHash ? this.staticHash.setCellSize(cellSize) : new SpatialHash(cellSize);
            this.kinematicHash = this.kinematicHash instanceof SpatialHash ? this.kinematicHash.setCellSize(cellSize) : new SpatialHash(cellSize);
            this.dynamicHash = this.dynamicHash instanceof SpatialHash ? this.dynamicHash.setCellSize(cellSize) : new SpatialHash(cellSize);
        },

        setGravity:function(gravity)
        {
            var x = typeof gravity !== "undefined" ? (typeof gravity.x === "number" ? gravity.x : (typeof arguments[0] === "number" ? arguments[0] : 0)) : (typeof G.gravity !== "undefined" ? G.gravity.x : 0);
            var y = typeof gravity !== "undefined" ? (typeof gravity.y === "number" ? gravity.y : (typeof arguments[1] === "number" ? arguments[1] : 0)) : (typeof G.gravity !== "undefined" ? G.gravity.y : 0);
            this.gravity = new G.Vector(x, y);
        },

        config:function(obj)
        {
            var self = this;

            if(typeof obj !== "object") return false;

            //set gravity, defaults to none
            if(typeof obj.gravity !== "undefined") this.setGravity(obj.gravity);

            //collision handling
            if(typeof obj.collisions !== "undefined")
            {
                //remove collisions
                if(!obj.collisions) this.collisions = false;
                else if(typeof obj.collisions === "object")
                {
                    _.each(obj.collisions, function(val, key)
                    {
                        if(val === false) self.collisions[key] = false;
                    });
                }
            }
            
            this.enableHash = typeof obj.enableHash === "boolean" ? obj.enableHash : true;
            this.onlyAABB = typeof obj.onlyAABB === "boolean" ? obj.onlyAABB : false;
            this.framerateVel = typeof obj.framerateVel === "boolean" ? obj.framerateVel : true;

        },

        add:function(shape)
        {
            if(shape instanceof G.Text) {shape.type = "static"; return;};
            if (shape instanceof G.Collection) shape.each(function(shape){self.add(shape)});
            else if(!(shape instanceof G.Shape) || (shape instanceof G.Shape && shape.physics === false)) return false;

            //set default type
            if(!shape.type) 
            {
                if(shape.shape === "line") shape.type = "static";
                else shape.type = "dynamic";
            }

            shape.on("collision", function(){ shape.colliding = true; })

            this.shapes.all.add(shape);
            if(shape.type === "static") 
            {
                this.shapes.static.add(shape);
                this.staticHash.insert(shape);
            }
            if(shape.type === "kinematic") 
            {
                this.shapes.kinematic.add(shape);
                this.kinematicHash.insert(shape);
            }
            if(shape.type === "dynamic") 
            {
                this.shapes.dynamic.add(shape);
                this.dynamicHash.insert(shape);
            }

            _.each(shapeDefaults, function(val, key){ shape[key] = typeof shape[key] === "undefined" ? val : shape[key] });
            _.each(shapeMethods, function(val, key){ shape[key] = shape[key]||val });

            return this;
        },

        remove:function(shape)
        {
            if(!(shape instanceof G.Shape)) return false;
            if(this.shapes.all.has(shape)) this.shapes.all.remove(shape);
            else return false;
            
            if(shape.type==="static") 
            {
                this.shapes.static.remove(shape);
                this.staticHash.remove(shape);
            }
            else if(shape.type==="kinematic") 
            {
                this.shapes.kinematic.remove(shape);
                this.kinematicHash.remove(shape);
            }
            else if(shape.type==="dynamic") 
            {
                this.shapes.dynamic.remove(shape);
                this.dynamicHash.remove(shape);
            }
            //remove shape physics methods
            _.each(shape, function(val, key){ if(key in shapeMethods) delete shape[key]; });

            return this;
        },

        update:function()
        {            
            var self = this;

            //with hash
            if(this.enableHash !== false)
            {
                if(this.collisions.dynamicstatic !== false && self.staticHash.length !== self.shapes.static.length()) self.staticHash.clear().insert(self.shapes.static);
                if(this.collisions.dynamickinematic !== false) self.kinematicHash.clear().insert(self.shapes.kinematic);
                if(this.collisions.dynamicdynamic !== false || this.collisions.dynamicstatic !== false) self.dynamicHash.clear().insert(self.shapes.dynamic);
            }
            
            //resolve collisions
            if(self.collisions.dynamicstatic && self.collisions !== false && self.shapes.dynamic.length() >= self.shapes.static.length())
            {
                self.shapes.static.each(function(shape)
                {
                    shape.colliding = false;
                    if(shape.enableCollisions === false || shape.physics === false) return;
                    //retrieve shapes in position range
                    if(self.enableHash !== false)
                    {
                        _.each(self.dynamicHash.retrieve(shape), function(shape2)
                        {
                            if(shape2.physics === false || shape2.enableCollisions === false) return;
                            self.handleCollisions(shape, shape2);
                        });
                    }
                    else
                    {
                        self.shapes.dynamic.each(function(shape2)
                        {
                            if(shape2.physics === false || shape2.enableCollisions === false) return;
                            self.handleCollisions(shape, shape2);
                        });
                    }
                });
            }

            self.shapes.kinematic.each(function(shape)
            {
                //if shape changed, reset
                if(shape.type !== "kinematic") { self.shapes.kinematic.remove(shape); shape.type === "static" ? self.shapes.static.add(shape) : self.shapes.dynamic.add(shape); return; }

                //don't do physics if shape says so
                if(shape.physics === false) return;
                
                shape.one("update", function()
                {
                    //make sure pos, vel, and acc are all vectors
                    if(!(shape.pos instanceof G.Vector) || !(shape.vel instanceof G.Vector))
                    {
                        shape.pos = new G.Vector(shape.pos ? shape.pos.x : 0, shape.pos ? shape.pos.y : 0);
                        shape.vel = new G.Vector(shape.vel ? shape.vel.x : 0, shape.vel ? shape.vel.y : 0);
                    }

                    if(self.collisions !== false && shape.enableCollisions !== false && self.collisions.dynamickinematic && self.shapes.dynamic.length() >= self.shapes.kinematic.length()) 
                    {
                        shape.colliding = false;
                        //retrieve shapes in position range
                        if(self.enableHash !== false)
                        {
                            _.each(self.dynamicHash.retrieve(shape), function(shape2)
                            {
                                if(shape2.physics === false || shape2.enableCollisions === false) return;
                                self.handleCollisions(shape, shape2);
                            });
                        }
                        else
                        {
                            self.shapes.dynamic.each(function(shape2)
                            {
                                if(shape2.physics === false || shape2.enableCollisions === false) return;
                                self.handleCollisions(shape, shape2);
                            });
                        }
                    }
                    
                    //perform euler integration - ish - (pos = pos + vel)
                    shape.pos.add(shape.vel.multiply(shape.stage && (shape.framerateVel !== false && self.framerateVel !== false) ? shape.stage.deltaFramerate:1));     
                });
            });

            self.shapes.dynamic.each(function(shape)
            {
                //if shape changed, reset
                if(shape.type !== "dynamic") { self.shapes.dynamic.remove(shape); shape.type === "static" ? self.shapes.static.add(shape) : self.shapes.kinematic.add(shape); return; }

                //don't do physics if shape says so
                if(shape.physics === false) return;

                shape.one("update", function()
                {
                    //make sure pos, vel, and acc are all vectors
                    if(!(shape.pos instanceof G.Vector) || !(shape.vel instanceof G.Vector) || !(shape.acc instanceof G.Vector))
                    {
                        shape.pos = new G.Vector(shape.pos ? shape.pos.x : 0, shape.pos ? shape.pos.y : 0);
                        shape.vel = new G.Vector(shape.vel ? shape.vel.x : 0, shape.vel ? shape.vel.y : 0);
                        shape.acc = new G.Vector(shape.acc ? shape.acc.x : 0, shape.acc ? shape.acc.y : 0);
                    }
                                                                       
                    //resolve collisions
                    if(self.collisions !== false && shape.enableCollisions !== false)
                    {
                        shape.colliding = false;
                        if(self.collisions.dynamicstatic && self.shapes.dynamic.length() < self.shapes.static.length()) 
                        {
                            function handle(shape2)
                            {
                                if(shape2.physics === false || shape2.enableCollisions === false) return;
                                self.handleCollisions(shape, shape2);
                            }
                            
                            //retrieve shapes in position range
                            if(self.enableHash !== false) _.each(self.staticHash.retrieve(shape), handle);
                            else self.shapes.static.each(handle);
                           
                        }

                        if(self.collisions.dynamickinematic && self.shapes.dynamic.length() < self.shapes.kinematic.length()) 
                        {
                            //retrieve shapes in position range
                            if(self.enableHash !== false) _.each(self.kinematicHash.retrieve(shape), handle);
                            else self.shapes.kinematic.each(handle);
                        }

                        if(self.collisions.dynamicdynamic) 
                        {
                            //retrieve shapes in position range
                            if(self.enableHash !== false) _.each(self.dynamicHash.retrieve(shape), handle);
                            else self.shapes.dynamic.each(handle);
                        }
                    }
                    
                    if(shape.stage && shape.stage.world)
                    {
                        if(shape.gravity !== false && shape.colliding !== true) 
                        {
                            shape.acc = shape.stage.world.gravity;
                        }
                        else if(shape.colliding)
                        {
                            shape.acc = new G.Vector();                    
                        }
                    }
                    
                    //perform euler integration - ish - (acc = gravity + force, vel = vel + acc, pos = pos + vel)
                    shape.vel.add(shape.acc);
                    shape.pos.add(shape.vel.multiply(shape.stage && (shape.framerateVel !== false && self.framerateVel !== false) ? shape.stage.deltaFramerate : 1));
                });
            });

            //debug
            // G.pause();
        },

        handleCollisions:function(shape1, shape2)
        {
            var self = this;

            if(!shape1 || !shape2 || shape1 === shape2 || (shape1.type !== "dynamic" && shape2.type !== "dynamic")) return false;

            // * * * * * * * 
            //TODO - Make collision detection more efficient, better in general etc.
            //TODO - Add good support for dynamic-dynamic collisions, for now no support
            // * * * * * * * 
            //Perform Collision Detection

            //make sure shape2 is dynamic
            if (shape2.type !== "dynamic"){  var temp = shape2 ; shape2 = shape1; shape1 = temp; }

            //trigger collision check start on shapes
            if(shape1.events) var res1 = shape1.trigger("collisionCheck", [shape2]);
            if(shape2.events) var res2 = shape2.trigger("collisionCheck", [shape1]);
            //exit if shapes want to exit
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true; 

            //TODO - add swept collisions
            var mtv = G.Physics.intersecting(shape1, shape2, this.onlyAABB);
            if(!mtv) 
            {
                return false;
            }
            
            //trigger collision event on shapes
            if(shape1.type !== "dynamic")
            {
                if(shape1.events) var res1 = shape1.trigger("collision", [shape2, mtv]);
                if(shape2.events) var res2 = shape2.trigger("collision", [shape1, mtv]);
            }
            else
            {
                if(shape1.events) var res1 = shape1.trigger("collision", [shape2, mtv.divide(2).multiply(-1)]);
                if(shape2.events) var res2 = shape2.trigger("collision", [shape1, mtv.divide(2)]);
            }
            
            //exit if shapes want to exit
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true; 
            if((res1 instanceof Array && res1.indexOf(false) !== -1) || (res2 instanceof Array && res2.indexOf(false) !== -1)) return true;

            //Perform Collision Response
            //TODO - Make realistic response, handle slopes, handle rotation, handle friction, handle non-AABB

            var restitution = (shape1.restitution && shape2.restitution) ? 1 * shape1.restitution * shape2.restitution : Math.max(shape1.restitution, shape2.restitution);
            var friction = (shape1.friction + shape2.friction)/2;

            if(shape1.type !== "dynamic")
            {
                if(shape2.vel.y > 0 && mtv.y > 0 || shape2.vel.y < 0 && mtv.y < 0) return;
                
                //push shape2's position to be outside of shape1
                shape2.pos.add(mtv);

                //Handle for simple AABB's
                //simple aabb velocity reversing, does not work with rotating shapes or non-box shapes
                if(shape2.rotation === 0 && shape1.rotation === 0) 
                {
                    //reverse vel, and apply restitution
                    if((shape2.vel.x !== 0) && (Math.abs(mtv.x) > 0)) shape2.vel.x *= -1*restitution;
                    if((shape2.vel.y !== 0) && (Math.abs(mtv.y) > 0)) shape2.vel.y *= -1*restitution;

                    //friction
                    if(shape2.vel.x<0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x>-0.01)shape2.vel.x=0;
                    }
                    else if(shape2.vel.x>0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x<0.01)shape2.vel.x=0;
                    }
                }
            }

            //set dynamicdynamic to true to enable this code
            else
            {
                //push shape2's position to be outside of shape1
                shape2.pos.add(mtv.divide(2));
                shape1.pos.subtract(mtv.divide(2));

                //Handle for simple AABB's
                //simple aabb velocity reversing, does not work with rotating shapes or non-box shapes
                if((shape2.shape === "circle" || shape2.shape === "rect") && shape2.rotation === 0 ) 
                {
                    if(shape2.vel.x !== 0 && mtv.x !== 0) 
                    {
                        //reverse
                        var temp = shape1.vel.x;
                        shape1.vel.x = shape2.vel.x;
                        shape2.vel.x = temp;

                        //restitution
                        shape2.vel.x *= 1*restitution;
                        shape1.vel.x *= 1*restitution;
                    }

                    if(shape2.vel.y !== 0 && mtv.y !== 0) 
                    {
                        //reverse
                        var temp = shape1.vel.y;
                        shape1.vel.y = shape2.vel.y;
                        shape2.vel.y = temp;

                        //restitution
                        shape2.vel.y *= 1*restitution;
                        shape1.vel.y *= 1*restitution;
                    }
                    
                    //friction
                    if(shape2.vel.x<0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x>-0.001)shape2.vel.x=0;
                    }
                    else if(shape2.vel.x>0 && friction)
                    {
                        shape2.vel.x*=1-(friction/10);
                        if(shape2.vel.x<0.001)shape2.vel.x=0;
                    }
                    //friction
                    if(shape1.vel.x<0 && friction)
                    {
                        shape1.vel.x*=1-(friction/10);
                        if(shape1.vel.x>-0.001)shape1.vel.x=0;
                    }
                    else if(shape1.vel.x>0 && friction)
                    {
                        shape1.vel.x*=1-(friction/10);
                        if(shape1.vel.x<0.001)shape1.vel.x=0;
                    }
                }
            }
            
            if(shape1.events) var res1 = shape1.trigger("collisionResolved", [shape2, mtv]);
            if(shape2.events) var res2 = shape2.trigger("collisionResolved", [shape1, mtv]);
        }

    });

})();