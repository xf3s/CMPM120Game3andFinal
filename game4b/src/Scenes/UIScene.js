class UIScene extends Phaser.Scene {
    constructor() {
        super("uiScene");
    }

    create() {
        // Create the score text
        this.scoreText = this.add.text(20, 20, 'Coins: 0', { 
            fontFamily: 'monaco', 
            fontSize: '40px', 
            fill: '#ffffff' 
        });

        
        this.deathText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'You Died\nPress r to Restart', {
            fontFamily: 'monaco',
            fontSize: '65px',
            fill: '#ff0000'
        });
        this.deathText.setOrigin(0.5);
        this.deathText.setVisible(false);
        

        
        const gameScene = this.scene.get('platformerScene');

        // ---------------
        // event handlers
        // ---------------

        gameScene.events.on('update-score', (score) => {
            this.scoreText.setText('Coins: ' + score);
        });

        gameScene.events.on('player-died', () => {
            this.deathText.setVisible(true);
        });

        gameScene.events.on('shutdown', () => {
            this.deathText.setVisible(false);
            this.scoreText.setText('Coins: 0');
        });
    }
}