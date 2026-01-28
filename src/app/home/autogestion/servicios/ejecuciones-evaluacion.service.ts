import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';

@Injectable({
  providedIn: 'root'
})
export class EjecucionesEvaluacionService {

  private apiUrl = FuncionesGenerales.urlGestion();

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de ejecuciones de evaluación
   * @returns Observable con la lista de ejecuciones
   */
  obtenerEjecuciones(): Observable<any> {
    const url = `${this.apiUrl}EjecucionesEvaluacion/obtener`;
    return this.http.get<any>(url);
  }

  /**
   * Obtiene una ejecución específica por ID
   * @param id - ID de la ejecución
   * @returns Observable con los datos de la ejecución
   */
  obtenerEjecucionPorId(id: number): Observable<any> {
    const url = `${this.apiUrl}EjecucionesEvaluacion/obtenerPorId/${id}`;
    return this.http.get<any>(url);
  }

  /**
   * Obtiene ejecuciones filtradas
   * @param filtros - Objeto con los filtros a aplicar
   * @returns Observable con la lista filtrada
   */
  obtenerEjecucionesFiltradas(filtros: any): Observable<any> {
    const url = `${this.apiUrl}EjecucionesEvaluacion/filtrar`;
    return this.http.post<any>(url, filtros);
  }
}
