import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filtro'
})
export class FiltroListaPipe implements PipeTransform {

	transform(array: any[], column: string, buscar: string): unknown {

		if (buscar === '') {
			return array;
		}

		buscar = buscar.toLowerCase();

		return array.filter(item => item[column].toLowerCase().includes(buscar));
	}


}
