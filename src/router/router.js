/**
 * Simple Vanilla Router using History API
 */
export default class Router {
    constructor(routes, outletId) {
        this.routes = routes;
        this.outlet = document.getElementById(outletId);

        // Listen for back/forward navigation
        window.addEventListener('popstate', () => this.handleRoute());

        // Initial route handling
        document.addEventListener('DOMContentLoaded', () => this.handleRoute());

        // Intercept all link clicks for SPA feel
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    navigate(path) {
        window.history.pushState(null, null, path);
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['*'];

        if (route) {
            // Clear outlet and insert new component
            this.outlet.innerHTML = `<${route.tagName}></${route.tagName}>`;
        }
    }
}
