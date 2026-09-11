/**
 * VUSCRIPT - Blu.js (Notification & Call Alert System)
 * Được tối ưu hóa giao diện xin quyền lớn trực quan trên web và giữ nguyên các tính năng cốt lõi.
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initRingtone();
        this.initCustomPermissionUI();
    }

    /**
     * 1. Tạo giao diện banner/popup xin quyền lớn ngay trên web (giống Zalo/Web lớn)
     * Giúp người dùng thấy rõ ràng, không bị bỏ lỡ.
     */
    initCustomPermissionUI() {
        if (!("Notification" in window)) return;

        // Nếu đã cấp quyền hoặc từ chối rồi thì không hiện nữa
        if (Notification.permission !== "default") return;

        // Tạo element giao diện HTML cho popup xin quyền
        const banner = document.createElement('div');
        banner.id = 'blu-permission-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: #ffffff;
            color: #333333;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            max-width: 360px;
            width: calc(100% - 40px);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            border-left: 5px solid #0068ff;
            animation: bluSlideIn 0.4s ease-out;
        `;

        banner.innerHTML = `
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #000;">Bật thông báo & Cuộc gọi</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 16px; line-height: 1.4;">
                Hãy bấm <b>"Đồng ý"</b> để nhận thông báo tin nhắn mới và cuộc gọi đến ngay cả khi bạn thu nhỏ trình duyệt.
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="blu-btn-deny" style="padding: 8px 14px; border: none; background: #f0f2f5; color: #555; border-radius: 6px; cursor: pointer; font-weight: 500;">Để sau</button>
                <button id="blu-btn-allow" style="padding: 8px 16px; border: none; background: #0068ff; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600;">Đồng ý ngay</button>
            </div>
        `;

        // Thêm CSS animation vào trang
        if (!document.getElementById('blu-animations')) {
            const style = document.createElement('style');
            style.id = 'blu-animations';
            style.innerHTML = `
                @keyframes bluSlideIn {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(banner);

        // Xử lý sự kiện khi bấm nút "Đồng ý ngay"
        document.getElementById('blu-btn-allow').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Blu.js: Người dùng đã đồng ý cấp quyền thông báo qua giao diện.");
                }
                banner.remove();
            });
            this.unlockAudioContext();
        });

        // Xử lý sự kiện khi bấm "Để sau"
        document.getElementById('blu-btn-deny').addEventListener('click', () => {
            banner.remove();
        });
    }

    /**
     * 2. Mở khóa Audio Context (tránh bị trình duyệt chặn tiếng chuông)
     */
    unlockAudioContext() {
        if (this.audioRing) {
            this.audioRing.play().then(() => {
                this.audioRing.pause();
                this.audioRing.currentTime = 0;
            }).catch(() => {});
        }
    }

    // 3. Chuẩn bị âm thanh chuông gọi[cite: 1]
    initRingtone() {
        this.audioRing = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        this.audioRing.loop = true; // Lặp lại liên tục khi đang gọi[cite: 1]
    }

    /**
     * 4. Hiển thị thông báo tin nhắn nổi ngoài màn hình (giống Zalo)[cite: 1]
     * @param {string} sender - Tên người gửi[cite: 1]
     * @param {string} message - Nội dung tin nhắn[cite: 1]
     * @param {string} avatar - Ảnh đại diện (tuỳ chọn)[cite: 1]
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
                window.focus(); // Nhấn vào thông báo sẽ mở lại trang web[cite: 1]
                notification.close();
            };
        }
    }

    /**
     * 5. Kích hoạt chế độ gọi đến: Rung máy + Đổ chuông + Thông báo lớn[cite: 1]
     * @param {string} callerName - Tên người gọi[cite: 1]
     */
    startIncomingCall(callerName) {
        // Phát chuông gọi[cite: 1]
        if (this.audioRing) {
            this.audioRing.play().catch(e => console.log("Trình duyệt chặn phát âm thanh tự động:", e));
        }

        // Rung thiết bị di động (nếu hỗ trợ Vibration API)[cite: 1]
        if ("vibrate" in navigator) {
            navigator.vibrate([500, 300, 500, 300, 500, 300, 500, 300]);
        }

        // Hiển thị thông báo đẩy dạng khẩn cấp[cite: 1]
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: `${callerName} đang gọi cho bạn... Nhấn để nghe máy!`,
                icon: "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-call",
                requireInteraction: true // Giữ thông báo hiển thị cho đến khi tương tác[cite: 1]
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
     * 6. Dừng chuông và dừng rung khi cuộc gọi kết thúc hoặc được nghe[cite: 1]
     */
    stopIncomingCall() {
        if (this.audioRing) {
            this.audioRing.pause();
            this.audioRing.currentTime = 0;
        }
        if ("vibrate" in navigator) {
            navigator.vibrate(0); // Tắt rung[cite: 1]
        }
    }
}

// Khởi tạo hệ thống toàn cục[cite: 1]
const bluSystem = new BluNotificationSystem();

// Bẫy sự kiện click/chạm đầu tiên trên trang (phòng hờ trường hợp người dùng click vào bất cứ đâu trên web để mở khóa âm thanh)[cite: 1]
document.addEventListener('click', function triggerSystemOnFirstClick() {
    if (window.bluSystem) {
        window.bluSystem.unlockAudioContext();
    }
    document.removeEventListener('click', triggerSystemOnFirstClick);
}, { once: true });
