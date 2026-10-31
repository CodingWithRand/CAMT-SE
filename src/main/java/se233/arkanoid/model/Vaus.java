package se233.arkanoid.model;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.geometry.Rectangle2D;
import javafx.scene.input.KeyCode;
import se233.arkanoid.view.GameplayArea;

import javafx.util.Duration;

public class Vaus extends GameCharacter {
    private int spriteFrame;
    private long lastFrameTime;
    private final int idleAnimationFrameRate = 5;
    private final float frameInterval = 1000.0f / idleAnimationFrameRate;
    private boolean isExpanded = false;

    private boolean isArmed = false;
    private boolean armedTransitioning = false;
    private Timeline armingAnimation = new Timeline(
            // Frame 1: Transitioning sprite frame (after 0ms)
            new KeyFrame(Duration.ZERO, e -> {
                this.imageView.setViewport(new Rectangle2D(112, 0, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(100), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 8, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(200), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 16, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(300), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 24, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(400), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 32, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(500), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 40, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(600), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 48, 32, 8)); // Intermediate frame
            }),
            new KeyFrame(Duration.millis(700), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 56, 32, 8)); // Intermediate frame
            }),
            // Frame Final: Final armed sprite frame (after 100ms)
            new KeyFrame(Duration.millis(800), e -> {
                this.imageView.setViewport(new Rectangle2D(112, 64, 32, 8)); // Final armed frame
            })
    );

    public Vaus() {
        super(
                GameplayArea.GPAREA_WIDTH / 2 - 16,
                GameplayArea.GPAREA_HEIGHT - 40,
                "/se233/arkanoid/assets/Vaus.png",
                32, 0,
                32, 8,
                64, 16,
                KeyCode.LEFT,
                KeyCode.RIGHT,
                KeyCode.UP
        );
        this.setScaleX(2);
        this.setScaleY(2);
        armingAnimation.setOnFinished(e -> armedTransitioning = false);
    }
    public void setExpanded(boolean expanded) {
        this.isExpanded = expanded;
        if (expanded) {
            this.setCharacterWidth(48); // Increase logical collision width
//            this.imageView.setViewport(new Rectangle2D(64, 0, 48, 8)); // Crop wider sprite
        } else {
            this.setCharacterWidth(32);
//            this.imageView.setViewport(new Rectangle2D(32, 0, 32, 8));
        }
    }
    public void setIsArmed(boolean armed) {
        this.isArmed = armed;
        if (armed) {
            armedTransitioning = true;
            armingAnimation.play();
        }
        // should we make the reverse animation as well?
//        else {
//            this.setCharacterWidth(32);
//            this.imageView.setViewport(new Rectangle2D(32, 0, 32, 8));
//        }
    }

    public boolean isExpanded() {
        return isExpanded;
    }
    public boolean isArmed() {
        return isArmed;
    }


    public void fire(GameplayArea gameplayArea) {
        if (!isArmed) return;

        Platform.runLater(() -> {
            Bullet b1 = new Bullet((int) this.getX() + 5, (int) this.getY() - 10);
            Bullet b2 = new Bullet((int) this.getX() + (int) this.getCharacterWidth() - 15, (int) this.getY() - 10);

            gameplayArea.getChildren().addAll(b1, b2);
            gameplayArea.getActiveBullets().add(b1);
            gameplayArea.getActiveBullets().add(b2);
        });
    }

    public void interpolate(long now) {
        if (armedTransitioning) return;
        if (lastFrameTime == 0) {
//            System.out.println('a');
            lastFrameTime = now;
            return;
        }

        // Advance sprite frame ONLY if enough time has passed
//        System.out.println(now);
//        System.out.println(lastFrameTime);
//        System.out.println(now - lastFrameTime);
        if ((now - lastFrameTime) >= frameInterval) {
//            System.out.println('a');
            spriteFrame = (spriteFrame + 1) % 6;
            if(isArmed) this.imageView.setViewport(new Rectangle2D(144, spriteFrame * 8, 32, 8));
            else this.imageView.setViewport(new Rectangle2D(isExpanded ? 64 : 32, spriteFrame * 8, isExpanded ? 48 : 32, 8));
            lastFrameTime = now;
        }
    }
}
