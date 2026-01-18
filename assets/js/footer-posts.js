/* =========================================
   Footer Posts Carousel
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.getElementById('footer-posts-carousel');
    if (!carouselContainer) return;

    const loadPosts = () => {
        try {
            // Use global POSTS_DATA instead of fetch to avoid CORS issues on file:// protocol
            const postsData = window.POSTS_DATA || [];
            if (postsData.length === 0) {
                console.warn('No post data found in window.POSTS_DATA');
                return;
            }

            // Limit to last 5 posts
            const recentPosts = postsData.slice(0, 5);

            renderCarousel(recentPosts);
        } catch (error) {
            console.error('Error loading footer posts:', error);
            carouselContainer.innerHTML = '<p class="text-xs text-muted-light">Nepodařilo se načíst příspěvky.</p>';
        }
    };

    const renderCarousel = (posts) => {
        if (posts.length === 0) return;

        let currentIndex = 0;
        const slides = [];

        posts.forEach((post, index) => {
            const slide = document.createElement('div');
            slide.className = `absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
            slide.innerHTML = `
                <div class="flex gap-4 items-start">
                    <div class="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src="${post.image_url}" alt="${post.title}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/64x64?text=Post'">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold truncate text-primary dark:text-white uppercase tracking-wider">${post.title}</h4>
                        <p class="text-[11px] text-muted-light dark:text-muted-dark line-clamp-2 mt-1 leading-snug">${post.content}</p>
                    </div>
                </div>
            `;
            carouselContainer.appendChild(slide);
            slides.push(slide);
        });

        const nextSlide = () => {
            if (slides.length <= 1) return;
            slides[currentIndex].classList.replace('opacity-100', 'opacity-0');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.replace('opacity-0', 'opacity-100');
        };

        if (slides.length > 1) {
            setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }
    };

    loadPosts();
});
