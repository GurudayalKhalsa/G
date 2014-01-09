G.Ticker = G.Class.extend(
{
    //arguments can be a callback and interval, in any order
    initialize: function(interval)
    {
        this.interval = interval || 1000 / 60;
        for (var i = 0; i < arguments.length; i++)
        {
            if (typeof arguments[i] === "function") this.on("tick", arguments[i]);
            if (typeof arguments[i] === "number") this.interval = arguments[i];
        }
        return this;
    },

    start: function(time) 
    {
        var self = this;

        //prevent multiple starting
        if(typeof time !== "number" && this.isStopped === false) return;

        //restarting (not reseting)
        else if(typeof time !== "number" && this.isStopped === true)
        {
            this.isStopped = false;
            this._time = Date.now();
            this.trigger("start");
        }

        //start ticker
        if(!this._time) this.trigger("start");
        if (!this._time) this._time = Date.now();
        if (!this.elapsedTime) this.elapsedTime = 0;
        this.deltaTime = Date.now() - this._time;
        this.elapsedTime = parseFloat((this.elapsedTime + this.deltaTime/1000).toFixed(3));
        this._time = Date.now();

        this.trigger("tick", arguments);

        if (!this.isStopped)
        {
            if (this.interval === 1000/60) window.requestAnimationFrame(function(time)
            {
                self.start.call(self, time)
            });
            else window.setTimeout(function(time)
            {
                self.start.call(self, self.elapsedTime)
            }, this.interval);
        }

        return this;
    },

    stop: function() 
    {
        this.isStopped = true;
        this.trigger("stop");
    },

    reset:function()
    {
        this.elapsedTime = 0;
        this.trigger("reset");
    }
});