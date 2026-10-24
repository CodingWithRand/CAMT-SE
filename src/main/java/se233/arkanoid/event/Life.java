package se233.arkanoid.event;

import javafx.event.Event;

import javafx.event.EventType;

public class Life extends Event {

    // Base EventType
    public static final EventType<Life> ANY =
            new EventType<>(Event.ANY, "LIFE_ANY");

    // Specific Stage Change Actions
    public static final EventType<Life> GAIN =
            new EventType<>(ANY, "GAIN");

    public static final EventType<Life> LOSE =
            new EventType<>(ANY, "LOSE");

    private final int lifeCount;

    // Constructor for Next / Prev
    public Life(EventType<? extends Event> eventType) {
        super(eventType);
        this.lifeCount = -1;
    }

    // Constructor for jumping to a specific stage number
    public Life(int lifeCount) {
        super(ANY);
        this.lifeCount = lifeCount;
    }

    public int getLifeCount() {
        return lifeCount;
    }
}