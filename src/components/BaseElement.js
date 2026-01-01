/**
 * BaseElement: A lightweight wrapper for native Web Components
 */
export default class BaseElement extends HTMLElement {
    constructor() {
        super();
        this._state = {};
    }

    /**
     * Set state and trigger a re-render
     */
    setState(newState) {
        this._state = { ...this._state, ...newState };
        this.render();
    }

    /**
     * Life cycle hook called when element is added to DOM
     */
    connectedCallback() {
        this.render();
    }

    /**
     * Clear and redraw the component
     */
    render() {
        this.innerHTML = this.template();
    }

    /**
     * Override this in child components
     */
    template() {
        return ``;
    }
}
