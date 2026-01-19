import { Routes } from "@angular/router";
import { OrgTree } from "./org-tree/org-tree";
import { OrgCreate } from "./org-create/org-create";

export default [
  { path: 'org-tree', component: OrgTree },
  { path: 'create-store', component: OrgCreate },
] as Routes;
