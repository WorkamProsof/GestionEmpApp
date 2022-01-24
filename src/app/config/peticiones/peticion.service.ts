import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'Crypto-js'
import { Observable } from 'rxjs';
import { StorageService } from '../../servicios/storage.service';
import { FuncionesGenerales } from '../funciones/funciones';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

export class CustomInjectorService {
	static injector: Injector
}

@Injectable({
	providedIn: 'root'
})
export class PeticionService {

	private storageService: StorageService;
	private notificacionesService: NotificacionesService;
	private httpClient: HttpClient;
	public url: string = environment.urlBack;
	public categoria: string = 'API/';

	constructor() {
		if (!this.httpClient) {
			this.httpClient = CustomInjectorService.injector.get<HttpClient>(HttpClient);
		}
		if (!this.storageService) {
			this.storageService = CustomInjectorService.injector.get<StorageService>(StorageService);
		}
	}

	async encriptar(datos) {
		const salt = CryptoJS.lib.WordArray.random(256);
		const iv = CryptoJS.lib.WordArray.random(16);
		const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
		const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
		const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, { iv: iv });
		const data = {
			ciphertext: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
			salt: CryptoJS.enc.Hex.stringify(salt),
			iv: CryptoJS.enc.Hex.stringify(iv)
		}
		return JSON.stringify(data);
	}

	async desencriptar(encriptado) {
		const salt = CryptoJS.enc.Hex.parse(encriptado.salt);
		const iv = CryptoJS.enc.Hex.parse(encriptado.iv);
		const crypt = JSON.parse(await this.storageService.get('crypt').then(resp => resp));
		const key = CryptoJS.PBKDF2(crypt.key, salt, { hasher: CryptoJS.algo.SHA512, keySize: 64 / 8, iterations: crypt.it });
		const decrypted = CryptoJS.AES.decrypt(encriptado.ciphertext, key, { iv: iv });
		return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
	}

	async obtener(controlador: string) {
		const uri = this.construirUrl(controlador);
		return await this.ejecutarPeticion('get', uri).toPromise().then(resp => this.desencriptar(resp), console.error);
	}

	async informacion(body: object, controlador: string) {
		const data = {
			encriptado: await this.encriptar(body)
		}
		const uri = this.construirUrl(controlador);
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let NIT = await this.storageService.get('nit').then(resp => resp);
		let usuario = await this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		const headers = new HttpHeaders({ Token: usuario.IngresoId, Conexion, NIT, Usuario: usuario.usuarioId });
		return await this.ejecutarPeticion('post', uri, data, headers).toPromise().then(async resp => {
			const desencriptado = await this.desencriptar(resp);
			if (desencriptado.activoLogueo) {
				// return Ejecutar cerrar sesion
				this.storageService.limpiarTodo();
			} else {
				return desencriptado;
			}
		}).catch((request) => {
			this.validarAlertaError(request);
		});
	}

	private construirUrl(controlador) {
		return this.url + this.categoria + controlador;
	}

	async validarNit(NIT) {
		return await this.ejecutarPeticion('post', `${this.url}Login/ValidarNIT`, { NIT }).toPromise().then(resp => resp, console.error);
	}

	async iniciarSesionUser(data) {
		data = {
			user: data.usuario,
			password: data.password,
			userSeccion: 1
		};
		data = {
			encriptado: await this.encriptar(data),
			RASTREO: FuncionesGenerales.rastreo('Ingresa al Sistema Gestion Empresarial', 'Ingreso Sistema'),
		}
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		const NIT = await this.storageService.get('nit').then(resp => resp);
		const headers = new HttpHeaders({ NIT, Conexion, Token: '0' });
		return await this.ejecutarPeticion('post', `${this.url}Login/ingreso`, data, headers).toPromise().then(resp => resp, console.error);
	}

	async cerrarSesionUser() {
		const Conexion = await this.storageService.get('conexion').then(resp => resp);
		let usuario = await this.desencriptar(JSON.parse(await this.storageService.get('usuario').then(resp => resp)));
		let data: any = {
			ingreso: usuario.IngresoId,
			usuario: usuario.usuarioId
		};
		data = {
			encriptado: await this.encriptar(data),
			RASTREO: FuncionesGenerales.rastreo('Salida del Sistema Gestion Empresarial', 'Salida Sistema'),
		}
		const headers = new HttpHeaders({ Conexion, Token: usuario.IngresoId });
		return await this.ejecutarPeticion('post', `${this.url}Login/cierre`, data, headers).toPromise().then(resp => this.desencriptar(resp)).catch(error => {
			this.validarAlertaError(error);
		});
	}

	ejecutarPeticion(verboPeticion: string, url: string, data?: object, headers?: HttpHeaders): Observable<any> {
		if (verboPeticion === 'get') {
			return this.httpClient.get(url);
		}
		return this.httpClient.post(url, data, { headers });
	}

	private validarAlertaError(request) {
		if (request.error != '' && request.error != undefined) {
			let encabezado = "Se ha producido un problema";
			let encabezado2 = 'Error';
			let opciones = [];
			let mensaje = `Para obtener más información de este problema y posibles correcciones, pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.`;
			if (request.error.text != '' && request.error.text != undefined) {
				mensaje = `Para obtener más información de este problema y posibles correcciones, pulse el botón "Ver Detalle" y comuniquese a la línea de servicio al cliente.`;

				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error.text, "Error", ['alerta-error'],
							[{
								text: 'Cerrar',
								role: 'aceptar',
								handler: () => {
									//this.storageService.limpiarTodo(true);
								}
							}]
						);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel',
					handler: () => {
						//this.storageService.limpiarTodo(true);
					}
				}];
			} else {
				if (request.error.includes('DELETE') && request.error.includes('REFERENCE') && request.error.includes('FK')) {
					mensaje = 'No se puede eliminar, el registro se encuentra referenciado en otras tablas.';
					encabezado = 'Error de Integridad';
					encabezado2 = encabezado;
				}
				opciones = [{
					text: 'Ver Detalle',
					handler: () => {
						this.notificacionesService.alerta(request.error, "Error", ['alerta-error'], [{ text: 'Cerrar', role: 'aceptar' }]);
					}
				}, {
					text: 'Cerrar',
					role: 'cancel'
				}];
			}
			this.notificacionesService.alerta(mensaje, encabezado, [], opciones);

		}
	}

}
