import BaseElement from '../../components/BaseElement.js';
import '../../components/ui/ui-table.js';
import '../../components/ui/ui-dialog.js';
import { ApiService } from '../../services/api.js';

export default class CustomerPage extends BaseElement {
    constructor() {
        super();
        this._state = {
            customers: [],
            delegates: [],
            loading: true,
            isSubmitting: false
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadData();
    }

    async loadData() {
        try {
            this.setState({ loading: true });
            const [customers, delegates] = await Promise.all([
                ApiService.get('/customers'),
                ApiService.get('/delegates')
            ]);
            this.setState({ customers, delegates, loading: false });
        } catch (error) {
            console.error('Failed to load customer data', error);
            this.setState({ customers: [], delegates: [], loading: false });
        }
    }

    template() {
        const { loading, delegates } = this._state;

        return `
            <div class="customers-page">
                <header class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Customer Management</h2>
                    <button class="btn btn-primary" id="open-customer-modal">+ Add Customer</button>
                </header>

                ${loading ? '<p>Loading customers...</p>' : `
                    <ui-table id="customer-table"></ui-table>
                `}

                <ui-dialog id="customer-modal" title="Add New Customer">
                    <div slot="content">
                        <form id="customer-form">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" placeholder="Customer Name" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" placeholder="Phone Number">
                            </div>
                            <div class="form-group">
                                <label>Assigned Delegate</label>
                                <select name="delegateId">
                                    <option value="">Select a delegate</option>
                                    ${delegates.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mt-6 flex justify-end gap-2">
                                <button type="button" class="btn btn-slate-200" id="cancel-customer-btn">Cancel</button>
                                <button type="submit" class="btn btn-primary" ${this._state.isSubmitting ? 'disabled' : ''}>
                                    ${this._state.isSubmitting ? 'Saving...' : 'Add Customer'}
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

        const table = this.querySelector('#customer-table');
        if (table) {
            table.columns = [
                { key: 'name', label: 'Company Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'delegateName', label: 'Delegate' },
                { key: 'cashBalance', label: 'Cash Due', render: val => `<span class="text-emerald-600 font-bold">$${Number(val).toFixed(2)}</span>` },
                { key: 'chequeBalance', label: 'Cheque Due', render: val => `<span class="text-blue-600 font-bold">$${Number(val).toFixed(2)}</span>` },
                { key: 'totalBalance', label: 'Total', render: val => `<span class="font-bold">$${Number(val).toFixed(2)}</span>` }
            ];
            table.data = this._state.customers;
        }
    }

    setupEventListeners() {
        const modal = this.querySelector('#customer-modal');
        const openBtn = this.querySelector('#open-customer-modal');
        const cancelBtn = this.querySelector('#cancel-customer-btn');
        const form = this.querySelector('#customer-form');

        if (openBtn) openBtn.onclick = () => modal.show();
        if (cancelBtn) cancelBtn.onclick = () => modal.close();

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                try {
                    this.setState({ isSubmitting: true });
                    await ApiService.post('/customers', data);
                    modal.close();
                    await this.loadData();
                } catch (error) {
                    alert('Error creating customer: ' + error.message);
                } finally {
                    this.setState({ isSubmitting: false });
                }
            };
        }
    }
}

customElements.define('app-customers', CustomerPage);
