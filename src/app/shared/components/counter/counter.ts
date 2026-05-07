import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-counter',
  imports: [ButtonModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter implements OnChanges {
  count = signal(0);

  @Input() maxValue: number | null = null;

  @Input() initialCount: number = 0;

  @Output() countChange = new EventEmitter<{ count: number, type: 'increment' | 'decrement' }>();

  ngOnChanges(changes: SimpleChanges) {
    const initialCountChange = changes['initialCount'];
    if (initialCountChange && initialCountChange.currentValue) {
      const value = this.maxValue ? initialCountChange.currentValue : 0
      this.count.set(value);
    }
  }

  increment() {
    if (this.maxValue !== null && this.count() >= this.maxValue) return;
    this.count.update(n => n + 1);
    this.countChange.emit({ count: this.count(), type: 'increment' });
  }

  decrement() {
    if (this.count() === 0) return;
    this.count.update(n => n - 1);
    this.countChange.emit({ count: this.count(), type: 'decrement' });
  }
}
