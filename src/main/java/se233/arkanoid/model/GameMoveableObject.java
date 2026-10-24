package se233.arkanoid.model;

import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Pane;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;

import java.util.List;

public class GameMoveableObject extends Pane {
    private Image characterImg;
    protected ImageView imageView;
    private int x;
    private int y;
    private int startX;
    private int startY;
    private int characterWidth;
    private int characterHeight;
    private int score = 0;

    // Ball physics velocities (can be positive or negative for directions)
    int xVelocity = 3;
    int yVelocity = -3;
    int xMaxVelocity = 7;
    int yMaxVelocity = 7;

    boolean isFalling = true;
    boolean canJump = false;
    boolean isJumping = false;

    public GameMoveableObject(
            int x, int y,
            String imgName,
            int spriteSheetOffsetX, int spriteSheetOffsetY,
            int spriteWidth, int spriteHeight,
            int width, int height
    ) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.setTranslateX(x);
        this.setTranslateY(y);
        this.characterWidth = width;
        this.characterHeight = height;
        this.characterImg = new Image(getClass().getResourceAsStream(imgName));
        this.imageView = new ImageView();
        this.imageView.setImage(characterImg);
        this.imageView.setViewport(new Rectangle2D(spriteSheetOffsetX, spriteSheetOffsetY, spriteWidth, spriteHeight));

        this.getChildren().addAll(this.imageView);
    }

    // Continuous movement for both X and Y axes based on current velocities
    public void move() {
        x += xVelocity;
        y += yVelocity;
        setTranslateX(x);
        setTranslateY(y);
        checkReachGameWall();
    }
    public boolean checkPaddleCollision(GameCharacter paddle) {
        // Check if the ball's bounding box intersects with the paddle's bounding box
        if (this.getBoundsInParent().intersects(paddle.getBoundsInParent())) {

            // 1. Reflect Y velocity upwards (ensure it's negative so it moves up)
            yVelocity = -Math.abs(yVelocity);

            // 2. Optional Classic Arkanoid Mechanic: Add "English" (angle adjustment)
            // based on where the ball hits the paddle relative to its center
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
    public boolean checkBrickCollisions(List<se233.arkanoid.model.StageData.Brick> bricks,
                                        List<se233.arkanoid.model.StageData.Brick> removedQueue) {
        for (se233.arkanoid.model.StageData.Brick brick : bricks) {
            // Skip bricks already queued for removal
            if (removedQueue.contains(brick)) continue;

            if (this.getBoundsInParent().intersects(brick.getBoundsInParent())) {
                boolean isDestroyed = brick.takeHit();

                if (isDestroyed) {
                    // Award points
                    javafx.application.Platform.runLater(() -> {
                        PlayerData.setCurrentScore(PlayerData.getCurrentScore() + brick.getType().getScoreValue());
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
    }

    public void respawn() {
        this.x = this.startX;
        this.y = this.startY;
        this.setTranslateX(x);
        this.setTranslateY(y);
        this.xVelocity = 3;
        this.yVelocity = -3;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getCharacterWidth() {
        return characterWidth;
    }

    public int getScore() {
        return score;
    }
}