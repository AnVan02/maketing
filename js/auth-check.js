// /**
//  * KIỂM TRA ĐĂNG NHẬP (AUTH GUARD)
//  *
//  * File này có nhiệm vụ:
//  * - Kiểm tra người dùng đã đăng nhập hay chưa (dựa vào access_token)
//  * - Nếu chưa đăng nhập mà vào trang cần bảo mật → chuyển về trang đăng nhập
//  * - Nếu đã đăng nhập rồi mà vẫn vào trang đăng nhập/đăng ký → chuyển về trang chính
//  * - Cung cấp hàm logout dùng chung cho toàn website
//  *
//  * File sẽ tự động chạy mỗi khi trang được load
//  */
// (function () {

//     // Lấy access_token đã lưu trong localStorage (nếu có)
//     // Nếu có token → coi như người dùng đã đăng nhập
//     const token = localStorage.getItem('access_token');

//     // Lấy đường dẫn của trang hiện tại (vd: /tong-hop.php)
//     const currentPath = window.location.pathname;

//     // Kiểm tra xem người dùng có đang ở trang đăng nhập hay không
//     const isLoginPage = currentPath.includes('dang-nhap.php');

//     // Kiểm tra xem người dùng có đang ở trang đăng ký hay không
//     const isRegisterPage = currentPath.includes('dang-ky.php');

//     // Kiểm tra các trang KHÔNG cần đăng nhập
//     const isHomePage =
//         currentPath.includes('trang-chu.php') ||
//         currentPath.endsWith('/') ||
//         currentPath.endsWith('index.php');

//     // 👉 TRƯỜNG HỢP 1:
//     // Nếu người dùng CHƯA đăng nhập
//     // VÀ đang cố truy cập vào trang cần đăng nhập
//     // → Chuyển hướng về trang đăng nhập
//     if (!token && !isLoginPage && !isRegisterPage && !isHomePage) {
//         console.warn('Bạn chưa đăng nhập. Đang chuyển về trang đăng nhập...');
//         window.location.href = 'dang-nhap.php';
//         return;
//     }

//     // 👉 TRƯỜNG HỢP 2 (tùy chọn):
//     // Nếu người dùng ĐÃ đăng nhập
//     // nhưng vẫn vào trang đăng nhập hoặc đăng ký
//     // → Chuyển thẳng về trang tổng hợp (dashboard)
//     if (token && (isLoginPage || isRegisterPage)) {
//         window.location.href = 'tong-hop.php';
//     }

//     /**
//      * HÀM ĐĂNG XUẤT
//      *
//      * Có thể gọi hàm này ở bất kỳ đâu trong website
//      * Ví dụ: khi bấm nút "Đăng xuất"
//      */


//     window.logout = function () {

//         // Xóa token để người dùng trở về trạng thái chưa đăng nhập
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');

//         // Sau khi logout thì chuyển về trang đăng nhập
//         window.location.href = 'dang-nhap.php';
//     };
// })();
