/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CDatabase from "./CDatabase";

import {data as customer_data} from "../public/datadb_customer.json";
import {data as wbs_data} from "../public/datadb_wbs.json";
import {data as activity_data} from "../public/datadb_activity.json";
import {data as request_data} from "../public/datadb_request.json";
import {data as requestenv_data} from "../public/datadb_requestenv.json";
import {data as workday_data} from "../public/datadb_workday.json";
import {numericInterval} from "./CBase";
import CActivity, {IActivity} from "./CActivity";
import CCustomer, {ICustomer} from "./CCustomer";
import CWbs, {IWbs} from "./CWbs";

export class CInit {
   private db: CDatabase;
   private date: Date;
   private changed_on: Date;
   private debug: boolean = false;

   constructor() {
      this.db = new CDatabase();
   }
   public deleteAll() {
      let o: CDatabase = new CDatabase();
      o.executeRun("DELETE FROM main.numberid;");
      o.executeRun("DELETE FROM main.customer;");
      o.executeRun("DELETE FROM main.wbs;");
      o.executeRun("DELETE FROM main.activity;");
      o.executeRun("DELETE FROM main.request-old;");
      o.executeRun("DELETE FROM main.request_binary;");
      o.executeRun("DELETE FROM main.workday;");
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.customer}', 100000);`);
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.wbs}', 200000);`);
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.activity}', 300000);`);
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.workday}', 400000);`);
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.change_request}', 500000);`);
      o.executeRun(`INSERT INTO main.numberid (id, last_number)
                    VALUES ('${numericInterval.workday_group}', 600000);`);
   }
   public customer(): void {
      try {
         customer_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.date = new Date(d.changed_on);
            this.db.executeRun(`INSERT INTO main.customer (id, description, changed_on)
                                VALUES (${d.id},
                                        '${d.description}',
                                        '${this.db.convertDate(this.date)}');`);
            this.db.getId(numericInterval.customer);
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public wbs(): void {
      try {
         wbs_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.date = new Date(d.changed_on);
            this.db.executeRun(
               `INSERT INTO main.wbs
                VALUES ('${d.internal_ref}',
                        ${d.customer},
                        '${d.description1}',
                        '${d.description2}',
                        ${d.id},
                        '${this.db.convertDate(this.date)}');`);
            this.db.getId(numericInterval.wbs);
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public activity(): void {
      try {
         activity_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.date = new Date(d.changed_on);
            this.db.executeRun(
               `INSERT INTO main.activity
                VALUES (${d.wbs},
                        '${d.internal_ref}',
                        '${d.external_ref}',
                        ${d.type},
                        '${d.description}',
                        '${d.functional}',
                        '${d.technical}',
                        ${d.hour},
                        ${d.status},
                        '${d.note}',
                        ${d.id},
                        '${this.db.convertDate(this.date)}');`);
            this.db.getId(numericInterval.activity);
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public request(): void {
      try {
         request_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.date = new Date(d.changed_on);
            this.db.executeRun(
               `INSERT INTO request
                VALUES (${d.activity},
                        '${d.request}',
                        ${d.type},
                        '${d.description}',
                        '${d.owner}',
                        '${d.date}',
                        '${d.note}',
                        ${d.id},
                        '${this.db.convertDate(this.date)}');`);
            this.db.getId(numericInterval.change_request);
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public requestenv(): void {
      try {
         requestenv_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.db.executeRun(
               `INSERT INTO requestenv
                VALUES (${d.id},
                        ${d.env},
                        '${this.db.convertDate(new Date(d.date))}',
                        '${this.db.convertDate(new Date())}');`
            );
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public workday(): void {
      try {
         workday_data.forEach(d => {
            if(this.debug)
               console.log(d);
            this.date = new Date(d.date);
            this.changed_on = new Date(d.change_on);
            this.db.executeRun(
               `INSERT INTO main.workday
                VALUES (${d.activity},
                        '${this.db.convertDate(this.date)}',
                        ${d.id},
                        ${d.idgroup},
                        ${d.hour},
                        '${d.extrainfo}',
                        ${d.place},
                        '${d.note}',
                        '${this.db.convertDate(this.changed_on)}');`);
            this.db.getId(numericInterval.workday);
         });
      }
      catch(e) {
         console.log(e.message);
      }
   }
   public search(): void {
      let customer: CCustomer;
      let wbs: CWbs;
      let activity: CActivity;

      let customer_data: ICustomer[];
      let wbs_data: IWbs[];
      let activity_data: IActivity[];

      this.db.executeRun("DELETE FROM main.search;");
      try {
         this.db.executeRun(`INSERT INTO main.numberid (id, last_number)
                             VALUES ('${numericInterval.search}', 100000);`);
      }
      catch(e) {
         this.db.executeRun(`UPDATE main.numberid
                             SET last_number = 100000
                             WHERE id = '${numericInterval.search}';`);
      }

      customer = new CCustomer();
      customer_data = customer.loadAll();
      customer_data.forEach(d => {
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.description}',
                                     '/customer/${d.id}', 1)`);
      });

      wbs = new CWbs();
      wbs_data = wbs.loadAll();
      wbs_data.forEach(d => {
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.internal_ref}',
                                     '/wbs/${d.id}', 2)`);
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.description1}',
                                     '/wbs/${d.id}', 2)`);
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.description2}',
                                     '/wbs/${d.id}', 2)`);
      });

      activity = new CActivity();
      activity_data = activity.loadAll();
      activity_data.forEach(d => {
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.internal_ref}',
                                     '/activity/${d.id}', 3)`);
         this.db.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                             VALUES (${d.id}, ${this.db.getId(numericInterval.search)}, '${d.description}',
                                     '/activity/${d.id}', 3)`);
      });
   }
}