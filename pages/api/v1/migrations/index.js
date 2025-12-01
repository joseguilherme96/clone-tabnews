import migrationRunner from "node-pg-migrate"
import {join} from "node:path"
import database from "infra/database"

export default async function migrations(request, response){

  const allowedMethods = ["GET","POST"]

  if(!allowedMethods.includes(request.method)){
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`
    })
  }

  let dbClient;

  try{

    dbClient =  await database.getNewClient();

    const defaultMigrationOptions = {
    "dbClient": dbClient,
    "dir":join("infra","migrations"),
    "direction":"up",
    "verbose": true,
    "migrationsTable":"pgmigrations"
    
    }

    if(request.method == "GET"){

      const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      "dryRun": true,
      })

      await dbClient.end()

      response.status(200).json(migratedMigrations)

    }

    if(request.method == "POST"){

      const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      "dryRun": false,
      })

      console.log(migratedMigrations)

      if(migratedMigrations.length > 0){

        return response.status(201).json(migratedMigrations);

      }

      return response.status(200).json(migratedMigrations)

    }

  }catch(error){

    console.error(error);
    throw error;

  }finally{

    await dbClient.end();

  }

  
}