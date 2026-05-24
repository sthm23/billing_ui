import { Routes } from "@angular/router";
import { AttributeView } from "./attribute-view/attribute-view";
import { AttributeList } from "./list/list";

export default [
  { path: 'list', component: AttributeList },
  { path: 'view/:id', component: AttributeView },
] as Routes;
