// Obsidian extends HTMLElement with DOM helpers; recreate the ones the plugin uses.
type ElementInfo = {
    cls?: string | string[];
    text?: string;
    href?: string;
    attr?: Record<string, string | number | boolean | null>;
};

function createEl(this: HTMLElement, tag: string, info?: ElementInfo | string): HTMLElement {
    const el = document.createElement(tag);
    if (typeof info === 'string') {
        el.className = info;
    } else if (info) {
        if (info.cls) el.className = Array.isArray(info.cls) ? info.cls.join(' ') : info.cls;
        if (info.text !== undefined) el.textContent = info.text;
        if (info.href !== undefined) el.setAttribute('href', info.href);
        if (info.attr) {
            for (const [key, value] of Object.entries(info.attr)) {
                el.setAttribute(key, String(value));
            }
        }
    }
    this.appendChild(el);
    return el;
}

Object.assign(HTMLElement.prototype, {
    createEl,
    createDiv(this: HTMLElement, info?: ElementInfo | string) {
        return createEl.call(this, 'div', info);
    },
    createSpan(this: HTMLElement, info?: ElementInfo | string) {
        return createEl.call(this, 'span', info);
    },
    empty(this: HTMLElement) {
        this.replaceChildren();
    },
    addClass(this: HTMLElement, ...cls: string[]) {
        this.classList.add(...cls);
    },
    setText(this: HTMLElement, text: string) {
        this.textContent = text;
    }
});
