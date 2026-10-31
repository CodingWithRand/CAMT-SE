package se233.arkanoid.model;

/**
 * Custom exception thrown when stage configuration files, brick layouts,
 * or saved player state data are malformed, missing, or invalid.
 */
public class InvalidStageDataException extends Exception {

    private final String resourceName;

    public InvalidStageDataException(String resourceName, String message) {
        super("Error loading resource [" + resourceName + "]: " + message);
        this.resourceName = resourceName;
    }

    public String getResourceName() {
        return resourceName;
    }
}