import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

export enum DialogType {
  USER_CREATE = 'create',
};
export enum DialogMode {
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
};

export interface DialogData {
  name: string;
  phone: string;
}

@Component({
  selector: 'app-dialog',
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    InputMaskModule
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class DialogComponent {
  dialogType = DialogType;

  @Input() visible: boolean = false;
  @Input() mode: DialogMode = DialogMode.CREATE;
  @Input() type: DialogType = DialogType.USER_CREATE;

  @Input() title: string = '';
  @Input() subtitle: string = '';

  @Input() data: DialogData = { name: '', phone: '' };

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<DialogData>();

  hideDialog() {
    this.visibleChange.emit(!this.visible);
  }

  submit() {
    this.dataChange.emit(this.data);
    this.hideDialog();
  }
}
