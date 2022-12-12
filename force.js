/**
 * force.js 
 * ~ the 6th generation -- project F (foxtrot)
 * authored by 9r3i
 * https://github.com/9r3i
 * started at november 12th 2022
 * continued at december 1st 2022 - v1.2.0 - cache control
 */
;const Force=function(){
this.version='1.2.6'; /* release version */
this.host=null; /* force stream host */
this.pkey=null; /* force privilege key */
this.loadedApp=null; /* current loaded app */
const _Force=this; /* constant to this object */
/* ============ apps requires @get, 2 others ============ */
/**
 * app -- return object
 * @parameters
 *   ns     = string of app namespace (required)
 *   root   = string of app root; default: apps (local)
 *   config = mixed of config for inner app (optional)
 * @requires
 *   this.get
 *   this.alert
 *   this.loadScript
 * @methods
 *   init = async function
 */
this.app=function(ns,root,config){
  config=typeof config==='object'&&config!==null?config:{};
  this.loaderCSS();
  this.dialogCSS();
  return {
    root:typeof root==='string'?root:'apps',
    namespace:ns,
    config:config,
    Force:this,
    init:async function(){
      var ns=this.namespace,
      root=this.root,
      path=`${root}/${ns}/${ns}.js`,
      vpath=`apps/${ns}/${ns}.js`,
      script=this.Force.virtualFile(vpath);
      if(!script){
        script=await this.Force.get(path);
        if(typeof script!=='string'
          ||/^error/i.test(script)){
          await this.Force.alert('Error: Failed to load "'
            +ns+'" app file.');
          return false;
        }
        this.Force.virtualFile(vpath,script);
      }else{
        var _app=this;
        this.Force.get(path).then(r=>{
          _app.Force.virtualFile(vpath,r);
        });
      }
      this.Force.virtualFileClearance();
      this.Force.loadScript(script,'force-app-'+ns);
      if(!window.hasOwnProperty(ns)
        ||typeof window[ns]!=='function'){
        await this.Force.alert('Error: Invalid app "'
          +ns+'" script.');
        return false;
      }
      const napp=new window[ns](this);
      if(napp.hasOwnProperty('init')
        &&typeof napp.init==='function'){
        this.Force.loadedApp=napp;
        return napp.init();
      }return napp;
    },
  };
};
/* ============ plugin requires @get, 3 others ============ */
/**
 * plugin object
 * @requires
 *   this.get
 *   this.alert
 *   this.loadScript
 *   this.loadStyleFile
 * @methods
 *   init       = function
 *   prepare    = async function
 *   register   = function
 *   loadScript = function
 */
this.plugin={
  root:'plugins',
  plug:[],
  param:{},
  hosts:{},
  Force:this,
  /* initialize all plugins */
  init:function(){
    for(var ns of this.plug){
      var plug=new window[ns](this.param[ns]);
      if(plug.hasOwnProperty('init')
        &&typeof plug.init==='function'){
        plug.init(this);
      }
    }return this;
  },
  /* prepare all plugins -- root path -- async */
  prepare:async function(root,cb){
    cb=typeof cb==='function'?cb:function(){};
    root=typeof root==='string'?root:this.root;
    this.root=root;
    var loaded=0;
    cb({loaded:loaded,total:this.plug.length});
    for(var ns of this.plug){
      loaded++;
      var _plug=this,
      host=this.hosts.hasOwnProperty(ns)?this.hosts[ns]:root;
      path=`${host}/${ns}/${ns}.js`,
      vpath=`plugins/${ns}/${ns}.js`,
      pathCSS=`${host}/${ns}/${ns}.css`,
      script=this.Force.virtualFile(vpath);
      this.Force.loadStyleFile(pathCSS);
      if(!script){
        script=await this.Force.get(path);
        if(typeof script!=='string'
          ||/^error/i.test(script)){
          await this.Force.alert('Error: Invalid plugin "'+ns+'".');
          continue;
        }
        this.Force.virtualFile(vpath,script);
      }else{
        this.loadScript(path,vpath,ns);
      }
      this.Force.loadScript(script,'force-plugin-'+ns);
      if(!window.hasOwnProperty(ns)
        ||typeof window[ns]!=='function'){
        await this.Force.alert('Error: Invalid plugin "'+ns+'".');
        continue;
      }
      /* progress callback */
      cb({loaded:loaded,total:this.plug.length});
    }return this;
  },
  /* load script at background */
  loadScript:function(path,vpath,ns){
    var _plug=this;
    this.Force.get(path).then(r=>{
      _plug.Force.virtualFile(vpath,r);
      _plug.Force.loadScript(r,'force-plugin-'+ns);
    });
  },
  /* plugin register -- namespace, parameter and host */
  register:function(ns,pr,host){
    if(typeof ns==='string'
      &&/^[a-zA-Z][a-zA-Z0-9_]+$/.test(ns)
      &&this.plug.indexOf(ns)<0){
      this.plug.push(ns);
      this.param[ns]=typeof pr==='undefined'?null:pr;
      if(typeof host==='string'){
        this.hosts[ns]=host;
      }
    }else if(Array.isArray(ns)){
      for(var nx of ns){
        if(Array.isArray(nx)&&nx.length>0){
          this.plug.push(nx[0]);
          this.param[nx[0]]=nx.length>1?nx[1]:null;
          if(nx.length>2&&typeof nx[2]==='string'){
            this.hosts[nx[0]]=nx[2];
          }
        }else if(typeof nx==='string'){
          this.plug.push(nx);
          this.param[nx]=null;
        }
      }
    }return this;
  },
};
/* ============ get/fetch/post requires @stream ============ */
/**
 * get -- post using promise
 * @requires:
 *   this.post
 * @parameters:
 *   url = string of url
 *   upl = function of upload callback
 *   dnl = function of download callback
 *   dta = object of data to be queried in url
 * 
 * @usage:
 * async function(){
 *   var data=await _Force.get(url,upload,download);
 *   return data;
 * }
 */
this.get=function(url,upl,dnl,dta){
  return new Promise(resolve=>{
    _Force.post('_Force.get',r=>{
      resolve(r);
    },dta,{
      method:'GET',
      upload:upl,
      download:dnl,
      host:url,
    });
  });
};
/**
 * fetch -- post using promise
 * @requires:
 *   this.post
 * @parameters:
 *   mt = string of method of object class; *required
 *   dt = object of data request
 *   cf = object of other configs
 *        method    = string of request method; default: POST
 *        host      = string of host (overwrite this.host)
 *        headers   = object of headers
 *        upload    = function of upload callback
 *        download  = function of download callback
 *        underfour = function of underfour callback
 * 
 * @usage:
 * async function(){
 *   var data=await _Force.fetch(method,data,config);
 *   return data;
 * }
 */
this.fetch=function(mt,dt,cf){
  return new Promise(resolve=>{
    _Force.post(mt,r=>{
      resolve(r);
    },dt,cf);
  });
};
/**
 * post -- using stream
 * @requires:
 *   this.stream
 *   this.buildQuery
 *   this.temp
 *   this.host (variable/required); overwritten by cf.host
 *   this.pkey (variable/optional)
 * @parameters:
 *   mt = string of method of object class; *required
 *   cb = function of callback
 *   dt = object of data request
 *   cf = object of other configs
 *        method    = string of request method; default: POST
 *        host      = string of host
 *        headers   = object of headers
 *        upload    = function of upload callback
 *        download  = function of download callback
 *        underfour = function of underfour callback
 * @usage:
 *   
 */
this.post=function(mt,cb,dt,cf){
  cb=typeof cb==='function'?cb:function(){};
  if(typeof mt!=='string'){return this.temp(cb);}
  dt=typeof dt==='object'&&dt!==null?dt:{};
  cf=typeof cf==='object'&&cf!==null?cf:{};
  dt.method=mt;
  dt.token=(Math.floor((new Date).getTime()/0x3e8)+(0x5*0x3c))
    .toString(0x24);
  var mtd=cf.hasOwnProperty('method')?cf.method:'POST',
      hdr=cf.hasOwnProperty('headers')?cf.headers:null,
      upl=cf.hasOwnProperty('upload')?cf.upload:null,
      dnl=cf.hasOwnProperty('download')?cf.download:null,
      ud4=cf.hasOwnProperty('underfour')?cf.underfour:null,
      ur=cf.hasOwnProperty('host')
          &&typeof cf.host==='string'?cf.host:this.host,
      qr=/\?/.test(ur)?'&':'?',
      ud=this.buildQuery(dt),
      tmp=false;
  if(this.pkey&&mtd=='POST'){
    dt.pkey=this.pkey;
  }
  ur+=mtd=='GET'?qr+ud:'';
  return this.stream(ur,cb,cb,dt,hdr,upl,dnl,mtd,ud4);
  /* ------> @stream: url,cb,er,dt,hd,ul,dl,mt,ud4 */
};
/* ============ alert requires stand-alone ============ */
/**
 * alert -- using promise
 * @requires:
 *   this.dialog
 *   this.dialogAlert
 * @parameters:
 *   text = string of message text
 * -----
 * @usage:
 * async function(){
 *   return await _Force.alert('OK');
 * }
 * -----
 */
this.alert=function(text){
  return new Promise(resolve=>{
    _Force.dialogAlert(text,e=>{
      resolve(e);
    });
  });
};
/**
 * confirm -- using promise
 * @requires:
 *   this.dialog
 *   this.dialogConfirm
 * @parameters:
 *   text = string of message text
 * -----
 * @usage:
 * async function(){
 *   return await _Force.confirm('Are you sure?');
 * }
 * -----
 */
this.confirm=function(text){
  return new Promise(resolve=>{
    _Force.dialogConfirm((e,d)=>{
      resolve(e);
    },text);
  });
};
/**
 * prompt -- using promise
 * @requires:
 *   this.dialog
 *   this.dialogPrompt
 * @parameters:
 *   text = string of message text; default: blank
 *   def  = string of default input; default: blank
 * -----
 * @usage:
 * async function(){
 *   return await _Force.prompt('Insert Name','Your Name');
 * }
 * -----
 */
this.prompt=function(text,def){
  return new Promise(resolve=>{
    _Force.dialogPrompt((e,d)=>{
      resolve(e);
    },text,def);
  });
};
/* dialog alert */
this.dialogAlert=function(text,cb){
  cb=typeof cb==='function'?cb:function(){};
  this.dialog(text,false,'Alert','OK',false,function(e){
    cb(e);
  });
};
/* dialog confirm */
this.dialogConfirm=function(cb,text){
  cb=typeof cb==='function'?cb:function(){};
  this.dialog(text,true,'Confirm','No',false)
    .addButton(cb,'Yes','red').show();
};
/* alert -- prompt */
this.dialogPrompt=function(cb,text,def,type,holder){
  cb=typeof cb==='function'?cb:function(){};
  def=typeof def==='string'?def:'';
  type=typeof type==='string'?type:'text';
  holder=typeof holder==='string'?holder:'';
  this.dialog(text,true,'Prompt','Cancel')
    .addInput(cb,def,type,holder).show();
};
/* ============ basic requires stand-alone ============ */
/* virtual file clearance -- 3 fingers gesture */
this.virtualFileClearance=function(){
  window.VIRTUAL_FILE_CLEARANCE=false;
  window.ontouchmove=async function(e){
    if(e.changedTouches.length>=0x03
      &&!window.VIRTUAL_FILE_CLEARANCE){
      window.VIRTUAL_FILE_CLEARANCE=true;
      var text='Clear all Force caches?',
      yes=await _Force.confirm(text);
      window.VIRTUAL_FILE_CLEARANCE=false;
      if(!yes){return false;}
      _Force.splash('All caches has been cleared.');
      return _Force.virtualFile(false);
    }
  };
};
/**
 * dialog -- november 10th 2022
 * @requires: 
 *   this.buildElement
 *   this.parseJSON
 *   this.dialogCSS for style
 * @parameters:
 *   text   = string of text message; *required
 *   hold   = bool of hold to show; default: false
 *   title  = string of title; default: Alert
 *   oktext = string of ok text button; default: OK
 *   bgtap  = bool of background tap to close; default: false

Usage confirm:
  var cp=this.dialog('Delete this file?',false,'Confirm','No')
    .addButton(function(e,d){
      _Force.splash(d.answer);
    },'Yes','red').show();
  _Force.splash(cp.answer); // has to be wait
  
Usage prompt:
  var pr=this.dialog('Insert your text!',true,'Prompt','Cancel')
    .addInput(function(e,d){
      _Force.splash(e);
    },'Default Value','text','Insert Text').show();
  _Force.splash(cp.input.value); // has to be wait
*/
this.dialog=function(text,hold,title,oktext,bgtap,cb){
  title=typeof title==='string'?title:'Alert';
  oktext=typeof oktext==='string'?oktext:'OK';
  cb=typeof cb==='function'?cb:function(){};
  var ptext=typeof text==='string'?text
    :typeof this.parseJSON==='function'
      ?this.parseJSON(text):JSON.stringify(text),
  old=document.getElementById('dialog'),
  oldbg=document.getElementById('dialog-background'),
  dt=this.buildElement('div',null,{
    'class':'dialog-title',
    'data-text':title,
  }),
  dtx=this.buildElement('div',null,{
    'class':'dialog-text'
      +(typeof text==='string'?'':' dialog-text-left'),
    'data-text':ptext,
  }),
  dtxt=this.buildElement('div',null,{
    'class':'dialog-text-out',
  },[dtx]),
  dbo=this.buildElement('button',null,{
    'class':'dialog-button',
    'data-text':oktext,
    'data-type':'ok',
  }),
  dbot=this.buildElement('div',null,{
    'class':'dialog-button-out',
  },[dbo]),
  dbg=this.buildElement('div',null,{
    'class':'dialog-background',
    'id':'dialog-background',
  }),
  d=this.buildElement('div',null,{
    'class':'dialog',
    'id':'dialog',
  },[
    dt,dtxt,dbot,
  ]),
  fix=false;
  if(old){old.parentNode.removeChild(old);}
  if(oldbg){oldbg.parentNode.removeChild(oldbg);}
  d.bg=dbg;
  d.button=dbo;
  d.buttonOut=dbot;
  d.buildElement=this.buildElement;
  d.answer=null;
  d.textOut=dtxt;
  dbg.dialog=d;
  dbo.dialog=d;
  dbo.callback=cb;
  dbo.text=text;
  d.close=function(){
    this.bg.remove();
    this.classList.remove('dialog-show');
    var dialog=this;
    setTimeout(e=>{
      dialog.remove();
    },300);
    this.answer=false;
    return this;
  };
  d.show=function(){
    this.appendTo(document.body);
    var dialog=this;
    setTimeout(e=>{
      dialog.classList.add('dialog-show');
      dialog.bg.appendTo(document.body);
    },100);
    return this;
  };
  dbo.onclick=function(e){
    this.dialog.close();
    return this.callback(this.text,this.dialog);
  };
  dbg.onclick=function(e){
    if(bgtap){
      this.dialog.close();
    }
  };
  /* add button */
  d.addButton=function(cb,btext,clr){
    cb=typeof cb==='function'?cb:function(){};
    btext=typeof btext==='string'?btext:'Submit';
    clr=typeof clr==='string'?clr:'blue';
    var nbut=this.buildElement('button',null,{
      'class':'dialog-button dialog-button-left dialog-button-'+clr,
      'data-text':btext,
    });
    this.buttonOut.insertBefore(nbut,this.button);
    nbut.dialog=this;
    nbut.onclick=function(e){
      this.dialog.close();
      this.dialog.answer=true;
      return cb(true,this.dialog);
    };
    this.button.onclick=function(e){
      this.dialog.close();
      return cb(false,this.dialog);
    };
    return this;
  };
  /* add input */
  d.addInput=function(cb,def,type,holder){
    cb=typeof cb==='function'?cb:function(){};
    def=typeof def==='string'?def:'';
    type=typeof type==='string'?type:'text';
    holder=typeof holder==='string'?holder:'';
    var input=this.buildElement('input',null,{
      'class':'dialog-input',
      'type':type,
      'value':def,
      'placeholder':holder,
      'data-touch':'first',
    }),
    nbut=this.addButton(function(e,d){
      if(!e){return cb(false,d);}
      return cb(input.value,d);
    });
    input.appendTo(this.textOut);
    input.onfocus=function(e){
      if(this.dataset.touch=='first'){
        this.select();
        this.dataset.touch='last';
      }
    };
    this.input=input;
    return this;
  };
  /* show or slide down */
  if(hold!==true){
    d.show();
  }
  /* return the dialog */
  return d;
};
/* splash message -- requires this.parseJSON */
this.splash=function(str,t,limit){
  var j=false,id='splash',
      div=document.getElementById(id);
  if(typeof str!=='string'){
    str=this.parseJSON(str,limit);
    j=true;
  }
  if(div){div.parentNode.removeChild(div);}
  if(window.SPLASH_TIMEOUT){
    clearTimeout(window.SPLASH_TIMEOUT);
  }
  div=document.createElement('div');
  div.innerText=str;
  div.id=id;
  div.classList.add('splash');
  div.style.textAlign=j?'left':'center';
  if(str.match(/[\u0600-\u06ff]/ig)){
    div.style.direction='rtl';
    div.style.fontFamily='arabic';
    div.style.fontSize='125%';
    div.style.textAlign='right';
  }else{
    div.style.width='auto';
  }
  div.style.left='-100vw';
  document.body.appendChild(div);
  var dw=div.offsetWidth/2;
  div.style.left='calc(50vw - '+dw+'px)';
  if(div){div.oncontextmenu=this.absorbEvent;}
  var tt=t?(t*0x3e8):0xbb8;
  window.SPLASH_TIMEOUT=setTimeout(function(e){
    var div=document.getElementById(id);
    if(!div){return false;}
    div.style.top='-100vh';
    setTimeout(function(e){
      if(!div){return false;}
      div.parentNode.removeChild(div);
    },0x5dc);
  },tt);
};
/**
 * parse json to string
 * @require: this.objectLength
 * @parameters:
 *   obj   = mixed data of json; could be object or else
 *   limit = int of nest limit; default: 1
 *   space = int of space; default: 0
 *   pad   = int of first space per line; default: 2
 */
this.parseJSON=function(obj,limit,space,pad){
  var rtext='';  
  space=space?parseInt(space,10):0;
  limit=limit?parseInt(limit,10):1;
  pad=pad?parseInt(pad,10):2;
  if((typeof obj==='object'&&obj!==null)
    ||Array.isArray(obj)){
    var start=Array.isArray(obj)?'[':'{',
        end=Array.isArray(obj)?']':'}';
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+start+'\r\n';
    }
    var len=this.objectLength(obj),counter=0;
    for(var i in obj){
      counter++;
      var comma=counter<len?',':'',e=obj[i],espace=space+2;
      if((typeof e==='object'&&e!==null)
        ||Array.isArray(e)){
        var estart=Array.isArray(e)?'[':'{',
            eend=Array.isArray(e)?']':'}',
            k=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+k+estart+'\r\n';
        if((espace/2)<limit){
          rtext+=this.parseJSON(e,limit,espace,pad);
        }else{
          rtext+=(' ').repeat(pad*(espace+2))+'[***LIMITED:'+limit+'***]\r\n';
        }
        rtext+=(' ').repeat(pad*espace)+''+eend+comma+'\r\n';
      }else if(typeof e==='string'||typeof e==='number'){
        var k=typeof e==='number'?e.toString():'"'+e+'"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(typeof e==='boolean'){
        var k=e===true?'true':'false';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }else if(e===null){
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+'null'+comma+'\r\n';
      }else{
        var k='"['+(typeof e)+']"';
        i=start==='{'?'"'+i+'" : ':'';
        rtext+=(' ').repeat(pad*espace)+''+i+k+comma+'\r\n';
      }
    }
    if(space==0){
      rtext+=(' ').repeat(pad*space)+''+end+'\r\n';
    }
  }else if(typeof obj==='string'){
    rtext+=(' ').repeat(pad*space)+'"'+obj+'"\r\n';
  }else if(typeof obj==='number'){
    rtext+=(' ').repeat(pad*space)+''+obj.toString()+'\r\n';
  }else if(typeof obj==='boolean'){
    rtext+=(' ').repeat(pad*space)+''+(obj===true?'true':'false')+'\r\n';
  }else if(obj===null){
    rtext+=(' ').repeat(pad*space)+'null\r\n';
  }else{
    rtext+=(' ').repeat(pad*space)+'"['+(typeof obj)+']"\r\n';
  }return rtext;
};
/**
 * stream
 * @require: this.buildQuery
 * @parameters:
 *   url = string of url
 *   cb  = function of success callback of response code 200
 *   er  = function of error callback
 *   dt  = object of data form
 *   hd  = object of headers
 *   ul  = function of upload progress
 *   dl  = function of download progress
 *   mt  = string of method
 *   ud4 = function of under-four ready-state
 * @return: void
 */
