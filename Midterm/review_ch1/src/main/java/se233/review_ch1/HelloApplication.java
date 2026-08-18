package se233.review_ch1;

import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.stage.Stage;

import java.io.IOException;

public class HelloApplication extends Application {
    private Object Stringlist;

    /// Note: Hover your cursor on "walkthrough" method name for easier reading (when open in IntelliJ btw.)
    /// # Intro to GUI
    /// Most software has GUI nowadays. <br>
    /// GUI takes user input, process it, and deliver the output to the user promptly, immediately.
    /// # Constructing a GUI
    /// Doing it procedure function way, you would have to write logic from scratch and write more copied code to reuse the GUI element, accounting to when it updates as well. <br>
    /// So, just do it the OOP way, encapsulate methods into an object, reuse those methods when update the element. Extend more functionalities for new element that is based on the old one (Inheritance). And customise behavior for slightly different element (like Ok button and Cancel button) <br>
    /// In this course, we use JavaFX to do GUI in Java.
    /// # Why JavaFX?
    /// 1. It's modern.
    /// 2. Rich features: E.g. CSS-like styling, modern UI components, animations and multimedia support.
    /// 3. Good performance
    /// 4. Actively maintained
    /// 5. Write once run everywhere -> Cross Platform -> applicable to desktop program, web app, mobile app, and embedded iot app.
    /// 6. A tool available to easily construct UI (drag-and-drop) -> SceneBuilder
    /// # JavaFX GUI Structure/Anatomy/Hierarchy
    /// It's like HTML DOM. Each element is a DOM/Node, with parent-child relationship to other nodes
    /// ## Structure Tree
    /// ```
    /// Application ->   Stage  (The entire thing including the close-resize-button-bar)
    ///                    |
    ///                  Scene  (The entire thing excluding the close-resize-button-bar -> main blank white zone for visual elements)
    ///                    |
    ///                   HBox    (Element hierarchy, not fixated I think.)
    ///                    |
    ///            Group ------ VBox
    ///                .
    ///                .
    ///                .
    /// ```
    /// Look like a DOM tree right? Well, it may be called *scene graph* here. <br>
    /// Scene graph does
    /// 1. Rendering UI elements.
    /// 2. (User) Event handling.
    /// ## Node Types
    /// 1. Interactive: Button, text fields, slider
    /// 2. Visual: Label, Shape e.g. Circle, Image
    /// 3. Layout/Container: Pane, StackPane, GridPane, HBox, VBox, etc.
    ///
    /// Of course those nodes properties are customizable just like how you edit css style or set innerHTML of a DOM through javascript <br>
    /// Those properties setting/getting are quite straightforward in name, but if some are not, I have added the comment entailed the code.
    /// ## How position work
    /// ```
    ///           (0,0) <-- (x,y) The position of that element (in the center) when placed into a Pane
    ///             ._________    which doesn't automatically set position according to the preset alignment
    ///             |
    ///             |   screen or container element (different story for aligned elements)
    ///             |
    ///             |
    /// ```
    /// # Event
    /// GUI program will have "user interaction", they would do things like moving mouse cursor, clicking something, dragging something, for example. <br>
    /// It's not merely inputting some text like in CLI program. <br>
    /// Event is the term describing those "user interaction", but at the same time, it also describes interactions between systems too. <br>
    /// User Interaction -> Foreground <br>
    /// System Interaction -> Background
    /// ## Terms
    /// 1. Event source: a gui element for user interaction. it generates event from that user intarction.
    /// 2. Event listener: an object that listen to the event emitted from a specific component. it is registered to the event source.
    /// 3. Event handler: a method containing logic to process that event/user interaction and produce expected output/behavior.
    ///
    /// I will point out what is what in the code later. <br>
    /// With all those term combines, when we implement them in code, that's what it's called "Event Driven Programming" <br>
    /// Each task is distributed to each event listener/handler. You might even call that a "sub program" as the handler will only work when certain event/user interaction trigger it. <br>
    /// The work of small task/sub program in the program build up the functionality of the main program.
    /// ## GUI event process loop
    /// (Queued up) Event -> Event Listener -> `Process` -> Change GUI object properties -> Show changed GUI to user.
    /// ## State
    /// > "A data/information that can be changed/manipulated during the program runtime."
    ///
    /// You may think of React's useState(). Nah, not a lot would relate to that. <br>
    /// Nvm, I'll point it out in the code again.
    public void walkthrough(Stage stage) throws IOException {
//        Load constructed UI from fxml file, not using it now.
//        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("hello-view.fxml"));
//        Scene scene = new Scene(fxmlLoader.load(), 320, 240);
        ScrollPane root = new ScrollPane();
        root.setFitToWidth(true);
//        root.setFitToHeight(true);
        Scene scene = new Scene(root, 320, 400);

        StackPane everything = new StackPane();

        // Example container element -> HBox, VBox
        HBox container = new HBox();
        container.setAlignment(Pos.CENTER); // Set the children in this container alignment to center.
        container.setBackground(Background.fill(Color.AQUA));
        container.setStyle("-fx-min-width: 200"); // JavaFX CSS-like styling.
        container.setMaxWidth(200); // Or use its method directly.
        container.setStyle("-fx-max-height: 120;");
        container.setMinHeight(100);

        // Example visual element -> Label
        Label testLabel1 = new Label();
        testLabel1.setText("Mr/Mrs/Ms");
        testLabel1.setTranslateX(10);
        testLabel1.setTranslateY(-30);
        Label testLabel2 = new Label();
        testLabel2.setText("Name Surname");
        testLabel2.setTranslateX(40);
        testLabel2.setTranslateY(-30);
        // node.getChildren() gives you a list of children of the node.
        container.getChildren().addAll(testLabel1, testLabel2); // add multiple children to the container

        // Example interactive element -> Button
        Button testBtn = new Button();
        testBtn.setText("Test");
        testBtn.setTranslateX(-60);
        testBtn.setTranslateY(10);
        testBtn.setBorder(Border.stroke(Color.BLUE));
        container.getChildren().add(testBtn); // add one child to the container (the parent)

        /*
        setAlignment on parent set the alignment position for all children of that parent.
        (Pos.CENTER, Pos.CENTER_LEFT, Pos.CENTER_RIGHT, Pos.TOP_CENTER, Pos.TOP_LEFT, Pos.TOP_RIGHT, Pos.BASELINE_*, Pos.BOTTOM_*)
        setTranslateX and setTranslateY set position of element for VBox, HBox, GridPane, StackPane, BorderPane, etc.
        -> The container element that automatically set position according to the alignment, I guess.)
        setLayoutX and setLayoutY set position of element for Pane
        -> The container element that doesn't automatically set position.

        Position value is relative to the container itself, whether it's getTranslateX, getTranslateY, getLayoutX, or getLayoutY
         */

        // Event playground

        /*
        Following events will be demonstrated in order.
        1. onMouseClicked
        2. onDragDetected
        3. onMouseDragged
        4. onMousePressed
        5. onMouseReleased
        6. onMouseDragOver
        7. onMouseDragReleased
        8. onMouseDragEntered
        9. onMouseDragExited
        10. onMouseEntered
        11. onMouseExited
        12. onMouseMoved
         */
        VBox btnContainer = new VBox();
        btnContainer.setTranslateY(120);
        btnContainer.setAlignment(Pos.CENTER);
        btnContainer.setStyle("-fx-background-color: pink");

        Label title = new Label();
        title.setText("Event playground");

        // onMouseClicked, just click and do stuff.
        Button click = new Button();
        click.setText("Click");
        click.setOnMouseClicked(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Hi");
                alert.setHeaderText("Greeting");
                alert.showAndWait();
            }
        });

        /* Here, "click" is an event source
         *       new EventHandler<MouseEvent>() is an event listener (an annonymous class)
         *       public void handle(MouseEvent event) is an event handler
         */

        btnContainer.getChildren().addAll(title, click);

        Pane layoutAvailable = new Pane();
        layoutAvailable.setStyle("-fx-background-color: green");
        Circle circle = new Circle(20);

        // onDragDetected, the object is about to be dragged, trigger it.
        circle.setOnDragDetected(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                System.out.println("Start dragging");
                circle.startFullDrag(); // REQUIRE TO FULFILL OTHER DRAG EVENTS!!! (Signal for the receiver end)
                circle.setMouseTransparent(true); // REQUIRE, the element itself block the other element event listener.
            }
        });

        // onMouseDragged, hold click and move the cursor (aka drag), and do stuff while the cursor move.
        circle.setOnMouseDragged(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                /* Here is an example of State -> The layout property of "circle"
                 1. circle store its layout position.
                 2. every "mouse drag", the layout position gets updated with the code below.
                 3. the ui update, making the circle to move when "mouse dragged"

                 Uhm actually, that may apply to our own "declared variable" more than what I mentioned.
                 */
                circle.setLayoutX(event.getSceneX());
                circle.setLayoutY(event.getSceneY() - (240 - layoutAvailable.getLayoutY() - circle.getRadius()));
            }
        });

        // onMousePressed, just press the left button on the mouse, hold it there.
        circle.setOnMousePressed(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                System.out.println("Press on the circle, drag?");
            }
        });

        // onMouseReleased, you stop pressing the left button on the mouse.
        circle.setOnMouseReleased(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                System.out.println("Release it to the wild...");
                circle.setMouseTransparent(false);
            }
        });

        Pane tray = new Pane();
        tray.setLayoutX(100);
        tray.setLayoutY(0);
        tray.setMinWidth(50);
        tray.setMinHeight(50);
        tray.setMaxWidth(50);
        tray.setMaxHeight(50);
        tray.setStyle("-fx-background-color: yellow");

        // onMouseDragOver, while dragging something over this (tray) it gets triggered EVERYTIME the dragging item move.
        // Note: That dragging element need to have startFullDrag() and setMouseTransparent(true) in order to trigger this.
        tray.setOnMouseDragOver(new EventHandler<MouseDragEvent>() {
            @Override
            public void handle(MouseDragEvent event) {
                System.out.println("circle over tray.");
            }
        });

        // onMouseDragReleased, do something after that dragging element stop being dragged in tray area.
        // Note: That dragging element need to have startFullDrag() and setMouseTransparent(true) in order to trigger this.
        tray.setOnMouseDragReleased(new EventHandler<MouseDragEvent>() {
            @Override
            public void handle(MouseDragEvent event) {
                System.out.println("placed in the tray.");
            }
        });

        tray.getChildren().add(new Label("Tray (onMouseDragOver)"));

        Pane gate = new Pane();
        gate.setLayoutX(150);
        gate.setLayoutY(60);
        gate.setMinWidth(30);
        gate.setMinHeight(50);
        gate.setMaxWidth(30);
        gate.setMaxHeight(50);
        gate.setStyle("-fx-background-color: beige");

        // onMouseDragEntered, while dragging something over this (gate) it gets triggered once.
        // Note: That dragging element need to have startFullDrag() and setMouseTransparent(true) in order to trigger this.
        gate.setOnMouseDragEntered(new EventHandler<MouseDragEvent>() {
            @Override
            public void handle(MouseDragEvent event) {
                System.out.println("enter gate");
            }
        });

        // onMouseDragExited, while dragging something leave this (gate) it gets triggered once.
        // Note: That dragging element need to have startFullDrag() and setMouseTransparent(true) in order to trigger this.
        gate.setOnMouseDragExited(new EventHandler<MouseDragEvent>() {
            @Override
            public void handle(MouseDragEvent event) {
                System.out.println("leave gate");
            }
        });

        gate.getChildren().add(new Label("Gate"));

        Pane sensor = new Pane();
        sensor.setLayoutY(150);
        sensor.setLayoutX(150);
        sensor.setMinWidth(80);
        sensor.setMinHeight(80);
        sensor.setMaxWidth(80);
        sensor.setMaxHeight(80);
        sensor.setStyle("-fx-background-color: red;");

        Label coord = new Label();
        coord.setTranslateY(20);

        // onMouseEntered, trigger when cursor enter the event source area.
        sensor.setOnMouseEntered(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                System.out.println("sensor detected cursor.");
                coord.setText("Cursor in");
            }
        });

        // onMouseExited, trigger when cursor leaves the event source area.
        sensor.setOnMouseExited(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                System.out.println("sensor no longer detected cursor");
                coord.setText("Cursor out");
            }
        });

        // onMouseMoved, trigger when cursor MOVE in the event source area.
        sensor.setOnMouseMoved(new EventHandler<MouseEvent>() {
            @Override
            public void handle(MouseEvent event) {
                coord.setText("Cursor at: (" + event.getScreenX() + ", " + event.getScreenY() + ")");
            }
        });

        sensor.getChildren().addAll(coord, new Label("cursor sensor"));

        layoutAvailable.getChildren().addAll(tray, gate, sensor, circle);

        btnContainer.getChildren().add(layoutAvailable);

        everything.getChildren().add(container);
        everything.getChildren().add(btnContainer);

        root.setContent(everything);

        // add the constructed ui scene to the stage, and show it.
        stage.setTitle("Intro");
        stage.setScene(scene);
        stage.show();
    }

    class LV {
        ListView<String>lV;

        LV() {
            lV= new ListView<String>();

            lV.setPrefSize(200,200);
            lV.setOnDragDetected(new EventHandler<MouseEvent>(){
                public void handle(MouseEvent event) {
                    Dragboard dragboard = lV.startDragAndDrop(TransferMode.MOVE); // Create dragboard, tell the system you'll MOVE the data.
                    String selectedItems =lV.getSelectionModel().getSelectedItem(); // get that data.
                    ClipboardContent content=new ClipboardContent();
                    content.putString(selectedItems);
                    // put the data in ClipboardContent and then in dragboard.
                    dragboard.setContent(content);
                }
            });
            lV.setOnDragOver(new EventHandler <DragEvent>(){
                public void handle(DragEvent event){
                    Dragboard dragboard = event.getDragboard();
                    // Make the decision whether to accept this drop with the intention to MOVE data or not.
                    if (/*event.getGestureSource()!=lV &&*/dragboard.hasString()){
                        // Accept the drop. Logic in onDragDropped will work.
                        event.acceptTransferModes(TransferMode.MOVE);
                    } else {
                        // Reject the drop. Logic in onDragDropped will not work.
                    }
                }
            });
            lV.setOnDragDropped(new EventHandler<DragEvent>(){
                public void handle(DragEvent event){
                    boolean dragCompleted =false;
                    Dragboard dragboard = event.getDragboard(); // pull out the dragboard.
                    if(dragboard.hasString()){
                        String list =dragboard.getString(); // pull out the data in the dragboard.
                        lV.getItems().addAll(list); // do something with it. in this case, add it to the new list element.
                        dragCompleted= true;
                    }
                    event.setDropCompleted(dragCompleted); // mark the drop as completed.
                }
            });
            lV.setOnDragDone(new EventHandler <DragEvent>(){
                public void handle(DragEvent event){
                    lV.getItems().remove(lV.getSelectionModel().getSelectedItem());
                    // Clean up. Remove the MOVED data from the original list.
                    // Note: TransferMode ONLY tells the system what will you do with the data in the dragboard, it doesn't actually do it for you, so you will have to add the logic to ACTUALLY do it here yourself.
                }
            });
        }
    }

    /// # Application: Drag & Drop
    /// > When drag something from one gui element and drop on another gui element, how do you transfer data from one to another?
    ///
    /// ## Introduce Dragboard
    /// When user start dragging the element, the element detect dragging (onDragDetected)...
    /// 1. Create a dragboard.
    /// 2. Store data in the dragboard
    /// 3. User drop the dragging element
    /// 4. The other element it dropped on decide whether to accept the drop or make this drop a success or not. (The decision was made before the drop -> onDragOver)
    /// 5. If success, do dropped logic on that element (onDragDropped), pull out the dragboard again, retrieve the data inside it, and do whatever you want with it.
    /// 6. Clean up or additional logic in onDragDone after finished all the previous steps.
    ///
    /// View [LV] class for explanation in code implementation. I have put some annotations there.
    public void dragndropwdatatransfer(Stage stage) throws IOException {
        StackPane root = new StackPane();
        Scene scene = new Scene(root, 500, 500);

        LV source = new LV();
        LV target = new LV();
        source.lV.getItems().addAll("ToTDTHL", "ToINE", "STONE:R", "ToMH", "ToID", "ToW");
        GridPane gridPane = new GridPane();
        gridPane.addRow(1, source.lV, target.lV);
        root.getChildren().add(gridPane);
        stage.setTitle("Drag & Drop");
        stage.setScene(scene);
        stage.show();
    }

    /// # More event: Keyboard event.
    /// Unlike mouse related event (click, drag, drop), there is no clear event source. <br>
    /// Event source for mouse event can be determined from the position of the cursor on screen, but there is no indicator for keyboard event. <br>
    /// Hence, we bound the event to the Scene.
    public void keyboard(Stage stage) throws IOException {
        StackPane root = new StackPane();
        Scene scene = new Scene(root, 400, 50);

        root.getChildren().add(new Label("Keyboard Event. Try to press F, and see the console."));
        // onKeyPressed, press a key and it triggers.
        scene.setOnKeyPressed(new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent event) {
                if(event.getCode() == KeyCode.F) System.out.println("F to pay respect.");
            }
        });
        // onKeyReleased, released (stop pressing) a key and it triggers.
        scene.setOnKeyReleased(new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent event) {
                if(event.getCode() == KeyCode.F) System.out.println("Hey, you insolent brat! 😡");
            }
        });

        stage.setTitle("Keyboard Event");
        stage.setScene(scene);
        stage.show();
    }

    @Override
    public void start(Stage stage) throws IOException {
        // For better reading/reviewing experience, please read the text from when you are hovering the method or class name, as it's written in markdown and javadoc.
        // Only call one function here, comment the other.
        // Intro to Event Driven Programming
        walkthrough(stage);
        // Drag & Drop
        dragndropwdatatransfer(stage);
        // Keyboard Event
        keyboard(stage);

        /*
         Btw, a bit of advice. DO NOT PUT EVERYTHING IN HERE LIKE I DID IN THE REAL PROJECT.
         At least have some architect man. Easy one would be MVC.
         M - Model: Data; data structure class.
         V - View: GUI construction code or .fxml file.
         C - Controller: Code that actually does the job for the app functionality. E.g. you may put those anonymous class event listener in the Controller folder.

         Finally, Ch.1 is finished omg.
         */
    }
}
