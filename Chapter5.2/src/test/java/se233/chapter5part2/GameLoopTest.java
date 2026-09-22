package se233.chapter5part2;

import javafx.geometry.Point2D;
import javafx.scene.input.KeyCode;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import se233.chapter5part2.controller.GameLoop;
import se233.chapter5part2.model.Direction;
import se233.chapter5part2.model.Food;
import se233.chapter5part2.model.Snake;
import se233.chapter5part2.view.GameStage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class GameLoopTest {
    private GameStage gameStage;
    private Snake snake;
    private Food food;
    private Food specialFood;
    private GameLoop gameLoop;
//    @BeforeAll
//    public static void initJfxRuntime() {
//        javafx.application.Platform.startup(() -> {});
//    }
    @BeforeEach
    public void setup() {
        gameStage = new GameStage();
        snake = new Snake(new Point2D(0, 0));
        food = new Food(new Point2D(0, 1));
        specialFood = new Food(new Point2D(0, 2), 5);
        gameLoop = new GameLoop(gameStage, snake, food, specialFood);
    }
    private void clockTickHelper() throws Exception {
        ReflectionHelper.invokeMethod(gameLoop, "keyProcess", new Class<?>[0]);
        ReflectionHelper.invokeMethod(gameLoop, "checkCollision", new Class<?>[0]);
        ReflectionHelper.invokeMethod(gameLoop, "redraw", new Class<?>[0]);
    }
    @Test
    public void keyProcess_pressRight_snakeTurnRight_whenSnakeIsGoingDown() throws Exception {
        ReflectionHelper.setField(gameStage, "key", KeyCode.RIGHT);
        ReflectionHelper.setField(snake, "direction", Direction.DOWN);
        clockTickHelper();
        Direction currentDirection = (Direction) ReflectionHelper.getField(snake, "direction");
        assertEquals(Direction.RIGHT, currentDirection);
    }
    @Test
    public void keyProcess_pressRight_snakeDontTurnRight_whenSnakeIsGoingLeft() throws Exception {
        ReflectionHelper.setField(gameStage, "key", KeyCode.RIGHT);
        ReflectionHelper.setField(snake, "direction", Direction.LEFT);
        clockTickHelper();
        Direction currentDirection = (Direction) ReflectionHelper.getField(snake, "direction");
        assertEquals(Direction.LEFT, currentDirection);
    }
    @Test
    public void collided_snakeEatFood_shouldGrowOnce() throws Exception {
        clockTickHelper();
        assertTrue(snake.getLength() > food.getFoodPoint());
        clockTickHelper();
        assertNotSame(food.getPosition(), new Point2D(0, 1));
    }
    @Test
    public void collided_snakeEatSpecialFood_shouldGrowQuintuply() throws Exception {
        clockTickHelper();
        clockTickHelper();
        // there is a normal food above special food, -1 point.
        assertTrue(snake.getLength() - food.getFoodPoint() > specialFood.getFoodPoint());
        clockTickHelper();
        assertNotSame(specialFood.getPosition(), new Point2D(0, 2));
    }
    @Test
    public void collided_snakeHitBorder_shouldDie() throws Exception {
        ReflectionHelper.setField(gameStage, "key", KeyCode.LEFT);
        clockTickHelper();
        Boolean running = (Boolean) ReflectionHelper.getField(gameLoop, "running");
        assertFalse(running);
    }
    @Test
    public void redraw_calledThreeTimes_snakeAndFoodShouldRenderThreeTimes() throws Exception {
        GameStage mockGameStage = Mockito.mock(GameStage.class);
        Snake mockSnake = Mockito.mock(Snake.class);
        Food mockFood = Mockito.mock(Food.class);
        Food mockSpecialFood = Mockito.mock(
                Food.class,
                withSettings().useConstructor(5).defaultAnswer(CALLS_REAL_METHODS)
        );
        GameLoop gameLoop = new GameLoop(mockGameStage, mockSnake, mockFood, mockSpecialFood);
        ReflectionHelper.invokeMethod(gameLoop, "redraw", new Class<?>[0]);
        ReflectionHelper.invokeMethod(gameLoop, "redraw", new Class<?>[0]);
        ReflectionHelper.invokeMethod(gameLoop, "redraw", new Class<?>[0]);
        verify(mockGameStage, times(3)).render(mockSnake, mockFood, mockSpecialFood);
    }
}
