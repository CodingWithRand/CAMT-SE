package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.input.KeyCode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.model.Vaus;
import se233.arkanoid.view.GameplayArea;

import static org.junit.jupiter.api.Assertions.*;

class GameCharacterTest {

    private GameCharacter paddle;

    @BeforeAll
    static void initJFX() {
        try {
            Platform.startup(() -> {});
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
            Thread.sleep(100);
        } catch (InterruptedException ignored) {}
    }

    @Test
    void testInitialPosition() {
        assertNotNull(paddle);
    }

    @Test
    void testLeftWallPaddingBoundary() {
        Platform.runLater(() -> {
            ReflectionHelper.setField(paddle, "x", 5);
            paddle.checkReachGameWall();
        });

        try { Thread.sleep(50); } catch (InterruptedException ignored) {}

        assertEquals(18, paddle.getX(), "Paddle should clamp to the left wall padding of 18px");
        int velocity = (int) ReflectionHelper.getField(paddle, "xVelocity");
        assertEquals(0, velocity, "Velocity should reset to 0 upon hitting the left wall");
    }

    @Test
    void testRightWallPaddingBoundary() {
        Platform.runLater(() -> {
            ReflectionHelper.setField(paddle, "x", GameplayArea.GPAREA_WIDTH);
            paddle.checkReachGameWall();
        });

        try { Thread.sleep(50); } catch (InterruptedException ignored) {}

        int renderedWidth = (int) (paddle.getCharacterWidth() * 1.2);
        int expectedMaxX = GameplayArea.GPAREA_WIDTH - renderedWidth - 18;

        assertEquals(expectedMaxX, paddle.getX(), "Paddle should clamp cleanly before the right wall padding");
        int velocity = (int) ReflectionHelper.getField(paddle, "xVelocity");
        assertEquals(0, velocity, "Velocity should reset to 0 upon hitting the right wall");
    }
}