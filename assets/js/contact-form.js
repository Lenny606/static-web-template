/**
 * Contact Form Handler
 * Handles validation and submission of the contact form.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // MailerSend Configuration
    // IMPORTANT: In production, it is recommended to use a server-side proxy
    // to avoid exposing your API token in the frontend.
    const MAILERSEND_API_TOKEN = 'mlsn.9e8b9261b8c502124e9109daed81a7ef36cca56d9b34b66ebcaa9d758fe648b8'; // Replace with your token
    const SENDER_EMAIL = 'info@nodeflow.site'; // Replace with your verified sender email
    const RECIPIENT_EMAIL = "thomas.kravcik@gmail.com";

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Detect language
    const isEn = document.documentElement.lang === 'en';

    // Translations
    const translations = {
        sending: isEn ? 'Sending...' : 'Odesílám...',
        success: isEn ? 'Thank you! Your message has been sent.' : 'Děkujeme! Vaše zpráva byla odeslána.',
        error: isEn ? 'Sorry, something went wrong. Please try again later.' : 'Omlouváme se, něco se nepovedlo. Zkuste to prosím později.',
        nameRequired: isEn ? 'Name is required.' : 'Jméno je povinné.',
        emailRequired: isEn ? 'Email is required.' : 'Email je povinný.',
        emailInvalid: isEn ? 'Please enter a valid email.' : 'Zadejte platný email.',
        messageRequired: isEn ? 'Message is required.' : 'Zpráva je povinná.'
    };

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
        if (!name) errors.push(translations.nameRequired);
        if (!email) {
            errors.push(translations.emailRequired);
        } else if (!validateEmail(email)) {
            errors.push(translations.emailInvalid);
        }
        if (!message) errors.push(translations.messageRequired);

        if (errors.length > 0) {
            showFeedback(errors.join(' '), true);
            return;
        }

        // Processing state
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>${translations.sending}</span><span class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-4"></span>`;

        try {
            const response = await fetch('https://api.mailersend.com/v1/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MAILERSEND_API_TOKEN}`,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    from: {
                        email: SENDER_EMAIL,
                        name: 'DBDA Contact Form'
                    },
                    to: [
                        {
                            email: RECIPIENT_EMAIL,
                            name: 'DBDA Studio'
                        }
                    ],
                    reply_to: {
                        email: email,
                        name: name
                    },
                    subject: `New Contact Form Submission: ${name}`,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                    html: `<h3>New Contact Form Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
                }),
            });

            if (response.ok || response.status === 202) {
                showFeedback(translations.success, false);
                contactForm.reset();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('MailerSend Error:', errorData);
                throw new Error('Chyba při odesílání.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFeedback(translations.error, true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });
});

