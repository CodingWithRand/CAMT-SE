package se233.arkanoid.view;

import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.Pane;
import se233.arkanoid.event.Life;
import se233.arkanoid.event.StageChange;
import se233.arkanoid.model.*;
import se233.arkanoid.model.StageData.Brick;

import java.util.ArrayList;
import java.util.List;

public class GameplayArea extends Pane {
    public static int GPAREA_WIDTH = 418;
    public static int GPAREA_HEIGHT = 467;
    public static ImageView stageBgImg;
    private Keys keys;
    private List<GameCharacter> gameCharacterList;
    private List<Brick> currentObstacles;

    private List<ImageView> lifeIcons;

    public GameplayArea() {
        super();
        gameCharacterList = new ArrayList<>();
        currentObstacles = new ArrayList<>();
        lifeIcons = new ArrayList<>();
        gameCharacterList.add(new Vaus());
//        scoreList = new ArrayList<>();
        keys = new Keys();
//        gameStageImg = new Image(Launcher.class.getResourceAsStream("assets/Background.png"));
//        scoreList.add(new Score(30, GROUND + 30));
//        scoreList.add(new Score(GameStage.WIDTH - 60, GROUND + 30));
//        getChildren().add(backgroundImg);

        this.addEventHandler(StageChange.NEXT_STAGE, e -> {
            getChildren().removeAll(currentObstacles);
            PlayerData.setCurrentStage(PlayerData.getCurrentStage() + 1);
            stageSetup();
        });
        this.addEventHandler(StageChange.PREV_STAGE, e -> {
            getChildren().removeAll(currentObstacles);
            PlayerData.setCurrentStage(PlayerData.getCurrentStage() - 1);
            stageSetup();
        });

        this.addEventHandler(Life.GAIN, e -> {
            PlayerData.setLifeCount(PlayerData.getLifeCount() + 1);
            ImageView lifeIcon = new ImageView();
            lifeIcon.setImage(new Image(getClass().getResourceAsStream("/se233/arkanoid/assets/Fields.png")));
            lifeIcon.setViewport(new Rectangle2D(8, 240, 16, 8));
            lifeIcon.setTranslateX(lifeIcons.size() * 32);
            lifeIcon.setTranslateY(GPAREA_HEIGHT - 8);
            lifeIcon.setScaleX(2);
            lifeIcon.setScaleY(2);
            lifeIcons.add(lifeIcon);
            getChildren().add(lifeIcon);
        });

        this.addEventHandler(Life.LOSE, e -> {
            PlayerData.setLifeCount(PlayerData.getLifeCount() - 1);
            getChildren().remove(lifeIcons.getLast());
            lifeIcons.removeLast();
        });

        for(int i = 0; i<PlayerData.getLifeCount(); i++) {
            ImageView lifeIcon = new ImageView();
            lifeIcon.setImage(new Image(getClass().getResourceAsStream("/se233/arkanoid/assets/Fields.png")));
            lifeIcon.setViewport(new Rectangle2D(8, 240, 16, 8));
            lifeIcon.setTranslateX(i * 32);
            lifeIcon.setTranslateY(GPAREA_HEIGHT - 8);
            lifeIcon.setScaleX(2);
            lifeIcon.setScaleY(2);
            lifeIcons.add(lifeIcon);
        }
        getChildren().addAll(lifeIcons);

        this.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                // Find sibling element by its fx:id from the parent scene
                stageBgImg = (ImageView) getScene().lookup("#stageBgImg");
                stageSetup();
                // mock up test the following
                // next/prev stage
                // gain/lose life
                getScene().addEventFilter(KeyEvent.KEY_PRESSED, e -> {
                    if(e.getCode() == KeyCode.N) {
                        this.fireEvent(new StageChange(StageChange.NEXT_STAGE));
                    }else if(e.getCode() == KeyCode.P) {
                        this.fireEvent(new StageChange(StageChange.PREV_STAGE));
                    }else if(e.getCode() == KeyCode.L) {
                        this.fireEvent(new Life(Life.LOSE));
                    }else if(e.getCode() == KeyCode.G) {
                        this.fireEvent(new Life(Life.GAIN));
                    }
                });
            }
        });

        getChildren().addAll(gameCharacterList);
        getChildren().addAll(new Ball());
//        getChildren().addAll(scoreList);
    }

    public void stageSetup() {
//        ImageView backgroundImg = new ImageView(gameStageImg); later (when stages design are finished)
        // set stage background and other.
        Image brickSpriteSheet = new Image(
                getClass().getResourceAsStream("/se233/arkanoid/assets/Blocks & Backgrounds.png")
        );

        // Load Stage 1
        currentObstacles = StageBuilder.buildStage(brickSpriteSheet);
        StageBuilder.setStageBg();

        // Add to GameplayArea child list so JavaFX renders them
        getChildren().addAll(currentObstacles);
    }

    public Keys getKeys() {
        return keys;
    }
    public List<GameCharacter> getGameCharacterList() {
        return  gameCharacterList;
    }
}
