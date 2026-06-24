// src/tiptap-element.ts
import r2wc from '@r2wc/react-to-web-component'
import { TiptapWCAdapter } from '@/components/tiptap-web-component/tiptap-wc-adapter'
//import './styles.css' // your bundled Tiptap + template CSS

const TiptapElement = r2wc(TiptapWCAdapter, {
    props: {
        content: 'string',
    },
    shadow: 'open', // strongly recommended — see CSS note below
})

customElements.define('tiptap-editor', TiptapElement)
