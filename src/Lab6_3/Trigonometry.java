package Lab6_3;
import java.util.Scanner;

public class Trigonometry {
    public static void main(String[] args){
        Scanner input = new Scanner(System.in);
        System.out.println("Enter the following number to select a trigonometric function");
        System.out.println("1 Sine\n2 Cosine\n3 Tangent\n4 Hyperbolic Sine\n5 Hyperbolic Cosine\n6 Hyperbolic Tangent");
        System.out.print("Select trigonometric function: ");
        int trigFunc = input.nextInt();
        System.out.print("Enter the angle in degree: ");
        double angleDegree = input.nextDouble();
        double angleRadian = Math.toRadians(angleDegree);
        
        switch (trigFunc) {
            case 1:
                System.out.println("sin("+angleDegree+")"+" = " +Math.sin(angleRadian));
                break;
            case 2:
                System.out.println("cos("+angleDegree+")"+" = " +Math.cos(angleRadian));
                break;
            case 3:
                System.out.println("tan("+angleDegree+")"+" = " +Math.tan(angleRadian));
                break;
            case 4:
                System.out.println("sinh("+angleDegree+")"+" = " +Math.sinh(angleRadian));
                break;
            case 5:
                System.out.println("cosh("+angleDegree+")"+" = " +Math.cosh(angleRadian));
                break;
            case 6:
                System.out.println("tanh("+angleDegree+")"+" = " +Math.tanh(angleRadian));
                break;
        
            default:
                System.out.println("Invalid function");
                break;
        }
    }
}
