import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-counter',
  imports: [InputNumberModule, FormsModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter implements OnChanges {
  count = 0;

  @Input() maxValue: number | null = null;

  @Input() initialCount: number = 0;

  @Output() countChange = new EventEmitter<{ count: number }>();

  ngOnChanges(changes: SimpleChanges) {
    const initialCountChange = changes['initialCount'];
    if (initialCountChange && initialCountChange.currentValue) {
      const value = this.maxValue ? initialCountChange.currentValue : 0
      this.count = value > this.maxValue! ? this.maxValue : value;
    }
  }

  handleChange() {
    this.countChange.emit({ count: this.count });
  }
}
