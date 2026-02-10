import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface UrlConfig {
  urlPrincipal: string;
  urlContingencia: string;
  usarContingencia: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UrlConfigService {
  private readonly CONFIG_KEY = 'url_config';
  private readonly CONTINGENCIA_KEY = 'usar_contingencia';

  constructor() { }

  /**
   * Obtiene la configuración de URLs del localStorage o valores por defecto
   * ✅ Síncrono y persiste entre sesiones (no se borra en logout)
   */
  getConfig(): UrlConfig {
    try {
      const usarContingencia = localStorage.getItem(this.CONTINGENCIA_KEY) === 'true';
      const savedConfig = localStorage.getItem(this.CONFIG_KEY);
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        return {
          ...config,
          usarContingencia
        };
      }
    } catch (error) {
      console.error('Error al obtener configuración de URLs:', error);
    }

    return {
      urlPrincipal: environment.urlBack,
      urlContingencia: environment.urlContingencia,
      usarContingencia: localStorage.getItem(this.CONTINGENCIA_KEY) === 'true'
    };
  }

  /**
   * Guarda la configuración de URLs en localStorage
   * ✅ Persiste entre sesiones (no se borra en logout)
   */
  saveConfig(config: UrlConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify({
        urlPrincipal: config.urlPrincipal,
        urlContingencia: config.urlContingencia
      }));
      localStorage.setItem(this.CONTINGENCIA_KEY, config.usarContingencia ? 'true' : 'false');
    } catch (error) {
      console.error('Error al guardar configuración de URLs:', error);
      throw error;
    }
  }

  /**
   * Cambia solo la URL principal sin alterar la contingencia
   * ✅ Ideal para cambiar dinámicamente la URL sin afectar otros valores
   * @param nuevaUrl La nueva URL principal
   */
  setMainUrl(nuevaUrl: string): void {
    try {
      const config = this.getConfig();
      
      // Actualizar solo la URL principal, mantener el resto igual
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify({
        urlPrincipal: nuevaUrl,
        urlContingencia: config.urlContingencia
      }));
      
      console.log('✅ URL principal actualizada:', nuevaUrl);
    } catch (error) {
      console.error('Error al actualizar URL principal:', error);
      throw error;
    }
  }

  /**
   * Reinicia SOLO la URL principal a su valor por defecto
   */
  resetMainUrl(): void {
    try {
      const config = this.getConfig();
      
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify({
        urlPrincipal: environment.urlBack,
        urlContingencia: config.urlContingencia
      }));
      
      console.log('✅ URL principal reiniciada al valor por defecto:', environment.urlBack);
    } catch (error) {
      console.error('Error al reiniciar URL principal:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL principal actual (guardada o por defecto)
   */
  getMainUrl(): string {
    const config = this.getConfig();
    return config.urlPrincipal || environment.urlBack;
  }

  /**
   * Obtiene la URL activa actual (principal o contingencia)
   */
  getActiveUrl(): string {
    const config = this.getConfig();
    
    // Si está usando contingencia, retornar URL de contingencia
    if (config.usarContingencia) {
      return config.urlContingencia || environment.urlContingencia;
    }
    
    // Si NO está usando contingencia, retornar la URL principal guardada
    // (no usar environment.urlBack directamente, usar la del config)
    return config.urlPrincipal || environment.urlBack;
  }

  /**
   * Reinicia la configuración a valores por defecto
   */
  resetConfig(): void {
    localStorage.removeItem(this.CONFIG_KEY);
    localStorage.removeItem(this.CONTINGENCIA_KEY);
  }
}
