<?php

include 'connect.php';

$sql = "INSERT INTO customers (customer_id, customer_first_name, customer_last_name, customer_address, customer_city, customer_state, customer_zip, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$id = 26; $first = "Antony"; $last = "Lee"; $address = "123 Tally";
$city = "Texas"; $state = "US"; $zip = "14725"; $phone = "025723458";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isssssss", $id, $first, $last, $address, $city, $state, $zip, $phone);
$stmt->execute();

echo "<p>Successfully created " . $stmt->affected_rows . " record(s)"."</p>";

$stmt->close();
$conn->close();

?>