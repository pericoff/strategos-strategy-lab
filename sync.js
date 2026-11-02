/* Sincronización Supabase: no se usan claves privadas en el navegador. */
const CBCSync = (() => {
 const base=''; // Supabase NUEVO de STRATEGY LAB, nunca el de STRATEGOS IA. // URL del NUEVO proyecto Supabase de STRATEGOS IA.
 const key=''; // Clave pública del proyecto independiente.
 const store='strategy_lab_teacher_session_v1';
 let session=null;
 try { session=JSON.parse(sessionStorage.getItem(store)||'null'); } catch {}
 function checkSetup(){if(!base||!key)throw Error('STRATEGY LAB: configura un proyecto Supabase independiente en sync.js.');}
 function currentToken(){return session?.access_token||null}
 async function refreshAuth(){
   checkSetup();
   if(!session?.refresh_token)throw Error('Inicia sesión como profesor.');
   const response=await fetch(base+'/auth/v1/token?grant_type=refresh_token',{
     method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},
     body:JSON.stringify({refresh_token:session.refresh_token})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.msg||data.error_description||'Sesión caducada');
   session=data;sessionStorage.setItem(store,JSON.stringify(session));return session;
 }
 async function rpc(name, params={}, retried=false){
   checkSetup();
   const headers={'apikey':key,'Content-Type':'application/json'};
   if(currentToken())headers.Authorization='Bearer '+currentToken();
   // Sin sesión, Supabase resuelve el rol anon mediante la cabecera apikey.
   let response;
   try{response=await fetch(base+'/rest/v1/rpc/'+name,{
      method:'POST',headers,body:JSON.stringify(params),cache:'no-store'
   });}catch{throw Error('Sin conexión a Supabase. Comprueba Internet.');}
   const data=await response.json().catch(()=>({}));
   if(response.status===401&&currentToken()&&!retried){
      await refreshAuth();return rpc(name,params,true);
   }
   if(!response.ok)throw Error(data.message||data.error_description||('Error Supabase '+response.status));
   return data;
 }
 async function login(email,password){
   checkSetup();
   const response=await fetch(base+'/auth/v1/token?grant_type=password',{
     method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},
     body:JSON.stringify({email,password})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.msg||data.error_description||data.error||'Usuario o contraseña incorrectos');
   session=data;sessionStorage.setItem(store,JSON.stringify(session));
   return rpc('cbc_teacher_state');
 }
 async function advisor(code,question){
   checkSetup();
   const response=await fetch(base+'/functions/v1/strategos-advisor',{
     method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},
     body:JSON.stringify({code,question})
   }).catch(()=>{throw Error('No se pudo contactar con el asesor.');});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.error||'Función IA no desplegada ('+response.status+').');
   return data;
 }
 function logout(){session=null;sessionStorage.removeItem(store)}
 return {rpc,login,logout,currentToken,advisor};
})();
