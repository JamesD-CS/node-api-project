/*db_driver class handles setting up
connection to mysql db and all 
queries/inserts/deletes... etc*/
import mysql from 'mysql2/promise';

type Item={
  item_name:string,
  order_id:number,
  item_id:number,
  quantity:number,
  price:number
}

type Order = {
  item_id: number
  item_name:string
  quantity: number
  price:number
}

export class db_driver{
    protected readonly pool:  mysql.Pool;
    constructor()  {

      let connlimit:unknown = process.env.DBCONLIMIT;
       this.pool =  mysql.createPool({
        connectionLimit : <number>connlimit,
        host: process.env.DBHOST!,
        user: process.env.DBUSER!,
        password: process.env.DBPASSWORD!,
        database: process.env.DATABASE!
      });
      
    }
    
    insert_user_db_test = async(first:string, last:string, email:string, phone:string, pass:string) => {
      const insert_user_query:string =`INSERT INTO users (first_name, last_name, email, phone, user_pass) VALUES ('${first}', '${last}', '${email}','${phone}', '${pass}');`;
      try{
        const [results, fields] = await this.pool.query(insert_user_query);
        return results;
        }catch (error){
          console.log("db driver error", error);
        }

    }
    
    find_user_test = async(email:string) =>{
      const find_user_query = `SELECT user_pass, first_name from users WHERE email ='${email}';`;
      try{
        const [results, fields] = await this.pool.query(find_user_query);
        return results;
        }catch (error){
          console.log("db driver error", error);
        }
    }
    
    get_all_items = async () => {
      const get_items_query = "SELECT * from items;"
      try{
      const [results, fields] = await this.pool.query( get_items_query);
      return results;
      }catch (error){
        console.log("db driver error", error);
      }
    }
    
    add_new_order = async(email:string,order_date:string,order_status:string,order_total:number,items:unknown[]) =>{
      const add_order_query:string = `INSERT INTO orders (email, order_date, order_status, order_total) 
      VALUES ('${email}', '${order_date}', '${order_status}','${order_total}');`;
      let order_items = items as Order[]

      try{
      const [results, fields] = await this.pool.query(add_order_query);
      //return results;
      let header = results as mysql.ResultSetHeader;
      let order_id = header.insertId;
      console.log('db drvier2 order id is', order_id);
      order_items.forEach(async (item) => {
        try{
          let order_item_query= `INSERT INTO order_items (order_id, item_id, quantity) 
          VALUES ('${order_id}', '${item.item_id}', '${item.quantity}');`;
          const[results, fields] = await this.pool.query(order_item_query);
          console.log('inserted item in order_items');

        }catch(error){
          console.log('error inserting order items', error);
        }
      });

      }catch (error){
        console.log("db driver add new order error", error);
      }
    };

    get_user_orders = async (email:string, order_id?:number|undefined) => {
      //console.log('db driver order_id  is', order_id, 'type is',typeof order_id);
      let get_order_query:string;
      let all_order_items:mysql.RowDataPacket[]=[];
      let user_orders:mysql.RowDataPacket[]=[];
      if(order_id){
        get_order_query = `SELECT * from orders WHERE email ='${email}' AND order_id = '${order_id}';`;

      }else {
        get_order_query = `SELECT * from orders WHERE email ='${email}';`;
      }
      //console.log('db driver order query is', get_order_query);
      try{
        const[results, fields] = await this.pool.query(get_order_query);
        let user_orders = results as mysql.RowDataPacket;
        for ( let i = 0; i < user_orders.length; i++){
          let get_order_items =  `SELECT * from order_items WHERE order_id ='${user_orders[i].order_id}';`;
          
          try{
            const[order_items, fields] = await this.pool.query(get_order_items);
            //console.log('db_driver order items:', order_items);
            all_order_items.push(order_items as mysql.RowDataPacket);
            //console.log('dbdriver all order items array', all_order_items);

          }
          catch(error){
            console.log('error getting order items', error);
          }

        }
        //get item names
        for (let x = 0; x < all_order_items.length; x++){
          //console.log('db driver get names loop item is', all_order_items[x]);
          for(let y=0; y < all_order_items[x].length; y++){
            let get_item_names =`SELECT item_name, price from items WHERE item_id ='${all_order_items[x][y].item_id}';`;
            try {
              const[item_name] = await this.pool.query(get_item_names);
              //console.log('item name query is', get_item_names);
              let retreived_name = item_name as mysql.RowDataPacket
              //console.log('db driver retreived item name',retreived_name[0]['item_name'] )
              //console.log('db driver retreived item price',retreived_name[0]['price'] )
              all_order_items[x][y].item_name = retreived_name[0]['item_name'];
              all_order_items[x][y].price = retreived_name[0]['price'];

            }
            catch(error){
              console.log('error getting item names', error);
            }
          }      
        }
        //console.log('dbdriver all order items array', all_order_items);
        return [user_orders, all_order_items];
      }
      catch(error){
        console.log('error retreiving orders', error);
      }
    }
}