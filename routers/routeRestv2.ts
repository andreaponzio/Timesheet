/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import fs from "node:fs";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CWbs, {IWbs} from "../core/CWbs";
import CActivity, {IActivity} from "../core/CActivity";
import CWorkday, {IWorkday} from "../core/CWorkday";
import CRequest, {IRequest} from "../core/CRequest";
import COData from "../core/COData";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Restituisce $metadata del servizio di accesso a SQLite.
 */
router.get("/$metadata", (request: Request, response: Response) => {
   response.send(fs.readFileSync("./public/metadata_v2.xml").toString());
});

router.post("/customer", (request: Request, response: Response) => {
   console.log(request.body);
});

