import BaseElement from '../../components/BaseElement.js';
import '../../components/ui/ui-table.js';
import '../../components/ui/ui-dialog.js';
import { ApiService } from '../../services/api.js';

export default class DelegatePage extends BaseElement {
    constructor() {
        super();
        this._state = {
            delegates: [],
            loading: true,
            isSubmitting: false
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadDelegates();
    }

    async loadDelegates() {
        try {
            this.setState({ loading: true });
            const delegates = await ApiService.get('/delegates');
            this.setState({ delegates, loading: false });
        } catch (error) {
            console.error('Failed to load delegates', error);
            this.setState({ loading: false });
        }
    }

    template() {
        const { loading } = this._state;

        return `
            <div class="delegates-page">
                <header class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Delegate Management</h2>
                    <button class="btn btn-primary" id="open-delegate-modal">+ Add Delegate</button>
                </header>

                ${loading ? '<p>Loading delegates...</p>' : `
                    <ui-table id="delegate-table"></ui-table>
                `}

                <ui-dialog id="delegate-modal" title="Add New Delegate">
                    <div slot="content">
                        <form id="delegate-form">
                            <div class="form-group">
                                <label>Delegate Name</label>
                                <input type="text" name="name" placeholder="Full Name" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" placeholder="Phone Number">
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <select name="role">
                                    <option value="SALES">Sales Agent</option>
                                    <option value="DELIVERY">Delivery Driver</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                            <div class="mt-6 flex justify-end gap-2">
                                <button type="button" class="btn btn-slate-200" id="cancel-delegate-btn">Cancel</button>
                                <button type="submit" class="btn btn-primary" ${this._state.isSubmitting ? 'disabled' : ''}>
                                    ${this._state.isSubmitting ? 'Saving...' : 'Add Delegate'}
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

        const table = this.querySelector('#delegate-table');
        if (table) {
            table.columns = [
                { key: 'name', label: 'Full Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'role', label: 'Role' },
                {
                    key: 'actions',
                    label: 'Actions',
                    render: (val, row) => `<button class="btn btn-danger btn-sm delete-delegate-btn" data-id="${row.id}">Delete</button>`
                }
            ];
            table.data = this._state.delegates;
        }
    }

    setupEventListeners() {
        const modal = this.querySelector('#delegate-modal');
        const openBtn = this.querySelector('#open-delegate-modal');
        const cancelBtn = this.querySelector('#cancel-delegate-btn');
        const form = this.querySelector('#delegate-form');

        if (openBtn) openBtn.onclick = () => modal.show();
        if (cancelBtn) cancelBtn.onclick = () => modal.close();

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                try {
                    this.setState({ isSubmitting: true });
                    await ApiService.post('/delegates', data);
                    modal.close();
                    await this.loadDelegates();
                } catch (error) {
                    alert('Error creating delegate: ' + error.message);
                } finally {
                    this.setState({ isSubmitting: false });
                }
            };
        }

        // Action buttons (Delete)
        this.querySelectorAll('.delete-delegate-btn').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('Are you sure you want to delete this delegate?')) {
                    try {
                        await ApiService.delete(`/delegates/${btn.dataset.id}`);
                        await this.loadDelegates();
                    } catch (error) {
                        alert('Error deleting delegate: ' + error.message);
                    }
                }
            };
        });
    }
}

customElements.define('app-delegates', DelegatePage);
