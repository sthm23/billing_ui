import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FileUploadData, UploadImageRequest } from '../../../models/product.model';
import { FileUploadService } from '../../services/file-upload.service';
import { TranslocoPipe } from '@ngneat/transloco';


@Component({
  selector: 'app-file-upload',
  imports: [
    CommonModule,
    ButtonModule,
    FileUploadModule,
    ToastModule,
    BadgeModule,
    ProgressBarModule,
    TranslocoPipe
  ],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit, OnDestroy {
  destroyer$: Subject<void> = new Subject<void>();
  files = signal<File[]>([]);
  totalSizePercent = 0;
  totalSize = 0;
  maxFileSize: number = 1000000 * 4; // 4 MB

  @Output() uploadComplete = new EventEmitter<FileUploadData[]>();

  @Input({ required: true }) storeId?: string;
  @Input() cancel: Subject<boolean> | undefined;

  @ViewChild('fileUploader') uploadElement!: FileUpload;

  messageService = inject(MessageService);
  fileUploadService = inject(FileUploadService);

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const cancelChange = changes['cancel']

    if (cancelChange && cancelChange.currentValue) {
      cancelChange.currentValue
        .pipe(takeUntil(this.destroyer$))
        .subscribe((value: boolean) => {
          if (value) {
            if (this.uploadElement) {
              this.uploadElement.clear()
            }
            this.clear();
          }
        });
    }
  }


  customUpload(event: FileUploadHandlerEvent) {
    const reqData = this.makeRequestData(event.files);
    this.fileUploadService.uploadProductImages({ files: reqData }).subscribe({
      next: (res) => {
        const data = event.files.map((file, index) => {
          return {
            ...res[index],
            file: file,
            size: file.size,
          }
        }) as any[];

        this.uploadElement.uploadedFiles.push(...data);
        this.uploadElement.files = [];
        this.uploadComplete.emit(this.uploadElement.uploadedFiles as any);
        this.showNotification('Upload photo', 'info', 'Images uploaded successfully!');
      },
      error: (err) => {
        console.error('Error uploading images:', err);
        this.showNotification('Upload photo', 'error', err?.error?.message || 'Error uploading images. Please try again.');
      }
    });
  }

  onSelectedFiles(event: FileSelectEvent) {
    this.files.set(event.currentFiles);
    this.files().forEach((file) => {
      this.totalSize += file.size
    });
    this.totalSizePercent = this.countProgress(this.totalSize, this.maxFileSize);
  }

  onRemoveTemplatingFile(event: Event, file: File, removeFileCallback: Function, index: number) {
    removeFileCallback(event, index);
    this.totalSize -= file.size

    this.totalSizePercent = this.countProgress(this.totalSize, this.maxFileSize);
    this.uploadComplete.emit(this.uploadElement.uploadedFiles as any[]);
  }

  private showNotification(title: string, bgColor: 'info' | 'success' | 'error', message: string) {
    this.messageService.add({ severity: bgColor, summary: title, detail: message, life: 3000 })
  }

  private makeRequestData(files: File[]): UploadImageRequest[] {
    const reqData = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      reqData.push({
        storeId: this.storeId!,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    }
    return reqData;
  }
  private countProgress(totalSize: number, maxSize: number): number {
    const result = (totalSize / maxSize) * 100; // in percent
    if (result > 100) {
      return 100;
    }
    return Math.round(result);
  }

  parseProgressValueIntoKb(value: number): number {
    return Math.round((value * this.maxFileSize) / 100 / 1000);
  }

  clear(clearCB?: Function) {
    if (clearCB) {
      clearCB()
    }
    this.files.set([]);
    this.uploadElement.files = [];
    this.uploadElement.uploadedFiles = [];
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  ngOnDestroy() {
    if (this.uploadElement) {
      this.uploadElement.clear()
    }
    if (this.cancel) {
      this.cancel.complete();
    }
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  formatSize(bytes: number): string {
    const k = 1024;
    const dm = 3;
    const sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }
}
