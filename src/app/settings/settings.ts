import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SettingsProvider {

	private theme: BehaviorSubject<String>;

	constructor() { }

	setActiveTheme(val) {
		this.theme.next(val);
	}

	getActiveTheme() {
		return this.theme.asObservable();
	}

}