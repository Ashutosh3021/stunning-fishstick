(function() {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const isMobileViewport = width <= 768;
    const currentPath = window.location.pathname;
    const isMobilePath = currentPath.includes('/prototype_mobile/');
    const isDesktopPath = currentPath.includes('/prototype_desktop/');

    // Determine correct classification
    let classification = isMobileViewport ? 'mobile' : 'desktop';
    
    // Store in sessionStorage if not already set
    if (!sessionStorage.getItem('cc_device_class')) {
        sessionStorage.setItem('cc_device_class', classification);
    } else {
        classification = sessionStorage.getItem('cc_device_class');
    }

    // Routing Logic
    if (classification === 'mobile' && isDesktopPath) {
        // Redirect from desktop to mobile equivalent
        let mobilePath = currentPath.replace('/prototype_desktop/', '/prototype_mobile/');
        // Mapping specific desktop pages to mobile equivalents if names differ
        mobilePath = mobilePath.replace('code_landing.html', 'code_home.html');
        mobilePath = mobilePath.replace('code_volunteer_desktop.html', 'code_home.html'); // Fallback or specific mapping
        mobilePath = mobilePath.replace('code_contact_desktop.html', 'code_contact.html');
        mobilePath = mobilePath.replace('code_faq.html', 'code_chatbot.html');
        mobilePath = mobilePath.replace('code_dashbord.html', 'code_impact.html');
        window.location.replace(mobilePath);
    } else if (classification === 'desktop' && isMobilePath) {
        // Redirect from mobile to desktop equivalent
        let desktopPath = currentPath.replace('/prototype_mobile/', '/prototype_desktop/');
        // Mapping specific mobile pages to desktop equivalents
        desktopPath = desktopPath.replace('code_home.html', 'code_landing.html');
        desktopPath = desktopPath.replace('code_chatbot.html', 'code_faq.html');
        desktopPath = desktopPath.replace('code_impact.html', 'code_dashbord.html');
        desktopPath = desktopPath.replace('code_psf.html', 'code_form1.html');
        desktopPath = desktopPath.replace('code_contact.html', 'code_contact_desktop.html');
        window.location.replace(desktopPath);
    }

    // 4.1 Touch target safeguard runtime check
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        window.addEventListener('load', () => {
            const touchElements = document.querySelectorAll('button, a, input, [role="button"]');
            touchElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    console.warn(`[CareConnect] Touch target too small (${rect.width}x${rect.height}px):`, el);
                }
            });
        });
    }
})();