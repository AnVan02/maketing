<?php
// Thiết lập CORS và Content Type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
     http_response_code(200);
     exit();
}

// 1. Cấu hình & Dữ liệu đầu vào
$base_url_backend = "https://dvcendpoint.rosachatbot.com/api/v1";
$request_data = json_decode(file_get_contents('php://input'), true);

// 2. Kiểm tra dữ liệu bắt buộc từ Frontend
$required_fields = ['top_news', 'config', 'title', 'outline', 'main_keyword', 'secondary_keywords'];
foreach ($required_fields as $field) {
     if (!isset($request_data[$field])) {
          http_response_code(400);
          echo json_encode(['success' => false, 'message' => "Thiếu trường dữ liệu bắt buộc: {$field}."]);
          exit();
     }
}

// Hàm gọi API backend (sử dụng lại hàm đã định nghĩa trước đó)
function callBackendApi($url, $method, $data = null)
{
     $curl = curl_init();
     $headers = ['Content-Type: application/json'];

     curl_setopt($curl, CURLOPT_URL, $url);
     curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
     curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
     curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

     if ($data && in_array($method, ['POST'])) {
          curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
     }

     $response = curl_exec($curl);
     $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
     $error = curl_error($curl);
     curl_close($curl);

     if ($error) {
          throw new Exception("Lỗi cURL ($url): " . $error);
     }

     if ($http_code < 200 || $http_code >= 300) {
          $error_message = json_decode($response, true)['message'] ?? "Lỗi Backend API: " . $http_code;
          throw new Exception($error_message, $http_code);
     }

     return json_decode($response, true);
}

try {
     // --- BƯỚC 5: Tạo bài viết hoàn chỉnh (/ai/contents) ---
     $content_api_url = $base_url_backend . '/ai/contents';

     // Yêu cầu (Request Body)
     // Dữ liệu này được gửi trực tiếp từ frontend (sau khi đã chỉnh sửa dàn ý)
     $content_request_body = json_encode($request_data);

     // Gọi API sinh nội dung
     $final_content_result = callBackendApi($content_api_url, 'POST', $content_request_body);

     // --- BƯỚC 6: Trả về và Hiển thị bài viết ---

     // Lấy dữ liệu bài viết hoàn chỉnh từ response [cite: 308]
     $article_data = $final_content_result['article'] ?? [];

     if (empty($article_data)) {
          throw new Exception("Backend không trả về dữ liệu bài viết.");
     }

     // Trả về dữ liệu bài viết hoàn chỉnh cho Frontend
     http_response_code(200);
     echo json_encode([
          'success' => true,
          'message' => 'Đã tạo bài viết SEO hoàn chỉnh.',
          'title' => $article_data['title'] ?? '',
          'meta_description' => $article_data['meta_description'] ?? '',
          'html_content' => $article_data['html_content'] ?? '', // Nội dung HTML hoàn chỉnh [cite: 248]
          'content_blocks' => $article_data['blocks'] ?? [], // Danh sách khối nội dung [cite: 247]
          'keywords' => $article_data['keywords'] ?? [],
          'references' => $article_data['references'] ?? []
     ]);
} catch (Exception $e) {
     // Xử lý lỗi trong quá trình tạo bài viết
     http_response_code($e->getCode() >= 400 ? $e->getCode() : 500);
     echo json_encode(['success' => false, 'message' => "Lỗi trong quy trình tạo nội dung: " . $e->getMessage()]);
}
