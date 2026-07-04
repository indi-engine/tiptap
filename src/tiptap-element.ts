// src/tiptap-element.ts
import r2wc from '@r2wc/react-to-web-component'
import { TiptapWCAdapter } from '@/components/tiptap-web-component/tiptap-wc-adapter'
import { installTiptapMessageRegistry } from '@/components/tiptap-web-component/tiptap-messages'

installTiptapMessageRegistry()

const ReactTiptapElement = r2wc(TiptapWCAdapter, {
    props: {
        value: 'string',
        toolbar: 'string',
        toolbarItems: 'string',
        placeholder: 'string',
        locale: 'string',
        disabled: 'boolean',
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
        return Array.from(new Set([...baseAttributes, 'value', 'placeholder', 'locale', 'disabled']))
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

        if (name === 'value') {
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

        if (this.getAttribute('value') !== nextValue) {
            this.setAttribute('value', nextValue)
        }
    }

    get disabled() {
        return this.hasAttribute('disabled')
    }

    set disabled(value: boolean) {
        if (value) {
            this.setAttribute('disabled', '')
        } else {
            this.removeAttribute('disabled')
        }
    }

    get placeholder() {
        return this.getAttribute('placeholder') ?? ''
    }

    set placeholder(value: string) {
        this.setAttribute('placeholder', String(value ?? ''))
    }

    get locale() {
        return this.getAttribute('locale') ?? 'en'
    }

    set locale(value: string) {
        this.setAttribute('locale', String(value ?? 'en'))
    }

    setValueFromEditor(value: string) {
        this._value = String(value ?? '')
    }

    private initializeValue() {
        if (this._defaultValue !== undefined && this._value !== undefined) return

        const initialValue =
            this.getAttribute('value') ??
            this.textContent ??
            ''

        if (this._defaultValue === undefined) {
            this._defaultValue = initialValue
        }

        if (this._value === undefined) {
            this._value = this._defaultValue
        }

        if (this.getAttribute('value') !== this._value) {
            this.setAttribute('value', this._value)
        }
    }
}

customElements.define('tiptap-editor', TiptapElement)
