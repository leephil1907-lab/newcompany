import postgres from "postgres";
import bcrypt from "bcryptjs";
const {DATABASE_URL,ADMIN_EMAIL,ADMIN_PASSWORD,ADMIN_NAME="AgroBridge Administrator"}=process.env;
if(!DATABASE_URL||!ADMIN_EMAIL||!ADMIN_PASSWORD){console.error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD before running this command.");process.exit(1);}
if(ADMIN_PASSWORD.length<14){console.error("ADMIN_PASSWORD must be at least 14 characters.");process.exit(1);}
const sql=postgres(DATABASE_URL,{max:1,prepare:false});
try{
 const hash=await bcrypt.hash(ADMIN_PASSWORD,12);
 const rows=await sql`INSERT INTO users(name,email,password_hash,role) VALUES(${ADMIN_NAME},${ADMIN_EMAIL.toLowerCase()},${hash},'admin') ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,role='admin',updated_at=NOW() RETURNING id,email,role`;
 console.log("Administrator account configured:",rows[0].email,"role:",rows[0].role);
}catch(error){console.error("Could not create administrator:",error instanceof Error?error.message:error);process.exitCode=1;}
finally{await sql.end();}
