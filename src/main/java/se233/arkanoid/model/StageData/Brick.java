package se233.arkanoid.model.StageData;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Pane;
import javafx.util.Duration;

public class Brick extends Pane {

    private final BrickType type;
    private final ImageView imageView;

    private boolean isBeingHit;

    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    private int hp;

    public Brick(BrickType type, Image spriteSheet, double displayWidth, double displayHeight) {
        this.type = type;
        this.hp = type.getMaxHp();

        this.imageView = new ImageView(spriteSheet);
        this.imageView.setViewport(type.getViewport()); // Crop sprite from sheet
        this.imageView.setFitWidth(displayWidth);        // Scale to world size
        this.imageView.setFitHeight(displayHeight);

        this.getChildren().add(imageView);
    }

    public boolean takeHit() {
        if (hp == -1) {
            animateHit();
            return false; // Unbreakable
        }
        if (isBeingHit) return false;
        hp--;
        if (hp > 0) animateHit();
        if (hp < 0) hp = 0;
        return hp == 0; // Returns true if destroyed
    }

    public void animateHit() {
        isBeingHit = true;
        Timeline brickHitAnim = null;
        switch (type) {
            case SILVER ->
                  brickHitAnim = new Timeline(
                        new KeyFrame(Duration.ZERO, e -> {
                            this.imageView.setViewport(type.getViewport());
                        }),
                        new KeyFrame(Duration.millis(100), e -> {
                            this.imageView.setViewport(new Rectangle2D(16, 16, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(200), e -> {
                            this.imageView.setViewport(new Rectangle2D(32, 16, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(300), e -> {
                            this.imageView.setViewport(new Rectangle2D(48, 16, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(400), e -> {
                            this.imageView.setViewport(new Rectangle2D(64, 16, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(500), e -> {
                            this.imageView.setViewport(new Rectangle2D(80, 16, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(600), e -> {
                            this.imageView.setViewport(type.getViewport());
                        })
                );
            case GOLD ->
                brickHitAnim = new Timeline(
                        new KeyFrame(Duration.ZERO, e -> {
                            this.imageView.setViewport(type.getViewport());
                        }),
                        new KeyFrame(Duration.millis(100), e -> {
                            this.imageView.setViewport(new Rectangle2D(16, 24, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(200), e -> {
                            this.imageView.setViewport(new Rectangle2D(32, 24, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(300), e -> {
                            this.imageView.setViewport(new Rectangle2D(48, 24, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(400), e -> {
                            this.imageView.setViewport(new Rectangle2D(64, 24, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(500), e -> {
                            this.imageView.setViewport(new Rectangle2D(80, 24, 16, 8));
                        }),
                        new KeyFrame(Duration.millis(600), e -> {
                            this.imageView.setViewport(type.getViewport());
                        })
                );
        }
        if(brickHitAnim != null) {
            brickHitAnim.setOnFinished(e -> isBeingHit = false);
            brickHitAnim.play();
        }
    }

    public BrickType getType() { return type; }
}
