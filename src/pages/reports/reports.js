import BaseElement from '../../components/BaseElement.js';
import '../../components/ui/ui-table.js';
import { ApiService } from '../../services/api.js';

export default class ReportPage extends BaseElement {
    constructor() {
        super();
        this._state = {
            reportType: 'SOA', // 'SOA' | 'DELEGATE_DEBTS' | 'DAILY_PERFORMANCE'
            customers: [],
            selectedCustomerId: '',
            startDate: '',
            endDate: '',
            reportData: null,
            loading: false
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.fetchCustomers();

        // Set default dates (Start of month to Today)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.setState({
            startDate: firstDay.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        });
    }

    async fetchCustomers() {
        try {
            const customers = await ApiService.get('/customers');
            this.setState({ customers });
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    }

    async fetchReport() {
        const { reportType, selectedCustomerId, startDate, endDate } = this._state;

        if (reportType === 'SOA' && !selectedCustomerId) {
            this.setState({ reportData: null });
            return;
        }

        try {
            this.setState({ loading: true });
            let data = null;
            const queryParams = `?startDate=${startDate}&endDate=${endDate}`;

            if (reportType === 'SOA') {
                data = await ApiService.get(`/reports/soa/${selectedCustomerId}${queryParams}`);
            } else if (reportType === 'DELEGATE_DEBTS') {
                data = await ApiService.get(`/reports/delegate-debts${queryParams}`);
            } else if (reportType === 'DAILY_PERFORMANCE') {
                data = await ApiService.get(`/reports/daily-performance${queryParams}`);
            }

            this.setState({ reportData: data, loading: false });
        } catch (error) {
            console.error('Failed to fetch report', error);
            this.setState({ loading: false });
        }
    }

    setReportType(type) {
        this.setState({
            reportType: type,
            reportData: null,
            selectedCustomerId: ''
        });

        if (type !== 'SOA') {
            this.fetchReport();
        }
    }

    template() {
        const { customers, reportData, loading, reportType, selectedCustomerId, startDate, endDate } = this._state;

        return `
            <div class="reports-page">
                <header class="mb-8">
                    <h2 class="text-3xl font-bold text-slate-900">Financial Reports</h2>
                    <p class="text-slate-500">Generate financial insights with detailed balance tracking</p>
                </header>

                <div class="card p-6 mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div class="form-group mb-0">
                            <label>Report Type</label>
                            <select id="report-type-select">
                                <option value="SOA" ${reportType === 'SOA' ? 'selected' : ''}>Statement of Account</option>
                                <option value="DELEGATE_DEBTS" ${reportType === 'DELEGATE_DEBTS' ? 'selected' : ''}>Debts by Delegate</option>
                                <option value="DAILY_PERFORMANCE" ${reportType === 'DAILY_PERFORMANCE' ? 'selected' : ''}>Performance Report</option>
                            </select>
                        </div>

                        ${reportType === 'SOA' ? `
                            <div class="form-group mb-0">
                                <label>Select Customer</label>
                                <select id="report-customer-select">
                                    <option value="">-- Choose Customer --</option>
                                    ${customers.map(c => `<option value="${c.id}" ${c.id === selectedCustomerId ? 'selected' : ''}>${c.name}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}

                        <div class="form-group mb-0">
                            <label>Start Date</label>
                            <input type="date" id="start-date-input" value="${startDate}">
                        </div>

                        <div class="form-group mb-0">
                            <label>End Date</label>
                            <input type="date" id="end-date-input" value="${endDate}">
                        </div>
                    </div>
                    <div class="mt-4 text-right">
                         <button id="refresh-report-btn" class="btn btn-primary">Generate Report</button>
                    </div>
                </div>

                ${loading ? '<div class="p-12 text-center"><div class="spinner"></div><p class="text-slate-500 mt-2">Crunching numbers...</p></div>' : ''}

                ${!loading && reportData ? this.renderReportContent() : ''}
            </div>
        `;
    }

    renderReportContent() {
        const { reportType, reportData } = this._state;

        if (reportType === 'SOA') return this.renderSOA(reportData);
        if (reportType === 'DELEGATE_DEBTS') return this.renderDelegateDebts(reportData);
        if (reportType === 'DAILY_PERFORMANCE') return this.renderDailyPerformance(reportData);
    }

    renderSOA(data) {
        return `
            <div class="card p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="flex justify-between items-start border-bottom pb-6 mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900">${data.customer.name}</h3>
                        <p class="text-slate-500">Phone: ${data.customer.phone || 'N/A'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-slate-500">Statement Period</p>
                        <p class="font-bold">${new Date(this._state.startDate).toLocaleDateString()} - ${new Date(this._state.endDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6 mb-8">
                    <div class="bg-emerald-50 p-4 rounded border border-emerald-100">
                        <p class="text-xs font-bold text-emerald-700 uppercase">Cash Due</p>
                        <p class="text-xl font-bold text-emerald-900">$${data.balance.cash_due.toLocaleString()}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded border border-blue-100">
                        <p class="text-xs font-bold text-blue-700 uppercase">Cheque Due</p>
                        <p class="text-xl font-bold text-blue-900">$${data.balance.cheque_due.toLocaleString()}</p>
                    </div>
                    <div class="bg-slate-900 p-4 rounded text-white">
                        <p class="text-xs font-bold text-slate-400 uppercase">Total Debt</p>
                        <p class="text-xl font-bold text-white">$${data.balance.total_due.toLocaleString()}</p>
                    </div>
                </div>

                <h4 class="font-bold mb-4">Transaction History</h4>
                <table class="w-full text-sm">
                    <thead class="bg-slate-50 border-y">
                        <tr>
                            <th class="p-3 text-left">Date</th>
                            <th class="p-3 text-left">Type</th>
                            <th class="p-3 text-left">Reference</th>
                            <th class="p-3 text-right">Debit</th>
                            <th class="p-3 text-right">Credit</th>
                            <th class="p-3 text-right text-emerald-700 bg-emerald-50">Run Cash</th>
                            <th class="p-3 text-right text-blue-700 bg-blue-50">Run Cheque</th>
                            <th class="p-3 text-right text-slate-700 bg-slate-100">Run Total</th>
                            <th class="p-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${data.history.length ? data.history.map(item => `
                            <tr>
                                <td class="p-3 text-slate-500">${new Date(item.createdAt || item.created_at).toLocaleDateString()}</td> <!-- Updated to support both cases -->
                                <td class="p-3 font-medium">${item.type}</td>
                                <td class="p-3">${item.reference}</td>
                                <td class="p-3 text-right font-bold text-slate-900">${item.delta > 0 ? `$${Number(item.delta).toLocaleString()}` : '-'}</td>
                                <td class="p-3 text-right font-bold text-emerald-600">${item.delta < 0 ? `$${Math.abs(Number(item.delta)).toLocaleString()}` : '-'}</td>
                                
                                <td class="p-3 text-right font-bold text-emerald-700 bg-emerald-50/50">
                                    $${Number(item.running_cash).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td class="p-3 text-right font-bold text-blue-700 bg-blue-50/50">
                                    $${Number(item.running_cheque).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td class="p-3 text-right font-bold text-slate-900 bg-slate-50">
                                    $${Number(item.running_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                
                                <td class="p-3 text-right font-semibold ${item.status === 'EXCEPTION' ? 'text-amber-600' : 'text-slate-500'}">${item.status}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="9" class="p-4 text-center text-slate-500">No activity in this period</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderDelegateDebts(data) {
        return `
            <div class="card p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 class="font-bold">Delegate Debt Summary</h3>
                    <span class="text-sm text-slate-500">filtered by invoice date</span>
                </div>
                <table class="w-full">
                    <thead class="bg-white border-b">
                        <tr>
                            <th class="p-4 text-left">Delegate Name</th>
                            <th class="p-4 text-left">Active Customers</th>
                            <th class="p-4 text-center">Cash Debt</th>
                            <th class="p-4 text-center">Cheque Debt</th>
                            <th class="p-4 text-right">Total Outstanding</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${data.map(row => `
                            <tr>
                                <td class="p-4 font-medium">${row.delegateName}</td>
                                <td class="p-4 text-slate-500">${row.customerCount}</td>
                                <td class="p-4 text-center font-bold text-emerald-600 bg-emerald-50/50 border-x border-dashed border-emerald-100">$${Number(row.totalCashDue).toLocaleString()}</td>
                                <td class="p-4 text-center font-bold text-blue-600 bg-blue-50/50 border-x border-dashed border-blue-100">$${Number(row.totalChequeDue).toLocaleString()}</td>
                                <td class="p-4 text-right font-bold text-slate-900">$${Number(row.totalDue).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderDailyPerformance(data) {
        return `
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="grid grid-cols-2 gap-6 mb-8">
                    <div class="card p-6 bg-slate-900 text-white">
                        <p class="text-sm font-medium text-slate-400">Total Invoiced (Period)</p>
                        <p class="text-3xl font-bold mt-2">$${data.totals.invoices_amount.toLocaleString()}</p>
                        <p class="text-sm mt-2 text-slate-400">${data.totals.invoices_count} Invoices Created</p>
                    </div>
                    <div class="card p-6 bg-emerald-600 text-white">
                        <p class="text-sm font-medium text-emerald-100">Total Collected (Period)</p>
                        <p class="text-3xl font-bold mt-2">$${data.totals.payments_amount.toLocaleString()}</p>
                        <p class="text-sm mt-2 text-emerald-100">${data.totals.payments_count} Payments Recorded</p>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="card p-0">
                        <div class="p-4 bg-slate-50 border-b font-bold">Invoices in Period</div>
                        <div class="max-h-[400px] overflow-y-auto">
                            <table class="w-full text-sm">
                                <tbody class="divide-y">
                                    ${data.invoices.length ? data.invoices.map(inv => `
                                        <tr>
                                            <td class="p-3">${inv.invoiceNumber}</td>
                                            <td class="p-3 text-slate-500">${inv.customerName}</td>
                                            <td class="p-3 text-right font-bold">$${Number(inv.totalAmount).toLocaleString()}</td>
                                        </tr>
                                    `).join('') : '<tr><td class="p-4 text-center text-slate-400">No invoices in range</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card p-0">
                        <div class="p-4 bg-slate-50 border-b font-bold">Payments in Period</div>
                        <div class="max-h-[400px] overflow-y-auto">
                            <table class="w-full text-sm">
                                <tbody class="divide-y">
                                    ${data.payments.length ? data.payments.map(rec => `
                                        <tr>
                                            <td class="p-3">${rec.customerName}</td>
                                            <td class="p-3 text-slate-500">${rec.method}</td>
                                            <td class="p-3 text-right font-bold text-emerald-600">$${Number(rec.amount).toLocaleString()}</td>
                                        </tr>
                                    `).join('') : '<tr><td class="p-4 text-center text-slate-400">No payments in range</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        super.render();
        // Event listeners (lines 302-333) remain largely same but `data` properties were updated in render methods
        const typeSelect = this.querySelector('#report-type-select');
        const customerSelect = this.querySelector('#report-customer-select');
        const startDateInput = this.querySelector('#start-date-input');
        const endDateInput = this.querySelector('#end-date-input');
        const refreshBtn = this.querySelector('#refresh-report-btn');

        if (typeSelect) {
            typeSelect.onchange = (e) => this.setReportType(e.target.value);
        }

        if (customerSelect) {
            customerSelect.onchange = (e) => {
                this._state.selectedCustomerId = e.target.value;
                this.fetchReport();
            };
        }

        if (startDateInput) {
            startDateInput.onchange = (e) => this._state.startDate = e.target.value;
        }

        if (endDateInput) {
            endDateInput.onchange = (e) => this._state.endDate = e.target.value;
        }

        if (refreshBtn) {
            refreshBtn.onclick = () => this.fetchReport();
        }
    }
}

customElements.define('app-reports', ReportPage);
