import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const baseUrl = 'http://localhost:4000';
    if (req.url.includes('/i18n/')) {
      return handler.handle(req);
    }
    // Only prefix API-relative URLs. Absolute URLs (e.g. presigned S3 URLs)
    // must pass through unchanged.
    const isAbsoluteUrl = /^https?:\/\//i.test(req.url) || req.url.startsWith('//');
    const newReq = isAbsoluteUrl
      ? req
      : req.clone({
        url: baseUrl + req.url
      });

    return handler.handle(newReq);
  }
}
