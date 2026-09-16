package se233.chapter5part2.model;

import javafx.geometry.Point2D;

public enum Direction {
    RIGHT(new Point2D(1, 0)),
    LEFT(new Point2D(-1, 0)),
    UP(new Point2D(0, -1)),
    DOWN(new Point2D(0, 1));
    public final Point2D current;
    Direction(Point2D current) { this.current = current; }
}
