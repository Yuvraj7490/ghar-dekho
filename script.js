const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES={'1 RK':'🛏️','1 BHK':'🏠','2 BHK':'🏡','PG / Shared':'👥','Hostel':'🏢'};
const GRAD=['#cfe8e5,#a9d3cf','#f6e3b4,#efd08a','#e5d7f0,#cdb5e3','#f9d5cc,#f1b3a4','#d4e6f7,#b0cdea'];
function seed(){return{users:[
 {id:1,role:'owner',name:'Ramesh Sharma',email:'owner@demo.com',pass:'1234',phone:'9876543210'},
 {id:2,role:'tenant',name:'Aman Verma',email:'tenant@demo.com',pass:'1234',phone:'9123456780'}],
 rooms:[
 {id:1,owner:1,type:'1 BHK',title:'Sunny 1BHK near metro',addr:'Sector 62, Noida',price:12000,status:'vacant',desc:'Furnished, balcony, 24x7 water.'},
 {id:2,owner:1,type:'PG / Shared',title:'Boys PG with meals',addr:'Kothrud, Pune',price:6500,status:'vacant',desc:'Wi-Fi, laundry, two meals included.'},
 {id:3,owner:1,type:'1 RK',title:'Compact studio for students',addr:'Civil Lines, Prayagraj',price:4500,status:'booked',desc:'5 min walk to university.'},
 {id:4,owner:1,type:'2 BHK',title:'Spacious 2BHK family flat',addr:'Vijay Nagar, Indore',price:15000,status:'vacant',desc:'Parking, lift, gated society.'}],
 enq:[],saved:{},n:10}}
let db;try{db=JSON.parse(localStorage.getItem('gd_db'))}catch(e){}
if(!db||!db.rooms)db=seed();
let me=null;try{me=db.users.find(u=>u.id==localStorage.getItem('gd_me'))||null}catch(e){}
let tab='browse',mode='login',uRole='tenant',f={q:'',type:'',max:'',st:''};
function save(){try{localStorage.setItem('gd_db',JSON.stringify(db))}catch(e){}}
function toast(m){const x=$('#err');if(x)x.textContent=m;const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}
const nid=()=>db.n++;
const uname=id=>(db.users.find(u=>u.id==id)||{}).name||'Unknown';
const rm=id=>db.rooms.find(r=>r.id==id);

