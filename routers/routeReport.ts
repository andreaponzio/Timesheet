/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import exceljs from "exceljs";
import {objectType} from "../core/CBase";
import CTool, {IDate} from "../core/CTool";
import {SqlGen} from "../core/CSqlGen";
import CWorkday, {IWeekWorkday} from "../core/CWorkday";
import IField = SqlGen.IField;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;
import {out} from "../public/config.json";

interface IExcel {
   date: string;
   hour: number;
   note: string;
   activity_description: string;
   activity_internal_ref: string;
   wbs_internal_ref: string;
   place: string;
}

/**
 * Funzioni locali.
 */
let getWeekWorkday = (year: number, month: number, load: boolean = true): IWeekWorkday[] => {
   let o: CWorkday;
   let data: IWeekWorkday[] = [];
   let week: IDate[];
   let cond: IField;
   let counter: number = 0;

   o = new CWorkday();
   week = CTool.generateWeekMonth(year, month);

   // Recupera le consuntivazioni per ogni settimana:
   for(let w of week) {
      cond = {
         name: "date",
         value: [{
            sign: Sign.INCLUDE,
            option: Option.BETWEEN,
            low: o.convertDate(w.start),
            high: o.convertDate(w.end)
         }]
      };
      data.push({
         start: w.start,
         end: w.end,
         id: `w${++counter}`,
         data: load ? o.loadAll([cond] as IField[]) : []
      });
   }

   return data;
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Permette di analizzare i dati settimanali.
 */
router.get("/week", (request: Request, response: Response) => {
   let year: string;
   let month: string;

   year = new Date().getFullYear().toString();
   month = (new Date().getMonth() + 1).toString();

   response.render("app", {
      view: objectType.week_list,
      data: {
         date: `${year}-${month}`,
         display: false
      }
   });
});

/**
 * Scrive in un file excel i dati settimanali.
 */
router.get("/week/:id", (request: Request, response: Response) => {
   let o: CWorkday;
   let week: IWeekWorkday[] = [];
   let data: IExcel[];
   let date: string[];
   let counter: number = 0;
   let workbook: any;
   let worksheet: any;
   let cell: any;

   o = new CWorkday();

   // Suddivide la data scelta in anno e mese e genera le settimane:
   date = request.params.id.split("-");

   // Genera lista consuntivazioni settimanali:
   week = getWeekWorkday(parseInt(date[0]), parseInt(date[1]) - 1, false);

   // Crea foglio di lavoro:
   workbook = new exceljs.Workbook();

   // Per ogni settimana crea un foglio di lavoro:
   for(let w of week) {
      counter++;

      // Legge dati della settimana:
      data = o.executeAll(`SELECT *
                           FROM main.workday_excel
                           WHERE date BETWEEN '${o.convertDate(w.start)}' AND '${o.convertDate(w.end)}';`) as IExcel[];

      // Prepara foglio di lavoro:
      worksheet = workbook.addWorksheet(`Settimana ${counter}`);
      worksheet.columns = [
         {header: "Data", key: "date", width: 20},
         {header: "Giorno", key: "day", width: 10},
         {header: "Ore", key: "hour", width: 8},
         {header: "Note", key: "note", width: 80},
         {header: "Descrizione", key: "activity_description", width: 80},
         {header: "Rif. interno", key: "activity_internal_ref", width: 80},
         {header: "WBS", key: "wbs_internal_ref", width: 25},
         {header: "Luogo", key: "place", width: 20},
      ];
      cell = worksheet.getCell("A1")
      cell.font = {bold: true};
      cell.fill = {
         type: "pattern",
         pattern: "solid",
         fgColor: {argb: "66CC00"}
      };

      // Valorizza righe:
      for(let r of data)
         worksheet.addRow({
            date: r.date,
            day: new Date(r.date).getDate(),
            hour: r.hour,
            note: r.note,
            activity_description: r.activity_description,
            activity_internal_ref: r.activity_internal_ref,
            wbs_internal_ref: r.wbs_internal_ref,
            place: r.place
         });
   }

   // Scrive file Excel e riporta nella pagina principale::
   workbook.xlsx.writeFile(`${out}W${request.params.id}.xlsx`).then();
   response.redirect("/report/week");
});

/**
 * Visualizza i dati settimanali per il mese scelto. Ci sarà anche la possibilità di
 * scaricarli tutti o solo la singola settimana.
 */
router.post("/week", (request: Request, response: Response) => {
   let date: string[];

   // Suddivide la data scelta in anno e mese e genera le settimane:
   date = request.body.month.split("-");

   // Riporta sulla pagina:
   response.render("app", {
      view: objectType.week_list,
      data: {
         date: `${parseInt(date[0])}-${parseInt(date[1])}`,
         workday: getWeekWorkday(parseInt(date[0]), parseInt(date[1]) - 1),
         display: true
      }
   });
});