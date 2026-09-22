package se233.chapter5part2.model;

import javafx.geometry.Point2D;
import se233.chapter5part2.view.GameStage;

import java.util.Random;

public class Food {
    private Point2D position;
    private Random rn;
    private int point;

    public Food(Point2D position, int point) {
        this.point = point;
        this.rn = new Random();
        this.position = position;
    }
    public Food(Point2D position) {
        this.point = 1;
        this.rn = new Random();
        this.position = position;
    }
    public Food(int point) {
        this.point = point;
        this.rn = new Random();
        this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
    }
    public Food() {
        this.point = 1;
        this.rn = new Random();
        this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
    }
    public void respawn() {
        Point2D prev_position = this.position;
        do {
            this.position = new Point2D(rn.nextInt(GameStage.WIDTH), rn.nextInt(GameStage.HEIGHT));
        } while (prev_position == this.position);
    }
    public Point2D getPosition() {
        return position;
    }
    public int getFoodPoint() { return point; }
}
