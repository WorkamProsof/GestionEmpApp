import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { LoginPage } from './login.page';


import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer   } from '@awesome-cordova-plugins/file-transfer/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		LoginPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule,
	],
  providers: [File,FileOpener,FileTransfer],
	declarations: [LoginPage]
})
export class LoginPageModule { }
