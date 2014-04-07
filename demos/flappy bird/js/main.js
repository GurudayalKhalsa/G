var game = {};

(function(){
        
    var stage = game.stage = new G.Stage({ physics:{ gravity:{y:0.3}, onlyAABB: true, framerateVel: false, enableHash: false } });
    stage.setCanvas();
    stage.backgroundColor = "#4ec0ca";
    
    var mouse = stage.event.mouse,
        key = stage.event.key;
    
    var gameStarted = false,
        gameOver = false;
    var w = 320, h = 568;
    var speed = 2;
    
    //disable default mouse and touch events
    mouse.on("down, up", function(e){ e.preventDefault() })
    
    //load and create assets
    //----------------------
    
    var assets = game.assets = new G.Collection,
        srces = 
        [ 
          "assets/ceiling.png", 
          "assets/score_0.png", 
          "assets/score_1.png", 
          "assets/score_2.png", 
          "assets/score_3.png", 
          "assets/score_4.png", 
          "assets/score_5.png", 
          "assets/score_6.png", 
          "assets/score_7.png", 
          "assets/score_8.png", 
          "assets/score_9.png", 
          "assets/land.png", 
          "assets/medal_bronze.png", 
          "assets/medal_silver.png", 
          "assets/medal_gold.png", 
          "assets/medal_platinum.png", 
          "assets/pipe_down.png", 
          "assets/pipe_up.png", 
          "assets/pipe.png", 
          "assets/replay.png", 
          "assets/score_button.png", 
          "assets/scoreboard.png", 
          "assets/sky.png", 
          "assets/splash.png", 
          "assets/start_button.png", 
          "assets/restart_button.png", 
          "assets/restart_button_icon.png", 
          "assets/pause_button.png",
          "assets/unpause_button.png",
          "assets/title.png" 
        ];
    
    for(var i = 0; i < srces.length; i++)
    {
        var img = new G.Image({ name: srces[i].split("/").pop().replace(".png", ""), src:srces[i], addToStage: false, physics: false });
        assets.add(img);
        assets[srces[i].split("/").pop().replace(".png", "")] = img;
    }
    
    var top = stage.height-h > assets.ceiling.height ? stage.height-h : 0;
    var bottom = stage.height-assets.land.height;
    
    var sky = new G.Collection;
        land = new G.Collection;
        ceiling = new G.Collection,
        topPipes = new G.Collection,
        bottomPipes = new G.Collection;
    
    //Set Asset Values
    //----------------

    assets.land.vel.x = -2;

    //create bird sprite
    var bird = assets.bird = game.bird = new G.Sprite
    ({
        name:"bird",
        src:"assets/bird.png",
        pos:{ x:200, y:200 },
        stepSize:{ x:34, y:24 },
        columns:1,
        rows:4,
        animations:
        {
            stillFlap:{range:[0,3], speed:1/6},
            movingFlap:{range:[0,3], speed:1/3}
        },
        addToStage:false,
        physics:false,
        disablePhysicsRotation: true,
        zindex: 300,
        flyForce: -5.7,
        score: 0
    });
    assets.add(assets.bird);    
        
    var ScoreImages = G.Collection.extend
    ({
        render: function(score, x, y, scale)
        {
            if(!score) score = 0;
            if(typeof x === "undefined") x = stage.width/2 + 20;
            if(typeof y === "undefined") y = 42;
            if(typeof scale === "undefined") scale = 0.8;
            
            this.remove(true);
            
            var score = (""+score).split("");
            
            var a = new G.Image(assets["score_"+score.pop()]);
            this.add(a.set({ zindex: 5, pos:{ x:x, y:y }, width: a.width * scale, height: a.height * scale }));
            for(var i = score.length - 1; i >= 0; i--)
            {                            
                var b = new G.Image(assets["score_"+score[i]]);
                this.add(b.set({ zindex: 5, pos:{ x: a.bounds().left - a.width/2 - 2, y:y }, width: b.width * scale, height: b.height * scale }));
                a = b;
            }
        } 
    });
    

    var scoreImages = new ScoreImages();
    
    var TopPipe = G.Rect.extend
    ({
        initialize:function(){ this._super.apply(this, arguments); this.name = "topPipe";  },
       _render: function()
       {
           var b = this.bounds();
           stage.ctx.drawImage(assets.pipe_down.image,b.left,b.bottom-assets.pipe_down.height,assets.pipe_down.width,assets.pipe_down.height);
           
           var h = ((b.bottom-assets.pipe_down.height-b.top) / assets.pipe.height);
           stage.ctx.drawImage(assets.pipe.image,b.left,b.top,assets.pipe.width,h);
       }
    });
    
    var BottomPipe = G.Rect.extend
    ({
        initialize:function(){ this._super.apply(this, arguments); this.name = "bottomPipe";  },
       _render: function()
       {
           var b = this.bounds();
           stage.ctx.drawImage(assets.pipe_up.image,b.left,b.top,assets.pipe_up.width,assets.pipe_up.height);
           
           var h = ((b.bottom-(assets.pipe_up.height+b.top)) / assets.pipe.height);
           stage.ctx.drawImage(assets.pipe.image, b.left, b.top + assets.pipe_up.height, assets.pipe.width, h);
       }  
    });
    
    //display loading until loaded all assets, start game after 
    var loadingText = new G.Text("Loading...", stage.width/2, stage.height/2, "25px", "Helvetica Neue", "bold", "white", "center");
    
    var instructions = new G.Text(G.touchEnabled ? "Instructions: Tap to flap" : "Instructions: Click or press space to flap", 0,0, "20px", "Helvetica Neue", "bold", "white", "center", false);
    
    var pauseButton;
    
    //start on load
    assets.one("load", function()
    {
        //Display Splash screen
        
        loadingText.remove();
        
        scrollCollection(land, assets.land);

        game.splashScreen();
        stage.event.on("resize", window, function()
        {
            if(!gameStarted) 
            {
                stage.setCanvas(window.innerWidth, window.innerHeight);
                game.splashScreen();
            }
        });
        
        //Start game when start_button clicked
        mouse.on("up", function()
        {
            if(assets.start_button.posInBounds(mouse.state.x, mouse.state.y) && !gameStarted)
            {
                game.start();
            }
        });
    });
    
    //pause on esc
    key.on("keyup:escape", function()
    {
        if(!gameOver) game.togglePaused();
    });
    
    //draws splash screen
    game.splashScreen = function()
    {        
        gameStarted = false;
        
        //Create Splash Screen and Set Images
        //-----------------------------------
        
        //get center box
        var c = { left:(stage.width/2) - w/2, top: (stage.height/2) - h/2, bottom: (stage.height/2) + h/2, right: (stage.width/2) + w/2, width:w, height:h };
        
        //add and set sky
        sky.remove(true);
        assets.land.bounds({bottom: stage.height});
        for(var i = 0, l = stage.width/assets.sky.width; i < l; i++)
        {
            var img = new G.Image(assets.sky);
            sky.add(img);
            img.add().bounds({bottom: assets.land.bounds().top, left: i * assets.sky.width });
        }
        //add and set land, repeating
        land.remove(true);
        assets.land.set({physics: true, type: "kinematic", vel:{x:-speed}});
        for(var i = 0, l = stage.width/assets.land.width; i < l; i++)
        {
            var img = new G.Image(assets.land);
            land.add(img);
            img.add().bounds({bottom: stage.height, left: i * assets.land.width });
        }
        
        //add and set title position
        assets.title.add().pos.set(c.left + (c.width/2) - 20, c.top + 150);
        //add and set bird
        assets.bird.add().setAnimation("stillFlap").pos.set(assets.title.bounds().right + assets.bird.width, assets.title.pos.y);
        //add and set start button
        assets.start_button.zindex = 1;
        assets.start_button.add().bounds({top:assets.title.bounds().bottom+30}).pos.x = stage.width/2;
        
        //instructions
        instructions.add();
        instructions.set
        ({
            pos:{ x: stage.width/2, y: assets.start_button.pos.y + 60 },
            zindex: 2
        }).add();
    }
        
    //starts the game
    game.start = function()
    {
        gameStarted = true;
        assets.start_button.remove();
        assets.title.remove();
        instructions.remove();
        
        //buttons
        assets.pause_button.add().set({zindex: 5, "pos.x": 30, "pos.y": 40});
        assets.restart_button_icon.add().set({zindex: 5, "pos.x": 70, "pos.y": 40});
        
        var buttonEvents = mouse.on("down", function()
        {
            if(assets.pause_button.posInBounds(mouse.state.x, mouse.state.y))
            {
                assets.pause_button.set({"pos.x": -100, "pos.y": -100}).remove();
                assets.unpause_button.add().set({zindex: 5, "pos.x": 30, "pos.y": 40});
                stage.render();
                stage.pause();
            }
            
            else if(assets.unpause_button.posInBounds(mouse.state.x, mouse.state.y))
            {
                assets.unpause_button.set({"pos.x": -100, "pos.y": -100}).remove();
                assets.pause_button.add().set({zindex: 5, "pos.x": 30, "pos.y": 40});
                stage.unPause();
            }
            
            else if(assets.restart_button_icon.posInBounds(mouse.state.x, mouse.state.y))
            {
                buttonEvents.off();
                keyflapDown.off();
                keyflapUp.off();
                mouseFlap.off();
                birdUpdate.off();
                birdScoreUpdate.off();
                event.off();
                bird.removeAnimation();
                scoreImages.remove(true);
                bird.set({score: 0, "vel.y": 0, rotation: 0})
                topPipes.remove(true);
                bottomPipes.remove(true);
                ceiling.remove(true);
                game.start();
            }
        })
        
        //score
        scoreImages.render(bird.score);
        
        //Set ceiling
        //-----------
        // assets.ceiling.set({physics: true, type: "kinematic", "vel.x":-speed});
        // assets.ceiling.bounds({bottom: 0});
        // for(var i = 0, l = stage.width/assets.ceiling.width; i < l+2; i++)
        // {
        //     var img = new G.Image(assets.ceiling);
        //     ceiling.add(img);
        //     img.add().bounds({ left: i * assets.ceiling.width });
        // }
        
        // scrollCollection(ceiling, assets.ceiling);
        
        //platform stuff
        //--------------
        var pipespacing = topPipes.pipespacing = bottomPipes.pipespacing = 120,
            pipegap = topPipes.pipegap = bottomPipes.pipegap = 100;
            
        var topPipe = addPipe(stage.width)[0];
        var nextPipe = topPipes.get(0);
            
        function addPipe(x)
        {
            var mid = G.random.float(bottom-(pipegap+pipegap/2), top+(pipegap+pipegap/2));
            
            var topPipe = new TopPipe(x, 0, assets.pipe.width, mid-(pipegap/2))
                .bounds({bottom:mid-pipegap/2})
                .set({"type": "kinematic", "vel.x": -speed, zindex: 2});

            var bottomPipe = new BottomPipe(x, 0, assets.pipe.width, stage.height-assets.land.height-(pipegap/2)-mid)
                .bounds({top:mid+pipegap/2})
                .set({"type": "kinematic", "vel.x": -speed, zindex: 2});
                
            topPipes.add(topPipe);
            bottomPipes.add(bottomPipe);
            
            return [topPipe, bottomPipe];
        }
        
        scrollCollection(topPipes, undefined, 
        //determines whether to scroll
        function()
        {
            var t = topPipes.get(0);
            //remove old
            if(t.pos.x < -((assets.pipe.width/2)+1)) 
            {
                t.remove();
                bottomPipes.get(0).remove();
            }
            
            var last = topPipes.get(-1);
            
            return last.pos.x > stage.width-assets.pipe.width/2 && last.pos.x < stage.width ? last : false;
        },
        //adds next item to collection and stage
        function(last)
        {
            addPipe(last.pos.x + last.width + pipespacing);
        });
        
        //bird stuff
        //----------
        bird.setAnimation("movingFlap").set({pos:{x: stage.width/5, y:stage.height-assets.land.height-( h <= window.innerHeight ? h/2 : (stage.height-assets.land.height)/2) }, physics:true});
        
        //flap on mouse down or spacebar
        var mouseFlap = mouse.on("down", flap);
        var keyflapDown = key.one("keydown:space", flap);
        var keyflapUp = key.on("keyup:space", function(){ keyflapDown = key.one("keydown:space", flap) });
                
        function flap()
        {
            if(assets.pause_button.posInBounds(mouse.state.x, mouse.state.y) || assets.unpause_button.posInBounds(mouse.state.x, mouse.state.y)) return;
            bird.vel.y = bird.flyForce; 
        }
        
        //update loop for bird
        var birdUpdate = bird.on("update", function()
        {
            //make sure bird doesn't go out of bounds
            if(bird.pos.y-bird.height/2 < 0) bird.pos.y = 0+bird.height/2;
                
            //rotate based on y velocity
            if(bird.vel.y < 0 && bird.rotation > -0.4) bird.rotation -= 0.1;             
            if(bird.vel.y > 6 && bird.rotation < Math.PI/2) bird.rotation += 0.1;
        });
        
        var birdScoreUpdate = bird.on("update", function()
        {
            //increase score if past next pillar
            if(bird.pos.x > nextPipe.pos.x) 
            {
                bird.score++;
                scoreImages.render(bird.score);
                nextPipe = topPipes.get(topPipes.getId(nextPipe) + 1);
            }
        });
        
        var event = bird.on("collision", function(shape, mtv)
        {
            if(!ceiling.has(shape))
            {
                buttonEvents.off();
                keyflapDown.off();
                keyflapUp.off();
                mouseFlap.off();
                bird.one("collision", function(){ birdUpdate.off(); });
                birdScoreUpdate.off();
                event.off();
                bird.removeAnimation();

                game.end();
                
                //stop from resolving collision
                return false;
            }    
        });
    }
    
    game.end = function()
    {
        gameOver = true;
        assets.pause_button.remove();
        assets.restart_button_icon.remove();
        topPipes.each(function(){ this.physics = false; this.vel.x = 0; });
        bottomPipes.each(function(){ this.physics = false; this.vel.x = 0; });
        ceiling.each(function(){ this.vel.x = 0; });
        land.each(function(){ this.vel.x = 0; });

        //add gameover image and scoreboard
        assets.scoreboard.add().set({zindex: 3, pos:{ x:stage.width/2, y: stage.height/2 }});

        //display score && highscore
        var scale = 0.5,
            x = stage.width/2 + 85,
            y = stage.height/2 - 25;
        
        scoreImages.render(bird.score, x, y, scale);
        
        var highscore = localStorage.getItem("flappy_bird_highscore");
        if(typeof highscore === "undefined" || bird.score > +highscore)
        {
            localStorage.setItem("flappy_bird_highscore", ""+bird.score);
            highscore = bird.score;
        }
        var highscoreImages = new ScoreImages();
        highscoreImages.render(highscore, x, y + 43, scale);
        
        //display medal if any
        var medal;
        if(bird.score >= 40) medal = assets.medal_platinum;
        else if(bird.score >= 30) medal = assets.medal_gold;
        else if(bird.score >= 20) medal = assets.medal_silver;
        else if(bird.score >= 10) medal = assets.medal_bronze;
            
        if(medal)
        {
            medal.add().set
            ({
                zindex: 10,
                "pos.x": stage.width/2 - 65,
                "pos.y": stage.height/2 - 5
            });
        }
        
        //add restart button, restart on click
        assets.restart_button.add().set
        ({
            zindex: 10,
            "pos.x": stage.width/2, 
            "pos.y": assets.scoreboard.bounds().bottom - 50
        });
        
        bird.one("collisionResolved", function(){ bird.physics = false })
        
        var restartEvent = mouse.on("up", function()
        {
            if(assets.restart_button.posInBounds(mouse.state.x, mouse.state.y))
            {
                restartEvent.off();
                [assets.scoreboard, scoreImages, highscoreImages, medal, assets.restart_button].forEach(function(asset){ if(asset) asset.remove(true); });
                bird.set({physics: true, score: 0, "vel.y": 0, rotation: 0})
                topPipes.remove(true);
                bottomPipes.remove(true);
                ceiling.remove(true);
                land.each(function(){ this.vel.x = -speed; });
                game.start();
            }
        })
    };

    game.togglePaused = function()
    {
        if(!stage.isPaused) 
        {
            stage.pause();
        }
        
        else
        {
            stage.unPause();
        }
    };
    

    stage.animate(function()
    {
        stage.update();
        stage.render();
    });
    
    //infinitely scrolls collection
    function scrollCollection(collection, shape, fn1, fn2)
    {   
        if(!fn1) fn1 = function()
        {
            //remove old
            if(collection.get(0).pos.x + collection.get(0).width*1.5 < 0) 
            {
                collection.get(0).remove();
            }
            
            var last = collection.get(-1);
            
            return last.pos.x > stage.width-(shape.width/2)-1 && last.pos.x < stage.width ? last : false;
        }
        
         
        if(!fn2) fn2 = function(last)
        {
            var img = new G.Image(shape);
            collection.add(img);
            img.add().bounds({left: last.bounds().right-1 });
        }
        
        stage.on("update", function()
        {
            var res = fn1();               
            if(res) fn2(res);
        });
    }
    
})();