/**
 * Contact Form Handler
 * Handles validation and submission of the contact form.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form');
    if (!contactForm) return;

    // Add required IDs if they don't exist (though we'll add them in HTML too)
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Create feedback message container
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'mt-6 p-4 hidden text-sm font-medium transition-all duration-300';
    contactForm.appendChild(feedbackContainer);

    const showFeedback = (message, isError = false) => {
        feedbackContainer.textContent = message;
        feedbackContainer.classList.remove('hidden', 'text-red-500', 'text-green-500', 'bg-red-50/50', 'bg-green-50/50', 'dark:bg-red-900/20', 'dark:bg-green-900/20');

        if (isError) {
            feedbackContainer.classList.add('text-red-500', 'bg-red-50/50', 'dark:bg-red-900/20');
        } else {
            feedbackContainer.classList.add('text-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
        }
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic reset
        showFeedback('', false);
        feedbackContainer.classList.add('hidden');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Validation
        let errors = [];
        if (!name) errors.push('Jméno je povinné.');
        if (!email) {
            errors.push('Email je povinný.');
        } else if (!validateEmail(email)) {
            errors.push('Zadejte platný email.');
        }
        if (!message) errors.push('Zpráva je povinná.');

        if (errors.length > 0) {
            showFeedback(errors.join(' '), true);
            return;
        }

        // Processing state
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Odesílám...</span><span class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-4"></span>';

        try {
            // Using a placeholder URL for demonstration
            // In production, replace with actual API endpoint
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                showFeedback('Děkujeme! Vaše zpráva byla odeslána.', false);
                contactForm.reset();
            } else {
                throw new Error('Chyba při odesílání.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFeedback('Omlouváme se, něco se nepovedlo. Zkuste to prosím později.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });
});
