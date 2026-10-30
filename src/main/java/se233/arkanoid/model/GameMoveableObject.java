package se233.arkanoid.model;

import javafx.application.Platform;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Pane;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.arkanoid.event.Life;
import se233.arkanoid.model.StageData.Brick;
import se233.arkanoid.view.GameplayArea;

import java.util.List;

public abstract class GameMoveableObject extends Pane {
    protected static final Logger logger = LogManager.getLogger(GameMoveableObject.class);
    private Image characterImg;
    protected ImageView imageView;
    protected int x;
    protected int y;
    private int startX;
    private int startY;
    protected int characterWidth;
    protected int characterHeight;
    private int score = 0;

    // Ball physics velocities (can be positive or negative for directions)
    protected int xVelocity = 0;
    protected int yVelocity = 0;
    protected int xMaxVelocity = 7;
    protected int yMaxVelocity = 7;

    public int getxVelocity() {
        return xVelocity;
    }

    public void setxVelocity(int xVelocity) {
        this.xVelocity = xVelocity;
    }

    public int getyMaxVelocity() {
        return yMaxVelocity;
    }

    public void setyMaxVelocity(int yMaxVelocity) {
        this.yMaxVelocity = yMaxVelocity;
    }

    public int getxMaxVelocity() {
        return xMaxVelocity;
    }

    public void setxMaxVelocity(int xMaxVelocity) {
        this.xMaxVelocity = xMaxVelocity;
    }

    public int getyVelocity() {
        return yVelocity;
    }

    public void setyVelocity(int yVelocity) {
        this.yVelocity = yVelocity;
    }

    boolean isFalling = true;
    boolean canJump = false;
    boolean isJumping = false;
    protected boolean isOutOfBounds = false;
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
        if (isOutOfBounds) return;
        x += xVelocity;
        y += yVelocity;
        Platform.runLater(() -> {
            setTranslateX(x);
            setTranslateY(y);
        });
        checkReachGameWall();
    }

    public abstract boolean checkPaddleCollision(GameCharacter paddle);

    public abstract boolean checkBrickCollisions(List<Brick> bricks, List<Brick> removedQueue, long time);

    public abstract void checkReachGameWall();

    public void respawn() {
        this.isOutOfBounds=false;
        this.x = this.startX;
        this.y = this.startY;
        this.setTranslateX(x);
        this.setTranslateY(y);
        this.xVelocity = 0;
        this.yVelocity = 0;
        logger.info("Ball respawned at default position X: {}, Y: {}", startX, startY);
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
    public int getCharacterHeight() {
        return characterHeight;
    }
    public int getScore() {
        return score;
    }

}