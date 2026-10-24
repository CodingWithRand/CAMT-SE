package se233.arkanoid.event;

import javafx.event.Event;

import javafx.event.EventType;

public class StageChange extends Event {

    // Base EventType
    public static final EventType<StageChange> ANY =
            new EventType<>(Event.ANY, "STAGE_CHANGE_ANY");

    // Specific Stage Change Actions
    public static final EventType<StageChange> NEXT_STAGE =
            new EventType<>(ANY, "NEXT_STAGE");

    public static final EventType<StageChange> PREV_STAGE =
            new EventType<>(ANY, "PREV_STAGE");

    private final int targetStage;

    // Constructor for Next / Prev
    public StageChange(EventType<? extends Event> eventType) {
        super(eventType);
        this.targetStage = -1;
    }

    // Constructor for jumping to a specific stage number
    public StageChange(int targetStage) {
        super(ANY);
        this.targetStage = targetStage;
    }

    public int getTargetStage() {
        return targetStage;
    }
}