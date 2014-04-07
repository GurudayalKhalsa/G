//add player
define(function(require, exports, module)
{
    exports.init = function(game)
    {
        var G = game.G,
            stage = game.stage,
            key = stage.event.key;
        
        var player = module.exports = new G.Sprite
        ({
           src:"img/mario.png",
           pos:{ x:200, y:200 },
           stepSize:{ x:30, y:50 },
           columns:4,
           rows:3,
           framecount:10,
           animations:
           {
               walkRight:{range:[0,3], speed:1/5},
               walkLeft:{range:[4,7], speed:1/5}
           }
        });
        player.restitution = 0;
        player.speed = 5;

        //when colliding with top of something
        player.on("collision", function(shape, mtv)
        {
           if(mtv.x !== 0 || mtv.y > 0) return;
           if(player.vel.x < 0) player.setAnimation("walkLeft");
           if(player.vel.x > 0) player.setAnimation("walkRight");
        });

        player.on("update", function()
        {
            if(player.vel.y !== 0 && player.animation) player.removeAnimation();

            if(key.isDown("left,a")) 
            {
                if(player.vel.y !== 0) player.setFrame(8);
                player.vel.x = -player.speed;
            }
            else if(key.isDown("right,d")) 
            {
                if(player.vel.y !== 0) player.setFrame(9);
                player.vel.x = player.speed;
            }
            else 
            {
                player.removeAnimation();
                if(player.vel.y === 0 && player.currentFrame === 9) player.setFrame(0);
                if(player.vel.y === 0 && player.currentFrame === 8) player.setFrame(4);
                player.vel.x = 0;
            }
            if(key.isUp("space") && player.colliding === true) 
            {
                player.removeAnimation();
                var frame = player.currentFrame === 0 ? 9 : 8;
                player.setFrame(frame);
                player.vel.y = -10;
            }
        })

        return player;
    }
})
