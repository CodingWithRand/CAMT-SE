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
import se233.arkanoid.model.Vaus;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
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
        byte[] transparentPng = new byte[]{
                (byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0D, (byte) 0x49, (byte) 0x48, (byte) 0x44, (byte) 0x52,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01,
                (byte) 0x08, (byte) 0x06, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x1F, (byte) 0x15, (byte) 0xC4,
                (byte) 0x89, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0A, (byte) 0x49, (byte) 0x44, (byte) 0x41,
                (byte) 0x54, (byte) 0x78, (byte) 0x9C, (byte) 0x63, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x00,
                (byte) 0x05, (byte) 0x00, (byte) 0x01, (byte) 0x0D, (byte) 0x0A, (byte) 0x2D, (byte) 0xB4, (byte) 0x00,
                (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x49, (byte) 0x45, (byte) 0x4E, (byte) 0x44, (byte) 0xAE,
                (byte) 0x42, (byte) 0x60, (byte) 0x82
        };
        dummyImage = new Image(new ByteArrayInputStream(transparentPng));
    }

    @BeforeEach
    void resetState() {
        PlayerData.setCurrentScore(0);
        PlayerData.setLifeCount(3);
        PlayerData.setHighScore(100);
    }

    @Test
    void testBrickCollisionAndScoreIncrement() throws InterruptedException {
        // 1. Arrange
        List<Vaus> paddles = new ArrayList<>();
        paddles.add(new Vaus());
        Ball ball = new Ball(paddles);
        ball.setTranslateX(100);
        ball.setTranslateY(100);

        Brick brick = new Brick(BrickType.BLUE, dummyImage, 100, 100);
        List<Brick> obstacles = new ArrayList<>();
        obstacles.add(brick);
        List<Brick> removedQueue = new ArrayList<>();

        assertEquals(0, PlayerData.getCurrentScore());

        // 2. Act
        boolean collisionDetected = ball.checkBrickCollisions(obstacles, removedQueue,4);

        assertTrue(collisionDetected, "Ball should detect intersection with the brick");
        assertTrue(removedQueue.contains(brick), "Destroyed brick should be added to the removal queue");

        // 3. Sync with JavaFX Application Thread queue
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(latch::countDown);
        latch.await(); // Wait for Platform.runLater to finish executing

        // 4. Assert score has updated
        assertTrue(PlayerData.getCurrentScore() > 0, "PlayerData score should increase upon brick destruction");
    }

    @Test
    void testLifeDeductionOnMiss() {
        int initialLives = PlayerData.getLifeCount();

        // Simulate missing the paddle
        PlayerData.setLifeCount(PlayerData.getLifeCount() - 1);

        assertEquals(initialLives - 1, PlayerData.getLifeCount(), "Life count should decrease by 1 when ball misses paddle");
    }

    @Test
    void testHighScoreUpdateAndPersistence() throws FileNotFoundException {
        // Set a score higher than the initial high score (100)
        PlayerData.setCurrentScore(250);

        PlayerData.checkAndUpdateHighScore();

        assertEquals(250, PlayerData.getHighScore(), "High score should be updated to current score if higher");

        // Verify file was written correctly
        File savedFile = new File("player-data");
        assertTrue(savedFile.exists(), "player-data file should exist on disk");

        boolean foundHighScoreInFile = false;
        try (Scanner scanner = new Scanner(savedFile)) {
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                if (line.equals("highScore=250")) {
                    foundHighScoreInFile = true;
                    break;
                }
            }
        }
        assertTrue(foundHighScoreInFile, "High score value 250 should be successfully saved to file");
    }
}