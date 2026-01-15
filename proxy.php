<?php

/**
 * PROXY.PHP - CORS WORKAROUND
 * Sử dụng tạm thời khi backend chưa cấu hình CORS cho localhost
 */

// Cho phép CORS

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Lấy endpoint từ query string
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Nếu không có endpoint, trả lỗi
if (empty($endpoint)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing endpoint parameter']);
    exit;
}

// Xây dựng URL đầy đủ
$baseUrl = 'https://dvcendpoint.rosachatbot.com/api/v1';
$targetUrl = $baseUrl . $endpoint;


// Debug: Log URL
error_log("Proxy request to: " . $targetUrl);

// Lấy method và body
$method = $_SERVER['REQUEST_METHOD'];
$inputData = file_get_contents('php://input');

// Chuẩn bị headers
$headers = [
    'Content-Type: application/json',
    'Accept: application/json'
];

// Forward cookies nếu có
if (isset($_SERVER['HTTP_COOKIE'])) {
    $headers[] = 'Cookie: ' . $_SERVER['HTTP_COOKIE'];
}

// Khởi tạo cURL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $targetUrl,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_FOLLOWLOCATION => true
]);

// Gửi body nếu có
if ($method !== 'GET' && !empty($inputData)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
}

// Thực hiện request
$response = curl_exec($ch);

// Kiểm tra lỗi cURL
if (curl_errno($ch)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'cURL Error: ' . curl_error($ch),
        'target_url' => $targetUrl
    ]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

// Tách header và body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

curl_close($ch);

// Forward Set-Cookie headers
preg_match_all('/^Set-Cookie:\s*([^\r\n]*)/mi', $responseHeaders, $matches);
foreach ($matches[1] as $cookie) {
    header('Set-Cookie: ' . $cookie, false);
}

// Trả về response
http_response_code($httpCode);
header('Content-Type: application/json');
echo $responseBody;

// Debug log
error_log("Response code: " . $httpCode);
