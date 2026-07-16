import { ValidacionPermisosService } from '../servicios/validacion-permisos.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { environment } from '../../environments/environment';

/**
 * Decorator para validar permisos antes de ejecutar un método
 * @param permisoId - ID del permiso requerido
 * @param nombreAccion - Nombre descriptivo de la acción
 */
export function ValidarPermiso(permisoId: number, nombreAccion: string = 'realizar esta acción') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Obtener las instancias de los servicios desde el contexto del componente
      const validacionPermisosService: ValidacionPermisosService = this['validacionPermisosService'];
      const notificacionService: NotificacionesService = this['notificacionService'];

      try {
        // Validar permiso antes de ejecutar el método
        const resultado = await validacionPermisosService.validarPermisoParaAccion(
          permisoId, 
          nombreAccion
        );

        if (!resultado.valido) {
          // Mostrar notificación con mensaje de redirección
          notificacionService.notificacion(resultado.mensaje);
          console.warn(`🚫 Acceso denegado al método ${propertyKey}: ${resultado.mensaje}`);
          
          // Activar redirección automática después de mostrar el mensaje
          setTimeout(() => {
            validacionPermisosService.manejarFaltaDePermisos(resultado.mensaje);
          }, 1500);
          
          return false;
        }

        // Si tiene permiso, ejecutar el método original
        return await originalMethod.apply(this, args);

      } catch (error) {
        console.error(`Error al validar permiso para ${propertyKey}:`, error);
        notificacionService.notificacion('Error al validar permisos.');
        
        // En caso de error, también activar redirección
        setTimeout(() => {
          if (validacionPermisosService.manejarFaltaDePermisos) {
            validacionPermisosService.manejarFaltaDePermisos('Error al validar permisos');
          } else {
            // Fallback manual si el método no está disponible
            window.location.href = '/modulos/inicio';
          }
        }, 1500);
        
        return false;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator para registrar acciones del usuario
 * @param accion - Descripción de la acción realizada
 */
export function LogAccion(accion: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const inicio = Date.now();
      
      try {        
        const resultado = await originalMethod.apply(this, args);
        
        // Aquí podrías enviar el log al servidor si lo necesitas
        // await this.auditService?.registrarAccion(accion, duracion, true);
        
        return resultado;
      } catch (error) {
        const duracion = Date.now() - inicio;
        console.error(` Error en acción: ${accion} - Duración: ${duracion}ms`, error);
        
        // Registrar error en el log
        // await this.auditService?.registrarAccion(accion, duracion, false, error.message);
        
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator para validar múltiples permisos
 * @param permisos - Array de IDs de permisos requeridos
 * @param operador - 'AND' (todos los permisos) o 'OR' (al menos uno)
 */
export function ValidarMultiplesPermisos(
  permisos: number[], 
  operador: 'AND' | 'OR' = 'AND',
  nombreAccion: string = 'realizar esta acción'
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const validacionPermisosService: ValidacionPermisosService = this['validacionPermisosService'];
      const notificacionService: NotificacionesService = this['notificacionService'];

      if (!validacionPermisosService || !notificacionService) {
        console.error('Servicios no encontrados en el componente para validación de permisos');
        return false;
      }

      try {
        const resultados = await validacionPermisosService.validarMultiplesPermisos(permisos);
        
        let tienePermiso = false;
        
        if (operador === 'AND') {
          // Todos los permisos deben ser válidos
          tienePermiso = permisos.every(permiso => resultados[permiso]);
        } else {
          // Al menos uno de los permisos debe ser válido
          tienePermiso = permisos.some(permiso => resultados[permiso]);
        }

        if (!tienePermiso) {
          const mensaje = `No tiene los permisos necesarios para ${nombreAccion}`;
          notificacionService.notificacion(mensaje);
          console.warn(`🚫 Acceso denegado al método ${propertyKey}: ${mensaje}`);
          
          // Activar redirección automática después de mostrar el mensaje
          setTimeout(() => {
            validacionPermisosService.manejarFaltaDePermisos(mensaje);
          }, 1500);
          
          return false;
        }

        return await originalMethod.apply(this, args);

      } catch (error) {
        console.error(`Error al validar permisos múltiples para ${propertyKey}:`, error);
        notificacionService.notificacion('Error al validar permisos.');

        // En caso de error, también activar redirección
        setTimeout(() => {
          if (validacionPermisosService.manejarFaltaDePermisos) {
            validacionPermisosService.manejarFaltaDePermisos('Error al validar permisos');
          } else {
            // Fallback manual si el método no está disponible
            window.location.href = '/modulos/inicio';
          }
        }, 1500);
        
        return false;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator para validar permisos solo en producción
 * En desarrollo, siempre permite el acceso
 */
export function ValidarPermisoProduccion(permisoId: number, nombreAccion: string = 'realizar esta acción') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // En desarrollo, saltarse la validación
      if (!environment.production) {
        return await originalMethod.apply(this, args);
      }

      // En producción, usar validación normal
      return await ValidarPermiso(permisoId, nombreAccion)(target, propertyKey, descriptor).value.apply(this, args);
    };

    return descriptor;
  };
}

// Exportar también para uso como funciones normales
export class PermisosUtils {
  
  /**
   * Valida permiso de forma imperativa (sin decorator) - Versión síncrona mejorada
   */
  static validarPermisoImperativo(
    validacionService: any,
    notificacionService: any,
    permisoId: number,
    nombreAccion: string = 'realizar esta acción'
  ): boolean {
    try {
      const tienePermiso = validacionService.validarPermisoLocal(permisoId);
      
      if (!tienePermiso) {
        const mensaje = `No tiene permisos para ${nombreAccion} (Código: ${permisoId})`;
        notificacionService.notificacion(mensaje);
        
        // Activar redirección después de mostrar mensaje
        setTimeout(() => {
          if (validacionService.manejarFaltaDePermisos) {
            validacionService.manejarFaltaDePermisos(mensaje);
          } else {
            window.location.href = '/modulos/inicio';
          }
        }, 1500);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar permiso:', error);
      notificacionService.notificacion('Error al validar permisos.');

      // En caso de error, también activar redirección
      setTimeout(() => {
        if (validacionService.manejarFaltaDePermisos) {
          validacionService.manejarFaltaDePermisos('Error al validar permisos');
        } else {
          window.location.href = '/modulos/inicio';
        }
      }, 1500);
      
      return false;
    }
  }

  /**
   * Valida múltiples permisos de forma imperativa
   */
  static async validarMultiplesPermisosImperativo(
    validacionService: ValidacionPermisosService,
    notificacionService: NotificacionesService,
    permisos: number[],
    operador: 'AND' | 'OR' = 'AND',
    nombreAccion: string = 'realizar esta acción'
  ): Promise<boolean> {
    try {
      const resultados = await validacionService.validarMultiplesPermisos(permisos);
      
      let tienePermiso = false;
      
      if (operador === 'AND') {
        tienePermiso = permisos.every(permiso => resultados[permiso]);
      } else {
        tienePermiso = permisos.some(permiso => resultados[permiso]);
      }

      if (!tienePermiso) {
        const mensaje = `No tiene los permisos necesarios para ${nombreAccion}`;
        notificacionService.notificacion(mensaje);

        // Activar redirección después de mostrar mensaje
        setTimeout(() => {
          if (validacionService.manejarFaltaDePermisos) {
            validacionService.manejarFaltaDePermisos(mensaje);
          } else {
            window.location.href = '/modulos/inicio';
          }
        }, 1500);
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar múltiples permisos:', error);
      notificacionService.notificacion('Error al validar permisos.');

      // En caso de error, también activar redirección
      setTimeout(() => {
        if (validacionService.manejarFaltaDePermisos) {
          validacionService.manejarFaltaDePermisos('Error al validar permisos');
        } else {
          window.location.href = '/modulos/inicio';
        }
      }, 1500);
      
      return false;
    }
  }
}
