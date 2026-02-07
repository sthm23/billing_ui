import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonClasses, ButtonModule, ButtonTemplates } from 'primeng/button';
import { FileUpload, FileUploadErrorEvent, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  imports: [
    ButtonModule,
    FileUploadModule,
    ToastModule,
    BadgeModule, ProgressBarModule,
  ],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit, OnDestroy {
  files: any[] = [];
  totalSizePercent = 0;
  totalSize = 0;
  maxFileSize: number = 1024000 * 4; // 1 MB

  @Output() uploadComplete = new EventEmitter<string[]>();

  @Input() cancel: Subject<boolean> | undefined;

  ngOnChanges(changes: SimpleChanges) {
    changes['cancel'].currentValue.subscribe((value: boolean) => {
      if (value) {
        if (this.uploadElement) {
          this.uploadElement.clear()
        }
        this.clear();
      }
    });
  }

  @ViewChild('uploadElement') uploadElement!: FileUpload;

  messageService = inject(MessageService);

  ngOnInit() {
  }

  choose(event: Event, choose: () => void) {
    choose();
  }

  upload(upload: () => void) {
    upload();
  }

  clear(clearCB?: () => void) {
    if (clearCB) {
      clearCB()
    }
    this.files = [];
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  onUploadError(event: FileUploadErrorEvent) {
    const message = event?.error?.error?.message || 'Error uploading images. Please try again.';
    this.showNotification('Upload photo', 'error', message);
  }

  onUpload(event: FileUploadEvent) {
    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];
      this.files.push({ file, path: (event.originalEvent as any).body[i] });
    }

    this.uploadComplete.emit(this.files.map(file => file.path));
    this.showNotification('Upload photo', 'info', 'Images uploaded successfully!');
  }



  private showNotification(title: string, bgColor: 'info' | 'success' | 'error', message: string) {
    this.messageService.add({ severity: bgColor, summary: title, detail: message, life: 3000 })
  }

  ngOnDestroy() {
    if (this.uploadElement) {
      this.uploadElement.clear()
    }
    if (this.cancel) {
      this.cancel.complete();
    }
  }
}
