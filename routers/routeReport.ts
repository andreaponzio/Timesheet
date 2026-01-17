/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import exceljs from "exceljs";
import CBase, {objectType} from "../core/CBase";
import CTool, {IDate} from "../core/CTool";
import {SqlGen} from "../core/CSqlGen";
import CWorkday, {IWeekWorkday} from "../core/CWorkday";
import IField = SqlGen.IField;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;
import {out} from "../public/config.json";
import CDatabase from "../core/CDatabase";

interface IExcel {
   date: string;
   hour: number;
   extrainfo: string;
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
let excelDate: Date;
let excelError: string = "";

/**
 * Permette di analizzare i dati settimanali.
 */
router.get("/week", (request: Request, response: Response) => {
   let db: CDatabase;

   db = new CDatabase();

   // Imposta data di default:
   if(!excelDate)
      excelDate = new Date();

   response.render("app", {
      view: objectType.week_list,
      data: {
         date: db.convertDate(excelDate, 2),
         display: false,
         error: excelError,
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
   let col: number;
   let cell: any;

   o = new CWorkday();

   // Suddivide la data scelta in anno e mese e genera le settimane:
   date = (request.params.id as string).split("-");

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
         {header: "Extrainfo", key: "extrainfo", width: 10},
         {header: "Note", key: "note", width: 80},
         {header: "Descrizione", key: "activity_description", width: 80},
         {header: "Rif. interno", key: "activity_internal_ref", width: 80},
         {header: "WBS", key: "wbs_internal_ref", width: 25},
         {header: "Luogo", key: "place", width: 20},
      ];

      // Assegna colore all'intestazione di colonna:
      for(col = 1; col < 10; col++) {
         switch(col) {
            case 1:
               cell = worksheet.getCell("A1");
               break;

            case 2:
               cell = worksheet.getCell("B1");
               break;

            case 3:
               cell = worksheet.getCell("C1");
               break;

            case 4:
               cell = worksheet.getCell("D1");
               break;

            case 5:
               cell = worksheet.getCell("E1");
               break;

            case 6:
               cell = worksheet.getCell("F1");
               break;

            case 7:
               cell = worksheet.getCell("G1");
               break;

            case 8:
               cell = worksheet.getCell("H1");
               break;

            case 9:
               cell = worksheet.getCell("I1");
               break;
         }
         cell.font = {bold: true};
         cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "66CC00"}
         };
         cell = undefined;
      }

      // Valorizza righe:
      for(let r of data)
         worksheet.addRow({
            date: r.date,
            day: new Date(r.date).getDate(),
            hour: r.hour,
            extrainfo: CTool.convertExtraInfo(parseInt(r.extrainfo)),
            note: r.note,
            activity_description: r.activity_description,
            activity_internal_ref: r.activity_internal_ref,
            wbs_internal_ref: r.wbs_internal_ref,
            place: r.place
         });
   }

   // Scrive file Excel e riporta nella pagina principale:
   workbook.xlsx.writeFile(`${out}W${request.params.id}.xlsx`).then(() => {
      excelError = "";
      response.redirect("/report/week");
   }).catch((err) => {
      excelError = err.message;
      response.redirect("/report/week");
   });
});

/**
 * Visualizza i dati settimanali per il mese scelto.
 */
router.post("/week", (request: Request, response: Response) => {
   let db: CDatabase;
   let date: string[];

   db = new CDatabase();

   // Suddivide la data scelta in anno e mese e genera le settimane:
   date = request.body.month.split("-");
   excelDate = new Date(parseInt(date[0]), parseInt(date[1]) - 1, 1);

   // Riporta sulla pagina:
   response.render("app", {
      view: objectType.week_list,
      data: {
         date: db.convertDate(excelDate, 2),
         workday: getWeekWorkday(parseInt(date[0]), parseInt(date[1]) - 1),
         display: true
      }
   });
});