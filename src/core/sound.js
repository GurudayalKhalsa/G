(function(G)
{
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    //use WebAudio API if available
    var context = new AudioContext();

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

            //get a playable source
            for (var i = 0; i < extensions.length; i++) if (playable(extensions[i], audio)) { this.src = src+"."+extensions[i]; break; }

            //create audio
            function createAudio(){
                var audio = new Audio;
                audio.src = self.src;
                return audio;
            }

            var audio = this.audio = createAudio();

            var channels = [];
            
            //trigger when loaded
            this.loaded = false;
            audio.addEventListener("canplaythrough", function(){ self.trigger("load"); });
            this.on("load", function(){ self.loaded = true; });

            //BUG - Safari (only tested on 7) has a major delay in playing sounds through solely html5 Audio
            //second method is much better in Safari, but not perfect (still delay)
            if(!context || (navigator.userAgent.match("Safari") === null || navigator.userAgent.match("Chrome") !== null))
            {
                //trigger playing
                audio.addEventListener("play", function() { self.playing = true; });
                audio.addEventListener("ended", function() { self.playing = false; });

                this.play = function()
                {
                    //if currently playing, play new channel simultaneously
                    if (this.playing) 
                    {
                        var n = new Audio;
                        n.src = this.src;
                        channels.push(n);
                        n.play();
                        return;
                    }
                    else channels = [];
                    if (!this.loaded) return this.on("load", function() { self.play(); });
                    channels.push(audio);
                    return audio.play();
                };
                //stops all
                this.stop = function()
                {
                    if (!this.loaded && !this.playing) return false;
                    for(var i in channels) channels[i].pause();
                };
            }

            else
            {
                this.context = context;
                var source = self.source = context.createMediaElementSource(audio);
                this.playing = false;
                source.mediaElement.addEventListener("play", function(){self.playing = true;});
                source.mediaElement.addEventListener("ended", function(){self.playing = false;});

                this.play = function()
                {
                    //if currently playing, play new sound simultaneously
                    if(this.playing) 
                    {
                        var newSource = context.createMediaElementSource(createAudio());
                        channels.push(newSource);
                        return newSource.mediaElement.play();
                    }
                    else channels = [];
                    if (!self.loaded) return self.on("load", function(){self.play()});
                    channels.push(source);
                    return source.mediaElement.play();
                };
                this.pause = function()
                {
                    if (!self.loaded) return false;
                    for(var i in channels) channels[i].mediaElement.pause();
                };
            }            
        }
    })
})(G);