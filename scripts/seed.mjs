import { readFile } from "node:fs/promises";
import postgres from "postgres";
const url=process.env.DATABASE_URL;
if(!url){console.error("DATABASE_URL is required.");process.exit(1);}
const sql=postgres(url,{max:1,prepare:false});
try{await sql.unsafe(await readFile(new URL("../db/seed.sql",import.meta.url),"utf8"));console.log("Starter Academy courses and lessons seeded.");}
catch(error){console.error("Seed failed:",error instanceof Error?error.message:error);process.exitCode=1;}
finally{await sql.end();}
