class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // ---------------
        // variables and settings
        // ---------------

        this.ACCELERATION = 800;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 800;
        this.JUMP_VELOCITY = -300;

        this.MAX_X_VELOCITY = 150;
        this.MAX_Y_VELOCITY = 400;


        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.0;

        this.coinCount = 0;
        this.playerIsDead = false;
    }

    create() {
        // coin counter
        this.scene.launch('uiScene');


        // ---------------
        // level & tilemap
        // ---------------

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("underground_level", 16, 16, 90, 60);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("1bitplatformer", "monochrome_tilemap_tiles");

        this.backgroundLayer = this.map.createLayer("background", this.tileset, 0, 0);
       
        this.spikeLayer = this.map.createLayer("spikes", this.tileset, 0, 0);

        this.spikeLayer.setCollisionByProperty({
            collides: true
        });

        // Create a layer
        this.wallsLayer = this.map.createLayer("walls", this.tileset, 0, 0);

        // Make it collidable
        this.wallsLayer.setCollisionByProperty({
            collides: true
        });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // ---------------
        // player avatar
        // ---------------
       
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(20, 755, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        my.sprite.player.body.setMaxVelocity(this.MAX_X_VELOCITY, this.MAX_Y_VELOCITY);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.wallsLayer);

        

        // ---------------
        // spike collision
        // ---------------

        this.physics.add.collider(my.sprite.player, this.spikeLayer, () => {
            this.playerIsDead = true;
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setVelocity(0);

            this.events.emit('player-died');
            this.input.once('pointerdown', () => {
                this.scene.restart();
            });
        });
        

        // ---------------
        // camera
        // ---------------

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);


        

        // ---------------
        // coins
        // ---------------

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("coins", {
            name: "coin",
            key: "monochrome_tilemap_sheet",
            frame: 2
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        my.vfx.coinCollect = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_04.png',
            lifespan: 100,
            speed: { min: 150, max: 250 },
            scale: { start: 0.1, end: 0.05 },
            gravityY: 100,
            blendMode: 'ADD',
            emitting: false // don't start automatically
        });

        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            my.vfx.coinCollect.emitParticle(8, obj2.x, obj2.y);

            this.coinCount++;
            this.events.emit('update-score', this.coinCount);
        });

        


        // ---------------
        // key input
        // ---------------

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
    }

    update() {
        if (this.playerIsDead) {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }
            return;
        }

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}