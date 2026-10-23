package se233.arkanoid.model;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import se233.arkanoid.view.GameplayArea;

import java.security.Key;

public class Vaus extends GameCharacter {
    public Vaus() {
        super(
                GameplayArea.GPAREA_WIDTH / 2 - 16,
                GameplayArea.GPAREA_HEIGHT - 40,
                "/se233/arkanoid/assets/Vaus.png",
                32, 0,
                32, 8,
                32, 8,
                KeyCode.LEFT,
                KeyCode.RIGHT,
                KeyCode.UP
        );
        this.setScaleX(2);
        this.setScaleY(2);
    }
}
