import { Injectable } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { HotkeysService, ToolbarButtonProvider, IToolbarButton } from 'terminus-core'
import { QuickCmdsModalComponent } from './components/quickCmdsModal.component'

@Injectable()
export class ButtonProvider extends ToolbarButtonProvider {
    constructor (
        private ngbModal: NgbModal,
        private domSanitizer: DomSanitizer,
        hotkeys: HotkeysService,
    ) {
        super()
        hotkeys.matchedHotkey.subscribe(async (hotkey) => {
            if (hotkey === 'qc') {
                this.activate()
            }
        })
    }

    activate () {
        this.ngbModal.open(QuickCmdsModalComponent)
    }

    provide (): IToolbarButton[] {
        return [{
            icon: this.domSanitizer.bypassSecurityTrustHtml(require('./icons/keyboard.svg')),
            weight: 5,
            title: 'Quick commands',
            touchBarNSImage: 'NSTouchBarOpenInBrowserTemplate',
            click: async () => {
                this.activate()
            }
        }]
    }
}
