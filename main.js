// Initialize Phaser, and start our 'main' state 
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update });


//Variables
var player;
var sharks;
var livingSharks = [];
var cursors;
var WIDTH = 800;
var HEIGHT = 480;


var bullets;
var fireRate = 100;
var nextFire = 0;
var turret;
var fireButton;

var enemySpeed = -200;
var lastEnemy = 0;
var enemies;
var speed = 100;

var music;
var score = 0;
var scoreString = '';
var scoreText;

var lives = 3;



 function preload() {
     game.load.image('sea', 'assets/background.png');
     game.load.image('diver', 'assets/diver.png');
     game.load.image('bullet', 'assets/blueBullet.png');
     game.load.image('sharks',  'assets/shark2.gif');
     game.load.image('heart', 'assets/heart-icon.png');
     game.load.audio('dub', 'assets/gameMusic.mp3');

 
 }

 function create() {
     //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0,0, 'sea');

     
    music = game.add.audio('dub');

    music.play();
     
     var fragmentSrc = [

        "precision mediump float;",

        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",

        "#define MAX_ITER 4",

        "void main( void )",
        "{",
            "vec2 v_texCoord = gl_FragCoord.xy / resolution;",

            "vec2 p =  v_texCoord * 8.0 - vec2(20.0);",
            "vec2 i = p;",
            "float c = 1.0;",
            "float inten = .05;",

            "for (int n = 0; n < MAX_ITER; n++)",
            "{",
                "float t = time * (1.0 - (3.0 / float(n+1)));",

                "i = p + vec2(cos(t - i.x) + sin(t + i.y),",
                "sin(t - i.y) + cos(t + i.x));",

                "c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),",
                "p.y / (cos(i.y+t)/inten)));",
            "}",

            "c /= float(MAX_ITER);",
            "c = 1.5 - sqrt(c);",

            "vec4 texColor = vec4(0.0, 0.01, 0.015, 1.0);",

            "texColor.rgb *= (1.0 / (1.0 - (c + 0.05)));",

            "gl_FragColor = texColor;",
        "}"
    ];
     
     
       filter = new Phaser.Filter(game, null, fragmentSrc);
    filter.setResolution(800, 600);

    sprite = game.add.sprite();
    sprite.width = 800;
    sprite.height = 600;

    sprite.filters = [ filter ];
     
  
      //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });
     
     //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 140, 10, 'Lives', { font: '34px Arial', fill: '#fff' });
     
     for (var i = 0; i < 3; i++) 
    {
        var hearts = lives.create(game.world.width - 160 + (60 * i), 60, 'heart');
        hearts.anchor.setTo(0.5, 0.5);
    
        hearts.alpha = 0.4;
    }
     
    // Add Scuba Diver
    player = game.add.sprite(50, 350, 'diver');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
     
    
    //Controllers
     cursors = game.input.keyboard.createCursorKeys();
     fireButton =               game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
     //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
     
     
     
        //  Finally the turret that we place on-top of the  body
    turret = game.add.sprite(0, 0,'player', 'turret');
    turret.anchor.setTo(player);
 
        
     enemies = this.game.add.group();
     enemies.enableBody = true;
     enemies.physicsBodyType = Phaser.Physics.ARCADE;

     
     
       
     
    
 }

 function update() {
     
 player.body.velocity.setTo(0, 0);

        if (cursors.down.isDown)
        {
            game.add.tween(player).to({angle: 10}, 100).start();	
            player.body.velocity.y = 200;
            setInterval(tweenDown, 1000)

        }
     
        else if (cursors.up.isDown)
        {   
            game.add.tween(player).to({angle: -10}, 100).start();	
            player.body.velocity.y = -200;
            setInterval(tweenDown, 1000)
        }
     
     
     
        //  Firing?
        if (fireButton.isDown)
        {
            fire();
        }
     
     turret.x = player.x + 60;
    turret.y = player.y + -11;

    turret.rotation = game.physics.arcade.angleToPointer(turret);

     
     
     var curTime = this.game.time.now;
     
     if(curTime-lastEnemy > 500 )
     {
        generateEnemy ();
        lastEnemy = curTime;
         
     }
     
     game.physics.arcade.collide(enemies, bullets, enemyHitBullet,null, this);
     game.physics.arcade.collide(enemies, player, enemyHitPlayer,null, this);

     
    filter.update(game.input.activePointer);
     
     //Stop the player going off the screen
     
  

 }


function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);
        bullet.body.velocity.x = 400;

       
    }

}

function generateEnemy (){
    
    var enemy = enemies.getFirstExists(false);
    if(enemy)
    {  
        enemy = enemies.create(WIDTH - 30,Math.floor(Math.random()*(HEIGHT-30)),'sharks');
    }
    else
    {
				enemy = enemies.create(WIDTH - 30,Math.floor(Math.random()*(HEIGHT-30)),'sharks');
    }
    
    
            enemy.body.velocity.x = enemySpeed;
			enemy.outOfBoundsKill = true;
			enemy.checkWorldBounds = true;
			enemy.animations.add('move');
			enemy.animations.play('move',20,true);
    
    
}



 function enemyHitBullet(bullets, enemy){
			if(enemies.getIndex(enemy) > -1)
				enemies.remove(enemy);
			     enemy.kill();
			     bullets.kill();
                 score + 10;
                 
                 
            
		}

    


    function tweenDown(){
         
        game.add.tween(player).to({angle:0}, 100).start();	
    }


function enemyHitPlayer(player,enemy){
    if(enemies.getIndex(enemy) > -1)
				enemies.remove(enemy);
			     enemy.kill();
  
    
    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
     
    }
    
    
    
    // When the player dies
//    if (lives.countLiving() < 1)
//    {
//        player.kill();
//        enemyBullets.callAll('kill');
//
//        stateText.text=" GAME OVER \n Click to restart";
//        stateText.visible = true;
//
//        //the "click to restart" handler
//        game.input.onTap.addOnce(restart,this);
//    }
//    
}
