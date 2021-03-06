
//Collection Module
//-----------------

G.Collection = G.Class.extend({
    initialize:function(addToCollections, addToObjectCollections, addPhysics)
    {
        this.objects = [];
        this._currentId = 0;
        this._length = 0;
        this.visibleHashEnabled = false;
        this.enableZindex = false;

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

        if(addPhysics || (typeof arguments[0] === "object" && arguments[0].physics))
        {
            this.physics = true;
            this.world = new G.Physics.World(arguments[0].physics||addPhysics);
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
        this.trigger("update");
        //update physics world if exists
        if((this.world && ((this !== G.stage && this.physics) || (this === G.stage && G.physics && this.physics)))) this.world.update();
        
        //update each shape
        this.each(function(shape)
        {
            if(shape.update) shape.update();
        });
        
        return this;
    },

    render:function()
    {
        if(this.isPaused) return;

        var self = this;

        if(self.events) self.trigger("render");

        //retrieve all visible shapes, very efficient if thousands of static shapes
        //only enabled if stage.enableVisibleHash is set to true
        if(this.visibleHash && this.visibleHashEnabled)
        {
            this.visibleHash.moving.clear().insert(this.visibleHash.moving.shapes);
            var obj = {};
            if(this.visibleHash.stage.camera) 
            {
                var camera = this.visibleHash.stage.camera;
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
                    bottom:self.visibleHash.stage.height,
                    right:self.visibleHash.stage.width
                }};
            }

            _.each(this.visibleHash.static.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type !== "static") 
                {
                    _.each(self.visibleHash.static.retrieve(), function(shape)
                    {
                        if(shape.type === "static") return;
                        self.visibleHash.static.remove(shape);
                        self.visibleHash.moving.insert(shape); 
                        self.visibleHash.moving.shapes.push(shape);
                    });
                }
                if(self.events) self.trigger("renderShape", [shape]);
                shape.render();
            });

            _.each(this.visibleHash.moving.retrieve(obj), function(shape)
            {
                if(!shape) return;
                if(shape.type === "static") 
                {
                    _.each(self.visibleHash.moving.retrieve(), function(shape)
                    {
                        if(shape.type !== "static") return;
                        self.visibleHash.moving.remove(shape); 
                        var index = self.visibleHash.moving.shapes.indexOf(shape);
                        if(index !== -1) self.visibleHash.moving.shapes.splice(index, 1);
                        self.visibleHash.static.insert(shape);
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
        if(_.isArr(object)){ for(var i = 0; i < object.length; i++) this.add(object[i]); return this }
        
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
            
            //could be slow
            if(typeof object.zindex !== "undefined" && this.enableZindex)
            {
                var needToSort = false;
                for(var i = 0; i < this.objects.length; i++) if(this.objects[i] && this.objects[i].zindex !== 0) { needToSort = true; break; }
                if(needToSort) this.sortByZindex();
            }

            //add to visible visibleHash
            if(this.visibleHashEnabled && (this.canvas || (this.get(0) && this.get(0).stage && this.get(0).stage.canvas)) && object instanceof G.Shape)
            {
                this.addToVisibleHash(object);
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
        if(_.isArr(object)){ for(var i = 0; i < object.length; i++) this.remove(object[i]); return this }

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
            for(var i = 0, j = this.objects.length; i < j; i++)
            {
                var object = this.objects[i];
                objects.push(object);
                self.remove(object);
                //force removal
                if(object) object.remove();
            }
                
            return objects;
        }

        if(this.world && this.physics !== false) this.world.remove(object);

        var index = this.getId(object);

        if(this.events) this.trigger("remove", arguments);
        if(this.events) this.trigger("change", arguments);

        this.objects.splice(index, 1);
        // delete this.objects[index];
        
        this._currentId = this.objects.length;
        this._length = this._length-1;

        //remove from visible visibleHash
        if(this.visibleHashEnabled && object instanceof G.Shape && this.visibleHash)
        {
            this.removeFromVisibleHash(object);
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
    
    sortByZindex: function()
    {
        this.objects.sort(function(cur, next)
        {
            return (cur.zindex > next.zindex ? 1 : (cur.zindex === next.zindex ? 0 : -1));
        });
    },

    addToVisibleHash:function(object)
    {
        var stage = this.canvas ? this : this.get(0).stage;
        var canvas = stage.canvas;

        //determine if visible hases required
        var b = object.bounds();

        if(!this.visibleHash) 
        {
            this.visibleHash = {stage:stage,static:new SpatialHash().setCellSize(stage.width, stage.height), moving:new SpatialHash().setCellSize(stage.width, stage.height)};
            this.visibleHash.moving.shapes = [];
        }
        if(object.type === "static") this.visibleHash.static.insert(object); 
        else 
        {
            this.visibleHash.moving.insert(object); 
            this.visibleHash.moving.shapes.push(object);
        }
    },

    removeFromVisibleHash:function(object)
    {
        if(object.type === "static") this.visibleHash.static.remove(object); 
        else 
        {
            this.visibleHash.static.remove(object); 
            this.visibleHash.moving.remove(object); 
            var index = this.visibleHash.moving.shapes.indexOf(object);
            if(index !== -1) this.visibleHash.moving.shapes.splice(index, 1);
        }
    },

    enableVisibleHash:function()
    {
        this.visibleHashEnabled = true;
        var self = this;
        this.each(function(shape)
        {
            self.addToVisibleHash(shape);
        });
    },

    disableVisibleHash:function()
    {
        this.visibleHashEnabled = false;
        var self = this;
        this.each(function(shape)
        {
            self.removeFromVisibleHash(shape);
        });
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
        for(var i = 0, j = this.objects.length; i < j; i++)
        {
            if(typeof this.objects[i] !== "undefined") 
            {
                var res = callback.call(this.objects[i], this.objects[i], i);
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

        if(typeof obj === "string") 
        {
            var match = obj.split(",");
            if(typeof cb === "string") 
            {
                var query = cb;
                cb = arguments[2];
            }
        }
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
                _.each(match, function(key)
                {
                   var parent = object;
                   if(key.indexOf(".") !== -1)
                   {
                       var depth = key.split(".");
                       for(var i = 0; i < depth.length-1; i++)
                       {
                           parent = parent[depth[i]];   
                       }
                       key = depth.pop();
                   }
                   
                   process(query, key, parent);
                });
            }
            

            //handle if obj
            else if(custom) not = custom(object) ? false : true;

            else _.each(obj, function(val, key)
            {
                var parent = object;
                if(key.indexOf(".") !== -1)
                {
                    var depth = key.split(".");
                    for(var i = 0; i < depth.length-1; i++)
                    {
                        parent = parent[depth[i]];   
                    }
                    key = depth.pop();
                }
                if(typeof val === "object") _.each(val, function(val2, key2){ process(val2, key2, parent[key]) });
                else process(val, key, parent);
            });

            function process(val, key, parent)
            { 
                if(!parent) return;

                var range = false;
                //if number range - e.g. "range:10:20" in between 10 and 20
                if(typeof val === "string" && val.indexOf("range") !== -1)
                {
                    var range = val.split("range:").join("").split(":").map(function(val){return +val});
                    if(range && parent[key] >= range[0] && parent[key] <= range[1]) not = false;
                    else not = true; 
                }
                if(!range && parent[key] !== val) not = true; 
            }

            if(!not) 
            {
                cb.call(object, object, obj);
                collection.add(object);
                none = false;
            }
        }

        return collection;
    }
});