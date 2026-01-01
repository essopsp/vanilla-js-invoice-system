import BaseElement from '../../components/BaseElement.js';
import { ApiService } from '../../services/api.js';

export default class DashboardPage extends BaseElement {
    constructor() {
        super();
        this._state = {
            stats: {
                totalCashDebt: 0,
                totalChequeDebt: 0,
                totalInvoiceVolume: 0
            },
            customerCount: 0,
            recentActivity: [],
            loading: true
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.fetchStats();
    }

    async fetchStats() {
        try {
            this.setState({ loading: true });
            const data = await ApiService.get('/dashboard/stats');
            this.setState({ ...data, loading: false });
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            this.setState({ loading: false });
        }
    }

    template() {
        const { stats, customerCount, recentActivity, loading } = this._state;
        const totalDebt = (Number(stats.totalCashDebt) || 0) + (Number(stats.totalChequeDebt) || 0);

        return `
            <div class="dashboard">
                <header class="mb-8">
                    <h2 class="text-3xl font-bold text-slate-900">Financial Overview</h2>
                    <p class="text-slate-500">Real-time split debt tracking & collection status</p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="card p-6 border-l-4 border-emerald-500">
                        <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Cash Debt</p>
                        <h3 class="text-2xl font-bold text-emerald-600 mt-1">$${(Number(stats.totalCashDebt) || 0).toLocaleString()}</h3>
                        <p class="text-xs text-slate-400 mt-2">Required for immediate operations</p>
                    </div>
                    <div class="card p-6 border-l-4 border-blue-500">
                        <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Cheque Debt</p>
                        <h3 class="text-2xl font-bold text-blue-600 mt-1">$${(Number(stats.totalChequeDebt) || 0).toLocaleString()}</h3>
                        <p class="text-xs text-slate-400 mt-2">Bank transfers & deferred payments</p>
                    </div>
                    <div class="card p-6 border-l-4 border-slate-900 bg-slate-900 text-white">
                        <p class="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Outstanding</p>
                        <h3 class="text-2xl font-bold mt-1">$${totalDebt.toLocaleString()}</h3>
                        <p class="text-xs text-slate-500 mt-2">Across ${customerCount} active customers</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="card">
                        <div class="p-4 border-bottom flex justify-between items-center">
                            <h3 class="font-bold">Recent Collections</h3>
                            <a href="/payments" data-link class="text-sm text-primary font-medium">View All</a>
                        </div>
                        <div class="p-0">
                            ${recentActivity.length === 0 ? '<p class="p-6 text-slate-500">No recent activity</p>' : `
                                <table class="w-full text-sm">
                                    <tbody class="divide-y">
                                        ${recentActivity.map(r => `
                                            <tr>
                                                <td class="p-4">
                                                    <p class="font-medium">${r.customerName}</p>
                                                    <p class="text-xs text-slate-400">${new Date(r.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td class="p-4 text-right">
                                                    <span class="font-bold text-emerald-600">+$${Number(r.amount).toLocaleString()}</span>
                                                    <p class="text-xs text-slate-400">${r.method}</p>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            `}
                        </div>
                    </div>

                    <div class="card p-6">
                        <h3 class="font-bold mb-4">Collection Health</h3>
                        <div class="flex items-center gap-4 mb-6">
                            <div class="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden flex">
                                <div class="h-full bg-emerald-500" style="width: ${totalDebt > 0 ? (stats.totalCashDebt / totalDebt * 100) : 0}%"></div>
                                <div class="h-full bg-blue-500" style="width: ${totalDebt > 0 ? (stats.totalChequeDebt / totalDebt * 100) : 0}%"></div>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 bg-emerald-500 rounded-full"></span> Cash Liquid</span>
                                <span class="font-medium">${totalDebt > 0 ? (stats.totalCashDebt / totalDebt * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 bg-blue-500 rounded-full"></span> Banking Assets</span>
                                <span class="font-medium">${totalDebt > 0 ? (stats.totalChequeDebt / totalDebt * 100).toFixed(1) : 100}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('app-dashboard', DashboardPage);
