import * as dotenv from 'dotenv'
dotenv.config()
import express, {Request, Response} from 'express';
import cors from "cors";
import {db_driver} from "./db_driver"
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import path from 'path';

const app = express();
const port = process.env.PORT || 9000;
const DB = new db_driver();
const salt_rounds = 10;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.use('/images', express.static(__dirname + '/images'));

function mysqlerrorHandler (err:mysql.QueryError, req:Request, res:Response, next:express.NextFunction){
    const errStatus = err.name || 500;
    const errMsg = err.message || 'Something went wrong';
    console.log(err.code);
    if(err.errno=== 1062){
      console.log("Duplicate entry");
      res.status(500).json({error: "email or phone number already in use", status: 500})

      return;
    }

    if(err.code==='ECONNREFUSED'){
      console.log("Database refused connection")
      res.status(500).json({error: "Database Error", status: 500})
      return;
    }
    
    res.sendStatus(500);
}

function verifyToken(token:string): string|jwt.JwtPayload|Boolean{
  let private_key:jwt.Secret = <jwt.Secret>process.env.TOKEN_SECRET
  try {
    let decoded = jwt.verify(token,private_key );
    //console.log("from verifyToken function",decoded); 
    return decoded;
  } catch(err) {
    console.log("invalid token")
    console.log(err);
    return false
  }

}

function generateAccessToken(user_email:string, user_name:string):string {
  let private_key:jwt.Secret = <jwt.Secret>process.env.TOKEN_SECRET;
  //return jwt.sign({user_info}, private_key, { expiresIn: '2 days' });
  return jwt.sign({user_email, user_name, expiresIn: '2 days'}, private_key);

};

async function user_lookup(email: string, password: string){

    //find user in db
    let user_result = await DB.Find_user(email) as mysql.RowDataPacket;
    console.log("express user lookup function", user_result.length);
    //if user exists compare hashed pass with user provided pass
    let new_jwt:string = "";
    let user_name:string="";
   
    if (user_result.length > 0 ){
        console.log("express user lookup user result valid");
        user_name =  user_result[0].first_name;
        const match = await bcrypt.compare(password, user_result[0].user_pass);

        if(match) {
            //login
            
            new_jwt = generateAccessToken(email, user_name);
        }
      
    }
      //console.log("jwt", new_jwt);
      return [new_jwt, user_name];
  };

app.get('/', async (req: Request, res: Response, next) => {
  try {
    const query_result = await DB.Select_DB();

    res.send(query_result);

  } catch (error) {
    next(error); // Pass the error to express error handler
  }
});



app.post('/register_user', async (req: Request, res: Response, next) => {
       let first_name:string = req.body.first_name;
       let last_name:string = req.body.last_name;
       let email:string = req.body.email;
       let phone:string = req.body.phone;
       let plaintext_pass:string = req.body.user_pass;
       let hashed_pass:string = await(bcrypt.hash(plaintext_pass,salt_rounds));
       
  try {
                const query_result = await DB.Insert_user_DB(
                  first_name, 
                  last_name, 
                  email,
                  phone,
                  hashed_pass);
            
        res.status(201).json({message: "Successfully Registered", status: 201})

      } catch (error: unknown) {
        /*
        code: 'ER_DUP_ENTRY',
        errno: 1062,

        */
      
        next(error); // Pass the error to express error handler
        }

});

/*Log in endpoint requires user email and password encoded as json string
in request body. Format must be {email:"user_email", password:"userpass"}
if successful API returns a signed jason web token */

app.post('/login', async (req:Request, res:Response, next) =>{
  let user_email:string = req.body.email;
  let password:string = req.body.password;
  console.log('express login function', user_email, password);
  try {
     let new_token:string[] = await user_lookup(user_email, password)
    if (new_token[0].length > 0){
      res.status(200).json({token:new_token[0], user_name:new_token[1], status:200});
    }else{
      res.status(500).json({error:"Invalid Login", status:500});

    };


} catch (error) {
next(error); // Pass the error to express error handler
  }
});

app.get('/verify',  (req:Request, res:Response, next) =>{
  //console.log(req.headers);
  if (!req.headers.authorization){
    res.sendStatus(401);
  }
  else{
    let token = req.headers.authorization;
    let decodedToken = verifyToken(token);
    if(!decodedToken){
      res.status(400).json({error:"Invalid token", status:400});
    }else{
      res.send(decodedToken);
    }
  
  }
  });

/* */
app.get('/user',  (req:Request, res:Response, next) =>{
  if (!req.headers.authorization){
      res.sendStatus(401);
  }
  else{
      let token = req.headers.authorization;
      let decodedToken = verifyToken(token);
          if(!decodedToken){
              res.status(400).json({error:"Invalid token", status:400});
          }else{
              res.send(decodedToken);
  }
  
  }
});

app.get('/items', async (req: Request, res: Response, next) => {
  try {
    const query_result = await DB.Get_items();
    
    res.send(JSON.stringify(query_result));

  } catch (error) {
    //console.log(error);
    next(error); // Pass the error to express error handler
  }
});


//access request params test
app.get('/:id', function (req, res) {
    console.log(req.params['id']);
    res.send();
});

app.post('/order', async (req: Request, res: Response, next) => {
  console.log('express get order function');
  if (!req.headers.authorization){
    res.sendStatus(401);
    }else
      {
      //let token:string = req.body.token;
      let token:string|undefined = req.headers.authorization as string;
      //console.log("express order function token is:", token);
      let decodedToken = verifyToken(token as string) as jwt.JwtPayload;
      let items:string[] = JSON.parse(req.body.items);
      let order_total:number = req.body.order_total as number;
      let email:string = decodedToken.user_email;
      let order_status:string = req.body.order_status;
      let order_date:string = req.body.order_date;
      if(!decodedToken){
        res.status(400).json({error:"Invalid token", status:400});
      }else
        {
        //console.log(decodedToken.user_email) ;
        console.log(items);
        try {
            DB.Add_order(
            email, 
            order_date, 
            order_status,
            order_total,
            items);
      
        res.status(201).json({message: "Order Placed", status: 201})

        } catch (error: unknown) {

          next(error); // Pass the error to express error handler
        }
        }
    }
    
});

app.get('/get_order', async(req: Request, res:Response, next) => {
  console.log('express get_order');
  if (!req.headers.authorization){
    res.sendStatus(401);
    }
  else{
      let token:string|undefined = req.headers.authorization as string;
      //console.log("express order function token is:", token);
      let decodedToken = verifyToken(token as string) as jwt.JwtPayload;
      if(!decodedToken){
        res.status(400).json({error:"Invalid token", status:400});
      }else{
        let email:string = decodedToken.user_email;
        try {
          const get_all_orders = await DB.Get_orders(email);
          res.send(JSON.stringify(get_all_orders));
      
        } catch (error) {
          //console.log(error);
          next(error); // Pass the error to express error handler
        }
      }
    }
});


app.listen(port, () => {
  console.log('Server running at http://localhost:', port);
});

app.use(mysqlerrorHandler);
