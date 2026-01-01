/**
 * Simple Reactive Store using Proxy
 */
export class Store {
    constructor(initialState = {}) {
        this.listeners = [];
        this.state = new Proxy(initialState, {
            set: (target, key, value) => {
                target[key] = value;
                this.notify();
                return true;
            }
        });
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        this.listeners.forEach(callback => callback(this.state));
    }
}

export const GlobalStore = new Store({
    user: null,
    customers: [],
    invoices: [],
    receipts: []
});
