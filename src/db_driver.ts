/*db_driver class handles setting up
connection to mysql db and all 
queries/inserts/deletes... etc*/
import mysql from 'mysql2';
type Order = {
  item_id: number
  item_name:string
  quantity: number
  price:number
}

export class db_driver{
    protected readonly pool:  mysql.Pool;
    constructor() {

      let connlimit:unknown = process.env.DBCONLIMIT;
      this.pool = mysql.createPool({
        connectionLimit : <number>connlimit,
        host: process.env.DBHOST!,
        user: process.env.DBUSER!,
        password: process.env.DBPASSWORD!,
        database: process.env.DATABASE!
      });
      
    }

    Select_DB = () =>{
      return new Promise((resolve, reject)=>{
          this.pool.query('SELECT * FROM test ',  (error, elements)=>{
              if(error){
                  reject(error);
              }
              resolve(elements);
              });
        });
    };
    
    Insert_user_DB = (first:string, last:string, email:string, phone:string, pass:string) =>{
      let insert_query:string =`INSERT INTO users (first_name, last_name, email, phone, user_pass) VALUES ('${first}', '${last}', '${email}','${phone}', '${pass}');`;
      console.log(insert_query);

      return new Promise((resolve, reject)=>{
        this.pool.query(insert_query,  (error, elements)=>{
            if(error){
              //console.log(error);
                reject(error);
                
            }
            resolve(elements);
            });
      });

    };

    Find_user =(email:string) =>{
      let find_user_query = `SELECT user_pass, first_name from users WHERE email ='${email}';`;
      return new Promise((resolve, reject)=>{
        this.pool.query(find_user_query,  (error, elements)=>{
            if(error){
                reject(error);
            }
            resolve(elements);
            });
      });

    }

    Get_items=() =>{
      let get_items_query = "SELECT * from items;"
      return new Promise((resolve, reject)=>{
        this.pool.query(get_items_query,  (error, elements)=>{
            if(error){
                reject(error);
            }
            resolve(elements);
            });
      });
    }

    Add_order =  (email:string,order_date:string,order_status:string,order_total:number,items:unknown[]) => {

    let insert_query:string =`INSERT INTO orders (email, order_date, order_status, order_total) 
    VALUES ('${email}', '${order_date}', '${order_status}','${order_total}');`;
    let order_id:number=0;

    this.pool.query(insert_query,   (error, results, fields)=> {
      if (error) throw error;
      let headers = results as mysql.ResultSetHeader;
      //console.log('order id is',headers.insertId);
      order_id = headers.insertId;
      //console.log('db driver items:',items)
      let i:number = 0;
      while (i < items.length){
        let order_item = items[i] as Order
        let order_item_query= `INSERT INTO order_items (order_id, item_id, quantity) 
        VALUES ('${order_id}', '${order_item.item_id}', '${order_item.quantity}');`;
        console.log('db driver add order order items', order_item);
        this.pool.query(order_item_query,function (error, results, fields) {
          if (error) throw error;
          //console.log(results);
        });
        i++;
      }
      
    });
    
    };

    Get_orders = (email:string, order_id?:number) => {
      //get all orders if order id undefined
      let get_order_query:string;
      if(typeof order_id === undefined){
        get_order_query = `SELECT * from orders WHERE email ='${email}';`;
      }else{
        get_order_query = `SELECT * from orders WHERE email ='${email}' AND order_id = '${order_id}';`;
      }
      return new Promise((resolve, reject)=>{
        this.pool.query(get_order_query, (error, elements)=>{
            if(error){
                reject(error);
            }
            resolve(elements);
            });
      });


    }
 
}