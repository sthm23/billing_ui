import { Routes } from "@angular/router";
import { Login } from "./login/login";
import { SignIn } from "./sign-in/sign-in";


export default [
  { path: 'sign-in', component: SignIn },
  { path: 'login', component: Login }
] as Routes;
