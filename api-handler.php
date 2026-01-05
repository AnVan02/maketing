<?php
// Basic configuration
$backend_api_url = "https://caiman-warm-swan.ngrok-free.app/api/v1";

// Support CORS if needed (though on same domain it's usually fine)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, ngrok-skip-browser-warning");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the action/endpoint from the query string
// Example: api-handler.php?endpoint=ai/contents
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No endpoint specified.']);
    exit();
}

// Build the target URL
$target_url = $backend_api_url . '/' . $endpoint;

// Initialize cURL
$ch = curl_init($target_url);

// Forward the request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Forward the request body for POST/PUT/DELETE
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Prepare headers
$headers = [
    'Content-Type: application/json',
    'ngrok-skip-browser-warning: true'
];

// Forward specific headers from the original request
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Execute the request
$response = curl_exec($ch);
$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'cURL Error: ' . $error_msg]);
} else {
    http_response_code($status_code);
    echo $response;
}

curl_close($ch);
