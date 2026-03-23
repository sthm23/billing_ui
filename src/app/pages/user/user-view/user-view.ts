import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AppStore } from '../../../store/app.store';
import { UserService } from '../service/user.service';
import { User } from '../../../models/user.model';
import { MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { OrgLevel } from '../../../models/store.model';
import { StoreService } from '../../organization/service/store';

@Component({
  selector: 'app-user-view',
  imports: [
    OrganizationChartModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
  providers: [MessageService]
})
export class UserView implements OnInit {
  user = signal<User | null>(null);
  orgTree = signal<TreeNode[]>([])
  visible = false;
  orgLevel = OrgLevel;
  currentLevel = OrgLevel.OWNER;
  currentStoreId: string | null = null;
  appStore = inject(AppStore);

  createOrgForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap((params) => this.userService.getUserById(params['id']))
    ).subscribe({
      next: (user) => {
        console.log(user);

        this.user.set(user);
        this.addOrgNode(user.id, user.fullName, OrgLevel.OWNER);
        if (user.staff && user.staff.store) {
          const store = user.staff.store
          this.addOrgNode(store.id, store.name, OrgLevel.STORE, user.id);

          if (user.staff.warehouse && user.staff.warehouse.length) {
            const warehouse = user.staff.warehouse[0];
            // this.addOrgNode(warehouse.warehouseId, warehouse.name, OrgLevel.WAREHOUSE, store.id);
          }
        }

      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/pages/user/list']);
      }
    });
  }

  addNode(node: TreeNode) {
    const parent = this.findParentNodeByKey(this.orgTree(), node.key!);
    console.log(parent);

    // if (!parent) return;
    if (node.data.level === OrgLevel.OWNER) {
      // create store
      // this.visible = true;
      this.currentLevel = OrgLevel.OWNER;
      this.createStore();
    } else if (node.data.level === OrgLevel.STORE) {
      // create warehouse
      this.visible = true;
      this.currentStoreId = node.key!;
      this.currentLevel = OrgLevel.STORE;
    } else if (node.data.level === OrgLevel.WAREHOUSE) {
      // create staff
      this.currentLevel = OrgLevel.WAREHOUSE;
      this.currentStoreId = parent!.key!;
      this.router.navigate(['/pages/user/create'], { queryParams: { warehouseId: `${node.key}!!${node.label}`, storeId: `${parent!.key}!!${parent!.label}` } });
    } else if (node.data.level === OrgLevel.STAFF) {
      // go to staff info
      this.currentLevel = OrgLevel.STAFF;
    } else {
      return;
    }
  }

  textToolTip(level: OrgLevel): string | null {
    let text = null
    switch (level) {
      case OrgLevel.OWNER:
        text = 'Magazin qo\'shish'
        break;
      case OrgLevel.STORE:
        text = 'Sklad qo\'shish'
        break;
      case OrgLevel.WAREHOUSE:
        text = 'Omborga xodim qo\'shish'
        break;
      case OrgLevel.STAFF:
        text = 'Hodim haqida ma\'lumotga o\'tish'
        break;
      default:
        break;
    }
    return text;
  }

  closeModal() {
    this.visible = false;
    this.createOrgForm.reset();
  }

  submitModal() {
    // if (this.createOrgForm.valid) {
    //   const name = this.createOrgForm.value.name!;
    //   if (this.currentLevel === OrgLevel.OWNER) {
    //     // create store
    //     this.createStore(name);
    //   } else if (this.currentLevel === OrgLevel.STORE) {
    //     //create warehouse
    //     this.createWarehouse(name, this.currentStoreId!);
    //   }
    // }

  }

  private addOrgNode(nodeId: string, nodeName: string, level: OrgLevel, parentId?: string) {
    const currentTree = this.orgTree();
    const newNode: TreeNode = {
      key: nodeId,
      label: nodeName,
      expanded: true,
      data: { level },
      children: [],
    };
    if (parentId) {
      const parentNode = this.findNodeByKey(currentTree, parentId);
      if (!parentNode) return;
      parentNode.children?.push(newNode);
      this.orgTree.set([...currentTree]);
    } else {
      //because it is owner node
      this.orgTree.set([...currentTree, newNode]);
    }
  }

  private findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const n of nodes) {
      if (n.key === key) return n;
      if (n.children?.length) {
        const found = this.findNodeByKey(
          n.children as TreeNode[],
          key
        );
        if (found) return found;
      }
    }
    return null;
  }

  private findParentNodeByKey(
    nodes: TreeNode[],
    key: string,
    parent: TreeNode | null = null
  ): TreeNode | null {

    for (const n of nodes) {
      if (n.key === key) return parent;
      if (n.children?.length) {
        const found = this.findParentNodeByKey(
          n.children as TreeNode[],
          key,
          n
        );
        if (found) return found;
      }
    }
    return parent;
  }

  private createStore() {
    this.router.navigate(['/pages/organization/create']);
  }

  private createWarehouse(name: string, storeId: string) {

    this.storeService.createWarehouse({ name, storeId, ownerId: this.user()!.id! }).subscribe({
      next: ({ warehouse }) => {
        this.visible = false;
        console.log('Warehouse created:', warehouse);
        this.addOrgNode(warehouse.id, warehouse.name, OrgLevel.WAREHOUSE, storeId);
        this.messageService.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: 'Sklad yaratildi' });
        this.createOrgForm.reset();
      },
      error: (err) => {
        console.error('Error creating warehouse:', err);
        this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error.message || 'Sklad yaratishda xatolik yuz berdi' });
      }
    });
  }
}