function render(){
  $('#hr').innerHTML=me?`<span>${esc(me.name)} <span class="badge ${me.role=='owner'?'v':'b'}" style="background:var(--pri2);color:var(--pri)">${me.role}</span></span><button class="btn g s" onclick="logout()">Log out</button>`:'';
  const vals={};if(!me)document.querySelectorAll('#app input').forEach(i=>{if(i.id)vals[i.id]=i.value});
  $('#app').innerHTML=!me?authView():me.role=='tenant'?tenantView():ownerView();
  for(const k in vals){const el=document.getElementById(k);if(el)el.value=vals[k]}
}
/* ---------- AUTH ---------- */
function authView(){const reg=mode=='reg',own=uRole=='owner';
return`<div class="auth"><div class="hero"><h1>Room dhoondna ab aasaan.</h1><p>Tenants browse rooms and message owners. Owners list rooms and keep availability up to date.</p></div>
<div class="box"><div class="seg"><button class="${!reg?'on':''}" onclick="mode='login';render()">Log in</button><button class="${reg?'on':''}" onclick="mode='reg';render()">Create account</button></div>
${reg?`<h2 style="font-size:22px;margin:16px 0 2px">Create your account</h2><div class="mut">Choose how you will use Ghar Dekho</div>
<div class="roles"><button class="rc ${!own?'on':''}" onclick="uRole='tenant';render()"><b>🔎 Tenant</b><span>I am looking for a room</span></button><button class="rc ${own?'on':''}" onclick="uRole='owner';render()"><b>🏠 Owner</b><span>I want to list my rooms</span></button></div>
<label>Full name</label><input id="an" autocomplete="name"><label>Phone number</label><input id="ap" inputmode="tel" maxlength="10" placeholder="10-digit mobile number">`:''}
<label>Email</label><input id="ae" type="email" autocomplete="email">
${reg?`<label>${own?'City where your rooms are':'College or workplace (optional)'}</label><input id="ax">`:''}
<label>Password</label><input id="aw" type="password" ${reg?'placeholder="At least 4 characters"':''}>
${reg?`<label>Confirm password</label><input id="ac" type="password">`:''}
<button class="btn" style="width:100%;margin-top:16px" onclick="auth()">${reg?'Create '+uRole+' account':'Log in'}</button>
<div id="err" role="alert" style="color:var(--bad);font-size:14px;margin-top:10px;min-height:1px"></div>
<p class="mut" style="text-align:center;margin:10px 0 0">${reg?'Already have an account?':'New to Ghar Dekho?'} <a href="#" onclick="mode='${reg?'login':'reg'}';render();return false" style="color:var(--pri);font-weight:700">${reg?'Log in':'Create an account'}</a></p>
${reg?'':`<div class="demo">Quick demo login: <button class="btn g s" onclick="demo('owner@demo.com')">As owner</button> <button class="btn g s" onclick="demo('tenant@demo.com')">As tenant</button></div>`}</div></div>`}
function auth(){
  const e=$('#ae').value.trim().toLowerCase(),p=$('#aw').value.trim();
  if(!e||!p)return toast('Enter email and password');
  if(mode=='login'){
    const u=db.users.find(u=>u.email==e&&u.pass==p);
    if(!u)return toast('Email or password is incorrect');
    me=u;
  }else{
    const n=$('#an').value.trim(),ph=$('#ap').value.trim(),x=$('#ax').value.trim();
    if(!n)return toast('Enter your full name');
    if(!/^\d{10}$/.test(ph))return toast('Enter a 10-digit phone number');
    if(!/^\S+@\S+\.\S+$/.test(e))return toast('Enter a valid email');
    if(uRole=='owner'&&!x)return toast('Enter the city where your rooms are');
    if(p.length<4)return toast('Password needs at least 4 characters');
    if(p!==$('#ac').value.trim())return toast('Passwords do not match');
    if(db.users.some(u=>u.email==e))return toast('This email is already registered. Log in instead');
    me={id:nid(),role:uRole,name:n,email:e,pass:p,phone:ph,extra:x};db.users.push(me);save();
  }
  try{localStorage.setItem('gd_me',me.id)}catch(x){}
  tab=me.role=='tenant'?'browse':'rooms';f={q:'',type:'',max:'',st:''};render();toast('Welcome, '+me.name.split(' ')[0]);
}
function demo(em){mode='login';render();$('#ae').value=em;$('#aw').value='1234';auth()}
function logout(){me=null;try{localStorage.removeItem('gd_me')}catch(e){}render()}
const tabs=(arr)=>`<div class="tabs"><div class="seg">${arr.map(([k,l])=>`<button class="${tab==k?'on':''}" onclick="tab='${k}';render()">${l}</button>`).join('')}</div></div>`;

/* ---------- TENANT ---------- */
function card(r,own){
  const g=GRAD[Object.keys(TYPES).indexOf(r.type)%5],sv=(db.saved[me.id]||[]).includes(r.id);
  return`<div class="room"><div class="pic" style="background:linear-gradient(135deg,${g});color:#1d2433"><span class="badge ${r.status=='vacant'?'v':'b'}">${r.status=='vacant'?'Vacant':'Booked'}</span><span>${TYPES[r.type]}</span></div>
  <div class="rb"><div style="display:flex;justify-content:space-between;align-items:start;gap:8px"><h3 style="font-size:18px">${esc(r.title)}</h3>${own?'':`<button class="heart" aria-label="Save room" onclick="heart(${r.id})">${sv?'❤️':'🤍'}</button>`}</div>
  <div class="mut">${esc(r.type)} · 📍 ${esc(r.addr)}</div><div class="price">₹${(+r.price).toLocaleString('en-IN')} <small>/ month</small></div>
  <div class="mut">${esc(r.desc||'')}</div>
  <div class="row">${own?`<button class="btn s ${r.status=='vacant'?'r':''}" onclick="toggle(${r.id})">${r.status=='vacant'?'Mark booked':'Mark vacant'}</button><button class="btn g s" onclick="del(${r.id})">Delete</button>`
  :`<button class="btn s" onclick="enqModal(${r.id})" ${r.status=='booked'?'disabled style="opacity:.5"':''}>Send enquiry</button><button class="btn g s" onclick="contact(${r.id})">Contact owner</button>`}</div></div></div>`}
