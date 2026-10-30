package se233.arkanoid;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
@Suite
@SelectClasses({GameCharacterTest.class, GameLoopTest.class, BallTest.class, GameStateAndBrickTest.class,BrickCollisionAndScoreTest.class, BallTest.class, UpgradeManagerTest.class})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class JUnitTestSuite {
    @BeforeAll
    public static void initJfxRuntime() {

        javafx.application.Platform.startup(() -> {});}
}