this.stream=function(url,cb,er,dt,hd,ul,dl,mt,ud4){
  /* prepare callbacks */
  cb=typeof cb==='function'?cb:function(){};
  er=typeof er==='function'?er:function(){};
  ul=typeof ul==='function'?ul:function(){};
  dl=typeof dl==='function'?dl:function(){};
  ud4=typeof ud4==='function'?ud4:function(){};
  /* prepare xhr --> xmlhttp */
  var xmlhttp=false;
  if(window.XMLHttpRequest){
    xmlhttp=new XMLHttpRequest();
  }else{
    /* older browser xhr */
    var xhf=[
      function(){return new ActiveXObject("Msxml2.XMLHTTP");},
      function(){return new ActiveXObject("Msxml3.XMLHTTP");},
      function(){return new ActiveXObject("Microsoft.XMLHTTP");}
    ];
    for(var i=0;i<xhf.length;i++){try{xmlhttp=xhf[i]();}catch(e){continue;}break;}
  }
  /* check xhr */
  if(!xmlhttp){return er('Error: Failed to build XML http request.');}
  /* set method */
  var mts=['GET','POST','PUT','OPTIONS','HEAD','DELETE'];
  mt=typeof mt==='string'&&mts.indexOf(mt)>=0?mt
    :typeof dt==='object'&&dt!==null?'POST':'GET';
  /* open xhr connection */
  xmlhttp.open(mt,url,true);
  /* build urlencoded form data */
  if(typeof dt==='object'&&dt!==null){
    if(typeof dt.append!=='function'){
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      dt=this.buildQuery(dt);
    }
  }
  /* set headers */
  if(typeof hd=='object'&&hd!=null){
    for(var i in hd){xmlhttp.setRequestHeader(i,hd[i]);}
  }
  /* set callback for upload and download */
  xmlhttp.upload.onprogress=ul;
  xmlhttp.addEventListener("progress",dl,false);
  /* xhr ready state change */
  xmlhttp.onreadystatechange=function(e){
    if(xmlhttp.readyState===4&&xmlhttp.status===200
      &&typeof xmlhttp.responseText==='string'){
      try{var res=JSON.parse(xmlhttp.responseText);}
      catch(e){var res=xmlhttp.responseText;}
      return cb(res);
    }else if(xmlhttp.readyState===4){
      return er('Error: '+xmlhttp.status+' - '
        +(xmlhttp.status===0?'No Connection':xmlhttp.statusText));
    }else if(xmlhttp.readyState<4){
      return ud4('Force::stream--> '+xmlhttp.readyState+' '+xmlhttp.status+' '+xmlhttp.statusText);
    }return er('Error: '+xmlhttp.status+' '+xmlhttp.statusText);
  };
  /* send XHR */
  xmlhttp.send(dt);
};
/* ============ stand-alone ============ */
/* on function ready
 * @parameters:
 *   fn = string of function name
 *   cb = function of callback on done
 *   cr = integer of counter, auto-generated
 * @return: boolean, executer in one second
 */
