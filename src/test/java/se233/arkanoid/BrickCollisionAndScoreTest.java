package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.Image;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.Ball;

import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.model.StageData.BrickType;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import static org.junit.jupiter.api.Assertions.*;

class BrickCollisionAndScoreTest {

    private static Image dummyImage;

    @BeforeAll
    static void initJFX() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        try {
            Platform.startup(latch::countDown);
        } catch (IllegalStateException e) {
            latch.countDown();
        }
        latch.await();

        // Create a tiny 1x1 transparent dummy image for headless testing
        byte[] transparentPng = new byte[] {
                (byte)0x89, (byte)0x50, (byte)0x4E, (byte)0x47, (byte)0x0D, (byte)0x0A, (byte)0x1A, (byte)0x0A,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x0D, (byte)0x49, (byte)0x48, (byte)0x44, (byte)0x52,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x01, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x01,
                (byte)0x08, (byte)0x06, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x1F, (byte)0x15, (byte)0xC4,
                (byte)0x89, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x0A, (byte)0x49, (byte)0x44, (byte)0x41,
                (byte)0x54, (byte)0x78, (byte)0x9C, (byte)0x63, (byte)0x00, (byte)0x01, (byte)0x00, (byte)0x00,
                (byte)0x05, (byte)0x00, (byte)0x01, (byte)0x0D, (byte)0x0A, (byte)0x2D, (byte)0xB4, (byte)0x00,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x49, (byte)0x45, (byte)0x4E, (byte)0x44, (byte)0xAE,
                (byte)0x42, (byte)0x60, (byte)0x82
        };
        dummyImage = new Image(new ByteArrayInputStream(transparentPng));
    }

    @BeforeEach
    void resetState() {
        PlayerData.setCurrentScore(0);
    }

    @Test
    void testBrickCollisionAndScoreIncrement() throws InterruptedException {
        // 1. Arrange
        Ball ball = new Ball();
        ball.setTranslateX(100);
        ball.setTranslateY(100);

        Brick brick = new Brick( BrickType.BLUE, dummyImage,100,100);
        List<Brick> obstacles = new ArrayList<>();
        obstacles.add(brick);
        List<Brick> removedQueue = new ArrayList<>();

        assertEquals(0, PlayerData.getCurrentScore());

        // 2. Act
        boolean collisionDetected = ball.checkBrickCollisions(obstacles, removedQueue);

        assertTrue(collisionDetected, "Ball should detect intersection with the brick");
        assertTrue(removedQueue.contains(brick), "Destroyed brick should be added to the removal queue");

        // 3. Sync with JavaFX Application Thread queue
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(latch::countDown);
        latch.await(); // Wait for Platform.runLater to finish executing

        // 4. Assert score has updated
        assertTrue(PlayerData.getCurrentScore() > 0, "PlayerData score should increase upon brick destruction");
    }
}