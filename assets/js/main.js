/* =========================================
   Main JS - Init & Micro-interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DBDA Architects Website Initialized');

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });


    // Initialize any micro-animations (e.g., reveal on scroll if needed)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const images = element.querySelectorAll('img');
                const reveal = () => {
                    // Ensure we don't double-animate
                    if (element.classList.contains('revealed')) return;

                    console.log('Revealing element:', element);
                    element.classList.add('revealed');
                    element.classList.add('anim');
                    observer.unobserve(element);
                };

                // If element has images, wait for them to load
                if (images.length > 0) {
                    let loadedCount = 0;
                    const totalImages = images.length;

                    // Fallback to avoid hanging forever
                    const fallbackTimer = setTimeout(() => {
                        console.warn('Image load timeout, revealing anyway:', element);
                        reveal();
                    }, 2000); // 2 second max wait

                    const checkAllLoaded = () => {
                        loadedCount++;
                        if (loadedCount >= totalImages) {
                            clearTimeout(fallbackTimer);
                            reveal();
                        }
                    };

                    images.forEach(img => {
                        if (img.complete && img.naturalHeight !== 0) {
                            checkAllLoaded();
                        } else {
                            img.addEventListener('load', checkAllLoaded, { once: true });
                            img.addEventListener('error', checkAllLoaded, { once: true }); // Reveal even on error
                        }
                    });
                } else {
                    // No images (text only blocks), reveal immediately
                    reveal();
                }
            }
        });
    }, observerOptions);

    // Observe elements with reveal classes
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .img-container, .content-block');
    console.log(`Found ${revealElements.length} elements to observe for reveal`);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Scroll to Top Button Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
