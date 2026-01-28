import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NotificacionesService } from './notificaciones.service';

@Injectable({
	providedIn: 'root'
})
export class StorageService {

	constructor(
		private storage: Storage
		, private router: Router
		, private modalController: ModalController
		, private notifcaciones: NotificacionesService
	) { }

	async set(llave: string, valor: any) {
		return await this.storage.set(llave, valor);
	}

	async get(llave: any) {
		return await this.storage.get(llave);
	}

	/**
	 * Obtiene datos del storage con validación segura
	 * @param llave La clave del storage
	 * @returns Los datos si existen y son válidos, null si no
	 */
	async getSafe(llave: string): Promise<any> {
		try {
			const datos = await this.storage.get(llave);
			
			if (datos === null || datos === undefined) {
				return null;
			}

			return datos;
		} catch (error) {
			console.error(`Error al obtener datos del storage para ${llave}:`, error);
			return null;
		}
	}

	/**
	 * Verifica si una clave existe en el storage
	 * @param llave La clave a verificar
	 * @returns true si existe, false si no
	 */
	async exists(llave: string): Promise<boolean> {
		try {
			const datos = await this.storage.get(llave);
			return datos !== null && datos !== undefined;
		} catch (error) {
			console.error(`Error al verificar existencia de ${llave}:`, error);
			return false;
		}
	}

	async remove(llave: string) {
		return await this.storage.remove(llave);
	}

	async limpiarTodo(logout?: boolean) {
		try {			
			const tema = await this.get('theme');
			
			// 🔥 IMPORTANTE: En Android/iOS, clear() es asíncrono y puede tardar
			// Debemos esperar a que termine con reintentos
			let intentos = 0;
			let limpioExitosamente = false;
			
			while (intentos < 3 && !limpioExitosamente) {
				try {
					await this.storage.clear();
					limpioExitosamente = true;
				} catch (error) {
					intentos++;
					console.warn(`Intento ${intentos} de limpiar storage falló:`, error);
					// Esperar antes de reintentar
					await new Promise(resolve => setTimeout(resolve, 200));
				}
			}
			
			if (!logout) {
				this.notifcaciones.alerta("Error de conexión", '', [], [{ text: 'Cerrar', role: 'aceptar' }]);
			}
			
			if (this.modalController) {
				await this.modalController.dismiss().catch(() => {});
			}
			
			// Restaurar configuraciones básicas con await explícito
			if (tema) {
				await this.storage.set('theme', tema);
			}
			
			// 🔥 IMPORTANTE: Resetear la foto de sesión a la imagen por defecto
			// Esto evita que la foto del usuario anterior aparezca al hacer login con otro usuario
			await this.storage.set('urlFotoUsuarioSesion', 'assets/images/nofoto.png');
			
			// CRÍTICO para Android 13: Esperar más tiempo para que SQLite sincronice en disco
			await new Promise(resolve => setTimeout(resolve, 300));
						
			// Navegar al login
			this.router.navigateByUrl('login');
		} catch (error) {
			console.error('❌ Error al limpiar storage:', error);
			// En caso de error, al menos navegar al login
			this.router.navigateByUrl('login');
		}
	}

  public clear() {
		return this.storage.clear();
	}
}
