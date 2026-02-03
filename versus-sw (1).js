// VERSUS Push Notification Service Worker
// This file must be served from the root of your domain

self.addEventListener('install', function(event) {
    console.log('VERSUS SW: installed');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('VERSUS SW: activated');
    event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', function(event) {
    console.log('VERSUS SW: push received');
    
    var data = { title: 'VERSUS', body: 'Something happened in your squad!', url: '/' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    var options = {
        body: data.body || '',
        icon: data.icon || '/versus-icon.png',
        badge: data.badge || '/versus-badge.png',
        tag: data.tag || 'versus-' + Date.now(),
        renotify: true,
        data: {
            url: data.url || '/',
            challengeId: data.challengeId || null
        },
        actions: data.actions || [],
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'VERSUS', options)
    );
});

// Handle notification click — deep link to the right screen
self.addEventListener('notificationclick', function(event) {
    console.log('VERSUS SW: notification clicked');
    event.notification.close();
    
    // Get base URL from service worker location (works for GitHub Pages subfolders)
    var swUrl = self.registration.scope;
    var baseUrl = swUrl.endsWith('/') ? swUrl : swUrl + '/';
    
    var targetUrl = baseUrl;
    var challengeId = event.notification.data.challengeId;
    
    // Add challenge deep link hash if present
    if (challengeId) {
        targetUrl = targetUrl + '#challenge=' + challengeId;
    }
    
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
            // If a VERSUS tab is already open, focus and navigate it
            for (var i = 0; i < clients.length; i++) {
                var client = clients[i];
                if (client.url.indexOf('versus') !== -1 || client.url.indexOf('VERSUS') !== -1 || client.url.indexOf('Versus') !== -1) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new tab
            return self.clients.openWindow(targetUrl);
        })
    );
}););
