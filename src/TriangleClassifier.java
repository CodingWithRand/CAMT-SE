import java.util.Scanner;

public class TriangleClassifier {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter length of side 1: ");
        double side1 = input.nextDouble();
        System.out.print("Enter length of side 2: ");
        double side2 = input.nextDouble();
        System.out.print("Enter length of side 3: ");
        double side3 = input.nextDouble();

        // Validate a triangle from Triangle Inequality Theorem
        
        // Without logic operators
        if(side1 + side2 > side3){
            if(side1 + side3 > side2){
                if(side2 + side3 > side1){
                    if(side1 == side2){
                        if(side1 == side3){
                            System.out.println("The sides form a Equilateral triangle.");
                        } else {
                            System.out.println("The sides form a Isosceles triangle.");
                        }
                    } else if (side2 == side3) {
                        System.out.println("The sides form a Isosceles triangle.");
                    } else if (side3 == side1) {
                        System.out.println("The sides form a Isosceles triangle.");
                    } else {
                        System.out.println("The sides form a Scalene triangle.");
                    }
                } else {    
                    System.out.println("These sides cannot form a valid triangle");
                }
            } else {
                System.out.println("These sides cannot form a valid triangle");
            }
        } else {
            System.out.println("These sides cannot form a valid triangle");
        }

        // With logic operators
        
        // if(side1 + side2 > side3 && side1 + side3 > side2 && side2 + side3 > side1){
        //     if(side1 == side2 && side1 == side3 && side2 == side3){
        //         System.out.println("The sides form a Equilateral triangle.");
        //     }else if(side1 == side2 || side1 == side3 || side2 == side3){
        //         System.out.println("The sides form a Isosceles triangle.");
        //     }else{
        //         System.out.println("The sides form a Scalene triangle.");
        //     }
        // }else{
        //     System.out.println("These sides cannot form a valid triangle");
        // }
    }
}