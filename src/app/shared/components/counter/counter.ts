import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-counter',
  imports: [ButtonModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter {
  count = signal(0);

  @Input() maxValue: number | null = null;

  @Output() countChange = new EventEmitter<number>();

  increment() {
    if (this.maxValue !== null && this.count() >= this.maxValue) return;
    this.count.update(n => n + 1);
    this.countChange.emit(this.count());
  }

  decrement() {
    if (this.count() === 0) return;
    this.count.update(n => n - 1);
    this.countChange.emit(this.count());
  }
}
