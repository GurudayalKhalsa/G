var Tank = (function(){

var ball;

return G.Class.extend({
    initialize:function(x,y,speed,rotationInc,forceInc,friction,restitution)
    {
        var tank = this.body = new G.Image
        ({
            src:'img/tank-body.png',
            pos:{x:x||200,y:y||200},
            width:55,
            height:20,
            shape:"polygon",
            //outline around tank body, making curved edges for smooth collisions
            vertices:reverse([16,10,17,9.75,18,9.5,19,9.25,20,9,28,-4,0,-10,-28,-4,-20,9,-19,9.25,-18,9.5,-17,9.75,-16,10]),
            speed:speed||3,
            friction:typeof friction === "undefined" ? 0.1 : friction,
            restitution:restitution||0,
            density:0
        });

        var tankBarrel = this.barrel = new G.Image
        ({
            src:'img/tank-barrel.png',
            pos:{x:this.body.pos.x,y:this.body.pos.y},
            addToPhysics:false,
            width:50,
            height:50,
            angle:0
        });

        this.force = 0;
        this.forceInc = forceInc||0.4;
        this.forceDamp = 3;
        this.maxForce = 100;

        this.rotationInc = rotationInc||0.02;

        //powerbar - displays current power
        this.powerbar = new G.Rect
        ({
            pos:{x:100, y:G.stage.height-30},
            width:this.maxForce+4, 
            height:20,
            addToPhysics:false,
            color:"black"
        });

        this.power = new G.Rect
        ({
          pos:{x:this.powerbar.bounds().left+2, y:this.powerbar.pos.y},
          width:0, 
          height:this.powerbar.height-4,
          addToPhysics:false,
          color:"red"
        });

        var self = this;

        G.event.key.on("keyup:space", function(){self.fireBall.apply(self, arguments)});

        tank.on("render", function()
        {
            //make tank barrel position change when tank body moves
            tankBarrel.pos.x = tank.pos.x+(5*tank.rotation);
            tankBarrel.pos.y = tank.pos.y-7;
            tankBarrel.rotation = tank.rotation + tankBarrel.angle;
        })
    },
    fireBall:function()
    {
        var radius = 3;
        var height = 25;

        var x = Math.sin(this.barrel.rotation);
        var y = -Math.cos(this.barrel.rotation);

        var impulse = new b2Vec2(x*this.force/this.forceDamp, y*this.force/this.forceDamp);
        var ball = new G.Circle
        ({
            pos:{x:this.body.pos.x+(x*height), y:this.body.pos.y-7+(y*height)}, 
            radius:radius,
            restitution:0.2,
            mass:0.1
        });
        ball.b2.body.ApplyImpulse(impulse, new b2Vec2(0,0));
        this.force = 0;

        this.power.width = 0;
        this.power.pos.x = this.powerbar.bounds().x+2;
    },
    update:function()
    {
        var tankBarrel = this.barrel;
        var tank = this.body;

        //draw power labels
        G.ctx.font = "bold 15px Helvetica Neue";
        G.ctx.fillStyle="black";
        G.ctx.fillText("Power:", this.powerbar.bounds().left+5, this.powerbar.bounds().top-10);
        G.ctx.font = "bold 14px Helvetica Neue";
        G.ctx.fillStyle="white";
        G.ctx.fillText(Math.floor(this.force), this.powerbar.bounds().left+5, this.powerbar.bounds().bottom-5);

        //rotate barrel based on keydown
        if(G.event.key.isDown("s,down") && tankBarrel.angle > -(Math.PI/2)+0.1)       
        {
            tankBarrel.angle -= this.rotationInc;
            tankBarrel.rotation -= this.rotationInc;
        }
        else if(G.event.key.isDown("w,up") && tankBarrel.angle < (Math.PI/2)-0.1) 
        {        
            tankBarrel.angle += this.rotationInc;
            tankBarrel.rotation += this.rotationInc;
        }

        
        if(G.event.key.isDown("space") && this.force < this.maxForce) 
        {
            this.force+= this.forceInc;
            this.power.width = this.force;
            this.power.pos.x = this.powerbar.bounds().left+2+this.force/2;
        }

        var vel = tank.b2.body.GetLinearVelocity();

        var c = terrain.collisionShapes.shapeContainingPoint(tank.pos.x+(10*tank.rotation), G.stage.height-10, true);
        if(c && c.vertices)
        {
            var v = reverse(c.vertices);
            var slope = v ? (v[3]-v[1])/(v[2]-v[0]) : 0;

            if(slope)
            {
                //move left/right based on keydown
                var sy = v[3]-v[1];
                //Math.abs(v[3]) >= Math.abs(v[1])+0.05 ? vel.y : (v[3] > v[1] ? -Math.abs(slope) : Math.abs(slope)*5)
                //v[1] > v[3] ? -Math.abs(slope) : Math.abs(slope)*5

                if(G.event.key.isDown("d,right"))     vel.Set(tank.speed, vel.y  );
                else if(G.event.key.isDown("a,left")) vel.Set(-tank.speed, vel.y );
                //stop moving if no button pressed
                else vel.x = 0;
                tank.b2.body.SetLinearVelocity(vel);

                //unflip tank if flipped
                if(tank.rotation > 1.3 ) { tank.b2.body.SetAngle(slope); };
                if(tank.rotation < -1.3 ) { tank.b2.body.SetAngle(slope); };
            }
        }

        //HACK - prevent inability to move after still
        if(!ball && G.event.key.isDown("d,right,a,left"))
        {
            console.log("poo");
                                
            //HACK - prevent inability for tank to move after still
            //add a ball to collide with, set to hidden. this wakes up the tank for some reason so it can move
            //removes the ball after a certain time
            ball = new G.Circle
            ({
                pos:{x:tank.pos.x,y:tank.pos.y-10},
                radius:3,
                hidden:true,
                density:0

            });
            // ball.hidden = true;
            setTimeout(function()
            {
                G.stage.remove(ball);
                ball = false;
            }, 300);
        }
    }
});
})();