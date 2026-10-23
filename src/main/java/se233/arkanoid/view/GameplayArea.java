package se233.arkanoid.view;

import javafx.fxml.FXML;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.model.Keys;
import se233.arkanoid.model.Vaus;

import java.util.ArrayList;
import java.util.List;

public class GameplayArea extends Pane {
    public static int GPAREA_WIDTH = 418;
    public static int GPAREA_HEIGHT = 467;
    private Keys keys;
    private List<GameCharacter> gameCharacterList;

    public GameplayArea() {
        super();
        gameCharacterList = new ArrayList<>();
        gameCharacterList.add(new Vaus());
//        scoreList = new ArrayList<>();
        keys = new Keys();
//        gameStageImg = new Image(Launcher.class.getResourceAsStream("assets/Background.png"));
//        scoreList.add(new Score(30, GROUND + 30));
//        scoreList.add(new Score(GameStage.WIDTH - 60, GROUND + 30));
//        getChildren().add(backgroundImg);

        getChildren().addAll(gameCharacterList);
//        getChildren().addAll(scoreList);
    }

    public void stageSetup(Stage stage) {
//        ImageView backgroundImg = new ImageView(gameStageImg); later (when stages design are finished)
        // set stage background and other.
    }

    public Keys getKeys() {
        return keys;
    }
    public List<GameCharacter> getGameCharacterList() {
        return gameCharacterList;
    }
}
