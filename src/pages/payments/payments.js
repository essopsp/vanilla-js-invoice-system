import BaseElement from '../../components/BaseElement.js';
import '../../components/ui/ui-table.js';
import '../../components/ui/ui-dialog.js';
import { ApiService } from '../../services/api.js';

export default class PaymentPage extends BaseElement {
    constructor() {
        super();
        this._state = {
            payments: [],
            customers: [],
            invoices: [],
            loading: true,
            isSubmitting: false,
            selectedCustomerId: '',
            selectedInvoiceId: ''
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
    }

    async loadData() {
        try {
            this.setState({ loading: true });
            const [payments, customers] = await Promise.all([
                ApiService.get('/payments'),
                ApiService.get('/customers')
            ]);
            this.setState({ payments, customers, loading: false });
        } catch (error) {
            console.error('Failed to load payment data', error);
            this.setState({ loading: false });
        }
    }

    async fetchCustomerInvoices(customerId) {
        if (!customerId) {
            this._state.invoices = [];
            this.updateInvoicesDropdown();
            return;
        }
        try {
            const invoices = await ApiService.get(`/invoices?customer_id=${customerId}`);
            this._state.invoices = invoices;
            this.updateInvoicesDropdown();
        } catch (error) {
            console.error('Failed to fetch customer invoices', error);
        }
    }

    updateInvoicesDropdown() {
        const select = this.querySelector('#payment-invoice-select');
        if (!select) return;

        const { invoices } = this._state;
        select.innerHTML = `<option value="">General Balance</option>` +
            invoices.map(i => `<option value="${i.id}">${i.invoiceNumber} ($${i.totalAmount})</option>`).join('');

        // Clear preview
        const preview = this.querySelector('#invoice-preview-box');
        if (preview) preview.innerHTML = '';
    }

    updateInvoicePreview(invoiceId) {
        const preview = this.querySelector('#invoice-preview-box');
        if (!preview) return;

        const invoice = this._state.invoices.find(i => i.id === invoiceId);
        if (!invoice) {
            preview.innerHTML = '';
            return;
        }

        // Using dynamic remaining debt from API
        preview.innerHTML = `
            <div class="p-3 bg-blue-50 border border-blue-100 rounded mb-4 text-sm">
                <p class="font-medium text-blue-800">Remaining Debt on ${invoice.invoiceNumber}:</p>
                <div class="flex gap-4 mt-1">
                    <span class="text-emerald-700">Cash: $${Number(invoice.remainingCashDebt).toFixed(2)}</span>
                    <span class="text-blue-700">Cheque: $${Number(invoice.remainingChequeDebt).toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    template() {
        const { loading, customers, invoices, selectedInvoiceId } = this._state;

        return `
            <div class="payments-page">
                <header class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Payment Management</h2>
                    <button class="btn btn-success" id="open-payment-modal">+ Record Payment</button>
                </header>

                ${loading ? '<p>Loading payments...</p>' : `
                    <ui-table id="payment-table"></ui-table>
                `}

                <ui-dialog id="payment-modal" title="Record New Payment">
                    <div slot="content">
                        <form id="payment-form">
                            <div class="form-group">
                                <label>Customer</label>
                                <select name="customerId" id="payment-customer-select" required>
                                    <option value="">Select a customer</option>
                                    ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Link to Invoice (Optional)</label>
                                <select name="invoiceId" id="payment-invoice-select">
                                    <option value="">General Balance</option>
                                    ${invoices.map(i => `<option value="${i.id}">${i.invoiceNumber} ($${i.totalAmount})</option>`).join('')}
                                </select>
                            </div>

                            <div id="invoice-preview-box">
                                <!-- Dynamic preview injected here -->
                            </div>

                            <div class="form-group">
                                <label>Amount</label>
                                <input type="number" name="amount" step="0.01" placeholder="0.00" required>
                            </div>
                            <div class="form-group">
                                <label>Payment Method</label>
                                <select name="method" required>
                                    <option value="CASH">Cash</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>
                            <div class="form-group flex items-center gap-2">
                                <input type="checkbox" name="isException" id="is-exception" style="width: auto;">
                                <label for="is-exception" class="mb-0">Mark as Exception (Treat as Cash fund)</label>
                            </div>

                            <div class="mt-6 flex justify-end gap-2">
                                <button type="button" class="btn btn-slate-200" id="cancel-payment-btn">Cancel</button>
                                <button type="submit" class="btn btn-success" ${this._state.isSubmitting ? 'disabled' : ''}>
                                    ${this._state.isSubmitting ? 'Processing...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </ui-dialog>
            </div>
        `;
    }

    render() {
        super.render();
        this.setupEventListeners();

        const table = this.querySelector('#payment-table');
        if (table) {
            table.columns = [
                { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
                { key: 'customerName', label: 'Customer' },
                { key: 'amount', label: 'Amount', render: (val) => `$${Number(val).toLocaleString()}` },
                { key: 'method', label: 'Method' },
                { key: 'invoiceNumber', label: 'Ref Invoice' }
            ];
            table.data = this._state.payments;
        }
    }

    setupEventListeners() {
        const modal = this.querySelector('#payment-modal');
        const openBtn = this.querySelector('#open-payment-modal');
        const cancelBtn = this.querySelector('#cancel-payment-btn');
        const form = this.querySelector('#payment-form');
        const customerSelect = this.querySelector('#payment-customer-select');
        const invoiceSelect = this.querySelector('#payment-invoice-select');

        if (openBtn) openBtn.onclick = () => modal.show();
        if (cancelBtn) cancelBtn.onclick = () => modal.close();

        if (customerSelect) {
            customerSelect.onchange = (e) => {
                const customerId = e.target.value;
                this._state.selectedCustomerId = customerId;
                this._state.selectedInvoiceId = '';
                this.fetchCustomerInvoices(customerId);
            };
        }

        if (invoiceSelect) {
            invoiceSelect.onchange = (e) => {
                const invoiceId = e.target.value;
                this._state.selectedInvoiceId = invoiceId;
                this.updateInvoicePreview(invoiceId);
            };
        }

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                data.amount = Number(data.amount);
                data.isException = formData.get('isException') === 'on';

                try {
                    this.setState({ isSubmitting: true });
                    await ApiService.post('/payments', data);
                    modal.close();
                    await this.loadData();
                } catch (error) {
                    alert('Error recording payment: ' + error.message);
                } finally {
                    this.setState({ isSubmitting: false });
                }
            };
        }
    }
}

customElements.define('app-payments', PaymentPage);
