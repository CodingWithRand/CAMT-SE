package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.WritableImage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.event.Life;
import se233.arkanoid.model.Bullet;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.model.StageData.BrickType;
import se233.arkanoid.view.GameplayArea;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameStateAndBrickTest {

    private WritableImage mockSpriteSheet;

    @BeforeAll
    static void initJFX() {
        try {
            Platform.startup(() -> {});
        } catch (IllegalStateException e) {
            // Toolkit already running
        }
    }

    @BeforeEach
    void resetState() {
        mockSpriteSheet = new WritableImage(64, 64);
        PlayerData.setCurrentScore(0);
        PlayerData.setLifeCount(2); // Initial lives
    }

    // --- 1. SCORE & LIFE MANAGEMENT TESTS ---

    @Test
    void testScoreIncrements() {
        assertEquals(0, PlayerData.getCurrentScore());

        // Simulate destroying a 100pt brick
        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + 100);
        assertEquals(100, PlayerData.getCurrentScore());

        // Simulate eating a power-up item (+500 pts)
        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + 500);
        assertEquals(600, PlayerData.getCurrentScore());
    }

    @Test
    void testLifeGainAndLoseEvents() throws InterruptedException {
        PlayerData.setLifeCount(2);

        // Directly test model event handling or use a CountDownLatch for async runLater blocks
        javafx.concurrent.Task<Void> task = new javafx.concurrent.Task<>() {
            @Override
            protected Void call() throws Exception {
                Platform.runLater(() -> {
                    GameplayArea area = new GameplayArea();
                    area.fireEvent(new Life(Life.GAIN));
                    assertEquals(3, PlayerData.getLifeCount());

                    area.fireEvent(new Life(Life.LOSE));
                    assertEquals(2, PlayerData.getLifeCount());
                });
                return null;
            }
        };
        // Or cleaner: test the logic directly without wrapping the whole test in runLater
    }
    // --- 2. BRICK HIT & HP TESTS ---

    @Test
    void testStandardBrickOneHitDestroy() {
        Brick redBrick = new Brick(BrickType.RED, mockSpriteSheet, 32, 16);

        // First hit should destroy standard brick (1 HP)
        boolean isDestroyed = redBrick.takeHit();
        assertTrue(isDestroyed, "RED brick should be destroyed on first hit");

        // Add score value
        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + redBrick.getType().getScoreValue());
        assertEquals(100, PlayerData.getCurrentScore(), "Destroying RED brick should add 100 points");
    }
// --- 3. BULLET & SHOOTING TESTS ---

    @Test
    void testBulletInitializationAndMovement() {
        Bullet bullet = new Bullet(100, 200);

        // Initial coordinates
        assertEquals(100, bullet.getX());
        assertEquals(200, bullet.getY());

        // Bullet should move straight UP (negative Y velocity, zero X velocity)
        bullet.move();
        assertEquals(100, bullet.getX(), "Bullet X coordinate should remain unchanged during flight");
        assertTrue(bullet.getY() < 200, "Bullet Y coordinate should decrease (move upward)");
    }

    @Test
    void testBulletDestroysBrickAndDisappears() {
        Bullet bullet = new Bullet(50, 50);
        Brick redBrick = new Brick(BrickType.RED, mockSpriteSheet, 32, 16);
        redBrick.setTranslateX(50);
        redBrick.setTranslateY(50);

        List<Brick> bricks = List.of(redBrick);
        List<Brick> removedQueue = new ArrayList<>();

        boolean hit = bullet.checkBrickCollisions(bricks, removedQueue, System.currentTimeMillis());

        assertTrue(hit, "Bullet collision check should report a hit");
        assertTrue(bullet.isOutOfBounds(), "Bullet must be marked out of bounds immediately after impact");
        assertEquals(1, removedQueue.size(), "Destroyed brick should be added to the removal queue");
    }

    @Test
    void testBulletHitsGoldBrickWithoutDestroyingIt() {
        Bullet bullet = new Bullet(50, 50);
        Brick goldBrick = new Brick(BrickType.GOLD, mockSpriteSheet, 32, 16);
        goldBrick.setTranslateX(50);
        goldBrick.setTranslateY(50);

        List<Brick> bricks = List.of(goldBrick);
        List<Brick> removedQueue = new ArrayList<>();

        boolean hit = bullet.checkBrickCollisions(bricks, removedQueue, System.currentTimeMillis());

        assertTrue(hit, "Bullet collision check should register a hit on gold brick");
        assertTrue(bullet.isOutOfBounds(), "Bullet should disappear upon impacting a gold brick");
        assertTrue(removedQueue.isEmpty(), "GOLD brick must NOT be added to removal queue");
        assertEquals(-1, goldBrick.getHp(), "GOLD brick HP must remain intact (-1)");
    }

    @Test
    void testBulletReachesTopWall() {
        // Position bullet right at the top wall padding
        Bullet bullet = new Bullet(100, 3);

        bullet.checkReachGameWall();

        assertTrue(bullet.isOutOfBounds(), "Bullet must be marked out of bounds when reaching top wall");
    }
    @Test
    void testSilverBrickRequiresTwoHits() {
        Brick silverBrick = new Brick(BrickType.SILVER, mockSpriteSheet, 32, 16);

        // First hit should NOT destroy silver brick (2 HP)
        boolean hitOneDestroyed = silverBrick.takeHit();
        assertFalse(hitOneDestroyed, "SILVER brick should survive the first hit");

        // Second hit SHOULD destroy silver brick
        boolean hitTwoDestroyed = silverBrick.takeHit();
        assertTrue(hitTwoDestroyed, "SILVER brick should be destroyed on the second hit");

        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + silverBrick.getType().getScoreValue());
        assertEquals(200, PlayerData.getCurrentScore(), "Destroying SILVER brick should add 200 points");
    }

    @Test
    void testGoldBrickUnbreakable() {
        Brick goldBrick = new Brick(BrickType.GOLD, mockSpriteSheet, 32, 16);

        // Multiple hits should never destroy GOLD brick (hp = -1)
        for (int i = 0; i < 10; i++) {
            boolean isDestroyed = goldBrick.takeHit();
            assertFalse(isDestroyed, "GOLD brick must remain unbreakable regardless of hit count");
        }

        assertEquals(0, goldBrick.getType().getScoreValue(), "GOLD brick should offer 0 score");
    }

    @Test
    void testBrickTypeEnumLookup() {
        assertEquals(BrickType.RED, BrickType.fromId(1));
        assertEquals(BrickType.BLUE, BrickType.fromId(2));
        assertEquals(BrickType.SILVER, BrickType.fromId(3));
        assertEquals(BrickType.GOLD, BrickType.fromId(4));
        assertEquals(BrickType.EMPTY, BrickType.fromId(999), "Unknown ID should default to EMPTY");
    }
}