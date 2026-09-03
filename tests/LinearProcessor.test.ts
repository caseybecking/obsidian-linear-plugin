import { describe, it, expect, vi } from 'vitest';
import { LinearProcessor } from '../src/processors/LinearProcessor';
import { DEFAULT_SETTINGS } from '../src/settings';

const ISSUE = {
    id: 'issue-uuid',
    identifier: 'ENG-8161',
    title: 'Go services in dev cluster load production.yaml instead of dev.yaml',
    url: 'https://linear.app/acme/issue/ENG-8161',
    description: 'Some **markdown** body',
    dueDate: undefined as string | undefined,
    state: Promise.resolve({ name: 'Done' })
};

function setup(issue: Partial<typeof ISSUE> = {}) {
    const el = document.createElement('div');
    const processor = new LinearProcessor({ ...DEFAULT_SETTINGS }, el, {} as any);
    vi.spyOn((processor as any).linearService, 'getIssueById').mockResolvedValue({ ...ISSUE, ...issue });
    const ctx = { sourcePath: 'note.md' } as any;
    return { el, processor, ctx };
}

async function render(source: string, issue?: Partial<typeof ISSUE>) {
    const { el, processor, ctx } = setup(issue);
    await processor.process(source, el, ctx);
    return el;
}

describe('parseOptions', () => {
    const parse = (source: string) => (setup().processor as any).parseOptions(source);

    it('reads the hide flags when set to true', () => {
        expect(parse('id: ENG-1\nhideDescription: true\nhideTitle: true\nhideDueDate: true'))
            .toEqual({ hideDescription: true, hideTitle: true, hideDueDate: true });
    });

    it('ignores hide flags that are not boolean true', () => {
        expect(parse('hideTitle: "true"\nhideDueDate: 1\nhideDescription: false')).toEqual({});
    });
});

describe('rendering a single issue', () => {
    it('shows identifier, title, status, due date and description by default', async () => {
        const el = await render('id: ENG-8161');
        const link = el.querySelector('.linear-issue-title')!;
        expect(link.textContent).toBe(`ENG-8161: ${ISSUE.title}`);
        expect(link.getAttribute('href')).toBe(ISSUE.url);
        expect(el.querySelector('.linear-issue-status')!.textContent).toBe('Done');
        expect(el.querySelector('.linear-issue-due-date')!.textContent).toBe('📅 No due date');
        expect(el.querySelector('.linear-issue-description')!.textContent).toBe(ISSUE.description);
        expect(el.querySelector('.linear-issue-header-compact')).toBeNull();
    });

    it('hideDescription omits the description', async () => {
        const el = await render('id: ENG-8161\nhideDescription: true');
        expect(el.querySelector('.linear-issue-description')).toBeNull();
        expect(el.querySelector('.linear-issue-title')).not.toBeNull();
    });

    it('hideTitle keeps the identifier link but drops the title text', async () => {
        const el = await render('id: ENG-8161\nhideTitle: true');
        const link = el.querySelector('.linear-issue-title')!;
        expect(link.textContent).toBe('ENG-8161');
        expect(link.getAttribute('href')).toBe(ISSUE.url);
        expect(el.querySelector('.linear-issue-header')!.classList.contains('linear-issue-header-compact')).toBe(true);
    });

    it('hideDueDate omits the metadata row even when the issue has a due date', async () => {
        const el = await render('id: ENG-8161\nhideDueDate: true', { dueDate: '2099-01-01' });
        expect(el.querySelector('.linear-issue-metadata')).toBeNull();
        expect(el.querySelector('.linear-issue-due-date')).toBeNull();
    });

    it('shows a real due date when hideDueDate is not set', async () => {
        const el = await render('id: ENG-8161', { dueDate: '2099-01-01' });
        const due = el.querySelector('.linear-issue-due-date')!;
        expect(due.classList.contains('upcoming')).toBe(true);
        expect(due.textContent).toMatch(/^📅 Due: /);
    });

    it('all three hide flags leave only the identifier and status badge', async () => {
        const el = await render('id: ENG-8161\nhideDescription: true\nhideTitle: true\nhideDueDate: true');
        const issue = el.querySelector('.linear-issue')!;
        expect(issue.children).toHaveLength(1);
        const header = issue.children[0];
        expect(header.classList.contains('linear-issue-header-compact')).toBe(true);
        expect(Array.from(header.children).map(c => c.textContent)).toEqual(['ENG-8161', 'Done']);
    });
});
