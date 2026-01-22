document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otpForm");
  const otpInput = document.getElementById("otp");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("verifyOtpBtn");
  const resendBtn = document.getElementById("resendOtpBtn");
  const messageBox = document.getElementById("otpMessage");

  // ===== HÀM HIỂN THỊ THÔNG BÁO =====
  function showMessage(text, type = "info") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `otp-message ${type}`;
  }

  // ===== XÁC THỰC OTP =====
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const otp = otpInput.value.trim();

      if (!email || !otp) {
        showMessage("Vui lòng nhập đầy đủ email và mã OTP", "error");
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        showMessage("Mã OTP phải gồm 6 chữ số", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "ĐANG XÁC THỰC...";

      try {
        const res = await fetch("/api/v1/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showMessage(
            "Xác thực OTP thành công! Bạn có thể đăng nhập.",
            "success",
          );

          // Chuyển sang trang đăng nhập sau 1.5s
          setTimeout(() => {
            window.location.href = "login.php";
          }, 1500);
        } else {
          showMessage(data.message || "Xác thực OTP thất bại", "error");
        }
      } catch (err) {
        console.error("Verify OTP error:", err);
        showMessage("Lỗi kết nối máy chủ", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "XÁC THỰC OTP";
      }
    });
  }

  // ===== GỬI LẠI OTP =====
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      if (!email) {
        showMessage("Vui lòng nhập email để gửi lại OTP", "error");
        return;
      }

      resendBtn.disabled = true;
      resendBtn.textContent = "ĐANG GỬI...";

      try {
        const res = await fetch("/api/v1/auth/resend-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showMessage("OTP mới đã được gửi tới email của bạn", "success");
        } else {
          showMessage(data.message || "Không thể gửi lại OTP", "error");
        }
      } catch (err) {
        console.error("Resend OTP error:", err);
        showMessage("Lỗi kết nối máy chủ", "error");
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = "GỬI LẠI OTP";
      }
    });
  }
});
