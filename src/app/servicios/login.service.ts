import { Injectable } from '@angular/core';
import { required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class LoginService extends PeticionService {

	private _nit: string;
	private _usuario: string;
	private _password: string;

	constructor() {
		super();
	}


	@required({ message: 'Ingrese un valor valido.' })
	public get nit(): string {
		return this._nit;
	}
	public set nit(value: string) {
		this._nit = value;
	}

	@required({ message: 'Ingreso nombre de usuario.' })
	public get usuario(): string {
		return this._usuario;
	}
	public set usuario(value: string) {
		this._usuario = value;
	}

	@required({ message: 'Ingrese la contraseña.' })
	public get password(): string {
		return this._password;
	}
	public set password(value: string) {
		this._password = value;
	}
}
