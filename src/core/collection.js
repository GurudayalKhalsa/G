G.Collection = G.Class.extend({
    initialize:function(addToCollections, addToObjectCollections, addPhysics)
    {
        this.objects = [];
        this._currentId = 0;
        this._length = 0;

        this.addToCollections = typeof addToCollections === "boolean" ? addToCollections : ((typeof addToCollections === "object" && typeof addToCollections.addToCollections === "boolean") ? addToCollections.addToCollections : true);
        this.addToObjectCollections = typeof addToObjectCollections === "boolean" ? addToObjectCollections : ((typeof addToSCollections === "object" && typeof addToCollections.addToObjectCollections === "boolean") ? addToCollections.addToObjectCollections : true);
        this.add.apply(this, arguments);
        if(this.addToCollections !== false) 
        {
            G.collections.push(this);
            this._initLoader();
        }

        this.events = true;
        var obj = this.addToCollections;
        if(obj && typeof obj.events !== "undefined" && !obj.events) this.events = false;

        if(addPhysics || typeof this.addToCollections === "object" && this.addToCollections.physics)
        {
            this.physics = true;
            this.world = new G.Physics.World(addToCollections);
        }
    },

    //trigger load when all images in stage have been loaded
    _initLoader:function()
    {
        var self = this;
        var assets = new G.Collection(false, false), loaded = new G.Collection(false, false), loading = new G.Collection(false, false);
        this.loaded = true;

        this.on('add', function(shape)
        {            
            if(shape.src) 
            {
                assets.add(shape);
                if(!shape.loaded) 
                {
                    self.loaded = false;
                    loading.add(shape);
                    shape.on('load', function()
                    { 
                        loading.remove(shape);
                        loaded.add(shape);
                        checkLoaded(shape) 
                    });
                }
                else loaded.add(shape);
                
                checkLoaded(shape);
            }
        });

        function checkLoaded(shape)
        {
            if(assets.length() === loaded.length()) 
            {
                self.loaded = true;
                if(self.events) self.trigger('load', [assets]);
                if(self === G.stage && G.events) G.trigger('load', [assets]);
            }
            else 
            {
                if(self.events) self.trigger('loading', [loading, loaded, assets]);                
                if(self === G.stage && G.events) G.trigger('loading', [loading, loaded, assets]);
            }
        }
    },

    config:function(obj)
    {
        if(typeof obj !== "object") return false;

        //physics
        if(obj.physics) 
        {
            if(obj.physics) 
            {
                if(!this.world) this.world = new G.Physics.World(obj.physics);
                else this.world.config(obj.Physics);
            }
        }
    },

    update:function()
    {
        if((this.world && ((this !== G.stage && this.physics) || (this === G.stage && G.physics && this.physics)))) this.world.update();
        //prevent update from being called more than once
        else if(this.get(0) && !(this.get(0).stage && this.get(0).stage.world))
        {
            this.each(function(shape)
            {
                if(shape.update) shape.update();
            });
        }
        return this;
    },

    render:function()
    {
        if(this.isPaused) return;

        var self = this;

        if(self.events) self.trigger("render");

        //retrieve all visible shapes, very efficient if thousands of static shapes
        if(this.visible && this.renderHash)
        {
            this.visible.moving.clear().insert(this.visible.moving.shapes);
            var obj = {};
            if(this.visible.stage.camera) 
            {
                var camera = this.visible.stage.camera;
                obj.bounds = function(){
                return {
                    top:camera.pos.y-camera.frame.top,
                    left:camera.pos.x-camera.frame.left,
                    bottom:camera.pos.y+camera.frame.bottom,
                    right:camera.pos.x+camera.frame.right
                }};
            }
            else 
            {
                obj.bounds = function(){
                return {
                    top:0,
                    left:0,
                    bottom:self.visible.stage.height,
                    right:self.visible.stage.width
                }};
            }

            _.each(this.visible.static.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type !== "static") 
                {
                    _.each(self.visible.static.retrieve(), function(shape)
                    {
                        if(shape.type === "static") return;
                        self.visible.static.remove(shape);
                        self.visible.moving.insert(shape); 
                        self.visible.moving.shapes.push(shape);
                    });
                }
                if(self.events) self.trigger("renderShape", [shape]);
                shape.render();
            });

            _.each(this.visible.moving.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type === "static") 
                {
                    _.each(self.visible.moving.retrieve(), function(shape)
                    {
                        if(shape.type !== "static") return;
                        self.visible.moving.remove(shape); 
                        var index = self.visible.moving.shapes.indexOf(shape);
                        if(index !== -1) self.visible.moving.shapes.splice(index, 1);
                        self.visible.static.insert(shape);
                    });
                }
                if(self.events) self.trigger("renderShape", [shape]);
                shape.render();
            });
            return this;
        }

        //draw and update all objects in stage
        for(var i = 0; i < this.objects.length; i++)
        {
            var shape = this.objects[i];
            if(!(shape instanceof G.Shape)) continue;
            if(self.events) self.trigger("renderShape", [shape]);
            shape.render();
        }
        return this;
    },

    add:function(object)
    {
        var self = this;
        //if multiple in arguments
        if(arguments.length > 1)
        {
            for(var i = 0; i < arguments.length; i++)
            {
                if(arguments[i] instanceof Array || arguments[i] instanceof G.Object) this.add(arguments[i]);
            }
        }
        //if passing in array of objects
        else if(object instanceof Array)
        {
            for(var i = 0; i < object.length; i++)
            {
                if(object[i] instanceof G.Object) this.add(object[i]);
            }
        }

        else if(object instanceof G.Collection) object.each(function(obj){self.add(obj)});
        
        else
        {
            if(!(object instanceof G.Object)) return false;

            if(this.world && this.physics !== false) this.world.add(object);

            if(this.has(object)) 
            {
                // console.warn("Warning: " + object.object + " already in collection. Not re-adding." )
                return false;
            }

            if(!(object instanceof G.Object)) return false;

            var id = this._currentId;

            this.objects[id] = object;
            this._currentId++;
            this._length = this._length+1;  

            //add to visible hash
            if((this.canvas || (this.get(0) && this.get(0).stage && this.get(0).stage.canvas)) && object instanceof G.Shape)
            {
                var stage = this.canvas ? this : this.get(0).stage;
                var canvas = stage.canvas;

                //determine if visible hases required
                var b = object.bounds();
                if(b.right < 0 || b.left > stage.width || b.bottom < 0 || b.top > stage.height && this.renderHash !== false) this.renderHash = true;

                if(!this.visible) 
                {
                    this.visible = {stage:stage,static:new SpatialHash().setCellSize(stage.width, stage.height), moving:new SpatialHash().setCellSize(stage.width, stage.height)};
                    this.visible.moving.shapes = [];
                }
                if(object.type === "static") this.visible.static.insert(object); 
                else 
                {
                    this.visible.moving.insert(object); 
                    this.visible.moving.shapes.push(object);
                }
            }

            //add to object's collections if necessary
            if(object.collections && this.addToObjectCollections !== false && object.collections.indexOf(this)===-1) object.collections.push(this);

            //set object's stage to this if this is stage
            if(this instanceof G.Stage) object.stage = this;

            if(this.events) this.trigger("add", arguments);
            if(this.events) this.trigger("change", arguments);

            return id;        
        }
    },

    remove:function(object, fromObject)
    {
        if(this.length() === 0) return false;
        //if index, get object
        if(typeof object === "number") object = this.get(object);

        //exit if object not in objects
        if(object instanceof G.Object && !this.has(object)) return false;

        //remove all if no object specified
        var self = this;
        if(!object || typeof object === "boolean") 
        {
            var index = 0;
            var objects = [];
            this.each(function(object)
            {
                objects.push(object);
                self.remove(object);
                //force removal
                if(object) object.remove();
            });
            return objects;
        }

        if(this.world && this.physics !== false) this.world.remove(object);

        var index = this.getId(object);

        if(this.events) this.trigger("remove", arguments);
        if(this.events) this.trigger("change", arguments);

        delete this.objects[index];
        this._length = this._length-1;

        //remove from visible hash
        if(object instanceof G.Shape && this.visible)
        {
            if(object.type === "static") this.visible.static.remove(object); 
            else 
            {
                this.visible.static.remove(object); 
                this.visible.moving.remove(object); 
                var index = this.visible.moving.shapes.indexOf(object);
                if(index !== -1) this.visible.moving.shapes.splice(index, 1);
            }
        }

        //handle collections and stage removal if necessary
        if(!object.collections || (object.collections && object.collections.length === 0)) return object;

        //remove current collection from object's collection list
        var index = object.collections.indexOf(this);
        if(index !== -1)
        {
            object.collections.splice(index, 1);
            if(!fromObject && object.events) object.trigger("remove", this);
        }
        //remove object from all of its collections if this is root stage
        if(this === G.stage || this.queryParent === G.stage) object.remove();

        return object;
    },

    has:function(obj)
    {
        if(obj instanceof Array) var output = obj.map(function(object){return this.has(object)}, this);
        else output = this.objects.indexOf(obj) !== -1;
        return output;
    },

    get:function(index)
    {
        if(typeof index === "number")
        {
            if(index >= 0)return this.objects[index];
            return this.objects[this.objects.length+index];
        }
        if(this.objects.indexOf(undefined) === -1) return this.objects.slice(0);
        var objects = [];
        for(var i = 0; i < this.objects.length; i++)
        {
            var object = this.objects[i];
            if(object)objects.push(object);
        }
        return objects;
    },

    getId:function(object)
    {
        return this.objects.indexOf(object);
    },

    each:function(callback)
    {
        for(var i = 0; i < this.objects.length; i++)
        {
            if(typeof this.objects[i] !== "undefined") 
            {
                var res = callback.call(this, this.objects[i]);
                if(res === false) break;
            }
        }
        return this;
    },

    length:function()
    {
        //get length cache
        if(typeof this._length === "number") return this._length;

        //if no deleted objects
        if(this.objects.indexOf(undefined) === -1) return this.objects.length;

        var count = 0;
        for(var i = 0; i < this.objects.length; i++)
        {
            if(typeof this.objects[i] !== "undefined") count++;
        }
        this._length = cound;
        return count;
    },

    shapeContainingPoint:function(x,y,reverse)
    {
        var shape;
        this.each(function(s)
        {
            if(!(s instanceof G.Shape)) return;
            if(s.posInBounds(x,y,reverse)) 
            {
                shape = s;
                return false;
            }
            
        });
        if(shape) 
        {
            return shape;
        }
        return false;
    },

    getIntersections:function()
    {
        var collection = this, cb = function(){}, none = true, collisions = [];
        for(var i = 0; i < arguments.length; i++){ if(arguments[i] instanceof G.Collection) collection = arguments[i]; if(typeof arguments[i] === "function") cb = arguments[i] }
        this.each(function(shape)
        {
            if(!(shape instanceof G.Shape)) return;
            var intersections = shape.getIntersections(collection, cb);
            if(intersections)
            {
                collisions.push([shape, intersections]);
                none = false;
            }
        });

        if(none) return false;
        return collisions;
    },

    query:function(obj, cb)
    {
        if(typeof obj !== "string" && typeof obj !== "object" && typeof obj !== "function") return false;

        if(typeof obj === "string") var match = obj.split(",");
        if(typeof obj === "function") var custom = obj;

        var cb = cb || function(){};
        var collection = new G.Collection(false, false);
        collection.queryParent = this;
        var none = true;

        for(var i = 0; i < this.objects.length; i++)
        {
            if(!this.objects[i]) continue;
            var object = this.objects[i];

            var not = false;
            
            //handle if string
            if(match) 
            {
                for(var i = 0; i < match.length; i++)
                {
                    if(typeof object[match[i]] === "undefined") not = true;
                }
            }

            //handle if obj
            else if(custom) not = custom(object) ? false : true;

            else _.each(obj, function(val, key)
            {
                if(typeof val === "object") _.each(val, function(val2, key2){ process(val2, key2, object[key]) });
                else process(val, key, object);
            });

            function process(val, key, parent)
            { 
                if(!parent) return;

                var range = false;
                //if number range - e.g. "range:10:20" in between 10 and 20
                if(typeof val === "string" && val.indexOf("range") !== -1)
                {
                    var range = val.split("range:").join("").split(":").map(function(val){return parseFloat(val)});
                    if(range && parent[key] >= range[0] && parent[key] <= range[1]) not = false;
                    else not = true; 
                }
                if(!range && parent[key] !== val) not = true; 
            }

            if(!not) 
            {
                cb(object, obj);
                collection.add(object);
                none = false;
            }
        }

        return collection;
    }
});