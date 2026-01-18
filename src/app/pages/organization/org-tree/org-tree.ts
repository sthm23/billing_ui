import { Component, Signal, signal } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';

@Component({
  selector: 'app-org-tree',
  imports: [
    OrganizationChartModule,
    ButtonModule
  ],
  templateUrl: './org-tree.html',
  styleUrl: './org-tree.css',
})
export class OrgTree {
  data = signal<(TreeNode)[]>([
    {
      key: this.createId(),
      label: 'Yangi magazin qo\'shish',
      expanded: true,
      data: 0,
      children: []
    }
  ])


  addNode(parentKey: string) {
    const parent = this.findNodeByKey(this.data(), parentKey);
    if (!parent) return;
    const newChild: TreeNode = {
      key: this.createId(),
      label: this.makeLabel(parent),
      expanded: true,
      data: (parent.data ?? 0) + 1,
      children: []
    };
    this.data.update(nodes => this.addChildImmutable(nodes, parentKey, newChild));
  }

  private addChildImmutable(nodes: TreeNode[], parentKey: string, child: TreeNode): TreeNode[] {
    return nodes.map(n => {
      if (n.key === parentKey) {
        const children = [...(n.children as TreeNode[] ?? []), child];
        return { ...n, children, expanded: true };
      }
      if (n.children?.length) {
        return { ...n, children: this.addChildImmutable(n.children as TreeNode[], parentKey, child) };
      } return { ...n };
    });
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

  private createId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID() : Math.random().toString(36).slice(2);
  }

  makeLabel(parent: TreeNode): string {
    const level = (parent.data ?? 0) + 1;
    const index = (parent.children?.length ?? 0) + 1;
    return `Уровень ${level} #${index};`
  }
}
