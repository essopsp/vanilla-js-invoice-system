import BaseElement from '../BaseElement.js';

/**
 * <ui-table>
 * Custom Element for data tables
 */
export default class UITable extends BaseElement {
    constructor() {
        super();
        this._state = {
            columns: [],
            data: []
        };
    }

    set columns(cols) { this.setState({ columns: cols }); }
    set data(rows) { this.setState({ data: rows }); }

    template() {
        const { columns, data } = this._state;

        return `
            <div class="table-container card">
                <table>
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.length > 0
                ? data.map(row => `
                                <tr>
                                    ${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
                                </tr>
                            `).join('')
                : `<tr><td colspan="${columns.length}" class="text-center p-8 text-slate-400">No data available</td></tr>`
            }
                    </tbody>
                </table>
            </div>
        `;
    }
}

customElements.define('ui-table', UITable);
