
document.addEventListener('DOMContentLoaded', () => {
    // Select the scroll track wrapper
    const scrollTrack = document.getElementById('hero-scroll-track');
    const textElements = document.querySelectorAll('.color-transition-text');

    if (!scrollTrack || textElements.length === 0) return;

    // Split text into characters
    textElements.forEach(element => {
        const text = element.innerText;
        element.innerHTML = '';

        [...text].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            // Initial state: Faint and White-ish
            // In light mode -> faint black looks white-ish/gray.
            // In dark mode -> faint white is also gray.
            // "Whiter" request: We can enforce a color like rgb(200,200,200) or just vary opacity.
            // Let's stick to opacity for natural blending, but start very low.
            span.style.opacity = '0.05';
            span.style.transition = 'color 0.1s ease';
            element.appendChild(span);
        });
    });

    const updateColor = () => {
        const trackRect = scrollTrack.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const trackTop = trackRect.top;
        const trackHeight = trackRect.height;

        // Calculate scroll progress within the track
        // We want 0% when track starts hitting top (or slightly before)
        // And 100% when track finishes scrolling (bottom of track hits bottom of viewport)

        // However, it's a sticky container. The content is pinned.
        // The "Distance Scrolled" is -trackTop.
        // Total Scrollable Distance is trackHeight - windowHeight.

        const scrollDistance = -trackTop;
        const totalDistance = trackHeight - windowHeight;

        // Clamp progress between 0 and 1
        let globalProgress = scrollDistance / totalDistance;
        globalProgress = Math.max(0, Math.min(1, globalProgress));

        textElements.forEach(element => {
            const spans = element.querySelectorAll('span');

            spans.forEach((span, index) => {
                // Stagger logic:
                // We want the sentence to "fill up" from left to right as we scroll.
                // Map globalProgress (0-1) to individual char progress.

                // Spread the transition across the scroll duration.
                // Let's say we want each char to take 20% of the scroll to fully transition,
                // and they start one after another.

                const totalChars = spans.length;
                const charStep = 0.8 / totalChars; // How much "progress" wait before this char starts

                // Adjusted progress for this specific character
                // It starts transitioning when globalProgress > (index / totalChars) * 0.5 (example)
                // Let's make it simpler:
                // Start range = index / totalChars
                // But we want it faster.

                // Start offset based on index (0 to ~0.7)
                const startOffset = (index / totalChars) * 0.7;
                // End offset (start + 0.3) -> rapid transition per char
                // The '0.3' is the "duration" of fade for one char relative to total scroll

                // Normalized progress for this char:
                // (GlobalProgress - StartOffset) / Duration

                let charProgress = (globalProgress - startOffset) / 0.3;
                charProgress = Math.max(0, Math.min(1, charProgress));

                // Interpolate Opacity
                // Start: 0.1 (Faint) -> End: 1.0 (Solid)
                const opacity = 0.3 + (charProgress * 0.9);
                span.style.opacity = opacity;

                // Optional: Dynamic Blur for extra "focusing" effect
                // Start: Blur(4px) -> End: Blur(0px)
                const blurAmount = (1 - charProgress) * 3;
                span.style.filter = `blur(${blurAmount}px)`;

                // Color interpolation (Visual "Whiter" to "Darker")
                // Start: rgb(200, 200, 200) -> End: currentColor
                // This is tricky with CSS vars, so sticking to Opacity + Blur is safest and visually very strong.
            });
        });
    };

    window.addEventListener('scroll', updateColor);
    window.addEventListener('resize', updateColor);

    // Initial call
    updateColor();
});