function heart(id){const a=db.saved[me.id]=db.saved[me.id]||[];const i=a.indexOf(id);i<0?a.push(id):a.splice(i,1);save();render()}
function dlg(h){const o=$('#md');if(o)o.remove();const d=document.createElement('div');d.className='modal';d.id='md';d.innerHTML='<div class="box">'+h+'</div>';document.body.appendChild(d)}
function contact(id){const r=rm(id),o=db.users.find(u=>u.id==r.owner);if(!o)return toast('Owner details not found');
dlg(`<h3>${esc(o.name)}</h3><p class="mut">Owner of ${esc(r.title)}</p><p>📞 <a href="tel:${esc(o.phone)}" style="color:var(--pri);font-weight:700">${esc(o.phone)}</a></p><p>✉️ ${esc(o.email)}</p>${o.extra?`<p>📍 ${esc(o.extra)}</p>`:''}<div class="row"><button class="btn" onclick="enqModal(${id})">Send enquiry</button><button class="btn g" onclick="$('#md').remove()">Close</button></div>`)}
function tenantView(){
  let body='';
  if(tab=='browse'){
    const L=db.rooms.filter(r=>(!f.q||(r.title+r.addr).toLowerCase().includes(f.q.toLowerCase()))&&(!f.type||r.type==f.type)&&(!f.max||r.price<=+f.max)&&(!f.st||r.status==f.st));
    body=`<div class="filters"><input placeholder="Search city or area" value="${esc(f.q)}" oninput="f.q=this.value;keep(this)">
    <select onchange="f.type=this.value;render()"><option value="">All types</option>${Object.keys(TYPES).map(t=>`<option ${f.type==t?'selected':''}>${t}</option>`).join('')}</select>
    <input type="number" placeholder="Max price ₹" value="${f.max}" oninput="f.max=this.value;keep(this)">
    <select onchange="f.st=this.value;render()"><option value="">Any status</option><option value="vacant" ${f.st=='vacant'?'selected':''}>Vacant</option><option value="booked" ${f.st=='booked'?'selected':''}>Booked</option></select></div>
    <div class="grid" id="list">${L.map(r=>card(r,false)).join('')||'<div class="empty">No rooms match. Try a higher price or clear filters.</div>'}</div>`;
  }else if(tab=='saved'){
    const L=db.rooms.filter(r=>(db.saved[me.id]||[]).includes(r.id));
    body=`<div class="grid">${L.map(r=>card(r,false)).join('')||'<div class="empty">Tap the heart on a room to save it here.</div>'}</div>`;
  }else{
    const L=db.enq.filter(e=>e.tenant==me.id).reverse();
    body=L.map(e=>`<div class="enq"><b>${esc((rm(e.room)||{title:'Removed room'}).title)}</b><div class="mut">To ${esc(uname(e.owner))} · ${e.date}</div><p>${esc(e.msg)}</p>${e.reply?`<div class="reply"><b>Owner replied:</b> ${esc(e.reply)}</div>`:'<div class="mut">Waiting for reply</div>'}</div>`).join('')||'<div class="empty">You haven’t sent any enquiries yet. Open a vacant room and tap Send enquiry.</div>';
  }
  return tabs([['browse','Browse rooms'],['saved','Saved'],['enq','My enquiries']])+body}
function keep(el){const p=el.selectionStart,id=el.placeholder;render();const n=[...document.querySelectorAll('input')].find(i=>i.placeholder==id);if(n){n.focus();try{n.setSelectionRange(p,p)}catch(e){}}}
function enqModal(id){const q=$('#md');if(q)q.remove();const d=document.createElement('div');d.className='modal';d.id='md';
  d.innerHTML=`<div class="box"><h3>Enquire about ${esc(rm(id).title)}</h3><label>Your message</label><textarea id="em" rows="4">Hi, is this room still available? When can I visit?</textarea><div class="row"><button class="btn" onclick="sendEnq(${id})">Send enquiry</button><button class="btn g" onclick="$('#md').remove()">Cancel</button></div></div>`;document.body.appendChild(d)}
