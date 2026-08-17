(function ()
 {
    const defraScriptUrl = "https://environment.data.gov.uk/shared/cookies.min.js";

    var handleCookieConsent = function ()
    {
        function gtag() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(arguments);
        }

        function recordPageViewOnLoad() {
            gtag('js', new Date());
            gtag('config', window.swirrl.gtagUACode);
        }

        function recordPageViewManually() {
            gtag('js', new Date());
            gtag('config', window.swirrl.gtagUACode, {
                send_page_view: false
            });
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }

        function disableAnalytics() {
            window['ga-disable-' + window.swirrl.gtagUACode] = true;
        }

        function displayCookieBanner() {
            const cookieBanner = document.getElementById('cookie-banner');
            if (cookiePolicy.shouldCookieBannerBeDisplayed()) {
                cookieBanner.style.display = '';
                document.getElementById('accept-all-cookies').onclick = function (_ev) {
                    cookiePolicy.setUserCookiePolicy(true);
                    recordPageViewManually();
                    cookieBanner.style.display = 'none';
                };
            } else {
                cookieBanner.style.display = 'none';
            }
        }

        function initGtags() {
            var acceptedCookiesLevel = cookiePolicy.getUserAcceptedCookiePolicyLevel();
            if (acceptedCookiesLevel === "true") {
                recordPageViewOnLoad();
            } else if (acceptedCookiesLevel === "false") {
                disableAnalytics();
            }
        }

        if (window.swirrl.gtagUACode) {
            initGtags();
            displayCookieBanner();
        }

    };

    // Create script element for the defra cookie policy script
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = defraScriptUrl;
    // Call cookie consent function when it's loaded
    script.onload = handleCookieConsent;
    // Add it to the page
    head.appendChild(script);
 }).call(window);
