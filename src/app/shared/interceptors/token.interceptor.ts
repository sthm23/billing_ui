import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "../../pages/auth/service/auth";
import { Observable } from "rxjs";


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getAccessToken();
    const isS3Url = req.url.includes('/billing/')
    const newReq = isS3Url
      ? req
      : req.clone({
        headers: req.headers.append('Authorization', `Bearer ${authToken}`),
      });
    return handler.handle(newReq);
  }
}
