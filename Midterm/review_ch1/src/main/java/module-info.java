module se233.review_ch1 {
    requires javafx.controls;
    requires javafx.fxml;


    opens se233.review_ch1 to javafx.fxml;
    exports se233.review_ch1;
}