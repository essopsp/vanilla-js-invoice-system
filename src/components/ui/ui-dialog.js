import BaseElement from '../BaseElement.js';

/**
 * <ui-dialog>
 * Native <dialog> wrapper. Preserves light DOM children as content.
 */
export default class UIDialog extends BaseElement {
    constructor() {
        super();
        this._state = {
            title: '',
            isOpen: false
        };
        this._initialized = false;
    }

    set title(val) {
        this._state.title = val;
        const titleEl = this.querySelector('h3');
        if (titleEl) titleEl.innerText = val;
    }

    show() {
        const dialog = this.querySelector('dialog');
        if (dialog) dialog.showModal();
        this._state.isOpen = true;
    }

    close() {
        const dialog = this.querySelector('dialog');
        if (dialog) dialog.close();
        this._state.isOpen = false;
    }

    template() {
        const { title } = this._state;
        return `
            <dialog class="modal-dialog p-0">
                <div class="modal-header p-4 flex justify-between items-center bg-slate-50">
                    <h3 class="font-bold text-lg">${title}</h3>
                    <button class="close-btn p-2 hover:bg-slate-200 rounded" id="modal-close-btn">&times;</button>
                </div>
                <div class="modal-content p-6" id="dialog-content-area">
                    <!-- Content will be moved here -->
                </div>
            </dialog>
        `;
    }

    render() {
        if (this._initialized) return;

        // 1. Move existing children to a temporary holder
        const children = Array.from(this.childNodes);

        // 2. Render the dialog shell
        this.innerHTML = this.template();

        // 3. Move children into the content area
        const contentArea = this.querySelector('#dialog-content-area');
        if (contentArea) {
            children.forEach(node => contentArea.appendChild(node));
        }

        this._initialized = true;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addEventListener('click', (e) => {
            if (e.target.id === 'modal-close-btn') {
                this.close();
            }
            // Close on backdrop click
            if (e.target.tagName === 'DIALOG') {
                const rect = e.target.getBoundingClientRect();
                const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    this.close();
                }
            }
        });
    }
}

customElements.define('ui-dialog', UIDialog);
