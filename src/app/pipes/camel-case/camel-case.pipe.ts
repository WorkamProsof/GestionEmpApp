import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCase'
})
export class CamelCasePipe implements PipeTransform {

  transform(palabra: string): string {
		palabra = palabra.replace(/[^a-zA-Z ]/g, '');
		let conversion: string = '';
		Array.from(palabra).forEach(char => {
			if (char === '') {
				return conversion = palabra;
			} else if (char === char.toUpperCase()) {
				conversion += ' ' + char.toLowerCase();
			} else {
				conversion += char.toLowerCase();
			}
		});
		return conversion;
	}

}
