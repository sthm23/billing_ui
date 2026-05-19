import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { UserService } from '../../../pages/user/service/user.service';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DialogComponent } from '../dialog/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslocoPipe } from '@ngneat/transloco';

export type SearchCustomer = { name: string, id: string, phone: string, label?: string }

@Component({
  selector: 'app-customer-search',
  imports: [
    ButtonModule,
    AutoCompleteModule,
    InputGroupAddonModule,
    InputGroup,
    DialogComponent,
    FormsModule,
    TranslocoPipe
  ],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.css',
})
export class CustomerSearch implements OnChanges {

  customerDialogVisible = false
  customerData: Omit<SearchCustomer, 'id'> = { name: '', phone: '' }
  userSearchResult = signal<SearchCustomer[]>([]);
  _customer = signal<SearchCustomer | null>(null);

  @Input() customer: SearchCustomer | null = null;
  @Input() isClearable = false;
  @Output() customerSelected = new EventEmitter<SearchCustomer | null>();

  constructor(
    private userService: UserService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const customerChange = changes['customer'];
    console.log(customerChange);
    if (customerChange && customerChange.currentValue) {
      this._customer.set(customerChange.currentValue);
    }
  }

  search(event: AutoCompleteCompleteEvent) {
    const query = event.query;
    this.userService.searchCustomers(query).subscribe({
      next: (res) => {
        const users = res.data.map(user => ({ label: user.fullName + ' ' + this.formatPhoneNumber(user.phone), name: user.fullName, id: user.customer!.id, phone: user.phone }));
        this.userSearchResult.set(users);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  selectSearchOption(option: AutoCompleteSelectEvent) {
    const selectedUser = option.value;
    const customerList = this.userSearchResult();
    const matchedUser = customerList.find(user => user.id === selectedUser.id);
    const phoneTemplate = this.formatPhoneNumber(matchedUser!.phone);
    this._customer.set({ label: matchedUser!.name + ' ' + phoneTemplate, name: matchedUser!.name, id: matchedUser!.id, phone: phoneTemplate });
    this.customerSelected.emit({ label: matchedUser!.name + ' ' + phoneTemplate, name: matchedUser!.name, id: matchedUser!.id, phone: phoneTemplate });
  }

  clearCustomer() {
    this._customer.set(null);
    this.customerSelected.emit(null);
  }

  handleCustomerCreate(data: Omit<SearchCustomer, 'id'>) {
    const phone = '+998' + data.phone?.replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '').trim()

    this.userService.createCustomer({ fullName: data.name, phone }).subscribe({
      next: (res) => {
        const phoneTemplate = this.formatPhoneNumber(res.phone);
        this._customer.set({ label: res.fullName + ' ' + phoneTemplate, name: res.fullName, id: res.customer!.id, phone: phoneTemplate });
        this.customerDialogVisible = false;
        this.customerSelected.emit({ label: res.fullName + ' ' + phoneTemplate, name: res.fullName, id: res.customer!.id, phone: phoneTemplate });
      },
      error: (err) => {
        console.error(err);
        this.customerDialogVisible = false;
        this.customerSelected.emit(null);
      }
    });
  }

  private formatPhoneNumber(phone: string): string {
    const code = phone?.slice(4, 6);
    const prefix = phone?.slice(6, 9);
    const firstPart = phone?.slice(9, 11);
    const secondPart = phone?.slice(11, 13);
    return `+998 (${code}) ${prefix}-${firstPart}-${secondPart}`;
  }
}
