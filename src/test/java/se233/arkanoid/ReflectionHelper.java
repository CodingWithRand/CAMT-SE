package se233.arkanoid;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;

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

    public static Object executeMethod(Object target, String methodName, Object... args) {
        try {
            Class<?> clazz = target.getClass();
            Method targetMethod = findMatchingMethod(clazz, methodName, args);

            if (targetMethod == null) {
                throw new NoSuchMethodException("No matching method found for " + methodName +
                        " with args " + Arrays.toString(args));
            }

            targetMethod.setAccessible(true);
            return targetMethod.invoke(target, args);
        } catch (Exception e) {
            throw new RuntimeException("Could not execute private method: " + methodName, e);
        }
    }

    private static Method findMatchingMethod(Class<?> clazz, String methodName, Object[] args) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            for (Method method : current.getDeclaredMethods()) {
                if (method.getName().equals(methodName) && isCompatible(method.getParameterTypes(), args)) {
                    return method;
                }
            }
            current = current.getSuperclass();
        }
        return null;
    }

    private static boolean isCompatible(Class<?>[] paramTypes, Object[] args) {
        if (paramTypes.length != args.length) {
            return false;
        }
        for (int i = 0; i < paramTypes.length; i++) {
            if (args[i] == null) continue; // null matches any reference type

            Class<?> param = paramTypes[i];
            Class<?> arg = args[i].getClass();

            if (!isAssignable(param, arg)) {
                return false;
            }
        }
        return true;
    }

    private static boolean isAssignable(Class<?> targetType, Class<?> sourceType) {
        if (targetType.isAssignableFrom(sourceType)) return true;

        // Primitive unboxing checks
        if (targetType == long.class && sourceType == Long.class) return true;
        if (targetType == int.class && sourceType == Integer.class) return true;
        if (targetType == double.class && sourceType == Double.class) return true;
        if (targetType == float.class && sourceType == Float.class) return true;
        if (targetType == boolean.class && sourceType == Boolean.class) return true;
        if (targetType == byte.class && sourceType == Byte.class) return true;
        if (targetType == char.class && sourceType == Character.class) return true;
        if (targetType == short.class && sourceType == Short.class) return true;

        return false;
    }
}