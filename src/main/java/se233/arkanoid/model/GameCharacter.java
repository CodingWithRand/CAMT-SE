package se233.arkanoid.model;

import javafx.scene.input.KeyCode;

public class GameCharacter extends GameMoveableObject {
    private KeyCode leftKey;
    private KeyCode rightKey;
    private KeyCode upKey;

    public GameCharacter(/*int id,*/
            int x, int y,
            String imgName,
            int spriteSheetOffsetX, int spriteSheetOffsetY,
            int spriteWidth, int spriteHeight,
            /*int count, int column, int row,*/
            int width, int height,
            KeyCode leftKey,
            KeyCode rightKey,
            KeyCode upKey
    ) {
        super(x, y, imgName, spriteSheetOffsetX, spriteSheetOffsetY, spriteWidth, spriteHeight, width, height);
        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.upKey = upKey;
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
}
