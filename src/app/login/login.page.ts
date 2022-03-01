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
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Platform } from '@ionic/angular';


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

  pdfObj: any;



  constructor(
    private sanitizer: DomSanitizer,
    private theme: ThemeService,
    private router: Router,
    private notificaciones: NotificacionesService,
    private loginService: LoginService,
    private storageService: StorageService,
    private cargadorService: CargadorService,
    private platform: Platform,
    private iab: InAppBrowser
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
        let permisos = FuncionesGenerales.permisos();
        let data = { ...this.formLogin.formulario.value, permisos };
        this.loginService.iniciarSesionUser(data).then(async respuesta => {
          console.log(respuesta);
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








  GenerarPDF() {

    /* var dd = {
      content: [
        {
          text: 'This is a header, using header style',
          style: 'header'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
        {
          text: 'Subheader 1 - using subheader style',
          style: 'subheader'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        {
          text: 'Subheader 2 - using subheader style',
          style: 'subheader'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        {
          text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
          style: ['quote', 'small']
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 15,
          justifi: true,
          bold: true
        },
        quote: {
          italics: true
        },
        small: {
          fontSize: 8
        }
      }

    } */





    // this.pdfObj = pdfMake.createPdf(dd).open();
    /* this.pdfObj.getBase64((data) => {
      console.log('data:image/pdf;base64,' + data);
      this.base64 = 'data:image/pdf;base64,' + data;
    }); */
    // this.pdfObj.download();
  }

  figureOutFile(file: string) {
    if (this.platform.is('ios')) {
      const baseUrl = location.href.replace('/index.html', '');
      return baseUrl + `/assets/${file}`;
    }
    if (this.platform.is('android')) {
      return `file:///android_asset/www/assets/${file}`;
    }
  }

  OpenPDF() { }

  download() {
    var target = "_system";
    var options = "location=yes,hidden=no,enableViewportScale=yes,toolbar=no,hardwareback=yes";
    const browser = this.iab.create('https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', target, options);

    browser.show();
  }

}
