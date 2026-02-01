import { Component, inject, OnInit, signal } from '@angular/core';
import { AppStore } from '../../../store/app.store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { UserService } from '../service/user.service';
import { OrgLevel, User } from '../../../models/user.model';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-user-view',
  imports: [
    OrganizationChartModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
})
export class UserView implements OnInit {
  user = signal<User | null>(null);
  orgTree = signal<TreeNode[]>([])
  orgLevel = OrgLevel;
  appStore = inject(AppStore);
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap((params) => this.userService.getUserById(params['id']))
    ).subscribe({
      next: (user) => {
        console.log(user);

        this.user.set(user);
        this.addOrgNode(user.id, user.fullName, OrgLevel.OWNER);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/pages/user/list']);
      }
    });
  }

  addNode(parentKey: string) {
    const parent = this.findNodeByKey(this.orgTree(), parentKey);
    console.log(parent);

    if (!parent) return;
    if (parent.data.level === OrgLevel.OWNER) {
      // create store
      // this.addOrgNode('store-' + Date.now(), 'MENS magazin', OrgLevel.STORE, parent.key);
    } else if (parent.data.level === OrgLevel.STORE) {
      // create warehouse
      // this.addOrgNode('wargouse-' + Date.now(), 'MENS sklad', OrgLevel.WAREHOUSE, parent.key);
    } else if (parent.data.level === OrgLevel.WAREHOUSE) {
      // create staff
      // this.addOrgNode('staff-' + Date.now(), 'MENS hodimi', OrgLevel.STAFF, parent.key);
    } else if (parent.data.level === OrgLevel.STAFF) {
      // go to staff info
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
      parentNode.children = [...(parentNode.children || []), newNode];
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
        const found = this.findNodeByKey(n.children as TreeNode[], key);
        if (found) return found;
      }

    }
    return null;
  }
}
