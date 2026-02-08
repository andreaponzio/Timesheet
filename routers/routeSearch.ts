/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import CDatabase from "../core/CDatabase";
import {objectType} from "../core/CBase";

export interface ISearch {
   id: number;
   data: string;
   url: string;
   type: string;
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Effettua la ricerca e visualizza i risultati.
 */
router.post("/", (request: Request, response: Response) => {
   let db: CDatabase;
   let data: ISearch[];

   // Effettua ricerca:
   db = new CDatabase();
   data = db.executeAll(`SELECT id, data, url, type
                         FROM main.search
                         WHERE data LIKE '%${request.body.search}%'
                         GROUP BY url;`) as ISearch[];

   // Visualizza dati:
   response.render("app", {
      view: objectType.search,
      data: data,
      search: request.body.search
   });
});