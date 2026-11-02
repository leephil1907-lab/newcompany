import { SignJWT,jwtVerify } from "jose";
const secret=()=>{const value=process.env.SESSION_SECRET;if(!value||value.length<32)throw new Error("SESSION_SECRET is required.");return new TextEncoder().encode(value);};
export async function createNewsletterToken(email:string,purpose:"confirm"|"unsubscribe"){return new SignJWT({email,purpose}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(secret());}
export async function verifyNewsletterToken(token:string,purpose:"confirm"|"unsubscribe"){const {payload}=await jwtVerify(token,secret());if(typeof payload.email!=="string"||payload.purpose!==purpose)throw new Error("Invalid newsletter token.");return payload.email;}
