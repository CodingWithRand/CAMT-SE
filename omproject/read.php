
<body style="background-color: yellow">
<?php
include 'connect.php';

// $conn->select_db("ap_extra");

$sql = "SELECT customer_id, customer_first_name, customer_last_name, customer_fax FROM customers";
try {
    $result = $conn->query($sql);
} catch (mysqli_sql_exception $e) {
    die("<br>" . $conn->sqlstate . "<br>" . $conn->errno . " " . mysqli_error($conn));
}

if ($result->num_rows > 0) {
    // fetch_assoc return rows as json/dict with the column name as dict key.
    // while ($row = $result->fetch_assoc()) {
    //     echo "ID: " . $row["customer_id"] . ", Name: "
    //         . htmlspecialchars($row["customer_first_name"]) . " " . htmlspecialchars($row["customer_last_name"]) . " Fax: " . htmlspecialchars($row["customer_fax"]) . "<br>";
    // }
    //htmlspecialchars prevent xss
    echo $result->num_rows . " results";

    // fetch_row return rows as an array, the column name becom index of where that column name was in order insted.
    while ($row = $result->fetch_row()) {
        echo $row[1] . "<br>";
    }

    // Roll back the fetched index to 0 (like nothing has been fetched yet.)
    $result->data_seek(0);
    echo "<br><br>";
    
    // fetch_array fetch NEXT row that is yet to be fetched.
    // (Mode: MYSQLI_NUM -> fetch_row, MYSQLI_ASSOC -> fetch_assoc, MYSQLI_BOTH -> fetch_row and fetch_assoc)

    // uncomment below code -> output Korah Yash Yash
    // $row = $result->fetch_assoc();
    // echo $row["customer_first_name"];

    // This alone will output Korah Korah
    $row = mysqli_fetch_array($result,MYSQLI_BOTH);
    $results[] = $row;

    echo $results[0][1] . " " . $results[0]["customer_first_name"];
    
    // Fields' lengths of the current row
    echo mysqli_fetch_lengths($result)[1];

    // fetch_all return rows as an array, the column name becom index of where that column name was in order insted.
    // (Mode: MYSQLI_NUM -> fetch_row, MYSQLI_ASSOC -> fetch_assoc, MYSQLI_BOTH -> fetch_row and fetch_assoc)

    $rows = $result->fetch_all(MYSQLI_ASSOC);
    foreach ($rows as $row) {
        printf("%s %s<br>", $row["customer_first_name"], $row["customer_last_name"]);
    }
    
} else {
    echo "0 results";
}


$result->free();
$conn->close();

?>
</body>