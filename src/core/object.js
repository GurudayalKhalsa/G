
//Object Module
//-------------


G.Object = G.Class.extend({

    initialize:function(obj, defaults)
    {
        this.mergeValues(obj, defaults);

        if(this.addToStage !== false) this.add(this.addToCollection);
        delete this.addToCollection;
        delete this.addToStage;
    },

    mergeValues:function(obj, defaults)
    {        
        //exit if nothing to merge
        if(!obj && !defaults) return;

        //prevent sub-objects from being modified if obj used again (e.g. if an object is used to create a shape, and that objects's pos is changed afterwards, this shape's ops would normally be that obj's pos. prevent that)
        //this also get's rid of functions... consider changing to allow functions?
        var tmp = {};
        for(var i in obj)
        {
            if(_.isObj(obj[i]) || _.isArr(obj[i])) 
            {
                try {
                    tmp[i] = JSON.parse(JSON.stringify(obj[i]));
                }  
                catch (e) {                    
                    if(_.isArr(obj[i]))
                    {
                        tmp[i] = obj[i].slice(0);
                    }
                    else
                    {
                        tmp[i] = _.extend({}, obj[i])
                    }
                }
            } 
            else tmp[i] = obj[i];
        }
        obj = tmp;

        var rootDefaults = {collections:[],events:true};
        var params = rootDefaults;

        //merge custom defauts with root defaults if custom defaults exist
        var defaults = defaults || {};
        //deep extend
        params = _.extend(params, defaults, obj);

        for (var param in params) 
        {
            if(typeof obj[param] !== "undefined") 
            {
                //if current parameter is an object, set all of params[param]'s keys that are in obj[params] keys to obj[param]'s key
                if(typeof obj[param] === "object" && typeof params[param] === "object")
                {
                    for(var key in obj[param]) 
                    {
                        try {
                            params[param][key] = obj[param][key]; 
                        }  
                        catch (e) { 

                        }
                    }
                }
                else params[param]=obj[param];
            }
            //Sets this.param to vector of param if object literal such as {x:0,y:0}
            if(typeof params[param] === "object" && params[param].x && params[param].y && _.keys(params[param]).length===2 ) this[param] = new G.Vector(params[param].x,params[param].y);
            else this[param] = params[param];
        }
    },

    add:function(collection)
    {        
        if(collection === false) return false;

        if(collection && collection instanceof G.Collection) 
        {
            var id = collection.add(this);
            if(typeof id === "number") 
            {
                if(this.events) this.trigger("add", collection);
                if(collection.addToObjectCollections !== false && this.collections.indexOf(collection) === -1) this.collections.push(collection);
            }
        }

        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var id = collection.add(this);
                if(typeof id === "number") 
                {
                    if(this.events) this.trigger("add", collection);
                }
            }, this);
        }

        if(G.stage && this.addToStage !== false && G.stages.length === 1) 
        {
            var id = G.stage.add(this);
            if(typeof id === "number" && this.events) 
            {
                if(this.events) this.trigger("add", G.stage);  
                if(G.stage.addToObjectCollections !== false && this.collections.indexOf(G.stage) === -1) this.collections.push(G.stage);
            }              
            if(typeof id !== "undefined") this.stageId = id; 
        }  
        
        return this;          
    },

    remove:function(collection)
    {        
        var self = this;  
        //delete collection specified if specified
        if(collection && collection instanceof G.Collection)
        {
            var success = collection.remove(this);
            if(typeof success === "number" && this.events) this.trigger("remove", collection);
        }

        //delete all collections this shape belongs to
        else if(this.collections && this.collections.length > 0)
        {
            _.each(this.collections, function(collection, index)
            {
                var success = collection.remove(self);
                if(typeof success === "number" && self.events) self.trigger("remove", collection);

            });
        }

        //delete this shape from the root stage
        if(!collection && this.stage) 
        {
            var success = this.stage.remove(this);
            if(typeof success === "number" && this.events) this.trigger("remove", this.stage);
        }

    },

    set:function(key, val)
    {
        var self = this;
        //handle of object passed in, set all keys in that object
        if(typeof key === "object") { _.each(arguments[0], function(val, key){ self.set(key, val) }); return self; }

        var current = this[key];
        if((typeof val !== "object" && val !== current) || (typeof val === "object" && !_.isEqual(current, val)) )
        {

            if(typeof val === "object" && !(val instanceof G.Object)) this[key] = _.extend(current, val);
            else this[key] = val;

            if(this.events)
            {
                this.trigger("change", [current, key]);
                this.trigger("change:"+key, [current, key]);
                for(var i = 0; i < this.collections.length; i++) 
                { 
                    if(this.collections[i].events)
                    {
                        this.collections[i].trigger("change:any", [current, key]); 
                        this.collections[i].trigger("change:"+key, [current, key]);
                    }
                };
            }
        }
        return self;
    },

    get:function(name)
    {
        if(typeof this[name] === "undefined") return false;
        if(typeof this[name] === "object") return _.clone(obj);
        return this[name];
    }
});
