module se233.review_ch3 {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.logging;


    exports se233.review_ch3;
    exports se233.review_ch3.new_multi;
    exports se233.review_ch3.old;
    opens se233.review_ch3 to javafx.fxml;
    opens se233.review_ch3.old to javafx.fxml;
    opens se233.review_ch3.new_multi to javafx.fxml;
}