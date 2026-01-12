import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { SignUp } from "./sign-up/sign-up";


export default [
  { path: 'sign-up', component: SignUp },
  { path: 'login', component: Login }
] as Routes;
