import { App, PluginSettingTab, Setting, Notice, type SettingDefinitionItem, requireApiVersion } from 'obsidian';
import LinearPlugin from './main';
import { LinearService } from './services/LinearService';

export class LinearSettingsTab extends PluginSettingTab {
    plugin: LinearPlugin;

    constructor(app: App, plugin: LinearPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        if (!requireApiVersion('1.13.0')) return [];

        return [
            {
                name: 'Linear integration settings',
                render: (setting) => {
                    setting.settingEl.empty();
                    setting.settingEl.createEl('h2', { text: 'Linear Integration Settings' });
                }
            },
            {
                name: 'API configuration',
                aliases: ['Linear API key', 'Connection test'],
                render: (setting) => {
                    setting.settingEl.empty();
                    this.createApiKeySection(setting.settingEl);
                }
            },
            {
                name: 'Debugging & troubleshooting',
                aliases: ['Debug mode'],
                render: (setting) => {
                    setting.settingEl.empty();
                    this.createDebugSection(setting.settingEl);
                }
            },
            {
                name: 'Usage examples',
                render: (setting) => {
                    setting.settingEl.empty();
                    this.createHelpSection(setting.settingEl);
                }
            }
        ];
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Main heading
        containerEl.createEl('h2', { text: 'Linear Integration Settings' });

        // API Configuration Section
        this.createApiKeySection(containerEl);

        // Debug Section
        this.createDebugSection(containerEl);

        // Help Section
        this.createHelpSection(containerEl);
    }

    private createApiKeySection(containerEl: HTMLElement): void {
        const apiSection = containerEl.createDiv();
        apiSection.createEl('h3', { text: 'API Configuration' });

        // API Key setting with enhanced description
        const apiKeySetting = new Setting(apiSection)
            .setName('Linear API Key')
            .setDesc('')
            .addText(text => {
                text.setPlaceholder('lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value.trim();
                        await this.plugin.saveSettings();
                        this.updateConnectionStatus();
                    });

                // Add input validation styling
                text.inputEl.addEventListener('input', () => {
                    const isValid = this.validateApiKey(text.getValue());
                    text.inputEl.removeClass('linear-api-valid', 'linear-api-invalid');
                    if (text.getValue().length > 0) {
                        text.inputEl.addClass(isValid ? 'linear-api-valid' : 'linear-api-invalid');
                    }
                });

                return text;
            });

        // Add detailed description below the setting
        const descEl = apiKeySetting.descEl;
        descEl.innerHTML = `
            <div style="margin-top: 8px;">
                <p><strong>How to get your Linear API key:</strong></p>
                <ol style="margin: 8px 0; padding-left: 20px;">
                    <li>Open <a href="https://linear.app/settings/api" target="_blank" rel="noopener">Linear Settings → API</a></li>
                    <li>Click "Create API key"</li>
                    <li>Give it a descriptive name (e.g., "Obsidian Integration")</li>
                    <li>Copy the generated key and paste it above</li>
                </ol>
                <p style="margin-top: 8px; padding: 8px; background-color: var(--background-modifier-border); border-radius: 4px; font-size: 0.9em;">
                    <strong>Important:</strong> Keep your API key secure. It provides access to your Linear data.
                    The key should start with <code>lin_api_</code> and be about 40 characters long.
                </p>
            </div>
        `;

        // Test Connection button
        new Setting(apiSection)
            .setName('Connection Test')
            .setDesc('Verify your API key and connection to Linear')
            .addButton(button => {
                button.setButtonText('Test Connection')
                    .setCta()
                    .onClick(async () => {
                        await this.testConnection(button);
                    });
            });

