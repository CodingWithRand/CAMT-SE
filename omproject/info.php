<?php

include 'connect.php';

echo "<br>";
echo "MySQLI client info: " . mysqli_get_client_info($conn) . "<br>";
echo "MySQLI client version: " . mysqli_get_client_version() . "<br>";
echo "MySQL server info: " . $conn->server_info . "<br>";
echo "MySQL server version: " . $conn->server_version . "<br>";
echo "MySQL protocol info: ". mysqli_get_proto_info($conn) . "<br>";
echo "MySQL host info: ". $conn->host_info . "<br>";

$conn->close();

?>