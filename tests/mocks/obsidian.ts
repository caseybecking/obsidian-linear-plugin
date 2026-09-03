import { load } from 'js-yaml';

export class App {}

export class Notice {
    constructor(public message: string) {}
}

export class MarkdownRenderChild {
    constructor(public containerEl: HTMLElement) {}
    onload() {}
    onunload() {}
}

export const MarkdownRenderer = {
    async render(_app: App, markdown: string, el: HTMLElement) {
        el.textContent = markdown;
    }
};

export function parseYaml(yaml: string): any {
    return load(yaml);
}
