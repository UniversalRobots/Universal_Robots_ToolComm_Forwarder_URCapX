import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { ApplicationPresenterAPI, ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';
import { ToolCommForwarderApplicationNode } from './tool-comm-forwarder-application.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';

@Component({
    templateUrl: './tool-comm-forwarder-application.component.html',
    styleUrls: ['./tool-comm-forwarder-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ToolCommForwarderApplicationComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // applicationNode is required
    @Input() applicationNode: ToolCommForwarderApplicationNode;
    private backendUrl: string;
    
    public baseTranslationKey: string = 'application.nodes.universal-robots-tool-comm-forwarder-tool-comm-forwarder-application';
    public canStopServer = signal<boolean>(false);
    public canStartServer = signal<boolean>(false);

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
            this.backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'tool-comm-forwarder-backend', 'rest-api');   
        
            const response = await this.fetchData(`${location.protocol}//${this.backendUrl}/is_server_running`);
            const running: boolean = response.running;
            this.canStartServer.set(!running);
            this.canStopServer.set(running);
        }   
    }

    startSocatServer = async (): Promise<void> => {
        const response = await this.fetchData(`${location.protocol}//${this.backendUrl}/socat_server`, {action: "start"});
        if (response.success) {
            this.canStartServer.set(false);
            this.canStopServer.set(true);
        }
        this.cd.detectChanges();
    };

    stopSocatServer = async (): Promise<void> => {
        const response = await this.fetchData(`${location.protocol}//${this.backendUrl}/socat_server`, {action: "stop"});
        if (response.success) {
            this.canStartServer.set(true);
            this.canStopServer.set(false);
        }
        this.cd.detectChanges();
    };

    async fetchData(url: string, action?: Record<string, unknown>): Promise<Record<string, boolean>> {
        if (action) {
            // POST
            const requestOptions: RequestInit = {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action)
            };
            const response = await fetch(url, requestOptions);
            return await response.json();
        } else {
            // GET
            const response = await fetch(url);
            return await response.json();
        }
    }
}
