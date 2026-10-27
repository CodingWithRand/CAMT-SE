<?php

// Data for mysql connection.

$servername = "localhost";
$username = "root"; // mysql user
$password = "1234"; // the password
$dbname = "om"; // selecting database

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // tell mysql to throw exception whenever error occurred.

try {
    $conn = new mysqli($servername, $username, $password, $dbname); // connect
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    echo mysqli_connect_errno() . ": " . mysqli_connect_error();
    die("Connection failed: " . $e->getMessage());
}

echo "Connected successfully!";

// $conn->close();

?>