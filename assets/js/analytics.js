/* =========================================
   Analytics & Consent Mode
   ========================================= */

const CONSENT_KEY = 'cookieConsent';
const GTM_ID = 'GTM-XXXXXXX'; // Placeholder GTM ID

// Initialize GTM
function loadGTM() {
    (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);

    console.log('GTM loaded');
}

// Push to dataLayer
function pushEvent(eventData) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
}

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('btn-accept');
    const btnDeny = document.getElementById('btn-deny');

    const savedConsent = localStorage.getItem(CONSENT_KEY);

    if (!savedConsent) {
        // Show banner
        if (banner) banner.hidden = false;
    } else if (savedConsent === 'granted') {
        loadGTM();
        pushEvent({
            'event': 'consent_granted',
            'consent_status': 'granted'
        });
    }

    if (btnAccept) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'granted');
            if (banner) banner.hidden = true;
            loadGTM();
            pushEvent({
                'event': 'consent_granted',
                'consent_status': 'granted'
            });
        });
    }

    if (btnDeny) {
        btnDeny.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'denied');
            if (banner) banner.hidden = true;
            pushEvent({
                'event': 'consent_denied',
                'consent_status': 'denied'
            });
        });
    }
});
