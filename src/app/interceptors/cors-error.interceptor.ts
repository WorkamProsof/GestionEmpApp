import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NotificacionesService } from '../servicios/notificaciones.service';

@Injectable()
export class CorsErrorInterceptor implements HttpInterceptor {

  private notificacionesService = inject(NotificacionesService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let mensaje = 'Error en la petición';

        if (error.status === 0) {
          mensaje = 'No hay conexión. Verifica tu internet.';
        } else if (error.status === 500) {
          mensaje = 'Error en el servidor. Intenta más tarde.';
        } else if (error.status === 404) {
          mensaje = 'Recurso no encontrado.';
        }

        console.error('Error:', error);
        this.notificacionesService.notificacion(mensaje);
        
        return throwError(() => error);
      })
    );
  }
}
