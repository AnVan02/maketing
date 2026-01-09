/**
 * Security Utility for API requests
 * Centrally manages backend URLs and request security (CSRF, Proxy, etc.)
 */

(function () {
    // Hidden internal configuration
    // This now points to our local proxy instead of the direct ngrok URL
    const API_PROXY_URL = 'api-handler.php?endpoint=';

    /**
     * Helper to get CSRF token (fallback if not available)
     */
    async function getCsrfToken() {
        return window.CSRF_TOKEN || "";
    }

    /**
     * Standardized API request function
     * @param {string} endpoint - The API endpoint (e.g., 'ui/configs')
     * @param {Object} options - Standard fetch options
     */
    async function apiRequest(endpoint, options = {}) {
        // Build the full URL using our proxy
        const url = API_PROXY_URL + endpoint;
        const token = localStorage.getItem('access_token');

        options.credentials = "include";
        options.headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        // Automatically add Authorization token if available
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        // Add CSRF token for mutating requests
        if (["POST", "PUT", "DELETE"].includes((options.method || "GET").toUpperCase())) {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                options.headers["X-CSRF-Token"] = csrfToken;
            }
        }

        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                console.error(`API Error: ${res.status} ${res.statusText}`);
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${res.status}`);
            }
            return await res.json();
        } catch (error) {
            console.error("API Fetch Failure:", error);
            throw error;
        }
    }

    /**
     * API request for FormData
     */
    async function apiRequestFormData(endpoint, formData, method = "POST") {
        const url = API_PROXY_URL + endpoint;
        const options = {
            method: method,
            credentials: "include",
            headers: {}
        };

        if (["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                options.headers["X-CSRF-Token"] = csrfToken;
            }
        }

        options.body = formData;

        try {
            const res = await fetch(url, options);
            return await res.json();
        } catch (error) {
            console.error("API Form Data Failure:", error);
            throw error;
        }
    }

    // Export to global scope
    window.apiRequest = apiRequest;
    window.apiRequestFormData = apiRequestFormData;

    // but the best way is to use apiRequest(endpoint)
    window.BACKEND_PROXY = API_PROXY_URL;

    console.log("🔒 Security layer initialized via proxy.");
})();