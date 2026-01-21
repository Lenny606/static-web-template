/* =========================================
   Cookie Consent & Tracking Management
   ========================================= */

const CONSENT_KEY = 'dbda_consent';
const GTM_ID = 'GTM-XXXXXXX'; // Replace with client GTM ID

/**
 * Global Consent Object
 * {
 *   necessary: true (always),
 *   analytical: bool,
 *   functional: bool,
 *   marketing: bool
 * }
 */

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
    console.log('DBDA studio: GTM initialized');
}

// Push to dataLayer helper
function pushToDataLayer(eventData) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
}

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const settingsPanel = document.getElementById('cookie-settings-panel');
    const mainActions = document.getElementById('cookie-main-actions');

    const acceptAllBtn = document.getElementById('accept-cookies');
    const saveSettingsBtn = document.getElementById('save-cookie-settings');
    const settingsToggleBtn = document.getElementById('settings-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    // Category Toggles
    const analyticalToggle = document.getElementById('cookie-analytical');
    const functionalToggle = document.getElementById('cookie-functional');
    const marketingToggle = document.getElementById('cookie-marketing');

    // Check for existing consent
    const savedConsent = localStorage.getItem(CONSENT_KEY);

    if (!savedConsent && banner) {
        banner.classList.remove('hidden');
    } else if (savedConsent) {
        applyConsent(JSON.parse(savedConsent));
    }

    function applyConsent(consent) {
        if (consent.analytical) {
            loadGTM();
            pushToDataLayer({ 'event': 'consent_analytical_granted' });
        }

        if (consent.functional) {
            pushToDataLayer({ 'event': 'consent_functional_granted' });
            // Other functional logic can go here (e.g. IG Feed enables)
        }

        window.dbdaConsent = consent;
        // Trigger custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('dbdaConsentUpdated', { detail: consent }));
    }

    function saveConsent(consent) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        applyConsent(consent);
        if (banner) banner.classList.add('hidden');
    }

    // Event Listeners
    if (settingsToggleBtn && settingsPanel && mainActions) {
        settingsToggleBtn.addEventListener('click', () => {
            mainActions.classList.add('hidden');
            settingsPanel.classList.remove('hidden');
        });
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            saveConsent({
                necessary: true,
                analytical: true,
                functional: true,
                marketing: true
            });
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveConsent({
                necessary: true,
                analytical: analyticalToggle?.checked || false,
                functional: functionalToggle?.checked || false,
                marketing: marketingToggle?.checked || false
            });
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveConsent({
                necessary: true,
                analytical: false,
                functional: false,
                marketing: false
            });
        });
    }
});