function sendEnq(id){const m=$('#em').value.trim();if(!m)return toast('Write a message first');
  db.enq.push({id:nid(),room:id,tenant:me.id,owner:rm(id).owner,msg:m,date:new Date().toLocaleDateString('en-IN'),reply:''});save();$('#md').remove();toast('Enquiry sent');render()}

/* ---------- OWNER ---------- */
function ownerView(){
  const mine=db.rooms.filter(r=>r.owner==me.id),E=db.enq.filter(e=>e.owner==me.id).reverse();
  const stats=`<div class="stats"><div class="stat"><b>${mine.length}</b><span>Rooms listed</span></div><div class="stat"><b>${mine.filter(r=>r.status=='vacant').length}</b><span>Vacant</span></div><div class="stat"><b>${E.filter(e=>!e.reply).length}</b><span>Unanswered</span></div></div>`;
  let body='';
  if(tab=='rooms')body=stats+`<div class="grid">${mine.map(r=>card(r,true)).join('')||'<div class="empty">No rooms yet. Use Add room to list your first one.</div>'}</div>`;
  else if(tab=='add')body=`<div class="box"><h2 style="font-size:24px">Add a room</h2><div class="form">
    <div><label>Title</label><input id="rt" placeholder="e.g. Sunny 1BHK near metro"></div>
    <div><label>Room type</label><select id="ry">${Object.keys(TYPES).map(t=>`<option>${t}</option>`).join('')}</select></div>
    <div class="w"><label>Address</label><input id="ra" placeholder="Area, city"></div>
    <div><label>Rent per month (₹)</label><input id="rp" type="number"></div>
    <div><label>Status</label><select id="rs"><option value="vacant">Vacant</option><option value="booked">Booked</option></select></div>
    <div class="w"><label>Details</label><textarea id="rd" rows="3" placeholder="Furnishing, facilities, rules"></textarea></div></div>
    <button class="btn" style="margin-top:16px" onclick="addRoom()">Add room</button></div>`;
  else body=E.map(e=>`<div class="enq"><b>${esc((rm(e.room)||{title:'Removed room'}).title)}</b><div class="mut">From ${esc(uname(e.tenant))} · ${e.date} · 📞 ${esc((db.users.find(u=>u.id==e.tenant)||{}).phone||'')}${(db.users.find(u=>u.id==e.tenant)||{}).extra?' · '+esc((db.users.find(u=>u.id==e.tenant)||{}).extra):''}</div><p>${esc(e.msg)}</p>
    ${e.reply?`<div class="reply"><b>Your reply:</b> ${esc(e.reply)}</div>`:`<input id="rp${e.id}" placeholder="Type a reply"><button class="btn s" style="margin-top:8px" onclick="reply(${e.id})">Send reply</button>`}</div>`).join('')||'<div class="empty">No enquiries yet. They appear here when tenants message you.</div>';
  return tabs([['rooms','My rooms'],['add','Add room'],['inq',`Enquiries (${E.length})`]])+body}
function addRoom(){const g=i=>$('#'+i).value.trim();
  if(!g('rt')||!g('ra')||!(+g('rp')>0))return toast('Fill title, address and a valid rent');
  db.rooms.unshift({id:nid(),owner:me.id,type:g('ry'),title:g('rt'),addr:g('ra'),price:+g('rp'),status:g('rs'),desc:g('rd')});save();tab='rooms';render();toast('Room added')}
function toggle(id){const r=rm(id);r.status=r.status=='vacant'?'booked':'vacant';save();render();toast('Marked '+r.status)}
function del(id){dlg(`<h3>Delete this room?</h3><p class="mut">${esc(rm(id).title)} will be removed for tenants too.</p><div class="row"><button class="btn r" onclick="delOk(${id})">Delete room</button><button class="btn g" onclick="$('#md').remove()">Cancel</button></div>`)}
function delOk(id){db.rooms=db.rooms.filter(r=>r.id!=id);save();$('#md').remove();render();toast('Room deleted')}
function reply(id){const v=$('#rp'+id).value.trim();if(!v)return toast('Type a reply first');db.enq.find(e=>e.id==id).reply=v;save();render();toast('Reply sent')}
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&!me&&$('#aw'))auth()});
render();