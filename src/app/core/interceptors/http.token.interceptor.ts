import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JwtService } from '../services';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  host_url = window.location.host;
  constructor(private jwtService: JwtService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'X-DNS-Prefetch-Control': 'off',
      // 'X-Frame-Options': 'DENY',
      // 'Referrer-Policy': 'strict-origin-when-cross-origin',
      // 'X-XSS-Protection': '1',
      // 'X-Content-Type-Options': 'nosniff',
      // 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      // 'Cross-Origin-Opener-Policy': 'same-origin',
      // 'Cross-Origin-Resource-Policy': 'same-site',
      // 'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
      // 'Server': 'webserver',
       'Access-Control-Allow-Origin': this.host_url,
      // 'Cross-Origin-Embedder-Policy': 'require-corp'
    };

    const token = this.jwtService.getToken();

    if (token) {
      headersConfig['Authorization'] = `JWT ${token}`;
    }
    if (localStorage.getItem('region') && localStorage.getItem('language')) {
      headersConfig['region'] = localStorage.getItem('region');
      headersConfig['Accept-Language'] = localStorage.getItem('language')
    }
    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }
}
