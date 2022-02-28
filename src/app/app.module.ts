import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';


import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CustomInjectorService } from './config/peticiones/peticion.service';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule } from '@angular/common/http';
import { Drivers } from '@ionic/storage';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
	declarations: [
		AppComponent
	],
	entryComponents: [],
	imports: [
		BrowserModule
		, IonicModule.forRoot()
		, AppRoutingModule
		, HttpClientModule
    , IonicSelectableModule
		, IonicStorageModule.forRoot({
			driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
			name: '__GestionEmpresarialDB',
			storeName: 'settings',
			description: 'GestionEmpresarialApp temp data'
		}),
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	],
	bootstrap: [AppComponent],
})
export class AppModule {
	constructor(private injector: Injector) {
		if (!CustomInjectorService.injector) {
			CustomInjectorService.injector = this.injector;
		}
	}
}
