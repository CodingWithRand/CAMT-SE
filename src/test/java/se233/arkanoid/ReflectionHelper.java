package se233.arkanoid;

import java.lang.reflect.Field;

public class ReflectionHelper {
    public static Object getField(Object target, String fieldName) {
        try {
            Field field = getFieldRecursive(target.getClass(), fieldName);
            field.setAccessible(true);
            return field.get(target);
        } catch (Exception e) {
            throw new RuntimeException("Could not get private field: " + fieldName, e);
        }
    }

    public static void setField(Object target, String fieldName, Object value) {
        try {
            Field field = getFieldRecursive(target.getClass(), fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Could not set private field: " + fieldName, e);
        }
    }

    // Helper to find fields in superclasses (e.g. GameCharacter fields from Vaus)
    private static Field getFieldRecursive(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        throw new NoSuchFieldException("Field " + fieldName + " not found in " + clazz.getName() + " or its superclasses.");
    }
}