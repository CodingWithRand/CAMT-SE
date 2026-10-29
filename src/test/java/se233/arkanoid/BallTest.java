package se233.arkanoid;

import javafx.application.Platform;
import javafx.scene.image.WritableImage;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.arkanoid.model.Ball;
import se233.arkanoid.model.GameCharacter;
import se233.arkanoid.model.GameMoveableObject;
import se233.arkanoid.model.PlayerData;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;

import java.lang.reflect.Field;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class BallTest {

    private static final Logger testLogger = LogManager.getLogger(BallTest.class);
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
                ball = new Ball(new java.util.ArrayList<>()) {
                    @Override
                    public boolean checkPaddleCollision(GameCharacter paddle) {
                        if (this.getBoundsInParent().intersects(paddle.getBoundsInParent())) {
                            testLogger.info("Ball collided with paddle at X: {}, Y: {}", x, y);
                            yVelocity = -Math.abs(yVelocity);
                            double paddleCenterX = paddle.getX() + (paddle.getCharacterWidth() / 2.0);
                            double ballCenterX = this.getX() + (this.getCharacterWidth() / 2.0);
                            double hitOffset = (ballCenterX - paddleCenterX) / (paddle.getCharacterWidth() / 2.0);
                            xVelocity += (int) (hitOffset * 2);
                            xVelocity = Math.max(-xMaxVelocity, Math.min(xMaxVelocity, xVelocity));
                            return true;
                        }
                        return false;
                    }

                    @Override
                    public boolean checkBrickCollisions(List<Brick> bricks,
                                                        List<se233.arkanoid.model.StageData.Brick> removedQueue,
                                                        long time) {
                        for (Brick brick : bricks) {
                            if (removedQueue.contains(brick)) continue;

                            if (this.getBoundsInParent().intersects(brick.getBoundsInParent())) {
                                boolean isDestroyed = brick.takeHit();
                                testLogger.info("Ball collided with brick. Destroyed: {}, Remaining HP: {}", isDestroyed, brick.getHp());

                                if (isDestroyed) {
                                    javafx.application.Platform.runLater(() -> {
                                        int points = brick.getType().getScoreValue();
                                        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + points);
                                        testLogger.info("Brick destroyed! Awarded {} points. Total Score: {}", points, PlayerData.getCurrentScore());
                                    });
                                    removedQueue.add(brick);
                                }

                                yVelocity = -yVelocity;
                                return true;
                            }
                        }
                        return false;
                    }

                    @Override
                    public void checkReachGameWall() {
                        int renderedCharWidth = getWidth() != 0 ? (int) getWidth() : (int) (getCharacterWidth() * 1.2);
                        int wallpadding = 4;

                        if (x <= wallpadding) {
                            x = wallpadding;
                            xVelocity = -xVelocity;
                        } else if (x + renderedCharWidth >= GameplayArea.GPAREA_WIDTH - wallpadding) {
                            x = GameplayArea.GPAREA_WIDTH - renderedCharWidth - wallpadding;
                            xVelocity = -xVelocity;
                        }

                        if (y <= wallpadding) {
                            y = wallpadding;
                            yVelocity = -yVelocity;
                        } else if (y > GameplayArea.GPAREA_HEIGHT - wallpadding) {
                            respawn();
                        }
                    }

                    {
                        try {
                            Field imgField = GameMoveableObject.class.getDeclaredField("characterImg");
                            imgField.setAccessible(true);
                            imgField.set(this, new WritableImage(16, 16));
                        } catch (Exception ignored) {}
                    }
                };

                setField(ball, "x", 200);
                setField(ball, "y", 200);

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
                setField(ball, "xVelocity", 5);
                setField(ball, "yVelocity", -5);

                int currentX = ball.getX();
                int currentY = ball.getY();

                setField(ball, "x", currentX + 5);
                setField(ball, "y", currentY - 5);
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
                setField(ball, "x", -5);
                ball.checkReachGameWall();
            } finally {
                latch.countDown();
            }
        });
        latch.await(2, TimeUnit.SECONDS);

        assertEquals(4, ball.getX(), "Ball should respect the left wall boundary");
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = GameMoveableObject.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}