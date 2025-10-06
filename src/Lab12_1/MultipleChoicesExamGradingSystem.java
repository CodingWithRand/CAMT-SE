package Lab12_1;

public class MultipleChoicesExamGradingSystem {
    public static void main(String[] args) {
        char[][] answers = {
            {'A', 'B', 'A', 'C', 'C', 'D', 'E', 'E', 'A', 'D'},
            {'D', 'B', 'A', 'B', 'C', 'A', 'E', 'E', 'A', 'D'},
            {'E', 'D', 'D', 'A', 'C', 'B', 'E', 'E', 'A', 'D'},
            {'C', 'B', 'A', 'E', 'D', 'C', 'E', 'E', 'A', 'D'},
            {'A', 'B', 'D', 'C', 'C', 'D', 'E', 'E', 'A', 'D'},
            {'B', 'B', 'E', 'C', 'C', 'D', 'E', 'E', 'A', 'D'},
            {'B', 'B', 'A', 'C', 'C', 'D', 'E', 'E', 'A', 'D'},
            {'E', 'B', 'E', 'C', 'C', 'D', 'E', 'E', 'A', 'D'}
        };
        char[] correctAnswers = {'D', 'B', 'D', 'C', 'C', 'D', 'A', 'E', 'A', 'D'};

        for(int nthStudent = 0; nthStudent < answers.length; nthStudent++){
            int correctCount = 0;
            for(int nthQuestion = 0; nthQuestion < answers[nthStudent].length; nthQuestion++)
                if(answers[nthStudent][nthQuestion] == correctAnswers[nthQuestion]) correctCount++;
            System.out.println("Student " + nthStudent + "'s correct count is " + correctCount);
        }
    }
}
