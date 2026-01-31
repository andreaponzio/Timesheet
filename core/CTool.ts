/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */

import {extraInfo} from "./CBase";
import CActivity, {IActivity} from "./CActivity";

/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
export enum calendarMonth {
   january = 0,
   february,
   march,
   april,
   may,
   june,
   july,
   august,
   september,
   october,
   november,
   december
}

export interface IDate {
   start: Date;
   end: Date;
}

export default class CTool {
   /**
    * Genera settimane partendo da uno specifico anno e mese.
    * @param year anno.
    * @param month mese.
    * @param closeMonth chiude settimana con il mese oppure completa.
    * @return intervalli di sate per settimana.
    */
   public static generateWeekMonth(year: number, month: calendarMonth, closeMonth: boolean = true): IDate[] {
      let start: Date;
      let data: IDate[] = [];
      let lastDay: number;
      let dayOfWeek: number;
      let nextMonth: number;

      // Determina ultimo giorno del mese:
      lastDay = new Date(year, month + 1, 0).getDate();

      // Calcola i giorni necessari da aggiungere per chiudere la settimana completa:
      nextMonth = 7 - new Date(year, month, lastDay).getDay();

      // Costruisce intervalli di date per il mese e anno selezionati:
      for(let day = 1; day <= lastDay; day++) {
         dayOfWeek = new Date(year, month, day).getDay();
         if(data.length === 0 && start === undefined)
            start = new Date(year, month, day, 0, 0, 0);
         else if(dayOfWeek === 1)
            start = new Date(year, month, day, 0, 0, 0);
         else if(dayOfWeek === 0) {
            data.push({
               start: start,
               end: new Date(year, month, day, 23, 59, 59)
            });
            start = undefined;
         }
      }

      // Se è richiesto che la settimana termina con il fine mese, aggiunge ultima data:
      if(closeMonth) {
         if(start !== undefined) {
            data.push({
               start: start,
               end: new Date(year, month, lastDay, 23, 59, 59)
            });
         }
      }

      // altrimenti termina la settimana con la domenica aggiungendo i giorni del mese successivo:
      else if(nextMonth !== 0 && start !== undefined) {
         month++;
         for(let day = 1; day <= nextMonth; day++) {
            dayOfWeek = new Date(year, month, day).getDay();
            if(dayOfWeek === 0) {
               data.push({
                  start: start,
                  end: new Date(year, month, day, 23, 59, 59)
               });
            }
         }
      }

      // Restituisce intervalli:
      return data;
   }

   /**
    * Genera intervalli per mese nell'anno specificato.
    * @param year anno.
    * @return intervalli di date per mese dell'anno.
    */
   public static generateMonthYear(year: number): IDate[] {
      let data: IDate[] = [];
      let lastDay: number;
      let counter: number = 0;

      // Genera date per ogni mese dell'anno:
      for(let month = 0; month < 12; month++) {
         lastDay = new Date(year, month + 1, 0).getDate();
         data.push({
            start: new Date(year, month, 1, 0, 0, 0),
            end: new Date(year, month, lastDay, 23, 59, 59)
         });
      }

      // Restituisce intervalli:
      return data;
   }

   /**
    * Permette di convertire il valore dell'Extra Info nella corrispettiva descrizione.
    * @param value valore Extra Info.
    * @return descrizione.
    */
   public static convertExtraInfo(value: number): string {
      let description: string = "";

      switch(value) {
         case extraInfo.reperibilita:
            description = "P010";
            break;

         case extraInfo.ferie:
            description = "A000";
            break;

         case extraInfo.attivitaExtra:
            description = "P015";
            break;

         case extraInfo.permessi:
            description = "A010";
            break;
      }

      return description;
   }

   /**
    * Permette di ottenere l'elenco delle attività attive.
    * @param object oggetto attività per l'accesso alla base dati.
    * */
   public static getActivity(object: CActivity): IActivity[] {
      return object.executeAll("SELECT id, internal_ref, description FROM main.activity WHERE status in (1, 2, 3) ORDER BY description;") as IActivity[];
   }
}