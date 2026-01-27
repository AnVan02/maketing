<?php
// Tắt báo lỗi để không làm hỏng dữ liệu JSON trả về
error_reporting(0);

// 1. Cấu hình CORS chấp nhận Cookie
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$endpoint = $_GET['endpoint'] ?? '';
if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing endpoint']);
    exit;
}

$baseUrl = 'https://dvcendpoint.rosachatbot.com/api/v1';
$targetUrl = $baseUrl . $endpoint;

/**
 * HÀM GỬI REQUEST ĐÃ CẢI TIẾN
 */
function sendRequest($url, $method, $data, $token = null, $contentType = 'application/json')
{
    $headers = ['Accept: application/json'];
    
    // Nếu là multipart và data là mảng, cURL sẽ tự set boundary.
    // Nhưng ở đây Proxy đang xây dựng string body ($data là string), nên bắt buộc phải gửi Content-Type kèm boundary.
    $headers[] = 'Content-Type: ' . $contentType;

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT => 20
    ]);

    // CHUYỂN TIẾP TẤT CẢ COOKIE TỪ TRÌNH DUYỆT ĐẾN BACKEND
    if (isset($_SERVER['HTTP_COOKIE'])) {
        curl_setopt($ch, CURLOPT_COOKIE, $_SERVER['HTTP_COOKIE']);
    }

    if ($method !== 'GET' && !empty($data)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }

    curl_setopt($ch, CURLOPT_HEADER, true);
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Request: $method $url\n", FILE_APPEND);
    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Backend Headers: \n$responseHeaders\n", FILE_APPEND);
    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Backend Body: \n$responseBody\n", FILE_APPEND);

    return ['code' => $httpCode, 'body' => json_decode($responseBody, true), 'headers' => $responseHeaders];
}

$method = $_SERVER['REQUEST_METHOD'];
$contentType = $_SERVER['CONTENT_TYPE'] ?? 'application/json';

// Xử lý dữ liệu đầu vào
// Tăng giới hạn bộ nhớ để xử lý file lớn (video 100MB)
ini_set('memory_limit', '512M');

