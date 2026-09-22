package se233.chapter5part1;

import javafx.scene.input.KeyCode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import se233.chapter5part1.model.Keys;

import static org.junit.jupiter.api.Assertions.*;

public class KeysTest {
    private Keys keys;

    @BeforeAll
    public static void initJfxRuntime() {
        javafx.application.Platform.startup(() -> {});
    }

    @BeforeEach
    public void setup() throws NoSuchFieldException {
        keys = new Keys();
    }

    @Test
    public void singleKeyPressed_shouldAddTheKeyToObjectState_checkingThroughIsPressed() {
        // supposed press key W
        keys.add(KeyCode.W);
        // check if W key is pressed or not (used in character controlling)
        assertTrue(keys.isPressed(KeyCode.W));
    }

    @Test
    public void multipleKeysPressed_shouldAddAllTheKeysToObjectState_checkingThroughIsPressed() {
        // supposed press key W and D at the same time.
        keys.add(KeyCode.W);
        keys.add(KeyCode.D);
        // check if W key and D key are pressed at the same time or not (used in character controlling)
        assertTrue(keys.isPressed(KeyCode.W) && keys.isPressed(KeyCode.D));
    }
}
