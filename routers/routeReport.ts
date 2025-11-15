/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Permette di analizzare i dati settimanali.
 */
router.get("/week", (request: Request, response: Response) => {

});

/**
 * Permette di analizzare i dati mensili.
 */
router.get("/month", (request: Request, response: Response) => {

});

/**
 * Permette di analizzare un periodo libero.
 */
router.get("/free", (request: Request, response: Response) => {

});