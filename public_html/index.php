<?php
$tokenFile = __DIR__ . '/../token.txt'; // ✅ fixed path
$validToken = file_exists($tokenFile) ? trim(file_get_contents($tokenFile)) : '';
$providedToken = $_GET['token'] ?? '';

if ($providedToken === $validToken) {
    include 'full.html'; // ✅ Show full version
} else {
    include 'lite.html'; // ❌ Show limited version
}
