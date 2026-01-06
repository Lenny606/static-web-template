/* =========================================
   Analytics & Consent Mode
   ========================================= */

const CONSENT_KEY = 'dbda_consent_status';
const GTM_ID = 'GTM-XXXXXXX'; // Replace with client GTM ID

// Initialize GTM
function loadGTM() {
    if (window.gtmLoaded) return;

    (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);

    window.gtmLoaded = true;
    console.log('DBDA studio Analytics: GTM initialized');
}

// Push to dataLayer helper
function pushToDataLayer(eventData) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
}

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('consent-banner');
    const btnAccept = document.getElementById('consent-accept');
    const btnDeny = document.getElementById('consent-deny');

    const savedConsent = localStorage.getItem(CONSENT_KEY);

    // Initial check
    if (!savedConsent) {
        banner.classList.add('show');
    } else if (savedConsent === 'granted') {
        loadGTM();
        pushToDataLayer({
            'event': 'consent_status',
            'status': 'granted'
        });
    }

    // Accept Logic
    if (btnAccept) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'granted');
            banner.classList.remove('show');
            loadGTM();
            pushToDataLayer({
                'event': 'consent_status',
                'status': 'granted'
            });
        });
    }

    // Deny Logic
    if (btnDeny) {
        btnDeny.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'denied');
            banner.classList.remove('show');
            pushToDataLayer({
                'event': 'consent_status',
                'status': 'denied'
            });
        });
    }

    // CTA Tracking
    document.querySelectorAll('.btn, a').forEach(el => {
        el.addEventListener('click', (e) => {
            const label = el.textContent.trim() || el.getAttribute('aria-label') || 'unlabeled';
            const category = el.classList.contains('btn') ? 'button' : 'link';

            pushToDataLayer({
                'event': 'interaction',
                'interaction_type': 'click',
                'interaction_category': category,
                'interaction_label': label
            });
        });
    });
});

