const API_BASE_URL = "https://caiman-warm-swan.ngrok-free.app/api/v1";

/**
 * Đăng nhập
 */
export async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user@example.com",
      password: "User123!",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Đăng nhập thất bại");
  }

  return await response.json();
}