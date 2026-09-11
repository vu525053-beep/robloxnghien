/**
 * VUSCRIPT - Blu.js (Phiên bản Popup Tùy Chỉnh Bắt Buộc Nhìn Thấy)
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initRingtone();
        this.checkAndShowPermissionModal();
    }

    // Kiểm tra nếu chưa cấp quyền thì hiện bảng popup ngay giữa màn hình
    checkAndShowPermissionModal() {
        if (!("Notification" in window)) return;

        if (Notification.permission === "default") {
            this.createPermissionPopup();
        }
    }

    // Tạo bảng thông báo bắt buộc tương tác
    createPermissionPopup() {
        if (document.getElementById('blu-custom-popup')) return;

        const overlay = document.createElement('div');
        overlay.id = 'blu-custom-popup';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
        `;

        overlay.innerHTML = `
            <div style="background: #1a1a1a; border: 2px solid #00ffcc; padding: 30px; border-radius: 16px; text-align: center; max-width: 350px; width: 90%; color: #fff; box-shadow: 0 0 30px rgba(0,255,204,0.4);">
                <div style="font-size: 45px; margin-bottom: 10px;">🔔</div>
                <h3 style="margin: 0 0 10px 0; color: #00ffcc; font-size: 20px;">Bật Thông Báo & Cuộc Gọi</h3>
                <p style="font-size: 14px; color: #ccc; line-height: 1.5; margin-bottom: 20px;">
                    Hãy bấm nút bên dưới để cấp quyền nhận tin nhắn nổi và gọi thoại trực tiếp trên thiết bị của bạn!
                </p>
                <button id="blu-agree-btn" style="background: #00ffcc; color: #000; border: none; padding: 12px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 15px; width: 100%;">
                    ĐỒNG Ý VÀ TIẾP TỤC
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Khi người dùng bấm nút này, trình duyệt sẽ lập tức hiện hộp thoại Cho Phép
        document.getElementById('blu-agree-btn').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Đã cấp quyền thành công!");
                }
            });

            // Mở khóa âm thanh
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

const bluSystem = new BluNotificationSystem();
