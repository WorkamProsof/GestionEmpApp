import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from '../servicios/cargador.service';
import { LoginService } from '../servicios/login.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { StorageService } from '../servicios/storage.service';
import { ThemeService } from '../servicios/theme.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { timer } from 'rxjs';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

	formLogin: { formulario: RxFormGroup, propiedades: Array<string> };
	ingresoDocumento: Boolean = true;
	claseDocumento: string = '';
	claseUsuario: string = '';
	verPassword: Boolean = false;
	urlFondoImagen: string = "/assets/images/fondoLogin.jpg";

	constructor(
		private sanitizer: DomSanitizer,
		private theme: ThemeService,
		private router: Router,
		private notificaciones: NotificacionesService,
		private loginService: LoginService,
		private storageService: StorageService,
		private cargadorService: CargadorService,
	) { }

	ngOnInit() {
		this.configForm();
	}

	ionViewWillEnter() {
		this.validarAccion();
	}

	async validarAccion() {
		let nit = await this.storageService.get('nit').then(resp => resp);
		if (nit) {
			this.formLogin.formulario.get('nit').setValue(nit);
			this.irFormulario();
		}
	}

	configForm() {
		this.formLogin = FuncionesGenerales.crearFormulario(this.loginService);
	}

	obtenerFondo() {
		return this.sanitizer.bypassSecurityTrustStyle(`
			background-image: url(${this.urlFondoImagen});
			background-repeat: no-repeat;
			background-size: cover;
			background-position: center;
			background-attachment: fixed;
		`);
	}

	irFormulario() {
		this.cargadorService.presentar().then(resp => {
			if (this.formLogin.formulario.get('nit').valid) {
				const nit = this.formLogin.formulario.get('nit').value;
				this.loginService.validarNit(nit).then(respuesta => {
					console.log(respuesta);
					if (respuesta && respuesta.success) {
						this.storageService.set('nit', nit);
						this.storageService.set('crypt', respuesta.crypt);
						this.storageService.set('modulos', respuesta.modulos);
						this.storageService.set('conexion', respuesta.db);
						this.claseDocumento = 'animate__fadeOutLeft';
						this.ejecutarTimer('claseUsuario', 'animate__fadeInRight').then(item => this.ingresoDocumento = !this.ingresoDocumento);
					} else {
						this.notificaciones.notificacion(respuesta.mensaje);
					}
					this.cargadorService.ocultar();
				}).catch(error => {
					console.log(error);
					this.notificaciones.notificacion("Error de conexión.");
					this.cargadorService.ocultar();
				});
			}
		});
	}

	async ejecutarTimer(variable: string, clase: string) {
		return await timer(200).toPromise().then(resp => this[variable] = clase);
	}

	retornar() {
		this.formLogin.formulario.reset();
		this.claseUsuario = 'animate__fadeOutRight';
		this.ejecutarTimer('claseDocumento', 'animate__fadeInLeft').then(item => this.ingresoDocumento = !this.ingresoDocumento);
	}

	get fontSize() {
		return { 'fontSize': this.theme.getStyle() };
	};

	login() {
		if (this.formLogin.formulario.valid) {
			this.cargadorService.presentar().then(resp => {
				const data = this.formLogin.formulario.value;
				this.loginService.iniciarSesionUser(data).then(async respuesta => {
					if (respuesta && respuesta.valido) {
						this.storageService.set('usuario', respuesta.usuario);
						this.router.navigateByUrl('/modulos/inicio');
						this.formLogin.formulario.reset();
						this.retornar();
					} else {
						this.notificaciones.notificacion(respuesta.mensaje);
					}
					this.cargadorService.ocultar();
				}).catch(error => {
					console.error("Error ", error);
					this.cargadorService.ocultar();
				});
			});
		} else {
			FuncionesGenerales.formularioTocado(this.formLogin.formulario);
		}
	}

}