// Xử lý dữ liệu đầu vào
if (strpos($contentType, 'multipart/form-data') !== false) {
    // Xây dựng Raw Multipart Body để hỗ trợ duplicate keys (Files, Files,...)
    // PHP CURL mặc định không hỗ trợ gửi nhiều field cùng tên thông qua mảng
    
    $boundary = '--------------------------' . microtime(true);
    $body = '';

    // 1. Process fields (text)
    foreach ($_POST as $key => $value) {
        $body .= "--$boundary\r\n";
        $body .= "Content-Disposition: form-data; name=\"$key\"\r\n\r\n";
        $body .= "$value\r\n";
    }

    // 2. Process Files
    foreach ($_FILES as $key => $file) {
        // Tên field gửi đi (bỏ [] nếu có để backend nhận đúng định dạng list)
        // VD: Client gửi Files[], PHP nhận key là 'Files'. Backend cần field 'Files'.
        // Nếu client gửi 'Files', PHP nhận 'Files' (nhưng chỉ 1 file cuối nếu trùng).
        // Vì client JS đã được sửa thành Files[], nên $key ở đây sẽ là 'Files'.
        $fieldName = $key; 

        if (is_array($file['tmp_name'])) {
            // Multiple files
            foreach ($file['tmp_name'] as $i => $tmpName) {
                if (!empty($tmpName) && is_uploaded_file($tmpName)) {
                    $fileName = $file['name'][$i];
                    $fileType = $file['type'][$i];
                    $fileContent = file_get_contents($tmpName);

                    $body .= "--$boundary\r\n";
                    $body .= "Content-Disposition: form-data; name=\"$fieldName\"; filename=\"$fileName\"\r\n";
                    $body .= "Content-Type: $fileType\r\n\r\n";
                    $body .= "$fileContent\r\n";
                }
            }
        } else {
            // Single file
            if (!empty($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
                $fileName = $file['name'];
                $fileType = $file['type'];
                $fileContent = file_get_contents($file['tmp_name']);

                $body .= "--$boundary\r\n";
                $body .= "Content-Disposition: form-data; name=\"$fieldName\"; filename=\"$fileName\"\r\n";
                $body .= "Content-Type: $fileType\r\n\r\n";
                $body .= "$fileContent\r\n";
            }
        }
    }

    $body .= "--$boundary--\r\n";
    
    // Cập nhật inputData và ContentType
    $inputData = $body;
    $contentType = "multipart/form-data; boundary=$boundary";

} else {
    $inputData = file_get_contents('php://input');
}

// LẤY ACCESS TOKEN TỪ COOKIE (THAY VÌ SESSION)
$accessToken = $_COOKIE['access_token'] ?? null;

// XỬ LÝ ĐẶC BIỆT CHO LOGOUT: Đảm bảo refresh_token được gửi lên backend để vô hiệu hóa
if (strpos($endpoint, 'logout') !== false && $method === 'POST') {
    if (empty($inputData) || $inputData === '{}' || $inputData === '[]') {
        if (isset($_COOKIE['refresh_token'])) {
            $inputData = json_encode(['refresh_token' => $_COOKIE['refresh_token']]);
            $contentType = 'application/json';
            file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Logout: Injected refresh_token from cookie into body.\n", FILE_APPEND);
        }
    }
}

// GỬI REQUEST LẦN 1
$result = sendRequest($targetUrl, $method, $inputData, $accessToken, $contentType);

// 2. XỬ LÝ KHI ĐĂNG NHẬP THÀNH CÔNG
if (strpos($endpoint, 'login') !== false && $result['code'] === 200) {
    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Login Success. Full Body: " . json_encode($result['body']) . "\n", FILE_APPEND);
    $data = $result['body']['data'] ?? $result['body'];

    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Login Success. Data keys: " . implode(', ', array_keys($data)) . "\n", FILE_APPEND);

    if (isset($data['access_token'])) {
        // Lưu Access Token vào HttpOnly Cookie (1 giờ)
        setcookie('access_token', $data['access_token'], [
            'expires' => time() + 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    if (isset($data['refresh_token'])) {
        // Lưu Refresh Token vào HttpOnly Cookie (30 ngày)
        setcookie('refresh_token', $data['refresh_token'], [
            'expires' => time() + (86400 * 30),
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }

    $result['body'] = [
        'success' => true,
        'login_success' => true,
        'user' => $data['user'] ?? null
    ];
}

// 3. NẾU LỖI 401 -> THỬ REFRESH TOKEN TỰ ĐỘNG
if ($result['code'] === 401 && isset($_COOKIE['refresh_token'])) {
    file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Got 401, attempting refresh...\n", FILE_APPEND);

    $refresh = sendRequest($baseUrl . '/auth/refresh', 'POST', json_encode([
        'refresh_token' => $_COOKIE['refresh_token']
    ]));

    if ($refresh['code'] === 200) {
        $refreshData = $refresh['body']['data'] ?? $refresh['body'];
        $newAt = $refreshData['access_token'];

        file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Refresh Success. New AT set.\n", FILE_APPEND);

        // Cập nhật Cookie mới
        setcookie('access_token', $newAt, [
            'expires' => time() + 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        // Thử lại request cũ với Token mới
        $result = sendRequest($targetUrl, $method, $inputData, $newAt, $contentType);
    } else {
        file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Refresh Failed with code: " . $refresh['code'] . "\n", FILE_APPEND);
    }
}

// 4. XỬ LÝ ĐĂNG XUẤT -> XÓA SẠCH COOKIE
if (strpos($endpoint, 'logout') !== false) {
    setcookie('access_token', '', time() - 3600, '/');
    setcookie('refresh_token', '', time() - 3600, '/');
}

// file_put_contents('debug_proxy.log', "[" . date('Y-m-d H:i:s') . "] Response Code: " . $result['code'] . "\n", FILE_APPEND);

// TỰ ĐỘNG CHUYỂN TIẾP (FORWARD) CÁC COOKIE TỪ BACKEND VỀ TRÌNH DUYỆT
if (isset($result['headers'])) {
    preg_match_all('/^Set-Cookie:\s*([^\r\n]*)/mi', $result['headers'], $matches);
    foreach ($matches[1] as $cookie) {
        header('Set-Cookie: ' . $cookie, false);
    }
}

http_response_code($result['code']);
header('Content-Type: application/json');
echo json_encode($result['body']);
