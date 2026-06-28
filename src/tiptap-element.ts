// src/tiptap-element.ts
import r2wc from '@r2wc/react-to-web-component'
import { TiptapWCAdapter } from '@/components/tiptap-web-component/tiptap-wc-adapter'

const ReactTiptapElement = r2wc(TiptapWCAdapter, {
    props: {
        content: 'string',
        value: 'string',
        toolbar: 'string',
        toolbarItems: 'string',
    },
    shadow: 'open',
})

class TiptapElement extends ReactTiptapElement {
    private _defaultValue?: string
    private _value?: string

    static get observedAttributes() {
        const baseAttributes =
            (ReactTiptapElement as CustomElementConstructor & { observedAttributes?: string[] })
                .observedAttributes ?? []
        return Array.from(new Set([...baseAttributes, 'value', 'content']))
    }

    connectedCallback() {
        this.initializeValue()
        const connectedCallback = Object.getPrototypeOf(TiptapElement.prototype)
            .connectedCallback as (() => void) | undefined
        connectedCallback?.call(this)
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null
    ) {
        const attributeChangedCallback = Object.getPrototypeOf(TiptapElement.prototype)
            .attributeChangedCallback as
            | ((name: string, oldValue: string | null, newValue: string | null) => void)
            | undefined
        attributeChangedCallback?.call(this, name, oldValue, newValue)

        if (oldValue === newValue) return

        if (name === 'value' || name === 'content') {
            this.value = newValue ?? ''
        }
    }

    get defaultValue() {
        this.initializeValue()
        return this._defaultValue ?? ''
    }

    set defaultValue(value: string) {
        this._defaultValue = String(value ?? '')
        if (this._value === undefined) {
            this.value = this._defaultValue
        }
    }

    get value() {
        this.initializeValue()
        return this._value ?? ''
    }

    set value(value: string) {
        const nextValue = String(value ?? '')
        this._value = nextValue

        // Internal bridge to the React adapter. Consumers should use `.value`.
        if (this.getAttribute('content') !== nextValue) {
            this.setAttribute('content', nextValue)
        }
    }

    get content() {
        return this.value
    }

    set content(value: string) {
        this.value = value
    }

    setValueFromEditor(value: string) {
        this._value = String(value ?? '')
    }

    private initializeValue() {
        if (this._defaultValue !== undefined && this._value !== undefined) return

        const initialValue =
            this.getAttribute('value') ??
            this.getAttribute('content') ??
            this.innerHTML.trim()

        if (this._defaultValue === undefined) {
            this._defaultValue = initialValue
        }

        if (this._value === undefined) {
            this._value = this._defaultValue
        }

        if (this.getAttribute('content') !== this._value) {
            this.setAttribute('content', this._value)
        }
    }
}

customElements.define('tiptap-editor', TiptapElement)
