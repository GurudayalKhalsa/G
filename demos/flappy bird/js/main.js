var g = {};

curl([
        
        "../../dist/G.js",
        ""
        
     ], function(G)
{
    var stage = new G.Stage({physics:{gravity:{y:0.15}}}).setCanvas();
    stage.backgroundColor = "#4ec0ca";
    
    var gameStarted = false;
    
    //load and create assets
    var assets = new G.Collection,
        srces = 
        [
            "assets/ceiling.png",
            "assets/font_big_0.png",
            "assets/font_big_1.png",
            "assets/font_big_2.png",
            "assets/font_big_3.png",
            "assets/font_big_4.png",
            "assets/font_big_5.png",
            "assets/font_big_6.png",
            "assets/font_big_7.png",
            "assets/font_big_8.png",
            "assets/font_big_9.png",
            "assets/land.png",
            "assets/medal_gold.png",
            "assets/pipe_down.png",
            "assets/pipe_up.png",
            "assets/pipe.png",
            "assets/replay.png",
            "assets/score_button.png",
            "assets/scoreboard.png",
            "assets/sky.png",
            "assets/splash.png",
            "assets/start_button.png",
            "assets/title.png",
        ];
    
    for(var i = 0; i < srces.length; i++)
    {
        var img = new G.Image({ name: srces[i].split("/").pop().replace(".png", ""), src:srces[i], addToStage: false, physics: false });
        assets.add(img);
        assets[srces[i].split("/").pop().replace(".png", "")] = img;
    }
    
    var landImg = assets.land;
    var skyImg = assets.sky;
    assets.sky = new G.Collection;
    assets.land = new G.Collection;

    //create bird sprite
    var bird = assets.bird = new G.Sprite
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
        zindex: 1
    });
    assets.add(assets.bird);    
        
    //display loading until loaded all assets, start game after 
    var loadingText = new G.Text("Loading...", stage.width/2, stage.height/2, "25px", "Helvetica Neue", "bold", "white", "center");
    
    //display splash screen on load
    assets.one("load", function()
    {
        loadingText.remove();
        splash();
        stage.event.on("resize", window, function()
        {
            stage.setCanvas(window.innerWidth, window.innerHeight);
            if(!gameStarted) splash();
        });
        
        stage.event.mouse.on("up", function()
        {
            if(assets.start_button.posInBounds(stage.event.mouse.state.x, stage.event.mouse.state.y) && !gameStarted)
            {
                startGame();
            }
        });
    });
    
    //draws splash screen
    function splash()
    {        
        gameStarted = false;
           
        var w = 320, h = 480;
        
        //Create Splash Screen and Set Images
        //-----------------------------------
        
        //get center box
        var c = { left:(stage.width/2) - w/2, top: (stage.height/2) - h/2, bottom: (stage.height/2) + h/2, right: (stage.width/2) + w/2, width:w, height:h };
        
        //add and set sky
        assets.sky.remove(true);
        landImg.bounds({bottom: stage.height});
        for(var i = 0, l = stage.width/skyImg.width; i < l; i++)
        {
            var img = new G.Image(skyImg);
            assets.sky.add(img);
            img.add().bounds({bottom: landImg.bounds().top, left: i * skyImg.width });
        }
        //add and set land, repeating
        assets.land.remove(true);
        for(var i = 0, l = stage.width/landImg.width; i < l; i++)
        {
            var img = new G.Image(landImg);
            assets.land.add(img);
            img.add().bounds({bottom: stage.height, left: i * landImg.width });
        }
        
        //add and set title position
        assets.title.add().pos.set(c.left + (c.width/2) - 20, c.top + 100);
        //add and set bird
        assets.bird.add().setAnimation("stillFlap").pos.set(assets.title.bounds().right + assets.bird.width, assets.title.pos.y);
        //add and set start button
        assets.start_button.zindex = 1;
        assets.start_button.add().bounds({top:assets.title.bounds().bottom+50}).pos.x = stage.width/2;
    }
    
    //starts the game
    function startGame()
    {
        gameStarted = true;
        assets.start_button.remove();
        assets.title.remove();
        
        bird.set("")
    }
    
    
    
    stage.animate(function()
    {
        stage.update();
        stage.render();
    })
    
    g.G = G,
    g.stage = stage; 
    g.assets = assets;  
    g.bird = bird; 
});