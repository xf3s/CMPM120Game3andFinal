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

        // Get a reference to the main game scene
        const gameScene = this.scene.get('platformerScene');

        // Listen for the 'update-score' event from the main scene
        gameScene.events.on('update-score', (score) => {
            this.scoreText.setText('Coins: ' + score);
        });
    }
}