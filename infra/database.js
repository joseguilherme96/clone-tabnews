import { Client } from "pg"
import { Pool } from "pg";

async function query(queryObject){

  const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: 5432,
      user: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD
    });

  await client.connect();

  try{
    const result = await client.query(queryObject);
    return result;
  }catch(e){
    console.log(e)
  }finally{
    await client.end();
  }
  
}


export default {
  query:query
}