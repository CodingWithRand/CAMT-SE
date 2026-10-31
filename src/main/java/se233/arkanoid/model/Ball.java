package se233.arkanoid.model;

import javafx.application.Platform;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.controller.GameLoop;
import se233.arkanoid.event.Life;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;
import se233.arkanoid.view.Stage;

import java.util.ArrayList;
import java.util.List;


public class Ball extends GameMoveableObject {
    private static final Logger logger = LogManager.getLogger(Ball.class);
    private List<? extends GameCharacter> paddles;
    public Ball(List<? extends GameCharacter> paddles) {
        super(
                GameplayArea.GPAREA_WIDTH / 2 - 16,
                GameplayArea.GPAREA_HEIGHT - 56,
                "/se233/arkanoid/assets/Vaus.png",
                0, 40,
                5, 4,
                10, 8
        );
        this.setScaleX(2);
        this.setScaleY(2);
        this.paddles = paddles;
    }

    public void moveAlong(int paddleNum) {
        Vaus paddle = (Vaus) paddles.get(paddleNum);
        x = paddle.getX();
        Platform.runLater(() -> {
            setTranslateX(paddle.getX());
        });
        checkReachGameWall();
    }

    @Override
    public boolean checkPaddleCollision(GameCharacter paddle) {
        // Check if the ball's bounding box intersects with the paddle's bounding box
        if (this.getBoundsInParent().intersects(paddle.getBoundsInParent())) {
            logger.debug("Ball collided with paddle at X: {}, Y: {}", x, y);

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

    private Brick lastHitBrick = null;
    private long lastHitTimeMs = 0;
    private final long COLLISION_COOLDOWN_MS = 1000;
    private boolean isPiercing = false;

    @Override
    public boolean checkBrickCollisions(List<Brick> bricks,
                                        List<Brick> removedQueue,
                                        long time) {

        // Clear the lockout ONLY when the ball has physically moved completely away from the last hit brick
        if (lastHitBrick != null && !this.getBoundsInParent().intersects(lastHitBrick.getBoundsInParent())) {
            lastHitBrick = null;
        }

        for (Brick brick : bricks) {
            if (removedQueue.contains(brick)) continue;

            // Ignore this brick if it's currently locked out from a recent hit
            if (brick == lastHitBrick) continue;

            if (this.getBoundsInParent().intersects(brick.getBoundsInParent())) {
                boolean isDestroyed = brick.takeHit();
                logger.info("Ball collided with brick. Destroyed: {}, Remaining HP: {}", isDestroyed, brick.getHp());

                if (isDestroyed) {
                    javafx.application.Platform.runLater(() -> {
                        int points = brick.getType().getScoreValue();
                        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + points);
                        logger.info("Brick destroyed! Awarded {} points. Total Score: {}", points, PlayerData.getCurrentScore());
                    });
                    removedQueue.add(brick);
                } else {
                    // Lock out this specific brick so it can't re-trigger until the ball moves away
                    lastHitBrick = brick;
                }
                // --- PIERCING vs NORMAL BOUNCE PHYSICS ---
                if (!isPiercing || brick.getHp() == -1) {
                    // --- ITERATIVE ESCAPE LOOP ---
                    int safetyGuard = 0;
                    while (this.getBoundsInParent().intersects(brick.getBoundsInParent()) && safetyGuard < 30) {
                        this.x -= (int) Math.signum(xVelocity);
                        this.y -= (int) Math.signum(yVelocity);
                        this.setTranslateX(this.x);
                        this.setTranslateY(this.y);
                        safetyGuard++;
                    }

                    // Invert velocities to bounce away cleanly
                    xVelocity = -xVelocity;
                    yVelocity = -yVelocity;
                }
                return true;
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
            xVelocity = -xVelocity;
            logger.info("Ball bounced off left wall.");
        }
        // Bounce off right wall (fixed subtraction syntax)
        else if (x + renderedCharWidth >= GameplayArea.GPAREA_WIDTH - wallpadding) {
            x = GameplayArea.GPAREA_WIDTH - renderedCharWidth - wallpadding;
            xVelocity = -xVelocity;
            logger.info("Ball bounced off right wall.");
        }

        // Top wall bounce check
        if (y <= wallpadding) {
            y = wallpadding;
            yVelocity = -yVelocity;
            logger.debug("Ball bounced off top wall.");
        }

        // Bottom boundary check (Missed paddle / Out of bounds)
        if (y >= GameplayArea.GPAREA_HEIGHT) {
            isOutOfBounds = true;
            yVelocity = 0;
            xVelocity = 0;
            logger.warn("Ball missed the paddle and went out of bounds at Y: {}", y);
            javafx.application.Platform.runLater(() -> {
                this.fireEvent(new Life(Life.LOSE));

                if (PlayerData.getLifeCount() > 0) {
                    logger.info("Player lost a life. Remaining lives: {}. Respawning ball.", PlayerData.getLifeCount());
                    paddles.forEach(GameCharacter::respawn);
                    respawn();
                } else {
                    logger.info("Game Over! Lives depleted. Saving high score.");
                    GameLoop.gameOver();
                    PlayerData.checkAndUpdateHighScore();
                }
            });
        }
    }

    public void nudge() {
        this.yVelocity = -3;
    }
    public boolean isPiercing() { return isPiercing; }
    public void setPiercing(boolean piercing) { this.isPiercing = piercing; }
}