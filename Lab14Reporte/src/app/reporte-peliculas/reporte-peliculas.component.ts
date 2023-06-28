import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

interface TDocumentDefinitions {
  content: any[];
  styles?: any;
}


@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];
  generos: string[] = [];
  aniosLanzamiento: number[] = [];
  filtroGenero: string = '';
  filtroAnio: number = 0;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
      this.peliculasFiltradas = data;
      this.generos = this.obtenerGeneros();
      this.aniosLanzamiento = this.obtenerAniosLanzamiento();
    });
  }

  generarPDF() {
    const contenido: any[] = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Título', style: 'tableHeader' },
              { text: 'Género', style: 'tableHeader' },
              { text: 'Año de lanzamiento', style: 'tableHeader' }
            ],
            ...this.peliculas.map(pelicula => [
              { text: pelicula.titulo, style: 'tableCell' },
              { text: pelicula.genero, style: 'tableCell' },
              { text: pelicula.lanzamiento.toString(), style: 'tableCell' }
            ])
          ]
        }
      }
    ];

    
    const estilos = {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10] // Margen inferior para separar el encabezado del contenido
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'white',
        fillColor: '#4287f5',
        alignment: 'center'
      },
      tableCell: {
        fontSize: 10,
        alignment: 'left'
      }
    };

    
    const documentDefinition: TDocumentDefinitions = {
      content: contenido,
      styles: estilos
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  aplicarFiltro() {
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.filtroGenero && pelicula.genero !== this.filtroGenero) {
        return false;
      }
      if (this.filtroAnio && pelicula.lanzamiento !== this.filtroAnio) {
        return false;
      }
      return true;
    });
  }

  limpiarFiltros() {
    this.filtroGenero = '';
    this.filtroAnio = 0;
    this.peliculasFiltradas = this.peliculas;
  }

  private obtenerGeneros(): string[] {
    const generos = this.peliculas.map(pelicula => pelicula.genero);
    return Array.from(new Set(generos));
  }

  private obtenerAniosLanzamiento(): number[] {
    const aniosLanzamiento = this.peliculas.map(pelicula => pelicula.lanzamiento);
    return Array.from(new Set(aniosLanzamiento));
  }

  saveFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url: string = window.URL.createObjectURL(data);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  }

  //Generamos uun excel
  generarExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(this.peliculasFiltradas);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Películas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveFile(excelBuffer, 'informe.xlsx');
  }



  saveFile2(data: string, fileName: string) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  }
  //Csv
  generarCSV() {
    const csv = Papa.unparse(this.peliculasFiltradas);
    this.saveFile2(csv, 'informe.csv');
  }






}
