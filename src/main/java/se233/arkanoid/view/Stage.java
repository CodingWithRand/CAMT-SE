package se233.arkanoid.view;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.ImageView;
import javafx.scene.text.Font;
import se233.arkanoid.controller.DrawingLoop;
import se233.arkanoid.controller.GameLoop;
import se233.arkanoid.model.PlayerData;


public class Stage {

    @FXML
    private Label thisGameScore;
    @FXML
    private Label highestScore;
    @FXML
    private Label highScoreLabel;
    @FXML
    private GameplayArea gameplayArea;

    @FXML
    public void initialize() {
        // Load custom TTF retro font
        Font retroFont = Font.loadFont(
                getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 18
        );
        // Fallback to Monospaced if font file isn't present yet
        if (retroFont != null) {
            highScoreLabel.setFont(Font.loadFont(
                    getClass().getResourceAsStream("/se233/arkanoid/font/PressStart2P-Regular.ttf"), 24
            ));
            highestScore.setFont(retroFont);
            thisGameScore.setFont(retroFont);
        }

        thisGameScore.setText(Integer.toString(PlayerData.getCurrentScore()));
        highestScore.setText(Integer.toString(PlayerData.getHighScore()));

        thisGameScore.textProperty().bind(PlayerData.currentScoreProperty().asString());
        gameplayArea.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if(newScene != null) {
                gameplayArea.getScene().setOnKeyPressed(event-> gameplayArea.getKeys().add(event.getCode()));
                gameplayArea.getScene().setOnKeyReleased(event ->  gameplayArea.getKeys().remove(event.getCode()));
            }
        });

        DrawingLoop drawingLoop = new DrawingLoop(gameplayArea);
        GameLoop gameLoop = new GameLoop(gameplayArea);
        (new Thread(drawingLoop)).start();
        (new Thread(gameLoop)).start();
    }

}
