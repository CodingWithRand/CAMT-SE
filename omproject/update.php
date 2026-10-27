<?php

include 'connect.php';

$sql = "UPDATE customers SET customer_fax = ? WHERE customer_id = ?";

$fax = "12345678";
$id = 3;

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $fax, $id);
$stmt->execute();

echo "<p>Successfully updated " . $stmt->affected_rows . " record(s)"."</p>";

$stmt->close();
$conn->close();

?>