this.onFunctionReady=function(fn,cb,cr){
  cr=cr?parseInt(cr):0;
  cb=typeof cb==='function'?cb:function(){};
  if(typeof fn!=='string'){return cb(false);}
  if(window.hasOwnProperty(fn)||cr>0x03){
    var res=window.hasOwnProperty(fn)
      &&typeof window[fn]==='function'?true:false;
    return cb(res);
  }cr++;
  return setTimeout(function(){
    _Force.onFunctionReady(fn,cb,cr);
  },0x64);
};
/* storage for virtual files
 * @parameters
 *   f = string of filename, or false to clear all virtual files
 *   c = string of content, or false to delete
 */
this.virtualFile=function(f,c){
  const p='force/virtual/',
  r=/^force\/virtual\//,
  k=p+''+f.toString();
  if(f===false){
    for(var i=0;i<localStorage.length;i++){
      var v=localStorage.key(i);
      if(v.match(r)){
        localStorage.removeItem(v);
      }
    }return true;
  }else if(typeof c==='string'){
    localStorage.setItem(k,c);
    return true;
  }else if(typeof c===false){
    localStorage.removeItem(k);
    return true;
  }return localStorage.getItem(k);
};
/* is script loaded
 * @parameters:
 *   f = string of file name or path
 * @return: boolean
 */
