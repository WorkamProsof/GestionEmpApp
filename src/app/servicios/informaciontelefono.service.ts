import { Injectable } from '@angular/core';
import { email, maxLength, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionTelefono extends PeticionService {

	private _fijo: string;
	private _celular: string;
	private _principal: string;

	constructor() {
		super();
	}

  @prop()
  @required({ message: 'Campo requerido.' })
	public get principal(): string {
		return this._principal;
	}
	public set principal(value: string) {
		this._principal = value;
	}

  @maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public set fijo(value: string) {
    this._fijo = value;
	}
	public get fijo(): string {
    return this._fijo;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
  @required({ message: 'Campo requerido.' })
	public set celular(value: string) {
		this._celular = value;
	}
	public get celular(): string {
		return this._celular;
	}

}

