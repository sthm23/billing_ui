import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "../../pages/auth/service/auth";
import { Observable } from "rxjs";


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getAccessToken();
    const isS3Url = req.url.includes('s3.eu-west-1.amazonaws.com');
    if (isS3Url) {
      let s3Req = req.clone({
        setHeaders: {
          'Content-Type': req.headers.get('Content-Type') || 'application/octet-stream'
        },
      });

      // Удаляем Accept и другие headers
      s3Req = s3Req.clone({
        headers: s3Req.headers
          .set('Accept', '*/*')
          .delete('Authorization')
      });

      return handler.handle(s3Req);
    }

    return handler.handle(req.clone({
      headers: req.headers.append('Authorization', `Bearer ${authToken}`),
    }));
  }
}
