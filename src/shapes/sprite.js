G.Sprite = G.Image.extend
({
    //either pass in an array of frames or 3 arguments to automate (frames must all have same width, and all have same height, for second option)
    
    //a frame should look something like this: { pos:{x:12,y:30}, clip:{x:0,y:0,width:20,height:20}, width:20,height:20 }, w/h are optional, default to clip w/h
    //pos is position of frame in stage, defaults to 0,0
    //clip is dimensions and location of sprite inside actual image spritesheet coordinates

    //args (in automation) - stepSize (width/height of each frame clip)(either number (x) or xy obj) width(default:stepsize.x), height(default:stepsize.y), columns (default:1), rows (default:1), framecount(default:columns*rows)
    //only stepSize is required

    //other arguments (inside of obj: 
    //default: the default frame to use, defaults to 0
    //animations: the animations to use
    
    initialize:function(obj, addToStage)
    {
        this._super(obj.src, obj.pos?obj.pos.x:0, obj.pos?obj.pos.y:0, obj.width||undefined, obj.height||undefined, addToStage);

        this.frames = [];
        if(obj[frames]) this.frames = obj[frames];
        var frames = this.frames;

        if(!obj.frames)
        {
            if(!obj.stepSize) throw new Error("Not enough info. Must contain stepSize.");
            var stepSize = {x:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.x, y:typeof obj.stepSize === "number" ? obj.stepSize : obj.stepSize.y},
                width = obj.width||stepSize.x,
                height = obj.height||stepSize.y,
                pos = obj.pos||{x:0,y:0},
                columns = obj.columns||1,
                rows = obj.rows||1,
                framecount = obj.framecount || columns*rows;

            var curX = 0, curY = 0, curFrame = 0;

            //compute frames
            for (var i = 0; i < rows; i++)
            {
                for (var j = 0; j < columns; j++)
                {
                    if(frames.length >= framecount) break;

                    frames.push
                    ({
                        clip:{x:curX,y:curY,width:stepSize.x,height:stepSize.y},
                        width:width,
                        height:height,
                        pos:pos
                    });      
                    
                    //change to next column
                    curX+=stepSize.x;
                }
                //reset x to 0
                curX=0;
                //change to next row
                curY+=stepSize.y;
            } 
        }

        //make sure frames are formatted correctly
        for (var i = 0; i < frames.length; i++)
        {
            var frame = frames[i];
            if(!frame.clip) throw new Error("Frame must have a clip with x,y,width,height attributes", frames, frame);
            if(!frame.width) frame.width = this.width || frame.clip.width;
            if(!frame.height) frame.height = this.height || frame.clip.height;
        }

        //set default image to first frame or user-specified
        this.setFrame(obj.default||0);

        //create animations
        if(obj.animations)
        {
            this.animations = {};
            this.addAnimations(obj.animations);
        }
    },

    addAnimations:function(animations)
    {
        for(var key in animations)
        {
            var obj = animations[key];
            var name = typeof obj.name === "string" ? obj.name : key;
            var anim = this.animations[name] = {};
            anim.name = name;
            anim.frames = [];
            if(obj.range) 
            {
                if(obj.range[1] > obj.range[0]) for (var i = obj.range[0]; i <= obj.range[1]; i++) anim.frames.push(i);
                else for (var i = obj.range[0]; i >= obj.range[1]; i--) anim.frames.push(i);
            }
            else if(obj.sequence) anim.frames = obj.sequence.slice(0);
            anim.currentFrame = anim.currentStep = 0;
            anim.speed = obj.speed||1;
            anim.repeat = typeof obj.repeat !== "undefined" ? anim.repeat : true;
        }
    },

    setAnimation:function(key)
    {
        if(this.animation === this.animations[key]) return;
        this.animation = this.animations[key];
        this.animation.currentFrame = 0;
        return this;
    },

    removeAnimation:function(frame)
    {
        if(!this.animation) return this;
        this.setFrame(typeof frame === "number" ? frame : this.animation.frames[0]);
        this.animation = false;
        return this;
    },

    setFrame:function(frame)
    {
        if(typeof frame !== "number" || !this.frames[frame]) return false;
        this.currentFrame = frame;
        this.clip = this.frames[frame].clip;
        this.width = this.frames[frame].width;
        this.height = this.frames[frame].height;

        return this;
    },

    _render:function()
    {
        if(this.animation)
        {
            var anim = this.animation;
            if(anim.currentStep > anim.frames.length-1) anim.currentStep = 0;

            this.setFrame(anim.frames[anim.currentFrame]);

            anim.currentStep+=anim.speed;
            anim.currentFrame = Math.round(anim.currentStep);
        }

        this._super.apply(this, arguments);
    }
});