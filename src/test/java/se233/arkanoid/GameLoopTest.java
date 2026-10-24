package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.input.KeyCode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.ReflectionHelper;
import se233.arkanoid.model.Vaus;

import static org.junit.jupiter.api.Assertions.*;

class GameLoopTest {

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
}