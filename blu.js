/**
 * VUSCRIPT - Blu.js (Notification & Call Alert System)
 * Tác dụng: Xử lý thông báo tin nhắn nổi ngoài màn hình và rung/đổ chuông khi có cuộc gọi đến.
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initNotificationPermission();
        this.initRingtone();
    }

    // 1. Xin quyền hiển thị thông báo của trình duyệt
    initNotificationPermission() {
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        console.log("Blu.js: Đã được cấp quyền thông báo.");
                    }
                });
            }
        }
    }

    // 2. Chuẩn bị âm thanh chuông gọi
    initRingtone() {
        // Tạo âm thanh chuông gọi mẫu (có thể thay thế link audio khác bằng file .mp3 của bạn)
        this.audioRing = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        this.audioRing.loop = true; // Lặp lại liên tục khi đang gọi
    }

    /**
     * 3. Hiển thị thông báo tin nhắn giống Zalo
     * @param {string} sender - Tên người gửi
     * @param {string} message - Nội dung tin nhắn
     * @param {string} avatar - Ảnh đại diện (tuỳ chọn)
     */
    showTextMessage(sender, message, avatar = "") {
        // Kiểm tra xem trang web có đang ẩn hoặc không được focus không
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: message,
                icon: avatar || "https://i.imgur.com/7gK764t.png", // Icon mặc định
                tag: "vuscript-chat", // Tránh bị trùng lặp quá nhiều thông báo
                renotify: true
            };

            // Hiển thị thông báo nổi hệ thống (hiện trên điện thoại/máy tính)
            const notification = new Notification(`💬 Tin nhắn mới từ ${sender}`, options);

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus(); // Nhấn vào sẽ quay lại trang web
                notification.close();
            };
        }
    }

    /**
     * 4. Kích hoạt chế độ gọi đến: Rung máy + Đổ chuông + Thông báo lớn
     * @param {string} callerName - Tên người gọi
     */
    startIncomingCall(callerName) {
        // Phát chuông gọi
        if (this.audioRing) {
            this.audioRing.play().catch(e => console.log("Không thể tự động phát chuông do chính sách trình duyệt:", e));
        }

        // Rung thiết bị di động (nếu hỗ trợ Vibration API - hỗ trợ tốt trên Android)
        if ("vibrate" in navigator) {
            // Rung liên tục: Rung 500ms, nghỉ 300ms, lặp lại
            navigator.vibrate([500, 300, 500, 300, 500, 300, 500, 300]);
        }

        // Hiển thị thông báo đẩy dạng khẩn cấp
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: `${callerName} đang gọi cho bạn... Nhấn để nghe máy!`,
                icon: "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-call",
                requireInteraction: true // Giữ thông báo hiển thị cho đến khi người dùng tương tác
            };

            const callNotification = new Notification(`📞 Cuộc gọi đến từ ${callerName}`, options);
            
            callNotification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                callNotification.close();
            };
        }
    }

    /**
     * 5. Dừng chuông và dừng rung khi cuộc gọi kết thúc hoặc được nghe
     */
    stopIncomingCall() {
        if (this.audioRing) {
            this.audioRing.pause();
            this.audioRing.currentTime = 0;
        }
        if ("vibrate" in navigator) {
            navigator.vibrate(0); // Tắt rung
        }
    }
}

// Khởi tạo đối tượng toàn cục để các file khác (chat.js, ad.js...) có thể gọi dễ dàng
const bluSystem = new BluNotificationSystem();
// Tự động yêu cầu quyền thông báo và kích hoạt Audio Context khi người dùng tương tác lần đầu với trang web
document.addEventListener('click', function initAudioAndNotification() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    
    // Kích hoạt ngầm âm thanh để khi có cuộc gọi đến, chuông có thể phát ngay lập tức không bị trình duyệt chặn
    if (window.bluSystem && window.bluSystem.audioRing) {
        window.bluSystem.audioRing.play().then(() => {
            window.bluSystem.audioRing.pause();
            window.bluSystem.audioRing.currentTime = 0;
        }).catch(() => {});
    }
    
    // Xóa sự kiện sau khi đã kích hoạt lần đầu tiên
    document.removeEventListener('click', initAudioAndNotification);
}, { once: true });