import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfiguracionPageRoutingModule } from './configuracion-routing.module';

import { ConfiguracionPage } from './configuracion.page';
import { ComponentesModule } from 'src/app/componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ComponentesModule,
    IonicModule,
    ConfiguracionPageRoutingModule
  ],
  declarations: [ConfiguracionPage]
})
export class ConfiguracionPageModule {}
