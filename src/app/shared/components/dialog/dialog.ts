import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-dialog',
  imports: [
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class DialogComponent {

  @Input() visible: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();

  hideDialog() {
    this.visibleChange.emit(!this.visible);
  }

  submit() {
    this.hideDialog();
  }
}
