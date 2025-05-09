<?php
$token = bin2hex(random_bytes(4)); // 8-character token
file_put_contents(__DIR__ . '/../token.txt', $token);

// Optional: email it
$to = "contact@3d-farmers.com";
$subject = "New Access Token for Loop Modifier";
$message = "Your new token is: $token\n\nURL: https://loop.3d-farmers.com?token=$token";
mail($to, $subject, $message);
