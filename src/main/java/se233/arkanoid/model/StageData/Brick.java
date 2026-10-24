package se233.arkanoid.model.StageData;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Pane;

public class Brick extends Pane {

    private final BrickType type;
    private final ImageView imageView;
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
        if (hp == -1) return false; // Unbreakable
        hp--;
        return hp <= 0; // Returns true if destroyed
    }

    public BrickType getType() { return type; }
}
