/**
 * VUSCRIPT - Blu.js (Phiên bản ép hiển thị bảng popup trực tiếp)
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initRingtone();
        
        // Đợi web tải xong là ép hiện bảng ngay lập tức
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createPermissionPopup());
        } else {
            this.createPermissionPopup();
        }
    }

    // Tạo bảng thông báo bắt buộc hiển thị giữa màn hình
    createPermissionPopup() {
        // Nếu đã tồn tại rồi thì thôi không tạo nữa
        if (document.getElementById('blu-custom-popup')) return;

        const overlay = document.createElement('div');
        overlay.id = 'blu-custom-popup';
        overlay.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.92) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: sans-serif !important;
        `;

        overlay.innerHTML = `
            <div style="background: #1a1a1a !important; border: 2px solid #00ffcc !important; padding: 30px !important; border-radius: 16px !important; text-align: center !important; max-width: 350px !important; width: 90% !important; color: #fff !important; box-shadow: 0 0 40px rgba(0,255,204,0.5) !important;">
                <div style="font-size: 45px !important; margin-bottom: 10px !important;">🔔</div>
                <h3 style="margin: 0 0 10px 0 !important; color: #00ffcc !important; font-size: 20px !important;">Bật Thông Báo & Cuộc Gọi</h3>
                <p style="font-size: 14px !important; color: #ccc !important; line-height: 1.5 !important; margin-bottom: 20px !important;">
                    Hãy bấm nút bên dưới để cấp quyền nhận tin nhắn nổi và gọi thoại trực tiếp trên thiết bị của bạn!
                </p>
                <button id="blu-agree-btn" style="background: #00ffcc !important; color: #000 !important; border: none !important; padding: 12px 20px !important; font-weight: bold !important; border-radius: 8px !important; cursor: pointer !important; font-size: 15px !important; width: 100% !important;">
                    ĐỒNG Ý VÀ TIẾP TỤC
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Khi người dùng bấm nút này
        document.getElementById('blu-agree-btn').addEventListener('click', () => {
            if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    console.log("Trạng thái quyền:", permission);
                });
            }

            // Mở khóa âm thanh chuông
            if (this.audioRing) {
                this.audioRing.play().then(() => {
                    this.audioRing.pause();
                    this.audioRing.currentTime = 0;
                }).catch(() => {});
            }

            // Tắt bảng popup đi
            overlay.remove();
        });
    }

    initRingtone() {
        this.audioRing = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        this.audioRing.loop = true;
    }

    showTextMessage(sender, message, avatar = "") {
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: message,
                icon: avatar || "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-chat",
                renotify: true
            };
            const notification = new Notification(`💬 Tin nhắn mới từ ${sender}`, options);
            notification.onclick = (e) => { e.preventDefault(); window.focus(); notification.close(); };
        }
    }

    startIncomingCall(callerName) {
        if (this.audioRing) this.audioRing.play().catch(() => {});
        if ("vibrate" in navigator) navigator.vibrate([500, 300, 500, 300, 500]);

        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: `${callerName} đang gọi cho bạn... Nhấn để nghe máy!`,
                icon: "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-call",
                requireInteraction: true
            };
            const callNotification = new Notification(`📞 Cuộc gọi đến từ ${callerName}`, options);
            callNotification.onclick = (e) => { e.preventDefault(); window.focus(); callNotification.close(); };
        }
    }

    stopIncomingCall() {
        if (this.audioRing) { this.audioRing.pause(); this.audioRing.currentTime = 0; }
        if ("vibrate" in navigator) navigator.vibrate(0);
    }
}

// Khởi tạo hệ thống
const bluSystem = new BluNotificationSystem();