        // Connection status indicator
        const statusEl = apiSection.createDiv('linear-connection-status');
        this.updateConnectionStatus(statusEl);
    }

    private createDebugSection(containerEl: HTMLElement): void {
        const debugSection = containerEl.createDiv();
        debugSection.createEl('h3', { text: 'Debugging & Troubleshooting' });

        const debugSetting = new Setting(debugSection)
            .setName('Debug Mode')
            .setDesc('')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        new Notice('Debug mode enabled. Check the developer console for detailed logs.', 5000);
                    }
                }));

        // Enhanced debug description
        const debugDescEl = debugSetting.descEl;
        debugDescEl.innerHTML = `
            <div style="margin-top: 8px;">
                <p>Enable comprehensive logging to help troubleshoot issues with the Linear integration.</p>

                <div style="margin: 12px 0; padding: 12px; background-color: var(--background-modifier-border); border-radius: 4px;">
                    <p><strong>When enabled, debug logs will show:</strong></p>
                    <ul style="margin: 8px 0; padding-left: 20px;">
                        <li>API requests and responses</li>
                        <li>Filter applications and matching results</li>
                        <li>Issue processing and rendering steps</li>
                        <li>Due date calculations</li>
                        <li>Team and status lookups</li>
                    </ul>

                    <p style="margin-top: 8px;"><strong>To view debug logs:</strong></p>
                    <ol style="margin: 8px 0; padding-left: 20px;">
                        <li>Open Developer Console (<kbd>Ctrl+Shift+I</kbd> or <kbd>Cmd+Option+I</kbd>)</li>
                        <li>Look for messages prefixed with <code>Linear Plugin:</code></li>
                    </ol>
                </div>

                <div style="margin-top: 8px; padding: 8px; background-color: var(--background-modifier-error); border-radius: 4px; font-size: 0.9em;">
                    <strong>Performance Note:</strong> Debug mode may slightly impact performance.
                    Disable it during normal use to keep your console clean.
                </div>
            </div>
        `;
    }

    private createHelpSection(containerEl: HTMLElement): void {
        const helpSection = containerEl.createDiv();
        helpSection.createEl('h3', { text: 'Usage Examples' });

        const helpContent = helpSection.createDiv();
        helpContent.innerHTML = `
            <div style="margin: 12px 0;">
                <p><strong>Fetch a single issue by ID:</strong></p>
                <pre style="background-color: var(--background-modifier-border); padding: 8px; border-radius: 4px; margin: 8px 0;"><code>\`\`\`linear
id: LIN-123
\`\`\`</code></pre>

                <p style="margin-top: 16px;"><strong>Fetch multiple issues:</strong></p>
                <pre style="background-color: var(--background-modifier-border); padding: 8px; border-radius: 4px; margin: 8px 0;"><code>\`\`\`linear
ids:
  - LIN-123
  - LIN-456
  - LIN-789
\`\`\`</code></pre>

                <p style="margin-top: 16px;"><strong>Filter issues with options:</strong></p>
                <pre style="background-color: var(--background-modifier-border); padding: 8px; border-radius: 4px; margin: 8px 0;"><code>\`\`\`linear
team: Engineering
status: In Progress
assignee: user@example.com
sorting: dateascending
limit: 5
hideDescription: true
\`\`\`</code></pre>

                <p style="margin-top: 16px;"><strong>Need more help?</strong></p>
                <ul style="margin: 8px 0; padding-left: 20px;">
                    <li><a href="https://github.com/caseybecking/obsidian-linear-plugin" target="_blank" rel="noopener">Plugin Documentation</a></li>
                    <li><a href="https://linear.app/docs/graphql-api" target="_blank" rel="noopener">Linear API Documentation</a></li>
                    <li>Enable Debug Mode above for detailed troubleshooting</li>
                </ul>
            </div>
        `;
    }

    private validateApiKey(apiKey: string): boolean {
        // Basic validation for Linear API key format
        return /^lin_api_[a-zA-Z0-9]{32,}$/.test(apiKey);
    }

    private async testConnection(button: any): Promise<void> {
        if (!this.plugin.settings.apiKey) {
            new Notice('Please enter your Linear API key first.', 3000);
            return;
        }

        if (!this.validateApiKey(this.plugin.settings.apiKey)) {
            new Notice('Invalid API key format. Please check your Linear API key.', 4000);
            return;
        }

        const originalText = button.buttonEl.textContent;
        button.setButtonText('Testing...');
        button.setDisabled(true);

        try {
            const testService = new LinearService(this.plugin.settings);
            const teams = await testService.getTeams();

            if (teams && teams.length > 0) {
                new Notice(`Connection successful! Found ${teams.length} team(s).`, 4000);
                this.updateConnectionStatus(undefined, 'connected');
            } else {
                new Notice('Connected but no teams found. Check your permissions.', 4000);
                this.updateConnectionStatus(undefined, 'warning');
            }
        } catch (error) {
            new Notice(`Connection failed: ${error.message || 'Unknown error'}`, 5000);
            this.updateConnectionStatus(undefined, 'error');
        } finally {
            button.setButtonText(originalText);
            button.setDisabled(false);
        }
    }

    private updateConnectionStatus(statusEl?: HTMLElement, status?: 'connected' | 'error' | 'warning'): void {
        const container = statusEl || this.containerEl.querySelector('.linear-connection-status');
        if (!container) return;

        container.empty();

        if (!this.plugin.settings.apiKey) {
            container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9em;">No API key configured</span>`;
            return;
        }

        const isValidFormat = this.validateApiKey(this.plugin.settings.apiKey);

        if (!isValidFormat) {
            container.innerHTML = `<span style="color: var(--text-error); font-size: 0.9em;">Invalid API key format</span>`;
            return;
        }

        switch (status) {
            case 'connected':
                container.innerHTML = `<span style="color: var(--text-success); font-size: 0.9em;">Connection verified</span>`;
                break;
            case 'error':
                container.innerHTML = `<span style="color: var(--text-error); font-size: 0.9em;">Connection failed</span>`;
                break;
            case 'warning':
                container.innerHTML = `<span style="color: var(--text-warning); font-size: 0.9em;">Connected with limited access</span>`;
                break;
            default:
                container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9em;">Click "Test Connection" to verify</span>`;
        }
    }
}
