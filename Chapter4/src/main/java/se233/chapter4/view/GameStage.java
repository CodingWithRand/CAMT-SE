package se233.chapter4.view;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import se233.chapter4.Launcher;
import se233.chapter4.model.GameCharacter;
import se233.chapter4.model.Keys;

import java.util.ArrayList;
import java.util.List;

public class GameStage extends Pane {
    public static final int WIDTH = 800;
    public static final int HEIGHT = 400;
    public static final int GROUND = 300;
    private Image gameStageImg;
    private List<GameCharacter> gameCharacters = new ArrayList<>();
    private Keys keys;
    public GameStage() {
        keys = new Keys();
        gameStageImg = new Image(Launcher.class.getResourceAsStream("assets/Background.png"));
        ImageView backgroundImg = new ImageView(gameStageImg);
        backgroundImg.setFitHeight(HEIGHT);
        backgroundImg.setFitWidth(WIDTH);
        gameCharacters.add(new GameCharacter("MarioSheet", 4, 4, 1, 16, 32, 30, 30, 0, 0, 7, 17, KeyCode.A, KeyCode.D, KeyCode.W, 32, 64));
        gameCharacters.add(new GameCharacter("rockman", 10, 5, 2, 541, 514, 100, 50, 0, 0, 10, 10, KeyCode.LEFT, KeyCode.RIGHT, KeyCode.UP, 64, 64));
        getChildren().add(backgroundImg);
        for(GameCharacter gc: gameCharacters) getChildren().add(gc);
    }
    public List<GameCharacter> getGameCharacter() {
        return gameCharacters;
    }
    public Keys getKeys() {
        return keys;
    }
}
