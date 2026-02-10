import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UrlConfigService } from 'src/app/servicios/url-config.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilCargoService {
  private urlConfigService = inject(UrlConfigService);
  public categoria: string = 'Autogestion/cPerfilCargo/';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la URL base dinámica (actualiza con la configuración guardada)
   */
  private get url(): string {
    return this.urlConfigService.getActiveUrl() + 'index.php/API/';
  }

  /**
   * Obtiene el cargo completo SIN ENCRIPTACIÓN
   * JSON plano que entra y sale del servidor
   */
  async obtenerCargoCompleto(documento: string): Promise<any> {
    const url = this.url + this.categoria + 'obtenerCargo';
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });

    try {
      const response: any = await this.http.post(
        url,
        { documento },
        { headers }
      ).toPromise();
      return response;
    } catch (error) {
      console.error('Error obteniendo cargo:', error);
      throw error;
    }
  }
}