this.isScriptLoaded=function(f){
  if(typeof f!=='string'){return false;}
  var s=document.querySelector('script[id="'+f+'"]');
  return s?true:false;
};
/* load script from file */
this.loadScriptFile=function(f){
  if(typeof f!=='string'){return false;}
  var j=document.createElement('script');
  j.type='text/javascript';
  j.async=true;
  j.id=f;
  j.src=f;
  document.head.appendChild(j);
  return j;
};
/* load script from string */
this.loadScript=function(s,i){
  if(typeof s!=='string'){return;}
  var id=i?i:Math.ceil((new Date).getTime()*Math.random());
  var j=document.createElement('script');
  j.type='text/javascript';
  j.async=true;
  j.id=id;
  j.textContent=s;
  document.head.appendChild(j);
  return j;
};
/* load style from file */
this.loadStyleFile=function(f){
  if(typeof f!=='string'){return false;}
  var j=document.createElement('link');
  j.type='text/css';
  j.rel='stylesheet';
  j.media='screen,print';
  j.async=true;
  j.id=f;
  j.href=f+'?id='+f;
  document.head.appendChild(j);
  return j;
};
/* load style from string */
this.loadStyle=function(s,i){
  if(typeof s!=='string'){return;}
  var id=i?i:Math.ceil((new Date).getTime()*Math.random());
  var j=document.createElement('style');
  j.id=id;
  j.type='text/css';
  j.rel='stylesheet';
  j.media='screen,print';
  j.textContent=s;
  document.head.appendChild(j);
  return j;
};
/* load module from file */
this.loadModuleFile=function(f){
  if(typeof f!=='string'){return false;}
  var j=document.createElement('script');
  j.type='module';
  j.async=true;
  j.defer=true;
  j.id=f;
  j.src=f;
  document.head.appendChild(j);
  return j;
};
/* load module script from string */
this.loadModule=function(s,i){
  if(typeof s!=='string'){return;}
  var id=i?i:Math.ceil((new Date).getTime()*Math.random());
  var j=document.createElement('script');
  j.type='module';
  j.id=id;
  j.textContent=s;
  document.head.appendChild(j);
  return j;
};
/* clear elements -- v221112 */
this.clearElement=function(el){
  if(typeof el!=='object'||el===null
    ||typeof el.removeChild!=='function'){return false;}
  var i=el.childNodes.length;
  while(i--){
    el.removeChild(el.childNodes[i]);
  }return true;
};
/* build element */
this.buildElement=function(tag,text,attr,children,html,content){
  var div=document.createElement(typeof tag==='string'?tag:'div');
  div.appendTo=function(el){
    if(typeof el==='object'&&el!==null
      &&typeof el.appendChild==='function'){
      el.appendChild(this);
      return true;
    }return false;
  };
  div.remove=function(){
    if(!this.parentNode
      ||typeof this.parentNode.removeChild!=='function'){
      return;
    }this.parentNode.removeChild(this);
  };
  if(typeof text==='string'){
    div.innerText=text;
  }
  if(typeof attr==='object'&&attr!==null){
    for(var i in attr){
      div.setAttribute(i,attr[i]);
    }
  }
  if(Array.isArray(children)){
    for(var i=0;i<children.length;i++){
      if(typeof children[i]==='object'
        &&children[i]!==null
        &&typeof children[i].appendChild==='function'){
        div.appendChild(children[i]);
      }
    }
  }
  if(typeof html==='string'){
    div.innerHTML=html;
  }
  if(typeof content==='string'){
    div.textContent=content;
  }
  div.args={
    tag:tag,
    text:text,
    attr:attr,
    children:children,
    html:html,
    content:content,
  };
  return div;
};
/* build url query -- build urlencoded form data */
this.buildQuery=function(data,key){
  var ret=[],dkey=null;
  for(var d in data){
    dkey=key?key+'['+encodeURIComponent(d)+']'
        :encodeURIComponent(d);
    if(typeof data[d]=='object'&&data[d]!==null){
      ret.push(this.buildQuery(data[d],dkey));
    }else{
      ret.push(dkey+"="+encodeURIComponent(data[d]));
    }
  }return ret.join("&");
};
/* parse query string */
this.parseQuery=function(t){
  if(typeof t!=='string'){return false;}
  var s=t.split('&');
  var r={},c={};
  for(var i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    var p=s[i].split('=');
    var k=decodeURIComponent(p[0]);
    if(k.match(/\[(.*)?\]$/g)){
      var l=k.replace(/\[(.*)?\]$/g,'');
      var w=k.replace(/^.*\[(.*)?\]$/g,"$1");
      c[l]=c[l]?c[l]:0;
      if(w==''){w=c[l];c[l]+=1;}
      if(!r[l]){r[l]={};}
      r[l][w]=decodeURIComponent(p[1]);
      continue;
    }r[k]=p[1]?decodeURIComponent(p[1]):'';
  }return r;
};
/* object length */
this.objectLength=function(obj){
  obj=typeof obj==='object'&&obj!==null?obj:{};
  var size=0,key;
  for(key in obj){
    if(obj.hasOwnProperty(key)){size++;}
  }return size;
};
/* loading view - loader-191026 from loader-171229 */
this.loader=function(text,info,value,max){
  /* prepare loader id */
  var id='loader-191026';
  /* check loader elements */
  var ld=document.getElementById(id);
  var ct=document.getElementById(id+'-text');
  var ci=document.getElementById(id+'-info');
  var cp=document.getElementById(id+'-progress');
  /* check text string */
  if(typeof text!=='string'){
    if(ld){ld.parentNode.removeChild(ld);}
    return false;
  }
  if(!ld){
    /* create elements */
    var ld=document.createElement('div');
    var bg=document.createElement('div');
    var lim=document.createElement('div');
    var img=document.createElement('img');
    var ct=document.createElement('div');
    /* add ids */
    ld.id=id;
    ct.id=id+'-text';
    /* add classes */
    ld.classList.add('loader');
    bg.classList.add('loader-background');
    lim.classList.add('loader-image');
    ct.classList.add('loader-text');
    ct.classList.add('blink');
    /* prepare loader image */
    img.width='32px';
    img.height='32px';
    img.alt='Loading...';
    img.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjY2NjIj4KICA8cGF0aCBvcGFjaXR5PSIuMjUiIGQ9Ik0xNiAwIEExNiAxNiAwIDAgMCAxNiAzMiBBMTYgMTYgMCAwIDAgMTYgMCBNMTYgNCBBMTIgMTIgMCAwIDEgMTYgMjggQTEyIDEyIDAgMCAxIDE2IDQiLz4KICA8cGF0aCBkPSJNMTYgMCBBMTYgMTYgMCAwIDEgMzIgMTYgTDI4IDE2IEExMiAxMiAwIDAgMCAxNiA0eiI+CiAgICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAxNiAxNiIgdG89IjM2MCAxNiAxNiIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KICA8L3BhdGg+Cjwvc3ZnPgoK';
    /* appending elements */
    lim.appendChild(img);
    ld.appendChild(bg);
    ld.appendChild(lim);
    ld.appendChild(ct);
  }
  /* add values */
  ct.innerText=text.replace(/\r|\n/g,' ');
  /* default output */
  var out={
    text:ct,
    info:null,
    progress:null,
  };
  /* check info string */
  if(typeof info==='string'){
    if(!ci){
      var ci=document.createElement('div');
      ci.id=id+'-info';
      ci.classList.add('loader-info');
      ld.appendChild(ci);
    }ci.innerText=info;
    out.info=ci;
    if(typeof value==='number'
      &&typeof max==='number'){
      if(!cp){
        var cp=document.createElement('progress');
        cp.id=id+'-progress';
        cp.classList.add('loader-progress');
        ci.classList.add('loader-info-with-progress');
        ld.appendChild(cp);
      }cp.value=value;
      cp.max=max;
      out.info=cp;
    }else if(cp){
      cp.parentNode.removeChild(cp);
    }
  }else if(ci){
    ci.parentNode.removeChild(ci);
  }
  /* append loader element into body */
  document.body.appendChild(ld);
  /* return output elements */
  return out;
};
/* create loader css for loader and splash */
this.loaderCSS=function(){
  var id='loader-css';
  var c=document.getElementById(id);
  if(c){return c;}
  var s='.loader{position:fixed;width:0px;height:0px;top:50%;left:50%;z-index:10000;-webkit-user-select:none;-moz-user-select:none;user-select:none;}.loader-background{background-color:#fff;opacity:1;position:fixed;width:100%;height:100%;top:0px;left:0px;right:0px;bottom:0px;margin:0px;padding:0px;z-index:10001;}.loader-image{margin:-70px 0px 0px 0px;padding:0px;left:0px;width:100%;height:32px;line-height:32px;vertical-align:top;text-align:center;font-family:segoeuil,Tahoma,consolas,monospace;color:#777;font-size:13px;z-index:10002;position:fixed;}.loader-image img{width:32px;height:32px;}.loader-text{margin:-35px 0px 0px 0px;padding:0px;left:0px;width:100%;height:50px;cursor:default;line-height:15px;vertical-align:top;text-align:center;position:fixed;font-family:inherit,system-ui,monospace;color:#777;font-size:13px;z-index:10002;}.loader-info{margin:-19px 0px 0px 0px;padding:0px;left:0px;width:100%;height:50px;cursor:default;line-height:15px;vertical-align:top;text-align:center;position:fixed;font-family:inherit,system-ui,monospace;color:#777;font-size:13px;z-index:10002;}.loader-info-with-progress{margin:-4px 0px 0px 0px;}.loader-progress{margin:-13px 0px 0px 0px;padding:0px;height:5px;border:0px none;border-radius:2px;width:calc(100% - 30px);background-color:#ddd;transition:all 0.1s ease 0s;cursor:default;position:fixed;z-index:10002;left:15px;}.loader-progress::-moz-progress-bar{background:#9d5;border-radius:2px;}.loader-progress::-webkit-progress-value{background:#9d5;border-radius:2px;}.loader-progress::-webkit-progress-bar{background:#ddd;border-radius:2px;}.splash{display:block;position:fixed;z-index:9999;top:7%;left:calc(15% - 20px);background-color:#000;color:#fff !important;opacity:0.5;padding:10px 20px;width:70%;max-width:70%;max-height:70%;text-align:center;border:0px none;border-radius:7px;transition:all 0.3s ease 0s;white-space:pre-wrap;overflow-x:hidden;overflow-y:auto;word-break:break-word;-moz-user-select:none;-webkit-user-select:none;user-select:none;font-size:13px;}';
  var c=document.createElement('style');
  c.rel='stylesheet';
  c.type='text/css';
  c.media='screen';
  c.textContent=s;
  c.id=id;
  document.head.appendChild(c);
  return c;
};
/* create dialog css for dialog */
this.dialogCSS=function(){
  var id='dialog-css';
  var c=document.getElementById(id);
  if(c){return c;}
  var s='.dialog{transition:all 0.3s ease 0s;width:270px;height:auto;max-height:270px;margin:0px;padding:0px;background-color:#fff;display:block;position:fixed;z-index:99999;top:-100vh;left:calc(50vw - 135px);box-shadow:0px 0px 15px #999;border:0px none;border-radius:10px;overflow:hidden;}.dialog-show{top:calc(50vh - 135px);}.dialog-background{transition:all 0.5s ease 0s;width:100vw;height:100vh;margin:0px;padding:0px;background-color:#fff;opacity:0.5;display:block;position:fixed;z-index:99998;top:0px;left:0px;right:0px;bottom:0px;border:0px none;overflow:hidden;}.dialog-title{font-weight:bold;font-size:20px;color:#555;border-bottom:1px solid #ddd;box-shadow:0px 1px 5px #ddd;margin:0px;padding:0px;text-align:center;height:50px;line-height:50px;overflow:hidden;white-space:pre-wrap;}.dialog-title:before{content:attr(data-text);}.dialog-text-out{margin:0px;padding:20px 10px;overflow:hidden;}.dialog-text{font-size:16px;color:#555;margin:0px;padding:0px;overflow-x:hidden;overflow-y:auto;white-space:pre-wrap;word-wrap:pre-wrap;word-break:break-all;height:auto;max-height:113px;text-align:center;}.dialog-text:before{content:attr(data-text);}.dialog-text-left{text-align:left;}.dialog-input{width:calc(100% - 20px);font-size:16px;border:1px solid #ddd;border-radius:5px;margin:10px 10px 10px;padding:7px 13px;color:#333;font-weight:normal;background-color:#eed;}.dialog-button-out{border-top:1px solid #ddd;box-shadow:0px -1px 5px #ddd;margin:0px;padding:0px;text-align:center;height:65px;line-height:60px !important;overflow:hidden;}.dialog-button:focus{background-color:#ccb;outline:none;}.dialog-button:hover{background-color:#ddc;}.dialog-button:disabled{background-color:#ddc;color:#333;opacity:0.8;}.dialog-button:before{content:attr(data-text);}.dialog-button{background-color:#eed;padding:5px 11px;border:0px none;color:#333;font-size:16px;margin:0px 0px;border-radius:3px;cursor:default;transition:all 0.3s ease 0s;box-shadow:1px 1px 3px #777;outline:none;font-weight:bold;}.dialog-button-left{margin-right:10px;}.dialog-button-blue:focus{background-color:#159;}.dialog-button-blue:hover{background-color:#26a;}.dialog-button-blue{color:#fff;background-color:#37b;}.dialog-button-soft-green:focus{background-color:#591;}.dialog-button-soft-green:hover{background-color:#6a2;}.dialog-button-soft-green{color:#fff;background-color:#7b3;}.dialog-button-orange:focus{background-color:#951;}.dialog-button-orange:hover{background-color:#a62;}.dialog-button-orange{color:#fff;background-color:#b73;}.dialog-button-red:focus{background-color:#a11;}.dialog-button-red:hover{background-color:#b22;}.dialog-button-red{color:#fff;background-color:#c33;}.dialog-button-yellow:focus{background-color:#aa1;}.dialog-button-yellow:hover{background-color:#bb2;}.dialog-button-yellow{color:#fff;background-color:#cc3;}.dialog-button-purple:focus{background-color:#519;}.dialog-button-purple:hover{background-color:#62a;}.dialog-button-purple{color:#fff;background-color:#73b;}.dialog-button-pink:focus{background-color:#915;}.dialog-button-pink:hover{background-color:#a26;}.dialog-button-pink{color:#fff;background-color:#b37;}.dialog-button-tosca:focus{background-color:#195;}.dialog-button-tosca:hover{background-color:#2a6;}.dialog-button-tosca{color:#fff;background-color:#3b7;}.dialog-button-violet:focus{background-color:#a1a;}.dialog-button-violet:hover{background-color:#b2b;}.dialog-button-violet{color:#fff;background-color:#c3c;}.dialog-button-light-blue:focus{background-color:#1aa;}.dialog-button-light-blue:hover{background-color:#2bb;}.dialog-button-light-blue{color:#fff;background-color:#3cc;}.dialog-button-dark-blue:focus{background-color:#11a;}.dialog-button-dark-blue:hover{background-color:#22b;}.dialog-button-dark-blue{color:#fff;background-color:#33c;}.dialog-button-green:focus{background-color:#1a1;}.dialog-button-green:hover{background-color:#2b2;}.dialog-button-green{color:#fff;background-color:#3c3;}';
  var c=document.createElement('style');
  c.rel='stylesheet';
  c.type='text/css';
  c.media='screen';
  c.textContent=s;
  c.id=id;
  document.head.appendChild(c);
  return c;
};
/* prevent context menu */
this.absorbEvent=function(event){
  var e=event||window.event;
  e.preventDefault&&e.preventDefault();
  e.stopPropagation&&e.stopPropagation();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
};
/* temporary */
this.temp=function(cb){
  cb=typeof cb==='function'?cb:function(){};
  return cb(false);
};
};
