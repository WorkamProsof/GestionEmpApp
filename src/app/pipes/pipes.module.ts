import { NgModule } from '@angular/core';
import { CamelCasePipe } from './camel-case/camel-case.pipe';
import { FiltroListaPipe } from './filtro-lista/filtro-lista.pipe';

const PIPES = [
	CamelCasePipe,
	FiltroListaPipe
]

@NgModule({
	declarations: PIPES,
	exports: PIPES
})
export class PipesModule { }
