// Service Worker for CareConnect PWA

const CACHE_NAME = 'careconnect-v1.0.0';
const STATIC_CACHE = 'careconnect-static-v1.0.0';
const DYNAMIC_CACHE = 'careconnect-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/components.css',
    '/styles/responsive.css',
    '/js/main.js',
    '/js/chat.js',
    '/js/animations.js',
    '/images/logo.svg',
    '/counselors',
    '/counselor/dr-sarah-mitchell',
    '/counselor/michael-rodriguez',
    '/counselor/dr-emily-chen',
    '/counselor/james-williams',
    '/counselor/dr-maria-garcia',
    '/counselor/lisa-thompson'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static file requests
    if (url.origin === self.location.origin) {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    // Handle external requests (images, fonts, etc.)
    event.respondWith(handleExternalRequest(request));
});

// Handle API requests
async function handleApiRequest(request) {
    try {
        // Try network first for API requests
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('API request failed, serving offline response');
        
        // Return offline response for API requests
        return new Response(JSON.stringify({
            error: 'You are offline. Please check your connection and try again.',
            offline: true
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Handle static file requests
async function handleStaticRequest(request) {
    try {
        // Try cache first for static files
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, try network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the response for future use
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Static request failed, serving offline page');
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
        }
        
        // Return appropriate offline response for other file types
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Handle external requests
async function handleExternalRequest(request) {
    try {
        // Try network first for external requests
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache external resources
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('External request failed');
    } catch (error) {
        console.log('External request failed');
        
        // Return appropriate fallback for images
        if (request.destination === 'image') {
            return caches.match('/images/placeholder.svg');
        }
        
        return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Handle background sync
async function doBackgroundSync() {
    try {
        // Get stored offline actions
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await performOfflineAction(action);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('Failed to perform offline action:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Store offline action
async function storeOfflineAction(action) {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.add(action);
}

// Get stored offline actions
async function getOfflineActions() {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    return await store.getAll();
}

// Remove offline action
async function removeOfflineAction(id) {
    const db = await openDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    await store.delete(id);
}

// Perform offline action
async function performOfflineAction(action) {
    const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
    });
    
    if (!response.ok) {
        throw new Error(`Action failed: ${response.status}`);
    }
    
    return response;
}

// Open IndexedDB
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CareConnectDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store for offline actions
            if (!db.objectStoreNames.contains('offlineActions')) {
                const store = db.createObjectStore('offlineActions', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'You have a new message from CareConnect',
        icon: '/images/logo.svg',
        badge: '/images/badge.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/images/open.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/close.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('CareConnect', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    console.log('Message received in service worker:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_API_RESPONSE') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(event.data.request, event.data.response))
        );
    }
});

// Error handling
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
}); 