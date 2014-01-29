
//Sound Module
//-------------


(function(G)
{
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    //use WebAudio API if available
    var context = AudioContext ? new AudioContext() : {};

    var test = new Audio;

    var types = {
        mp3: "audio/mpeg",
        ogg: "audio/ogg",
        wav: "audio/wav"
    }

    function playable(type)
    {
        return test.canPlayType(types[type]) !== "";
    }

    G.Sound = G.Object.extend
    ({
        initialize: function(src, extensions)
        {
            this._super();
            var self = this;
            if (typeof src !== "string") return console.warn("Warning: A sound must have a source... ", this);

            if(!(extensions instanceof Array))
            {
                this.src = src;
            }

            else
            {
                //get a playable source
                for (var i = 0; i < extensions.length; i++) if (playable(extensions[i], audio)) { this.src = src+"."+extensions[i]; break; }
            }

            this.multipleChannels = true;
            for (var i = 0; i < arguments.length; i++) if (typeof arguments[i] === "boolean") this.multipleChannels = arguments[i];

            
            //create audio
            function createAudio(){
                var audio = new Audio;
                audio.src = self.src;
                return audio;
            }

            //create channels
            
            var channels = [];
            for(var i = 0; i < 4; i++) channels.push(createAudio());
            var currentChannel = 0;
            var audio = this.audio = channels[0];
            
            //trigger when loaded
            this.loaded = false;
            audio.addEventListener("canplaythrough", function(){ self.trigger("load"); });
            this.on("load", function(){ self.loaded = true; });

            //BUG - Safari Mac (only tested on 7) has a major delay in playing sounds through solely html5 Audio
            //this method is much better in Safari than withoud using WebAudio, but not perfect (still delay)
            if(context && (navigator.userAgent.match("Safari") !== null && navigator.userAgent.match("Chrome") === null))
            {
                this.context = context;
                for(var i in channels)
                {
                    channels[i] = context.createMediaElementSource(channels[i]).mediaElement;
                }
            }      

            //trigger playing
            this.playing = false;
            audio.addEventListener("play", function() { self.playing = true; });
            audio.addEventListener("ended", function() { self.playing = false; });

            //mobile browsers must have an input event happen to load audio
            if(G.isMobile && G.stages[0]) G.stages[0].event.one("touchstart", window, function(){ audio.muted = true; audio.play(); audio.muted = false; })     
        },
        //plays all
        play: function(t)
        {
            //if currently playing, play new channel simultaneously
            if (this.playing && this.multipleChannels !== false) 
            {
                currentChannel++;
                if(currentChannel > 3) currentChannel = 0;
                return channels[currentChannel].play(t);
            }
            if (!this.loaded) return this.on("load", function() { self.play(t); });
            return audio.play(t);
        },
        //pauses all
        pause: function(t)
        {
            if (!this.loaded && !this.playing) return false;
            for(var i in channels) channels[i].pause(t);
        }
    })
})(G);