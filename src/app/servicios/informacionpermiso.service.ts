import { Injectable } from '@angular/core';
import { email, maxLength, maxNumber, numeric, NumericValueType, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionPermiso extends PeticionService {

	private _Dias: number;
	private _Fecha: string;
	private _TipoAusentismoId: string;

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })
	public get TipoAusentismoId(): string {
		return this._TipoAusentismoId;
	}
	public set TipoAusentismoId(value: string) {
		this._TipoAusentismoId = value;
	}
	
	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get Fecha(): string {
		return this._Fecha;
	}
	public set Fecha(value: string) {
		this._Fecha = value;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo nùmeros positivos' })
	@maxNumber({ value: 250, message: 'Solo nùmeros hasta 250' })
	public get Dias(): number {
		return this._Dias;
	}
	public set Dias(value: number) {
		this._Dias = value;
	}

}

