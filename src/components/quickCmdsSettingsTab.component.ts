import { Component } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService } from 'terminus-core'
import { QuickCmds, ICmdGroup } from '../api'
import { EditCommandModalComponent } from './editCommandModal.component'
import { PromptModalComponent } from './promptModal.component'

@Component({
    template: require('./quickCmdsSettingsTab.component.pug'),
})
export class QuickCmdsSettingsTabComponent {
    commands: QuickCmds[]
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}

    constructor (
        public config: ConfigService,
        private ngbModal: NgbModal,
    ) {
        this.commands = this.config.store.qc.cmds
        this.refresh()
    }

    createCommand () {
        let command: QuickCmds = {
            name: '',
            text: '',
            appendCR: true,
        }

        let modal = this.ngbModal.open(EditCommandModalComponent)
        modal.componentInstance.command = command
        modal.result.then(result => {
            this.commands.push(result)
            this.config.store.qc.cmds = this.commands
            this.config.save()
            this.refresh()
        })
    }

    editCommand (command: QuickCmds) {
        let modal = this.ngbModal.open(EditCommandModalComponent)
        modal.componentInstance.command = Object.assign({}, command)
        modal.result.then(result => {
            Object.assign(command, result)
            this.config.save()
            this.refresh()
        })
    }

    deleteCommand (command: QuickCmds) {
        if (confirm(`Delete "${command.name}"?`)) {
            this.commands = this.commands.filter(x => x !== command)
            this.config.store.qc.cmds = this.commands
            this.config.save()
            this.refresh()
        }
    }

    editGroup (group: ICmdGroup) {
        let modal = this.ngbModal.open(PromptModalComponent)
        modal.componentInstance.prompt = 'New group name'
        modal.componentInstance.value = group.name
        modal.result.then(result => {
            if (result) {
                for (let connection of this.commands.filter(x => x.group === group.name)) {
                    connection.group = result
                }
                this.config.save()
                this.refresh()
            }
        })
    }

    deleteGroup (group: ICmdGroup) {
        if (confirm(`Delete "${group}"?`)) {
            for (let command of this.commands.filter(x => x.group === group.name)) {
                command.group = null
            }
            this.config.save()
            this.refresh()
        }
    }

    refresh () {
        this.childGroups = []

        for (let command of this.commands) {
            command.group = command.group || null
            let group = this.childGroups.find(x => x.name === command.group)
            if (!group) {
                group = {
                    name: command.group,
                    cmds: [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(command)
        }
    }
}
