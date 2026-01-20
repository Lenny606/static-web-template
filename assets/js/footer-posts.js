/* =========================================
   Footer Posts - API Integration
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('footer-posts-container');
    if (!container) return;

    const API_URL = 'https://www.nodeflow.site/webhook-test/get-ig-posts';
    const INSTAGRAM_URL = 'https://www.instagram.com/dbdastudio';
    const CACHE_KEY = 'footer_posts_cache';
    const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

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
            <div class="mt-6">
                <a href="${INSTAGRAM_URL}" target="_blank" class="inline-flex items-center group text-xs font-bold tracking-widest uppercase">
                    <span class="w-8 h-[1px] bg-black dark:bg-white mr-4 transition-all group-hover:w-12"></span>
                    Sledujte nás na Instagramu
                </a>
            </div>
        `;
    };

    const loadPosts = async () => {
        // Try to load from cache first
        const cachedData = getCachedData();
        if (cachedData) {
            console.log('Loading footer posts from cache');
            renderPosts(cachedData);
            return;
        }

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                showFallback();
                return;
            }

            console.log('Fetched new footer posts from API');

            setCachedData(data);
            renderPosts(data);
        } catch (error) {
            console.error('Error fetching footer posts:', error);
            showFallback();
        }
    };

    const renderPosts = (posts) => {
        // Clear container
        container.innerHTML = '';
        container.className = 'mt-6 relative h-20 overflow-hidden'; // Improved fixed height for carousel

        const slides = [];
        let currentIndex = 0;

        // Show up to 6 recent posts in the carousel
        posts.slice(0, 6).forEach((item, index) => {
            const caption = item.caption || '';
            const mediaUrl = item.media_url || '';
            const permalink = item.permalink || '#';

            const postElement = document.createElement('a');
            postElement.href = permalink;
            postElement.target = '_blank';
            postElement.className = `absolute inset-0 flex gap-3 group items-center transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;

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

            setInterval(nextSlide, 5000); // Change every 5 seconds
        }
    };

    loadPosts();
});
