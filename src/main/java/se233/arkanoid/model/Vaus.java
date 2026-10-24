package se233.arkanoid.model;

import javafx.geometry.Rectangle2D;
import javafx.scene.input.KeyCode;
import se233.arkanoid.view.GameplayArea;

public class Vaus extends GameCharacter {
    private int spriteFrame;
    private long lastFrameTime;
    private final int idleAnimationFrameRate = 5;
    private final float frameInterval = 1000.0f / idleAnimationFrameRate;

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
    }

    public void fire() {

    }

    public void interpolate(long now) {
        if (lastFrameTime == 0) {
            System.out.println('a');
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
            this.imageView.setViewport(new Rectangle2D(32, spriteFrame * 8, 32, 8));
            lastFrameTime = now;
        }
    }
}
