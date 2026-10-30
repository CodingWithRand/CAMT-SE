package se233.arkanoid.view;

import javafx.application.Platform;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.Pane;
import se233.arkanoid.controller.GameLoop;
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

    public List<Brick> getCurrentObstacles() {
        return currentObstacles;
    }

    public void setCurrentObstacles(List<Brick> currentObstacles) {
        this.currentObstacles = currentObstacles;
    }

    private List<Brick> currentObstacles;

    private List<ImageView> lifeIcons;

    private Ball ball;

    public GameplayArea() {
        super();
        gameCharacterList = new ArrayList<>();
        currentObstacles = new ArrayList<>();
        lifeIcons = new ArrayList<>();
        gameCharacterList.add(new Vaus());
//        scoreList = new ArrayList<>();
        keys = new Keys();
        ball=new Ball(gameCharacterList);
//        gameStageImg = new Image(Launcher.class.getResourceAsStream("assets/Background.png"));
//        scoreList.add(new Score(30, GROUND + 30));
//        scoreList.add(new Score(GameStage.WIDTH - 60, GROUND + 30));
//        getChildren().add(backgroundImg);

        this.addEventHandler(StageChange.NEXT_STAGE, e -> {
            if (!currentObstacles.isEmpty()) {
                getChildren().removeAll(currentObstacles);
                currentObstacles.clear();
            }
            PlayerData.setCurrentStage(PlayerData.getCurrentStage() + 1);
            Platform.runLater(this::stageSetup);
        });
        this.addEventHandler(StageChange.PREV_STAGE, e -> {
            getChildren().removeAll(currentObstacles);
            PlayerData.setCurrentStage(PlayerData.getCurrentStage() - 1);
            Platform.runLater(this::stageSetup);
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
            javafx.application.Platform.runLater(() -> {
                // Only decrement and remove icons if lives and icons actually remain
                if (PlayerData.getLifeCount() > 0 && !lifeIcons.isEmpty()) {
                    this.setMouseTransparent(false);
                    GameLoop.pauseStage();
                    PlayerData.setLifeCount(PlayerData.getLifeCount() - 1);

                    // Safely remove the last icon element without index underflow
                    ImageView lifeIcon = lifeIcons.removeLast();
                    getChildren().remove(lifeIcon);
                }
            });
        });

        this.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                // Find sibling element by its fx:id from the parent scene
                stageBgImg = (ImageView) getScene().lookup("#stageBgImg");
                stageSetup();
                // mock up test the following
                // next/prev stage
                // gain/lose life
                this.setOnKeyPressed( e -> {
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

        this.setOnMouseClicked(e -> {
            GameLoop.startStage();
            Platform.runLater(() -> ball.nudge());
            this.setMouseTransparent(true);
            e.consume();
        });

        getChildren().addAll(gameCharacterList);
        getChildren().addAll(ball);
//        getChildren().addAll(scoreList);
    }

    public void stageSetup() {
//        ImageView backgroundImg = new ImageView(gameStageImg); later (when stages design are finished)
        // set stage background and other.
        Image brickSpriteSheet = new Image(
                getClass().getResourceAsStream("/se233/arkanoid/assets/Blocks & Backgrounds.png")
        );

        getChildren().removeAll(lifeIcons);
        lifeIcons.clear();
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
    public void removeDestroyedBricks(List<se233.arkanoid.model.StageData.Brick> bricksToRemove) {
        if (bricksToRemove.isEmpty()) return;
        // Remove them from the active obstacle list(i think this fixed the index bug)
        currentObstacles.removeAll(bricksToRemove);
        for(Brick brickToRemove: bricksToRemove) {
            brickToRemove.setVisible(false);
        }

        javafx.application.Platform.runLater(() -> {
            // Remove all destroyed brick nodes from the JavaFX scene graph in one batch
            getChildren().removeAll(bricksToRemove);


        });
    }

    public Ball getBall() { return ball; }
}
