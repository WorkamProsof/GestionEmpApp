import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitarvacacionesPageRoutingModule } from './solicitarvacaciones-routing.module';

import { SolicitarvacacionesPage } from './solicitarvacaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitarvacacionesPageRoutingModule
  ],
  declarations: [SolicitarvacacionesPage]
})
export class SolicitarvacacionesPageModule {}
