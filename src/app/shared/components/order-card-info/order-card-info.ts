import { Component, EventEmitter, input, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-order-card-info',
  imports: [],
  templateUrl: './order-card-info.html',
  styleUrl: './order-card-info.css',
})
export class OrderCardInfo {
  @Input() data = {};
}
