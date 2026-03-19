import { Routes } from "@angular/router";
import { AttributeView } from "./attribute-view/attribute-view";
import { AttributeCreate } from "./create/create";
import { AttributeList } from "./list/list";

export default [
  { path: 'list', component: AttributeList },
  { path: 'create', component: AttributeCreate },
  { path: 'view/:id', component: AttributeView },
] as Routes;
