/* =========================================
   Navigation JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('header');

    // Mobile Menu Toggle
    if (menuToggle && mobileMenu) {
        // Handle menu toggle with better mobile support
        const handleToggle = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;

            menuToggle.setAttribute('aria-expanded', newState.toString());
            mobileMenu.classList.toggle('active');

            // Toggle body scroll
            if (newState) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        };

        // Add click event
        menuToggle.addEventListener('click', handleToggle);

        // Add touch event for better mobile support (prevent double-tap zoom)
        menuToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleToggle(e);
        }, { passive: false });
    } else {
        // Debug: log if elements are not found
        console.warn('Menu toggle elements not found:', {
            menuToggle: !!menuToggle,
            mobileMenu: !!mobileMenu
        });
    }

    // Sticky Header Effect
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nav-logo');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking outside (on overlay background)
    if (mobileMenu) {
        const menuContent = mobileMenu.querySelector('.mobile-menu-content');
        mobileMenu.addEventListener('click', (e) => {
            // Close if clicking on the overlay itself, but not on menu content or links
            if (e.target === mobileMenu || (!menuContent.contains(e.target) && !e.target.closest('.mobile-nav'))) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Dynamic Year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

