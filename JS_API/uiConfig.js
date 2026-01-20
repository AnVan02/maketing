const API_BASE_URL = "https://caiman-warm-swan.ngrok-free.app/api/v1";

/**
 * Lấy cấu hình UI
 */
export async function fetchUIConfigs() {
  const response = await fetch(`${API_BASE_URL}/ui/configs`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
    }
    if (response.status === 403) {
      throw new Error("Không có quyền truy cập");
    }
    throw new Error("Không thể lấy UI config");
  }

  return await response.json();
  
}