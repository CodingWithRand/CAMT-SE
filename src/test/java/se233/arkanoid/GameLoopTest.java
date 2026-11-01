package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.VBox;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testfx.util.WaitForAsyncUtils;
import se233.arkanoid.controller.GameLoop;
import se233.arkanoid.model.*;
import se233.arkanoid.ReflectionHelper;
import se233.arkanoid.view.GameplayArea;
import se233.arkanoid.view.Stage;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameLoopTest {

    private GameCharacter paddle;
    private GameLoop gameLoop;
    private GameplayArea gpA;

    @BeforeAll
    static void initJFX() {
        try {
            Platform.startup(() -> {});
            System.setProperty("testfx.robot", "glass");
            System.setProperty("testfx.headless", "true");
            System.setProperty("prism.order", "sw");
        } catch (IllegalStateException e) {
            // Toolkit already initialized
        }
    }

    @BeforeEach
    void setUp() {
        try {
            Platform.runLater(() -> {
                paddle = new Vaus();
            });

            gpA = new GameplayArea();
            gameLoop = new GameLoop(gpA, new VBox());
            Thread.sleep(100);
        } catch (InterruptedException ignored) {}
    }

    @Test
    void testPaddleStopOnNoInput() {
        // Force paddle into movement state
        paddle.moveRight();
        assertTrue((boolean) ReflectionHelper.getField(paddle, "isMoveRight"));

        // Simulate stopping or clearing movement flags
        paddle.stop();

        assertFalse((boolean) ReflectionHelper.getField(paddle, "isMoveRight"), "isMoveRight should be false after stop()");
        assertFalse((boolean) ReflectionHelper.getField(paddle, "isMoveLeft"), "isMoveLeft should be false after stop()");
        assertEquals(0, ReflectionHelper.getField(paddle, "xVelocity"), "Velocity should reset to 0 on stop()");
    }

    @Test
    void testMovementDirectionMutuallyExclusive() {
        paddle.moveLeft();
        assertTrue((boolean) ReflectionHelper.getField(paddle, "isMoveLeft"));
        assertFalse((boolean) ReflectionHelper.getField(paddle, "isMoveRight"));

        // Switch direction to right
        paddle.moveRight();
        assertFalse((boolean) ReflectionHelper.getField(paddle, "isMoveLeft"), "Moving right should clear isMoveLeft flag");
        assertTrue((boolean) ReflectionHelper.getField(paddle, "isMoveRight"), "Moving right should set isMoveRight flag");
    }

    @Test
    void testAbleToShootWhileMoving() {
        ReflectionHelper.setField(((Vaus) paddle), "isArmed", true);

        Keys pressingKeys = new Keys();
        List<GameCharacter> gameCharacterList = new ArrayList<>();
        gameCharacterList.add(paddle);
        pressingKeys.add(KeyCode.LEFT);
        pressingKeys.add(KeyCode.UP);

        ReflectionHelper.setField(gpA, "keys", pressingKeys);
        try {
            ReflectionHelper.executeMethod(gameLoop, "update", gameCharacterList, 0L);
        } catch (Exception e) {
            e.printStackTrace();
        }
//        ((Vaus) paddle).fire(new GameplayArea());
        WaitForAsyncUtils.waitForFxEvents();

        assertTrue((boolean) ReflectionHelper.getField(paddle, "isMoveLeft"));
        assertEquals(2, gpA.getActiveBullets().size());
    }

    @Test
    void testGameOver() {
        Boolean gameRunning = (Boolean) ReflectionHelper.getField(gameLoop, "running");
        assertTrue(gameRunning);
        GameLoop.gameOver();
        gameRunning = (Boolean) ReflectionHelper.getField(gameLoop, "running");
        assertFalse(gameRunning);
    }

    @Test
    void testCompletedStage() {
        GameLoop.startStage();
        Boolean isGameStarted = (Boolean) ReflectionHelper.getField(gameLoop, "started");
        assertTrue(isGameStarted);

        Platform.runLater(() -> gpA.fireEvent(new se233.arkanoid.event.StageChange(se233.arkanoid.event.StageChange.NEXT_STAGE)));
        WaitForAsyncUtils.waitForFxEvents();

        isGameStarted = (Boolean) ReflectionHelper.getField(gameLoop, "started");
        assertFalse(isGameStarted);
    }

    @Test
    void testRestartAGame() {
        GameLoop.gameOver();
        Boolean gameRunning = (Boolean) ReflectionHelper.getField(gameLoop, "running");
        Boolean isGameStarted = (Boolean) ReflectionHelper.getField(gameLoop, "started");
        assertFalse(gameRunning);
        // apply every upgrade possible
        Platform.runLater(() -> {
            UpgradeManager.applyScoreMultiplier();
            UpgradeManager.applyGainLife(gpA);
            UpgradeManager.applyPiercingBall(gpA);
            UpgradeManager.applyBallSpeedAdjustment(gpA, 10);
            UpgradeManager.applyIncreasePaddleSize(gpA);
            UpgradeManager.armedWithBullets(gpA);
            UpgradeManager.applyIncreasePaddleSpeed(gpA);
        });
        WaitForAsyncUtils.waitForFxEvents();
        PlayerData.setCurrentScore(10230);
        PlayerData.setLifeCount(5);
        PlayerData.setCurrentStage(4);

        Stage mockStage = new Stage();
        ReflectionHelper.setField(mockStage, "gameLoop", gameLoop);
        ReflectionHelper.setField(mockStage, "gameplayArea", gpA);

        ReflectionHelper.executeMethod(mockStage, "restart");
        WaitForAsyncUtils.waitForFxEvents();

        gameRunning = (Boolean) ReflectionHelper.getField(gameLoop, "running");

        assertTrue(
                !((Vaus) gpA.getGameCharacterList().get(0)).isArmed() &&
                        !((Vaus) gpA.getGameCharacterList().get(0)).isExpanded() &&
                        gpA.getGameCharacterList().get(0).getxMaxVelocity() == 7 &&
                        (gpA.getBall().getxMaxVelocity() == 7 && gpA.getBall().getyMaxVelocity() == 7) &&
                        !gpA.getBall().isPiercing() &&
                        PlayerData.getScoreMultiplier() == 1 &&
                        PlayerData.getLifeCount() == 2
        );
        assertTrue(
                PlayerData.getCurrentScore() == 0 &&
                PlayerData.getCurrentStage() == 1 &&
                (gpA.getBall().getX() == gpA.getBall().getStartX() && gpA.getBall().getY() == gpA.getBall().getStartY()) &&
                (
                        gpA.getGameCharacterList().get(0).getX() == gpA.getGameCharacterList().get(0).getStartX() &&
                        gpA.getGameCharacterList().get(0).getY() == gpA.getGameCharacterList().get(0).getStartY()
                )
        );
        assertTrue(gameRunning && !isGameStarted);
    }
}