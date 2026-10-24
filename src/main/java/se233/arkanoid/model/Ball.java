package se233.arkanoid.model;

import se233.arkanoid.view.GameplayArea;

public class Ball extends GameMoveableObject {
    public Ball() {
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
    }
}
