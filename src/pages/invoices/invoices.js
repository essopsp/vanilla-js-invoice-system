import BaseElement from '../../components/BaseElement.js';
import '../../components/ui/ui-table.js';
import '../../components/ui/ui-dialog.js';
import { ApiService } from '../../services/api.js';
import { calculateInvoiceSplit } from '../../lib/finance.js';

export default class InvoicePage extends BaseElement {
    constructor() {
        super();
        this._state = {
            invoices: [],
            customers: [],
            loading: true,
            isSubmitting: false,
            newInvoice: {
                customer_id: '',
                total_amount: ''
            }
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
    }

    async loadData() {
        try {
            this.setState({ loading: true });
            const [invoices, customers] = await Promise.all([
                ApiService.get('/invoices'),
                ApiService.get('/customers')
            ]);
            this.setState({ invoices, customers, loading: false });
        } catch (error) {
            console.error('Failed to load invoice data', error);
            this.setState({ loading: false });
        }
    }

    template() {
        const { loading, customers, newInvoice } = this._state;
        const splits = newInvoice.total_amount ? calculateInvoiceSplit(Number(newInvoice.total_amount)) : { cashDebt: 0, chequeDebt: 0 };

        return `
            <div class="invoices-page">
                <header class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Invoice Management</h2>
                    <button class="btn btn-primary" id="open-invoice-modal">+ Create Invoice</button>
                </header>

                ${loading ? '<p>Loading invoices...</p>' : `
                    <ui-table id="invoice-table"></ui-table>
                `}

                <ui-dialog id="invoice-modal" title="Create New Invoice">
                    <div slot="content">
                        <form id="invoice-form">
                            <div class="form-group">
                                <label>Customer</label>
                                <select name="customer_id" required>
                                    <option value="">Select a customer</option>
                                    ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Total Amount</label>
                                <input type="number" name="total_amount" step="0.01" placeholder="0.00" required id="total-amount-input">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded border border-slate-200">
                                <div>
                                    <p class="text-xs font-medium text-slate-500">CASH DEBT (1/3)</p>
                                    <p class="text-lg font-bold text-emerald-600" id="cash-debt-display">$${splits.cashDebt.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-slate-500">CHEQUE DEBT (2/3)</p>
                                    <p class="text-lg font-bold text-blue-600" id="cheque-debt-display">$${splits.chequeDebt.toFixed(2)}</p>
                                </div>
                            </div>

                            <div class="mt-6 flex justify-end gap-2">
                                <button type="button" class="btn btn-slate-200" id="cancel-invoice-btn">Cancel</button>
                                <button type="submit" class="btn btn-primary" ${this._state.isSubmitting ? 'disabled' : ''}>
                                    ${this._state.isSubmitting ? 'Saving...' : 'Create Invoice'}
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

        const table = this.querySelector('#invoice-table');
        if (table) {
            table.columns = [
                { key: 'invoiceNumber', label: 'Invoice #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'totalAmount', label: 'Total' },
                { key: 'remainingCashDebt', label: 'Cash Due' },
                { key: 'remainingChequeDebt', label: 'Cheque Due' },
                { key: 'status', label: 'Status' }
            ];
            table.data = this._state.invoices;
        }
    }

    setupEventListeners() {
        const modal = this.querySelector('#invoice-modal');
        const openBtn = this.querySelector('#open-invoice-modal');
        const cancelBtn = this.querySelector('#cancel-invoice-btn');
        const form = this.querySelector('#invoice-form');
        const amountInput = this.querySelector('#total-amount-input');

        if (openBtn) openBtn.onclick = () => modal.show();
        if (cancelBtn) cancelBtn.onclick = () => modal.close();

        if (amountInput) {
            amountInput.oninput = (e) => {
                const amount = e.target.value;
                const { cashDebt, chequeDebt } = calculateInvoiceSplit(Number(amount));
                this.querySelector('#cash-debt-display').innerText = `$${cashDebt.toFixed(2)}`;
                this.querySelector('#cheque-debt-display').innerText = `$${chequeDebt.toFixed(2)}`;
            };
        }

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = {
                    customerId: formData.get('customer_id'),
                    totalAmount: Number(formData.get('total_amount'))
                };

                try {
                    this.setState({ isSubmitting: true });
                    await ApiService.post('/invoices', data);
                    modal.close();
                    await this.loadData(); // Refresh list
                } catch (error) {
                    alert('Error creating invoice: ' + error.message);
                } finally {
                    this.setState({ isSubmitting: false });
                }
            };
        }
    }
}

customElements.define('app-invoices', InvoicePage);
