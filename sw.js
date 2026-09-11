// sw.js - Chạy ngầm trong trình duyệt
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Cuộc gọi đến";
    const options = {
        body: data.body || "Ai đó đang gọi cho bạn...",
        icon: data.icon || "https://i.imgur.com/7gK764t.png",
        badge: "https://i.imgur.com/7gK764t.png",
        tag: data.tag || "vuscript-call",
        requireInteraction: true, // Giữ thông báo không tự mất để giống Zalo
        vibrate: [500, 300, 500, 300, 500],
        data: { url: data.url || "/" }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Sự kiện khi người dùng click vào thông báo gọi đến
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Nếu đã mở trang web thì focus lại trang đó
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Nếu chưa mở thì bật tab mới dẫn đến trang web
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});