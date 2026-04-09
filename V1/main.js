document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================================
       CUSTOM CURSOR LOGIC
       ========================================================================= */
    const cursorDot = document.querySelector('.cursor-dot');
    const hoverTargets = document.querySelectorAll('.hover-target, a');

    // Update cursor position only if not on touch device
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        });

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hovered');
            });
            target.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovered');
            });
        });
    }

    /* =========================================================================
       SCROLL ANIMATIONS (Intersection Observer)
       ========================================================================= */
    const animElements = document.querySelectorAll('.anim-line, .anim-line-delay, .anim-line-delay-long');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once initially visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // Optionally handle header staggered reveal when page loads
    // Since the hero is at the top, it should trigger immediately thanks to the observer.
});
