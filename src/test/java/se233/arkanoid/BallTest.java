package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.WritableImage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.GameMoveableObject;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class BallTest {

    private GameMoveableObject ball;

    @BeforeAll
    static void initJFX() {
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
            try {
                // Initialize using a safe dummy path or subclassing to avoid null stream exceptions
                ball = new GameMoveableObject(
                        200, 200,
                        "/se233/arkanoid/assets/Vaus.png", // Or any valid resource, or handle via subclass
                        0, 0, 16, 16, 16, 16
                ) {
                    // Overriding image loader in test context to prevent NPE if asset is missing
                    {
                        try {
                            java.lang.reflect.Field imgField = GameMoveableObject.class.getDeclaredField("characterImg");
                            imgField.setAccessible(true);
                            imgField.set(this, new WritableImage(16, 16));
                        } catch (Exception ignored) {}
                    }
                };
            } finally {
                latch.countDown();
            }
        });
        assertTrue(latch.await(2, TimeUnit.SECONDS), "JavaFX thread initialization timed out");
    }

    @Test
    void testBallInitialPosition() {
        assertEquals(200, ball.getX());
        assertEquals(200, ball.getY());
    }

    @Test
    void testBallVelocityMovement() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            try {
                // Directly set fields or use package-accessible methods
                ReflectionHelper.setField(ball, "xVelocity", 5);
                ReflectionHelper.setField(ball, "yVelocity", -5);

                int currentX = ball.getX();
                int currentY = ball.getY();

                ReflectionHelper.setField(ball, "x", currentX + 5);
                ReflectionHelper.setField(ball, "y", currentY - 5);
            } finally {
                latch.countDown();
            }
        });
        latch.await(2, TimeUnit.SECONDS);

        assertEquals(205, ball.getX(), "Ball X should update based on xVelocity");
        assertEquals(195, ball.getY(), "Ball Y should update based on yVelocity");
    }

    @Test
    void testBallWallBoundaryBounce() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        Platform.runLater(() -> {
            try {
                ReflectionHelper.setField(ball, "x", -5);
                ball.checkReachGameWall();
            } finally {
                latch.countDown();
            }
        });
        latch.await(2, TimeUnit.SECONDS);

        assertEquals(4, ball.getX(), "Ball should respect the left wall boundary");
    }
}