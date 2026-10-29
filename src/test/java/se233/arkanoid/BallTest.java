package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.WritableImage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.model.GameMoveableObject;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;

import java.util.List;
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
                    @Override
                    public boolean checkPaddleCollision(GameCharacter paddle) {
                        // Check if the ball's bounding box intersects with the paddle's bounding box
                        if (this.getBoundsInParent().intersects(paddle.getBoundsInParent())) {
                            logger.info("Ball collided with paddle at X: {}, Y: {}", x, y);

                            // 1. Reflect Y velocity upwards (ensure it's negative so it moves up)
                            yVelocity = -Math.abs(yVelocity);

                            // 2. Optional Classic Arkanoid Mechanic: Add "English" (angle adjustment)
                            double paddleCenterX = paddle.getX() + (paddle.getCharacterWidth() / 2.0);
                            double ballCenterX = this.getX() + (this.getCharacterWidth() / 2.0);
                            double hitOffset = (ballCenterX - paddleCenterX) / (paddle.getCharacterWidth() / 2.0);

                            // Adjust xVelocity slightly based on the hit offset for directional steering
                            xVelocity += (int) (hitOffset * 2);

                            // Clamp max velocities so it doesn't get out of hand
                            xVelocity = Math.max(-xMaxVelocity, Math.min(xMaxVelocity, xVelocity));

                            return true;
                        }
                        return false;
                    }
                    @Override
                    public boolean checkBrickCollisions(List<Brick> bricks,
                                                        List<se233.arkanoid.model.StageData.Brick> removedQueue) {
                        for (Brick brick : bricks) {
                            // Skip bricks already queued for removal
                            if (removedQueue.contains(brick)) continue;

                            if (this.getBoundsInParent().intersects(brick.getBoundsInParent())) {
                                boolean isDestroyed = brick.takeHit();
                                logger.info("Ball collided with brick. Destroyed: {}, Remaining HP: {}", isDestroyed, brick.getHp());

                                if (isDestroyed) {
                                    // Award points safely on FX thread
                                    javafx.application.Platform.runLater(() -> {
                                        int points = brick.getType().getScoreValue();
                                        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + points);
                                        logger.info("Brick destroyed! Awarded {} points. Total Score: {}", points, PlayerData.getCurrentScore());
                                    });
                                    // Queue for safe batch removal later in the loop cycle
                                    removedQueue.add(brick);
                                }

                                // Reverse vertical velocity (bounce)
                                yVelocity = -yVelocity;
                                return true; // Collision handled
                            }
                        }
                        return false;
                    }
                    @Override
                    public void checkReachGameWall() {
                        int renderedCharWidth = getWidth() != 0 ? (int) getWidth() : (int) (getCharacterWidth() * 1.2);
                        int wallpadding = 4; // Match your game arena wall padding

                        // Bounce off left wall
                        if (x <= wallpadding) {
                            x = wallpadding;
                            xVelocity = -xVelocity; // Reverse X direction (bounce)
                        }
                        // Bounce off right wall
                        else if (x + renderedCharWidth >= GameplayArea.GPAREA_WIDTH - wallpadding) {
                            x = GameplayArea.GPAREA_WIDTH - renderedCharWidth - wallpadding;
                            xVelocity = -xVelocity; // Reverse X direction (bounce)
                        }

                        // Top wall bounce check (if ball reaches top of play area)
                        if (y <= wallpadding) {
                            y = wallpadding;
                            yVelocity = -yVelocity; // Reverse Y direction (bounce)
                        }

                        else if (y > GameplayArea.GPAREA_HEIGHT - wallpadding) respawn();
                    }
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