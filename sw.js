self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "📞 Có cuộc gọi đến!";
    const options = {
        body: data.body || "Ai đó đang gọi cho bạn...",
        icon: "https://i.imgur.com/7gK764t.png",
        tag: "incoming-call",
        requireInteraction: true,
        vibrate: [500, 300, 500, 300, 500]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
