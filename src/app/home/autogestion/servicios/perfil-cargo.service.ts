import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerfilCargoService {
  public url: string = environment.urlBack + 'index.php/API/';
  public categoria: string = 'Autogestion/cPerfilCargo/';

  constructor(private http: HttpClient) { }

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
