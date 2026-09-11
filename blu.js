/**
 * VUSCRIPT - Blu.js (Notification & Call Alert System)
 * Tác dụng: Xử lý thông báo tin nhắn nổi ngoài màn hình, rung và đổ chuông khi có cuộc gọi/tin nhắn.
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initNotificationPermission();
        this.initRingtone();
    }

    // 1. Tự động yêu cầu quyền thông báo từ trình duyệt khi vừa tải trang
    initNotificationPermission() {
        if ("Notification" in window) {
            // Sau 1 giây vào web, tự động bật hộp thoại xin quyền của trình duyệt
            setTimeout(() => {
                if (Notification.permission === "default") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            console.log("Blu.js: Người dùng đã bấm Cho phép thông báo.");
                        }
                    });
                }
            }, 1000);
        }
    }

    // 2. Chuẩn bị âm thanh chuông gọi
    initRingtone() {
        this.audioRing = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        this.audioRing.loop = true; // Lặp lại liên tục khi đang gọi
    }

    /**
     * 3. Hiển thị thông báo tin nhắn nổi ngoài màn hình (giống Zalo)
     * @param {string} sender - Tên người gửi
     * @param {string} message - Nội dung tin nhắn
     * @param {string} avatar - Ảnh đại diện (tuỳ chọn)
     */
    showTextMessage(sender, message, avatar = "") {
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: message,
                icon: avatar || "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-chat",
                renotify: true
            };

            const notification = new Notification(`💬 Tin nhắn mới từ ${sender}`, options);

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus(); // Nhấn vào thông báo sẽ mở lại trang web
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
            this.audioRing.play().catch(e => console.log("Trình duyệt chặn phát âm thanh tự động:", e));
        }

        // Rung thiết bị di động (nếu hỗ trợ Vibration API)
        if ("vibrate" in navigator) {
            navigator.vibrate([500, 300, 500, 300, 500, 300, 500, 300]);
        }

        // Hiển thị thông báo đẩy dạng khẩn cấp
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: `${callerName} đang gọi cho bạn... Nhấn để nghe máy!`,
                icon: "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-call",
                requireInteraction: true // Giữ thông báo hiển thị cho đến khi tương tác
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

// Khởi tạo hệ thống toàn cục
const bluSystem = new BluNotificationSystem();

// Bẫy sự kiện click/chạm đầu tiên: Giúp mở khóa hộp thoại xin quyền & âm thanh nếu trình duyệt chặn tự động
document.addEventListener('click', function triggerSystemOnFirstClick() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Blu.js: Đã cấp quyền thông báo sau cú click đầu tiên.");
            }
        });
    }
    
    // Kích hoạt ngầm Audio Context để tránh bị trình duyệt chặn tiếng chuông sau này
    if (window.bluSystem && window.bluSystem.audioRing) {
        window.bluSystem.audioRing.play().then(() => {
            window.bluSystem.audioRing.pause();
            window.bluSystem.audioRing.currentTime = 0;
        }).catch(() => {});
    }
    
    document.removeEventListener('click', triggerSystemOnFirstClick);
}, { once: true });
