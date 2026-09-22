import {cloudEnabled,getClient,employee,enterPreview,signOut} from './store.js?v=7';
const form=document.querySelector('#login-form'),message=document.querySelector('#auth-message');
const staff=new URLSearchParams(location.search).get('role')==='employee';
let mode='login',recovery=false;
function say(text,error=false){message.textContent=text;message.classList.toggle('error',error);}
function labels(){
  document.querySelector('#auth-title').textContent=mode==='signup'?'CREATE ACCOUNT.':staff?'TEAM SIGN IN.':'WELCOME BACK.';
  document.querySelector('#auth-submit').textContent=mode==='signup'?'Create account':'Sign in';
  document.querySelector('#auth-switch').textContent=mode==='signup'?'Already have an account? Sign in':'New here? Create an account';
  document.querySelector('#auth-password').autocomplete=mode==='signup'?'new-password':'current-password';
  document.querySelector('#auth-switch').hidden=staff;
}
labels();
document.querySelector('#auth-switch').addEventListener('click',()=>{mode=mode==='login'?'signup':'login';labels();say('');});
document.querySelector('#show-password').addEventListener('click',e=>{const p=document.querySelector('#auth-password');p.type=p.type==='password'?'text':'password';e.currentTarget.textContent=p.type==='password'?'Show':'Hide';e.currentTarget.setAttribute('aria-pressed',String(p.type==='text'));});
document.querySelector('#open-preview').addEventListener('click',()=>{enterPreview();location.href='admin.html';});
async function account(client){
  const {data:{user}}=await client.auth.getUser();if(!user||recovery)return;
  form.hidden=true;document.querySelector('#auth-extras').hidden=true;document.querySelector('#account-panel').hidden=false;
  document.querySelector('#account-email').textContent=user.email;
  const role=await employee();document.querySelector('#account-admin').hidden=!role;
  document.querySelector('#account-role').textContent=role?'Employee access enabled.':'Customer account. Employee access is assigned by the store owner.';
  if(staff&&role&&!recovery)location.replace('admin.html');
}
if(!cloudEnabled){
  document.querySelector('#connection-info').hidden=false;
  form.querySelectorAll('input,button').forEach(e=>e.disabled=true);
  document.querySelector('#auth-extras').hidden=true;
}else{
  document.querySelector('#preview-login').hidden=true;
  try{
    const client=await getClient();
    client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovery=true;document.querySelector('#password-recovery').hidden=false;form.hidden=true;document.querySelector('#account-panel').hidden=true;document.querySelector('#auth-extras').hidden=true;}});
    await account(client);
  }catch{say('Sign-in could not load. Please try again.',true);}
}
form.addEventListener('submit',async e=>{
  e.preventDefault();const submit=document.querySelector('#auth-submit');submit.disabled=true;say('Connecting…');
  try{
    const client=await getClient();if(!client)throw new Error('Account sign-in is awaiting the shared store connection.');
    const email=document.querySelector('#auth-email').value.trim(),password=document.querySelector('#auth-password').value;
    if(mode==='signup'){
      const {error}=await client.auth.signUp({email,password,options:{emailRedirectTo:new URL('login.html',location.href).href}});
      if(error)throw error;say('Check your email to confirm your account, then sign in.');form.reset();mode='login';labels();
    }else{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;form.reset();say('Signed in.');await account(client);}
  }catch(error){say(error.message||'Unable to sign in.',true);}finally{submit.disabled=false;}
});
document.querySelector('#forgot-password').addEventListener('click',async()=>{
  const email=document.querySelector('#auth-email');if(!email.reportValidity())return;
  try{const client=await getClient();const {error}=await client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:new URL('login.html',location.href).href});if(error)throw error;say('If an account exists, password reset instructions will arrive by email.');}catch(error){say(error.message,true);}
});
document.querySelector('#password-recovery').addEventListener('submit',async e=>{
  e.preventDefault();try{const client=await getClient();const {error}=await client.auth.updateUser({password:document.querySelector('#new-password').value});if(error)throw error;await signOut();location.replace('login.html');}catch(error){say(error.message,true);}
});
document.querySelector('#account-signout').addEventListener('click',async()=>{try{await signOut();location.reload();}catch(error){say(error.message,true);}});
