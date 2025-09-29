package Lab11_1;

public class StudentGradeStatistics {
    public static void main(String[] args) {
        int[] studentsScore = new int[100];
        for(int i = 0; i<studentsScore.length; i++){
            studentsScore[i] = (int) (Math.random() * 100);
        }

        int[] studentsNumberInEachGrade = new int[5];

        for(int score: studentsScore) {
            if(score<=100 && score>=80) studentsNumberInEachGrade[0]++;
            else if(score<80 && score>=70) studentsNumberInEachGrade[1]++;
            else if(score<70 && score>=60) studentsNumberInEachGrade[2]++;
            else if(score<60 && score>=50) studentsNumberInEachGrade[3]++;
            else if(score<50 && score>=0) studentsNumberInEachGrade[4]++;
        }

        String prefix = "";

        for(int i = 0; i<studentsNumberInEachGrade.length; i++){
            switch(i){
                case 0: prefix = "Student got A >> "; break;
                case 1: prefix = "Student got B >> "; break;
                case 2: prefix = "Student got C >> "; break;
                case 3: prefix = "Student got D >> "; break;
                case 4: prefix = "Student got F >> "; break;
            }
            
            System.out.println(prefix + studentsNumberInEachGrade[i]);
        }
    }
}
