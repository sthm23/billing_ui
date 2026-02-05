import { Routes } from "@angular/router";
import { OrgCreate } from "./org-create/org-create";
import { OrgList } from "./org-list/org-list";
import { OrgView } from "./org-view/org-view";

export default [
  { path: 'view/:id', component: OrgView },
  { path: 'list', component: OrgList },
  { path: 'create', component: OrgCreate },
] as Routes;
