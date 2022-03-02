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
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

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
    , FontAwesomeModule
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
	constructor(private injector: Injector,library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
		if (!CustomInjectorService.injector) {
			CustomInjectorService.injector = this.injector;
		}
	}
}
