package se233.arkanoid;


import javafx.application.Platform;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.Ball;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.UpgradeManager;
import se233.arkanoid.model.Vaus;
import se233.arkanoid.view.GameplayArea;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class UpgradeManagerTest {

    private GameplayArea gameplayArea;
    private Vaus vaus;
    private Ball ball;

    @BeforeAll
    static void initJavaFX() {
        // Initialize JavaFX toolkit safely for headless/unit test execution
        try {
            Platform.startup(() -> {});
        } catch (IllegalStateException e) {
            // Toolkit already initialized
        }
    }

    @BeforeEach
    void setUp() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            PlayerData.resetState();
            gameplayArea = new GameplayArea();
            vaus = (Vaus) gameplayArea.getGameCharacterList().get(0);
            ball = gameplayArea.getBall();
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);
    }

    @Test
    void testApplyIncreasePaddleSize() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            assertFalse(vaus.isExpanded(), "Paddle should start standard size");
            UpgradeManager.applyIncreasePaddleSize(gameplayArea);
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);

        // Allow Platform.runLater inside UpgradeManager to execute
        Thread.sleep(100);

        assertTrue(vaus.isExpanded(), "Paddle should be expanded after upgrade");
        assertEquals(48, vaus.getCharacterWidth(), "Expanded paddle collision width should be 48");
    }

    @Test
    void testApplyIncreasePaddleSpeed() throws InterruptedException {
        int initialMaxVelocity = vaus.getxMaxVelocity();

        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            UpgradeManager.applyIncreasePaddleSpeed(gameplayArea);
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);
        Thread.sleep(100);

        assertEquals(initialMaxVelocity + 3, vaus.getxMaxVelocity(), "Paddle max velocity should increase by 3");
    }

    @Test
    void testApplyBallSpeedAdjustment() throws InterruptedException {
        ball.setxVelocity(4);
        ball.setyVelocity(-4);

        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            UpgradeManager.applyBallSpeedAdjustment(gameplayArea, 2);
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);
        Thread.sleep(100);

        assertEquals(6, ball.getxVelocity(), "Ball X velocity should increase by delta");
        assertEquals(-6, ball.getyVelocity(), "Ball Y velocity magnitude should increase by delta");
    }

    @Test
    void testApplyGainLife() throws InterruptedException {
        int initialLives = PlayerData.getLifeCount();

        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            UpgradeManager.applyGainLife(gameplayArea);
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);
        Thread.sleep(100);

        assertEquals(initialLives + 1, PlayerData.getLifeCount(), "Player should gain an additional life");
    }

    @Test
    void testApplyPiercingBall() throws InterruptedException {
        assertFalse(ball.isPiercing(), "Ball should not start as piercing");

        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            UpgradeManager.applyPiercingBall(gameplayArea);
            latch.countDown();
        });
        latch.await(2, TimeUnit.SECONDS);
        Thread.sleep(100);

        assertTrue(ball.isPiercing(), "Ball should have piercing mode enabled");
    }

    @Test
    void testApplyScoreMultiplier() {
        assertEquals(1.0, PlayerData.getScoreMultiplier(), 0.001, "Score multiplier should start at 1.0");

        UpgradeManager.applyScoreMultiplier();

        assertEquals(1.5, PlayerData.getScoreMultiplier(), 0.001, "Score multiplier should increase by 0.5");
    }
}