// Note: rework where i comment, k?
package se233.arkanoid.model;

import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import se233.arkanoid.view.GameplayArea;

public class GameMoveableObject extends Pane {
    private Image characterImg;
    protected ImageView imageView;
//    private AnimatedSprite imageView;
    private int x;
    private int y;
    private int startX;
    private int startY;
    private int characterWidth;
    private int characterHeight;
    private int score = 0;
    int xVelocity = 0;
    int yVelocity = 0;
    int xAcceleration = 1;
    int yAcceleration = 1;
    int xMaxVelocity = 7;
    int yMaxVelocity = 17;
    boolean isMoveLeft = false;
    boolean isMoveRight = false;
    boolean isFalling = true;
    boolean canJump = false;
    boolean isJumping = false;

    public GameMoveableObject(
            /*int id,*/
            int x, int y,
            String imgName,
            int spriteSheetOffsetX, int spriteSheetOffsetY,
            int spriteWidth, int spriteHeight,
            /*int count, int column, int row,*/
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
//        this.imageView = new AnimatedSprite(characterImg, count, column, row, 0, 0, width, height);
//        this.imageView.setFitWidth((int) (width * 1.2));
//        this.imageView.setFitHeight((int) (height * 1.2));

        this.getChildren().addAll(this.imageView);
//        this.imageView.setScaleX(id % 2 * 2 - 1);
    }
    public void moveLeft() {
//        this.imageView.setScaleX(1);
        isMoveLeft = true;
        isMoveRight = false;
    }
    public void moveRight() {
//        this.imageView.setScaleX(-1);
        isMoveLeft = false;
        isMoveRight = true;
    }
    public void stop() {
        isMoveLeft = false;
        isMoveRight = false;
    }
    public void moveX() {
        setTranslateX(x);
        if(isMoveLeft) {
            xVelocity = xVelocity>=xMaxVelocity? xMaxVelocity : xVelocity+xAcceleration;
            x = x - xVelocity;
        }
        if(isMoveRight) {
            xVelocity = xVelocity>=xMaxVelocity? xMaxVelocity : xVelocity+xAcceleration;
            x = x + xVelocity;
        }
    }
//    public void moveY() {
//        setTranslateY(y);
//        if(isFalling) {
//            yVelocity = yVelocity >= yMaxVelocity? yMaxVelocity : yVelocity+yAcceleration;
//            y = y + yVelocity;
//        } else if(isJumping) {
//            yVelocity = yVelocity <= 0 ? 0 : yVelocity-yAcceleration;
//            y = y - yVelocity;
//        }
//    }
    public void checkReachGameWall() {
        int renderedCharWidth = getWidth() != 0 ? (int) getWidth() : (int) (getCharacterWidth() * 1.2);
//        System.out.println(x+renderedCharWidth + " " + renderedCharWidth + " " + GameStage.WIDTH);
        if(x <= 0) {
            x = 0;
        } else if( x+renderedCharWidth >= GameplayArea.GPAREA_WIDTH) {
            x = GameplayArea.GPAREA_HEIGHT-renderedCharWidth;
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
//    public void checkReachHighest () {
//        if(isJumping && yVelocity <= 0) {
//            isJumping = false;
//            isFalling = true;
//            yVelocity = 0;
//        }
//    }
    // rework here
//    public void checkReachFloor() {
//        if(isFalling && y >= GameStage.GROUND - this.characterHeight) {
//            isFalling = false;
//            canJump = true;
//            yVelocity = 0;
//        }
//    }
    public void repaint() {
        moveX();
//        moveY();
    }

    // rework here.
//    public boolean collided(GameCharacter c) {
//        System.out.println(this.x + " " + c.getX());
//        if (this.isMoveLeft && this.x > c.getX()) {
//            this.x = Math.max(this.x, c.getX() + c.getCharacterWidth());
//            this.stop();
//        } else if (this.isMoveRight && this.x < c.getX()) {
//            this.x = Math.min(this.x, c.getX() - this.characterWidth);
//            this.stop();
//        }
//        if (this.isFalling && this.y < c.getY()) {
//            score++;
//            this.y = Math.min(GameplayArea.GROUND - this.characterHeight, c.getY());
//            this.repaint();
//            c.collapsed();
//            c.respawn();
//            return true;
//        }
//        return false;
//    }
//    public void collapsed() {
//        this.imageView.setFitHeight(5);
//        this.y = this.y + this.characterHeight - 5;
//        this.repaint();
//        try {
//            TimeUnit.MILLISECONDS.sleep(300);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//    }
    public void respawn() {
        this.x = this.startX;
        this.y = this.startY;
        this.imageView.setFitWidth(this.characterWidth);
        this.imageView.setFitHeight(this.characterHeight);
        this.isMoveLeft = false;
        this.isMoveRight = false;
        this.isFalling = true;
        this.canJump = false;
        this.isJumping = false;
    }

//    public AnimatedSprite getImageView() {
//
//        return imageView;
//    }

    public int getX() {
        return x;
    }

    public int getCharacterWidth() {
        return characterWidth;
    }

    public int getY() {
        return y;
    }

    public int getScore() {
        return score;
    }

    public boolean isCanJump() {
        return canJump;
    }

    public boolean isJumping() {
        return isJumping;
    }
}