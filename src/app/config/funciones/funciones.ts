import { RxFormGroup, RxFormBuilder } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

export class FuncionesGenerales {

	static ordenar(a, column?: string, orden?: number, b?): number {
		if (column && b && orden) {
			return a[column] > b[column] ? orden : (a[column] < b[column] ? (orden === -1 ? 1 : -1) : 0);
		} else if (column) {
			return a[column] ? 1 : -1;
		}
	}

	static formatearFecha(fecha: string, formato?: string, iso?: boolean): string {
		const valorFecha = moment(fecha);
		if (iso) {
			return valorFecha.toISOString();
		}
		return valorFecha.format(formato ? formato : 'DD/MM/YYYY')
	}

	static urlGestion() {
		return environment.urlGestion;
	}

	static crearFormulario(service: any, group?: boolean) {
		let formulario: RxFormGroup;
		if (group) {
			formulario = <RxFormGroup>new RxFormBuilder().group(service);
		} else {
			formulario = <RxFormGroup>new RxFormBuilder().formGroup(service);
		}
		const propiedades: Array<string> = Object.keys(formulario.controls);
		return { formulario, propiedades }
	}

	static formularioTocado(formulario: RxFormGroup) {
		Object.values(formulario.controls).forEach(item => {
			item.markAsTouched();
			if (item['controls']) {
				this.formularioTocado(item as RxFormGroup);
			}
		});
	}

	static rastreo = (cambio, programa) => {
		return { fecha: moment().format('YYYY-DD-M HH:mm:ss'), programa, cambio }
	};

	static generarColorAutomatico() {
		const VALORESCOLORES = "0123456789ABCDEF";
		let color = "#";
		for (let index = 0; index < VALORESCOLORES.length - 10; index++) {
			color += VALORESCOLORES[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	static permisos(tipo = '') {
		let datos = [
			{ id: 600100, tipo: "menu" },

			//{ id: 6001006, tipo: "Datos Personales" },
			{ id: 60010061, tipo: "DP", campo: "nombruno" },
			{ id: 60010062, tipo: "DP", campo: "nombrdos" },
			{ id: 60010063, tipo: "DP", campo: "apelluno" },
			{ id: 60010064, tipo: "DP", campo: "apelldos" },
			{ id: 60010065, tipo: "DP", campo: "estadocivil_id" },
			{ id: 60010066, tipo: "DP", campo: "sexo" },
			{ id: 60010067, tipo: "DP", campo: "grupo_sanguineo" },
			{ id: 60010068, tipo: "DP", campo: "fecha_nac" },

			//{ id: 6001001, tipo: "Información Empleado" },
			{ id: 60010011, tipo: "IE", campo: "paisid" },
			{ id: 60010012, tipo: "IE", campo: "dptoid" },
			{ id: 60010013, tipo: "IE", campo: "ciudadid" },
			//{ id: 60010014, tipo: "IE", campo: "clave" },
			{ id: 60010015, tipo: "IE", campo: "pasatiempo" },

			//{ id: 6001002, tipo: "Información Familiar" },
			{ id: 60010021, tipo: "FI", campo: "tipodoc_id" },
			{ id: 60010022, tipo: "FI", campo: "num_docu" },
			{ id: 60010023, tipo: "FI", campo: "parentesco_id" },
			{ id: 60010024, tipo: "FI", campo: "nombre" },
			{ id: 60010025, tipo: "FI", campo: "fecha_nac" },
			{ id: 60010026, tipo: "FI", campo: "tel_fijo" },
			{ id: 60010027, tipo: "FI", campo: "celular" },
			{ id: 60010028, tipo: "FI", campo: "direccion" },

			//{ id: 6001003, tipo: "Información Academica" },
			{ id: 60010031, tipo: "IC", campo: "niveleducativo_id" },
			{ id: 60010032, tipo: "IC", campo: "institucion" },
			{ id: 60010033, tipo: "IC", campo: "ultimocursado" },
			{ id: 60010034, tipo: "IC", campo: "fecha_finalizacion" },
			{ id: 60010035, tipo: "IC", campo: "titulo" },

			{ id: 60010046, tipo: "DC", campo: "fijo" },
			{ id: 60010047, tipo: "DC", campo: "celular" },
			{ id: 60010048, tipo: "DC", campo: "principal" },

			//{ id: 6001004, tipo: "Datos de Contacto" },
			{ id: 60010041, tipo: "DR", campo: "paisid" },
			{ id: 60010042, tipo: "DR", campo: "dptoid" },
			{ id: 60010043, tipo: "DR", campo: "ciudadid" },
			{ id: 60010044, tipo: "DR", campo: "principal" },
			{ id: 60010045, tipo: "DR", campo: "direccion" },

			{ id: 60010049, tipo: "CC", campo: "correo" },
			{ id: 60010050, tipo: "CC", campo: "principal" },
      { id: 6001005, tipo: "RP", campo: "Reportes" },
      { id: 6001007, tipo: "CL", campo: "Certificados Laborales" },
      { id: 60010071, tipo: "CL", campo: "Carta Laboral" },
      { id: 60010072, tipo: "CL", campo: "Extratos" },
      { id: 60010073, tipo: "CL", campo: "Certificados" },
      { id: 6001008, tipo: "CL", campo: "Solicitar Vacaciones" },
      { id: 60010081, tipo: "CL", campo: "Periodos vacacionales pendientes" },
      { id: 60010082, tipo: "CL", campo: "Periodos vacacionales disfrutados o pagados" },
      { id: 60010083, tipo: "CL", campo: "Crear" }
		];

		if (tipo == '') {
			return datos.map(op => op.id);
		} else {
			return datos.filter(op => op.tipo == tipo);
		}
	}

}
