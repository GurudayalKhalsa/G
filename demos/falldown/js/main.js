var game = {};

(function(){
        
    var stage = game.stage = new G.Stage({ showFramerate: true, physics:{ gravity:{y:0.3}, onlyAABB: true, enableHash: false } }).setCanvas(window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight / 1.2),
        mouse = stage.event.mouse,
        key = stage.event.key;
    
    var falldownTitleText, instructionText, startText, score, walls, ball, leftPlatforms, rightPlatforms, platformSpacing;
    
    //create game assets
    function createAssets()
    {         
        score = new G.Text(function(){return "Score: "+(ball.score||0)}, 10, 10, false).set({align: "left", size: "15px", baseline: "top"});
        walls = new G.Bounds();
        ball = new G.Circle(stage.width/2, 100, 10, false);
        ball.set({speed: 5, score: 0});
        leftPlatforms = new G.Collection();
        rightPlatforms = new G.Collection();
        
        platformSpacing = 100;
        
        var y = stage.height / 2,
            height = 20,
            gap = 60,
            num = (stage.height / platformSpacing) + 1
            speed = 2;
        
        for(var i = 0; i < num; i++)
        {
            var x = G.random(stage.width - gap, gap);
            var left = new G.Rect((x - (gap/2)) / 2, y, x-(gap/2), height, false).set({"type": "kinematic", friction: 0.4});
            var right = new G.Rect(x+(gap/2) + (stage.width-(x+(gap/2)))/2, y, stage.width-(x+(gap/2)), height, false).set({"type": "kinematic", friction: 0.4});
            leftPlatforms.add(left);
            rightPlatforms.add(right);
            y += platformSpacing;
        }
    }
    
    //start game
    game.start = function()
    {
        falldownTitleText.remove();
        instructionText.remove();
        startText.remove();
        
        //add score
        score.add();
        
        //add platforms
        function add(){this.add()};
        leftPlatforms.each(add);
        rightPlatforms.each(add);
        
        //update plaftorms
        var platformUpdate = stage.on("update", function()
        {
            //set platform speed based on score
            speed = 2;
            
            //update platform speed
            function inc(){ this.vel.y = -speed };
            leftPlatforms.each(inc);
            rightPlatforms.each(inc);

            //infinitely loop platforms
            var left = leftPlatforms.get(0);
            var right = rightPlatforms.get(0);
            
            if(left.pos.y + left.height/2 < 0)
            {
                var y = leftPlatforms.get(-1).pos.y + platformSpacing;
                left.set("pos.y", y);
                leftPlatforms.remove(left).add(left);
                right.set("pos.y", y);
                rightPlatforms.remove(right).add(right);
            }
        });
        
        //add ball
        ball.add();

        var currentPlatform = leftPlatforms.get(0);

        //update ball
        var ballUpdate = ball.on("update", function()
        {
            //update score
            if(currentPlatform && ball.pos.y > currentPlatform.pos.y)
            {
                ball.score++;
                currentPlatform = leftPlatforms.get(leftPlatforms.getId(currentPlatform)+1);
            }
            
            //update speed
            if(!G.isMobile)
            {
                if(key.isDown("left")) ball.vel.x = -ball.speed;
                else if(key.isDown("right")) ball.vel.x = ball.speed;
                else ball.vel.x = 0;
            }
        });
        
        //game over
        var collisionCheck = ball.on("collision", function(shape)
        {
            if(shape === walls.top) 
            {
                platformUpdate.off();
                ballUpdate.off();
                collisionCheck.off();
                game.end();
            }
        });
    }
    
    game.end = function()
    {
        //get score && highscore
        var score = ball.score, highscore = +localStorage.getItem("falldown_highscore") || score;
        if(highscore < score) localStorage.setItem("falldown_highscore", score);
        
        stage.remove(true);
        
        //show gameover text
        var gameoverText = new G.Text("Game Over!", stage.width/2, stage.height/2 - 100).set({ size: "30px", "align": "center", color: "#800" });
        scoreText = new G.Text("Score: " + score, stage.width/2, stage.height/2 - 30).set({ size: "15px", "align": "center" });
        highscoreText = new G.Text("Highscore: " + highscore, stage.width/2, stage.height/2 - 10).set({ size: "15px", "align": "center" });
        startText = new G.Text({ text:(G.touchEnabled ? "Tap" : "Click") + " to restart", align:"center", pos:{ x: stage.width/2, y: stage.height/2 + 30 }, size: "20px" });
        startText.update = function() { this.color = G.random.color(); }
            
        //restart on click / tap
        mouse.one("up", function()
        {
            stage.remove(true);
            createAssets();
            game.start();
        });
    }
    
    //create initial screen
    falldownTitleText = new G.Text({ text:"Falldown", align:"center", pos:{ x: stage.width/2, y: stage.height/2 - 100 }, size: "30px", color: "#800" });
    instructionText = new G.Text({ text: "Instructions: " + (G.isMobile ? "Tilt to move" : "Press left / right keys to move"), align:"center", pos:{ x: stage.width/2, y: stage.height/2 - 50 }, size: "20px" });
    startText = new G.Text({ text:(G.touchEnabled ? "Tap" : "Click") + " to start", align:"center", pos:{ x: stage.width/2, y: stage.height/2 - 20 }, size: "20px" });
    startText.update = function() { this.color = G.random.color(); }
    
    createAssets();
    
    //move ball on mobile tilt
    window.addEventListener("deviceorientation", function(e)
    {
        var tilt = e.gamma;
        if(Math.abs(ball.vel.x) < ball.speed) ball.vel.x += tilt/20;
    });
    
    //start on click / tap
    mouse.one("up", game.start);
    
    //toggle pause on esc
    key.onUp("escape", stage.togglePaused.bind(stage));
    
    stage.animate(function()
    {
        stage.update();
        stage.render();
    });
    
})();