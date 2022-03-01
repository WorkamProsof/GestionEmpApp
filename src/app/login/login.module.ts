import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { LoginPage } from './login.page';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		LoginPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
	],
	providers: [InAppBrowser],
	declarations: [LoginPage]
})
export class LoginPageModule { }
