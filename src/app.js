import Router from './router/router.js';
import './pages/dashboard/dashboard.js';
import './pages/customers/customers.js';
import './pages/invoices/invoices.js';
import './pages/payments/payments.js'; // Renamed
import './pages/reports/reports.js';
import './pages/delegates/delegates.js';

export default class App extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="app-layout">
                <nav class="sidebar">
                    <h1>Inovices Managment System</h1>
                    <ul class="nav-links">
                        <li><a href="/" data-link>Dashboard</a></li>
                        <li><a href="/customers" data-link>Customers</a></li>
                        <li><a href="/delegates" data-link>Delegates</a></li>
                        <li><a href="/invoices" data-link>Invoices</a></li>
                        <li><a href="/payments" data-link>Payments</a></li>
                        <li><a href="/reports" data-link>Reports</a></li>
                    </ul>
                </nav>
                <main id="router-outlet">
                    <p>Loading application...</p>
                </main>
            </div>
        `;
    }

    connectedCallback() {
        // Initialize Router
        this.router = new Router({
            '/': { tagName: 'app-dashboard' },
            '/customers': { tagName: 'app-customers' },
            '/delegates': { tagName: 'app-delegates' },
            '/invoices': { tagName: 'app-invoices' },
            '/payments': { tagName: 'app-payments' }, // Updated
            '/reports': { tagName: 'app-reports' },
            '*': { tagName: 'app-dashboard' }
        }, 'router-outlet');

        console.log('Inovices Managment System Manager Initialized');
    }
}

customElements.define('app-root', App);
