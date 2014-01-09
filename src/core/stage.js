;(function(G){

function createStats(offset)
{

    var stats = new Stats();
    document.body.appendChild(stats.domElement);
    stats.domElement.style.cssText="padding:3px;z-index:100;position:absolute;left:"+offset[0]+"px;top:"+offset[1]+"px;cursor:pointer;background-color:#fff;font: 12px 'Helvetica Neue', Helvetica, Arial, sans-serif;";
    return stats;
}

function removeStats(stats)
{
    if(stats.domElement && stats.domElement.parentNode === document.body) document.body.removeChild(stats.domElement);
}

G.Stage = G.Collection.extend({

    initialize:function(obj)
    {
        if(G.stages.length === 0) 
        {
            G.stage = this;
            this.name = "G Main Stage";
        }
        else
        {
            delete G.stage;
            delete G.stages[0].name;
        }

        this.objects = [];
        this.physics = false;
        this._currentId = 0;
        this._length = 0;
        this._initLoader(); 
        this.addToCollections = false;
        this.addToObjectCollections = false;
        this.events = true;
        if(obj && typeof obj.events !== "undefined" && !obj.events) this.events = false;

        //mouse/key events
        this.event = new Event();

        //framerate
        this.framerate = this.desiredFramerate = 60;
        this.timeScale = 1;
        this.deltaFramerate = 1;
        this.deltaTime = 1000/this.framerate;
        this.time = 0;
        if(G.stage && this === G.stage) this.showFramerate = G.showFramerate;

        //physics 
        if((obj && obj.physics) || (G.stages.length === 0 && G.physics))
        {
            this.physics = true;
            this.world = new G.Physics.World(obj);
        }

        this.backgroundColor = "white";

        //add to stage list
        G.stages.push(this);
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

        if(typeof obj.showFramerate === "boolean") 
        {
            if(this === G.stage) G.showFramerate = obj.showFramerate;
            this.showFramerate = obj.showFramerate;
        }

        if(obj.camera)
        {
            if(!this.camera) this.camera = new G.Camera(_.extend(obj.camera, {stage:this}));
            else this.camera.initialize(_.extend(obj.camera, {stage:this}));
        }
    },

    setCanvas:function()
    {
        var args = [];
        _.each(arguments, function(arg){ args.push(arg) });   

        var initiating = this.canvas ? false : true;     

        for(var i  = 0; i < args.length; i++)
        {
            var arg = args[i];

            //
            // Get Canvas 
            //
            
            if(!this.canvas && !this.ctx)
            {
                //if canvas object passed in
                if(arg.tagName && arg.tagName === "CANVAS")
                {
                    this.canvas = arg;
                }

                //else if queryselector passed in
                else if(typeof arg === "string" && arg !== "smooth" && arg !== "crisp" && arg !== "lowres")
                {
                    this.canvas = document.querySelector(arg);
                    if(!this.canvas || this.canvas.tagName !== "CANVAS") throw new Error("Selector does not match a canvas" + arg);
                }

                else
                {
                    this.canvas = document.body.appendChild(document.createElement('canvas'));
                }

                //get canvas's 2d context
                this.ctx = this.canvas.getContext('2d');
            }

            //
            //get width and/or height
            //
            if(typeof arg === "number" && this.canvas)
            {
                if(typeof args[i+1] === "number")
                {
                    this.canvas.width = args[i];
                    this.canvas.height = args[i+1];
                    i++;
                }
                else this.canvas.width = args[i];
            }
        }

        //if no arguments
        if(!this.canvas && !this.ctx)
        {
            this.canvas = document.body.appendChild(document.createElement('canvas'));
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx = this.canvas.getContext('2d');
        }

        //set drawing mode to either pixellated or smooth, defaults to pixellated
        if(args.indexOf("smooth") !== -1)  
        {
            this.canvas.style.imageRendering = '';
            this.canvas.style.msInterpolationMode = '';
        }

        else if(args.indexOf("crisp") !== -1)
        {
            this.canvas.style.imageRendering = '-moz-crisp-edges';
            this.canvas.style.imageRendering = '-o-crisp-edges';
            this.canvas.style.imageRendering = '-webkit-optimize-contrast';
            this.canvas.style.imageRendering = 'crisp-edges';
            this.canvas.style.msInterpolationMode = 'nearest-neighbor';
        }

        if(initiating)
        {
            //make sure w/h are right
            this.width = this.canvas.width = this.canvas.clientWidth;
            this.height = this.canvas.height = this.canvas.clientHeight;
        }

        
        var devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                                this.ctx.mozBackingStorePixelRatio ||
                                this.ctx.msBackingStorePixelRatio ||
                                this.ctx.oBackingStorePixelRatio ||
                                this.ctx.backingStorePixelRatio || 1,
            ratio = devicePixelRatio / backingStoreRatio;

        if(args.indexOf("lowres") === -1 && devicePixelRatio !== backingStoreRatio)
        {
            var canvas = this.canvas, ctx = this.ctx;

            var oldWidth = canvas.width;
            var oldHeight = canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            this.width = oldWidth;
            this.height = oldHeight;

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            ctx.scale(ratio, ratio);
        }

        //run mouse event engine, setting root to canvas
        this.event.mouse.setRoot(this.canvas).run();

        this.clearCanvas();

        return this;
    },

    getCanvasOffset:function()
    {
        var obj = this.canvas;
        if(!obj) return false;

        try { var box = obj.getBoundingClientRect() }
        catch(e) { throw new Error("Invalid DOM Element") };

        var left = box.left;
        var top = box.top;

        return [left, top];
    },

    clearCanvas:function()
    {
        if(this.canvas && this.ctx) 
        {
            this._canvasCleared = true;
            if(this.backgroundColor === "white") this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            else
            {
                this.ctx.fillStyle = this.backgroundColor;
                this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            }
        }
        return this;
    },

    setScale:function()
    {
        if(!this.ctx)
        {

        }
    },

    render:function(noClear)
    {
        if(this.isPaused) return;

        if(noClear !== false || !this._canvasCleared) 
        {
            this._canvasCleared = true;
            this.clearCanvas();
        }
        this._super.apply(this, arguments);
        return this;
    },

    animate:function(time)
    {
        var self = this;
        this._canvasCleared = false;

        //when user calls stage.animate(callback) with a callback as parameter, initializes animation, and callback is called every animation frame
        if(typeof time === "function") 
        {
            //prevents starting animation more than once
            if(this._events.animate) return this.on("animate", time);
            this.on("animate", time);
        }

        if(this.camera) 
        {
            this.clearCanvas()._canvasCleared = true;
            this.camera.translate();
        }
        this.trigger("animate", arguments);
        if(this.camera) this.camera.resetTranslation();

        //get framerate properties unless specified not to
        if(typeof time === "number")
        {
            var dt = Math.avg(this.deltaTime, time - this.time);
            //refresh delta time if not sudden change
            this.deltaTime = Math.abs(dt-this.deltaTime) > 10 ? this.deltaTime : dt;
            // this.deltatime = time - this.time;
            this.framerate = 1000/this.deltaTime;
            this.deltaFramerate = (this.desiredFramerate/this.framerate)*this.timeScale;            
            this.time = time;
        }

        //stats mode
        if(this.showFramerate === true && !this.stats) this.stats = createStats(this.getCanvasOffset()); 
        else if(this.showFramerate && this.stats) this.stats.update();
        else if(!this.showFramerate && this.stats) removeStats(this.stats);

        if(!this.isPaused)
        {
            //framerate gets wonky sometimes while using requestanimframe in browsers other than chrome.... :| (dissatisfied face)
            //TODO - fix ^
            if(this.desiredFramerate === 60) window.requestAnimationFrame(function(time){ self.animate.call(self, time) });
            else 
            {
                var currTime = (new Date).getTime();
                var timeToCall = Math.max(0, 1000/this.desiredFramerate - (currTime - this.time));
                var id = window.setTimeout(function() {
                    self.animate.call(self, currTime + timeToCall)
                }, timeToCall);
            }
        }
    },

    pause:function()
    {
        this.isPaused = true;            
        this.trigger("pause", arguments);
        return this;
    },

    unPause:function()
    {
        //if wasn't already paused before, exit
        if(typeof this.isPaused === "undefined") return false;
        this.isPaused = false;
        this.framerate = this.desiredFramerate;
        this.deltaFramerate = 1;
        this.deltaTime = 1000/this.framerate;
        this.animate(true);            
        this.trigger("unpause", arguments);
        return this;
    },

    togglePaused:function()
    {
        if(this.isPaused) this.unPause();
        else this.pause();
        return this;
    }
});

})(G);