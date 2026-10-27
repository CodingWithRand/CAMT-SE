<?php
include 'connect.php';

$sql = "DELETE FROM customers WHERE customer_id = ?";

$id = 26;

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();

echo "<p>Successfully deleted " . $stmt->affected_rows . " record(s)"."</p>";

$stmt->close();
$conn->close();