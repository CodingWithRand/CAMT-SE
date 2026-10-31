package se233.arkanoid.model;

import javafx.application.Platform;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;

import java.util.List;

public class Bullet extends GameMoveableObject {
    private static final Logger logger = LogManager.getLogger(Bullet.class);

    public Bullet(int x, int y) {
        super(
                x, y,
                "/se233/arkanoid/assets/Vaus.png",
                152, 48,
                5, 19,
                0, 12 // xVelocity = 0 so it shoots straight up, yVelocity = speed
        );
        this.yVelocity = -12; // Ensure it moves upward immediately
        this.setScaleX(1.5);
        this.setScaleY(1.5);
    }

    @Override
    public boolean checkPaddleCollision(GameCharacter paddle) {
        // Bullets do not collide or interact with paddles
        return false;
    }

    @Override
    public boolean checkBrickCollisions(List<Brick> bricks,
                                        List<Brick> removedQueue,
                                        long time) {
        for (Brick brick : bricks) {
            if (removedQueue.contains(brick)) continue;

            if (this.getBoundsInParent().intersects(brick.getBoundsInParent())) {
                // Gold / unbreakable bricks absorb bullets without taking damage or destroying
                if (brick.getHp() < 0) {
                    logger.info("Bullet hit unbreakable/gold brick. Disappearing.");
                    this.isOutOfBounds = true; // Mark for removal
                    return true;
                }

                boolean isDestroyed = brick.takeHit();
                logger.info("Bullet collided with brick. Destroyed: {}, Remaining HP: {}", isDestroyed, brick.getHp());

                if (isDestroyed) {
                    Platform.runLater(() -> {
                        int points = (int) (brick.getType().getScoreValue() * PlayerData.getScoreMultiplier());
                        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + points);
                        logger.info("Brick destroyed by bullet! Awarded {} points. Total Score: {}", points, PlayerData.getCurrentScore());
                    });
                    removedQueue.add(brick);
                }

                // Bullet disappears instantly upon hitting any brick
                this.isOutOfBounds = true;
                this.yVelocity = 0;
                this.xVelocity = 0;
                return true;
            }
        }
        return false;
    }

    @Override
    public void checkReachGameWall() {
        int wallpadding = 4;

        // If bullet hits the top wall, mark it out of bounds so it gets cleaned up
        if (y <= wallpadding) {
            isOutOfBounds = true;
            yVelocity = 0;
            xVelocity = 0;
            logger.debug("Bullet reached top wall and disappeared.");
        }
    }
}