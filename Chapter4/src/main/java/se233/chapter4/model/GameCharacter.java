package se233.chapter4.model;

import javafx.scene.image.Image;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import se233.chapter4.Launcher;
import se233.chapter4.view.GameStage;

public class GameCharacter extends Pane {
    private static final Logger logger = LogManager.getLogger(GameCharacter.class);
    public static int CHARACTER_WIDTH = 32;
    public static int CHARACTER_HEIGHT = 64;
    private Image gameCharacterImg;
    private AnimatedSprite imageView;
    private int x;
    private int y;
    private KeyCode leftKey;
    private KeyCode rightKey;
    private KeyCode upKey;
    int xVelocity = 0;
    boolean isMoveLeft = false;
    boolean isMoveRight = false;
    int yVelocity = 0;
    boolean isFalling = true;
    boolean canJump = false;
    boolean isJumping = false;
    int xAcceleration = 1;
    int yAcceleration = 1;
    int xMaxVelocity;
    int yMaxVelocity;
    public GameCharacter(String name, int spriteCount, int spriteColumns, int spriteRows, int spriteAnimWidth, int spriteAnimHeight, int x, int y, int offsetX, int offsetY, int xmv, int ymv, KeyCode leftKey, KeyCode rightKey, KeyCode upKey, Integer customSpriteWidth, Integer customSpriteHeight) {
        this.x = x;
        this.y = y;
        this.xMaxVelocity = xmv;
        this.yMaxVelocity = ymv;
        this.setTranslateX(x);
        this.setTranslateY(y);
        this.gameCharacterImg = new Image(Launcher.class.getResourceAsStream("assets/" + name + ".png"));
        this.imageView = new AnimatedSprite(gameCharacterImg, spriteCount, spriteColumns, spriteRows, offsetX, offsetY, spriteAnimWidth, spriteAnimHeight);
        this.CHARACTER_WIDTH = customSpriteWidth != null ? customSpriteWidth : this.CHARACTER_WIDTH;
        this.CHARACTER_HEIGHT = customSpriteHeight!= null ? customSpriteHeight : this.CHARACTER_WIDTH;
        this.imageView.setFitWidth(this.CHARACTER_WIDTH);
        this.imageView.setFitHeight(this.CHARACTER_HEIGHT);
        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.upKey = upKey;
        this.getChildren().addAll(this.imageView);
    }
    public void moveX() {
        setTranslateX(x);
        if(isMoveLeft) {
            xVelocity = xVelocity>=xMaxVelocity ? xMaxVelocity : xVelocity + xAcceleration;
            x = x - xVelocity;
        }
        if(isMoveRight) {
            xVelocity = xVelocity>=xMaxVelocity ? xMaxVelocity : xVelocity + xAcceleration;
            x = x + xVelocity;
        }
    }
    public void moveY() {
        setTranslateY(y);
        if(isFalling){
            yVelocity = yVelocity >= yMaxVelocity ? yMaxVelocity : yVelocity + yAcceleration;
            y = y + yVelocity;
        }
        else if(isJumping) {
            yVelocity = yVelocity <= 0 ? 0 : yVelocity - yAcceleration;
            y = y - yVelocity;
        }
    }
    public void repaint() {
        moveX();
        moveY();
    }
    public void moveLeft() {
        setScaleX(-1);
        isMoveLeft = true;
        isMoveRight = false;
    }
    public void moveRight() {
        setScaleX(1);
        isMoveLeft = false;
        isMoveRight = true;
    }
    public void stop() {
        isMoveLeft = false;
        isMoveRight = false;
    }
    public void checkReachGameWall() {
        if(x <= 0) {
            x = 0;
            logger.debug("Hit game wall on the left.");
        } else if(x + getWidth() >= GameStage.WIDTH) {
            x = GameStage.WIDTH - (int) getWidth();
            logger.debug("Hit game wall on the right.");
        }
    }
    public void jump() {
        if (canJump) {
            yVelocity = yMaxVelocity;
            canJump = false;
            isJumping = true;
            isFalling = false;
        }
    }
    public void checkReachHighest() {
        if(isJumping && yVelocity <= 0) {
            isJumping = false;
            isFalling = true;
            yVelocity = 0;
        }
    }
    public void checkReachFloor() {
        if(isFalling && y >= GameStage.GROUND - CHARACTER_HEIGHT){
            isFalling = false;
            canJump = true;
            yVelocity = 0;
        }
    }

    public KeyCode getLeftKey() {
        return leftKey;
    }

    public KeyCode getRightKey() {
        return rightKey;
    }

    public KeyCode getUpKey() {
        return upKey;
    }

    public AnimatedSprite getImageView() {
        return imageView;
    }

    public void trace() {
//        System.out.println(String.format("x:%d y:%d vx:%d vy:%d", x, y, xVelocity, yVelocity));
        logger.info("x:{} y:{} vx:{} vy:{}", x, y, xVelocity, yVelocity);
    }
}
