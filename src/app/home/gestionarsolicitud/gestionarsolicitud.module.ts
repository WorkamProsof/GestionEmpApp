import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarsolicitudPageRoutingModule } from './gestionarsolicitud-routing.module';

import { GestionarsolicitudPage } from './gestionarsolicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarsolicitudPageRoutingModule
  ],
  declarations: [GestionarsolicitudPage]
})
export class GestionarsolicitudPageModule {}
