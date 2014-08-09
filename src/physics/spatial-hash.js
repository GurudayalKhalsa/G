var SpatialHash = Physics.SpatialHash = (function(){

    return G.Class.extend
    ({
        //argument is size of each hash cell
        initialize:function(cellSize)
        {
            //default size if none specified or no canvas
            this.setCellSize(cellSize);
            this.length = 0;

            this.buckets = {};
        },

        hash:function(x,y)
        {
            return [Math.floor(x/this.cellWidth), Math.floor(y/this.cellHeight)];
        },

        //converts object to hash
        insert:function(obj)
        {
            var self = this;
            if(obj instanceof Array) _.each(obj, function(obj){ self.insert(obj) });
            else if(obj instanceof G.Collection) obj.each(function(obj){ self.insert(obj) });

            else
            {
                if(!obj || !obj.bounds) 
                {
                    console.log(this);
                    throw new Error("The object to insert must have a bounds function that returns {top,left,bottom,right}");
                }

                this.length++;

                var bounds = obj.bounds();

                //get xy hashes
                var min = this.hash(bounds.left, bounds.top);
                var max = this.hash(bounds.right, bounds.bottom);

                for(var x = min[0]; x <= max[0]; x++)
                {
                    for(var y = min[1]; y <= max[1]; y++)
                    {
                        var key = x+":"+y;
                        if(!this.buckets[key]) this.buckets[key] = [];
                        this.buckets[key].push(obj);
                    }
                }
            }

            return this;
        },

        retrieve:function(obj)
        {
            if(!obj) return this.retrieveAll();

            var bounds = obj.bounds();

            var min = this.hash(bounds.left, bounds.top);
            var max = this.hash(bounds.right, bounds.bottom);

            var matches = [];

            for(var x = min[0]; x < max[0]+1; x++)
            {
                for(var y = min[1]; y < max[1]+1; y++)
                {
                    var key = x+":"+y;

                    if(!this.buckets[key]) continue;

                    for(var i = 0; i < this.buckets[key].length; i++)
                    {
                        if(matches.indexOf(this.buckets[key][i]) === -1) matches.push(this.buckets[key][i]);
                    }
                }
            }

            return matches;
        },

        retrieveAll:function()
        {
            var objects = [];

            _.each(this.buckets, function(bucket)
            {
                for(var i = 0; i < bucket.length; i++)
                {
                    if(objects.indexOf(bucket[i]) === -1) objects.push(bucket[i]);
                }
            });

            return objects;
        },

        remove:function(obj)
        {
            if(!obj) return;

            var bounds = obj.bounds();

            var min = this.hash(bounds.left, bounds.top);
            var max = this.hash(bounds.right, bounds.bottom);

            for(var x = min[0]; x < max[0]+1; x++)
            {
                for(var y = min[1]; y < max[1]+1; y++)
                {
                    var key = x+":"+y;
                    var index = this.buckets[key] ? this.buckets[key].indexOf(obj) : -1;
                    if(this.buckets[key] && index !== -1) 
                    {
                        this.buckets[key].splice(index, 1);
                        if(this.buckets[key].length === 0) delete this.buckets[key];
                    }
                }
            }

            return this;
        },

        clear:function()
        {
            this.length = 0;
            this.buckets = {};
            return this;
        },

        //horrible performance compared to clearing and reinserting
        // reset:function()
        // {
        //     var objects = this.retrieveAll();
        //     this.clear().insert(objects);
        //     return this;
        // },

        setCellSize:function(cellWidth, cellHeight)
        {
            this.cellWidth = cellWidth || (G.isMobile ? 30 : 60);
            this.cellHeight = cellHeight || this.cellWidth;
            var obj = this.retrieveAll();
            this.clear().insert(obj);
            return this;
        }
    });
})();