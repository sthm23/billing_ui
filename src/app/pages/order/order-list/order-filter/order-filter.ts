import { Component, EventEmitter, input, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-order-filter',
  imports: [],
  templateUrl: './order-filter.html',
  styleUrl: './order-filter.css',
})
export class OrderFilter {
  @Input() data = {};
}
