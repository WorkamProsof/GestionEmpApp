import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ValidacionPermisosService } from '../servicios/validacion-permisos.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { Router } from '@angular/router';

@Injectable()
export class PermisosInterceptor implements HttpInterceptor {

  private validacionPermisosService = inject(ValidacionPermisosService);
  private notificacionesService = inject(NotificacionesService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(45000),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403 || error.status === 401) {
          const mensaje = error.status === 401 
            ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
            : 'No tienes permisos para realizar esta acción.';
          
          this.notificacionesService.notificacion(mensaje);
          
          if (error.status === 401) {
            setTimeout(() => this.router.navigateByUrl('/login'), 2000);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
