/* =========================================
   Footer Posts - API Integration
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('footer-posts-container');
    if (!container) return;

    const API_URL = 'https://www.nodeflow.site/webhook-test/get-ig-posts';
    const INSTAGRAM_URL = 'https://www.instagram.com/dbda_arch';
    const CACHE_KEY = 'footer_posts_cache';
    const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

    const getConsent = () => {
        const saved = localStorage.getItem('dbda_consent');
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    };

    const getCachedData = () => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    };

    const setCachedData = (data) => {
        const cacheObj = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    };

    const showFallback = () => {
        container.innerHTML = `
            <div class="mt-6 flex justify-center md:justify-start">
                <a href="${INSTAGRAM_URL}" target="_blank" class="inline-flex items-center group text-xs font-bold tracking-widest uppercase">
                    <div class="relative flex items-center">
                        <div
                            class="relative w-4 h-4 border border-primary/10 dark:border-white/10 group-hover:border-transparent transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
                            <!-- Central Axis Pillar -->
                            <span
                                class="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-full bg-primary dark:bg-white opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:h-12 group-hover:-top-4 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[height,top]"></span>

                            <!-- Expansion Line -->
                            <span
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary dark:bg-white transition-all duration-1000 delay-400 group-hover:w-12 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[width]"></span>
                        </div>
                        <span
                            class="ml-4 text-primary dark:text-white transition-all duration-1000 group-hover:-translate-x-2 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
                            Sledujte nás na Instagramu
                        </span>
                    </div>
                </a>
            </div>
        `;
    };

    const loadPosts = async () => {
        const consent = getConsent();

        // If no functional consent, show fallback and stop
        if (!consent || !consent.functional) {
            showFallback();
            return;
        }

        // Try to load from cache first
        const cachedData = getCachedData();
        if (cachedData) {
            renderPosts(cachedData);
            return;
        }

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');

            const rawData = await response.json();

            // Handle both new format { data: [...] } and old format [...]
            let posts = [];
            if (Array.isArray(rawData)) {
                posts = rawData;
            } else if (rawData && Array.isArray(rawData.data)) {
                posts = rawData.data;
            }

            if (posts.length === 0) {
                showFallback();
                return;
            }

            setCachedData(posts);
            renderPosts(posts);
        } catch (error) {
            console.error('Error fetching footer posts:', error);
            showFallback();
        }
    };

    const renderPosts = (posts) => {
        // Clear container
        container.innerHTML = '';
        container.className = 'mt-6 relative h-20 overflow-hidden';

        const slides = [];
        let currentIndex = 0;

        posts.slice(0, 6).forEach((item, index) => {
            const caption = item.caption || '';
            const mediaUrl = item.media_url || '';
            const permalink = item.permalink || '#';

            const postElement = document.createElement('a');
            postElement.href = permalink;
            postElement.target = '_blank';
            postElement.className = `absolute inset-0 flex gap-3 group items-center justify-center md:justify-start transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;

            postElement.innerHTML = `
                ${mediaUrl ? `
                <div class="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src="${mediaUrl}" alt="Instagram post" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                </div>
                ` : ''}
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] text-muted-light dark:text-muted-dark line-clamp-3 leading-snug group-hover:text-primary dark:group-hover:text-white transition-colors">
                        ${caption}
                    </p>
                </div>
            `;
            container.appendChild(postElement);
            slides.push(postElement);
        });

        if (slides.length > 1) {
            const nextSlide = () => {
                slides[currentIndex].classList.remove('opacity-100', 'z-10');
                slides[currentIndex].classList.add('opacity-0', 'z-0');
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.remove('opacity-0', 'z-0');
                slides[currentIndex].classList.add('opacity-100', 'z-10');
            };
            setInterval(nextSlide, 5000);
        }
    };

    // Initial load attempt
    loadPosts();

    // Re-attempt if consent is updated
    window.addEventListener('dbdaConsentUpdated', (e) => {
        if (e.detail.functional) {
            loadPosts();
        } else {
            showFallback();
        }
    });
});
