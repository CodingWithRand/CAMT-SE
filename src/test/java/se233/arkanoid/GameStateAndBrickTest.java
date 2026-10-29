package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.WritableImage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.event.Life;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.model.StageData.BrickType;
import se233.arkanoid.view.GameplayArea;

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
    void testLifeGainAndLoseEvents() {
        // Explicitly set starting lives to 2 for this test

        Platform.runLater(() -> {
            GameplayArea area = new GameplayArea();
            PlayerData.setLifeCount(2);

            // Gain extra life -> 2 + 1 = 3
            area.fireEvent(new Life(Life.GAIN));
            assertEquals(3, PlayerData.getLifeCount(), "Life count should increase to 3 on GAIN");

            // Lose first life -> 3 - 1 = 2
            area.fireEvent(new Life(Life.LOSE));
            assertEquals(2, PlayerData.getLifeCount(), "Life count should decrease to 2 after losing a life");

            // Lose remaining lives down to 0
            area.fireEvent(new Life(Life.LOSE));
            area.fireEvent(new Life(Life.LOSE));
            assertEquals(0, PlayerData.getLifeCount(), "Life count should hit 0 on death");

            // Verify no negative lives on extra death events
            assertDoesNotThrow(() -> area.fireEvent(new Life(Life.LOSE)), "Excess LOSE events should handle gracefully");
            assertEquals(0, PlayerData.getLifeCount(), "Life count should clamp at 0");
        });
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