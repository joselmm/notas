const $form = document.querySelector('#form');
const $textarea = document.querySelector('#tak-description');
const $htmlMode = document.querySelector('#htmlMode');
const $list = document.querySelector('#list');
const $listContent = document.querySelector('#list-content');
const $saveBTN = document.querySelector('#send-tak-btn');
const $alertMessage = document.getElementById('alert-message');
const $shadow = document.getElementById('shadow');
const $shadowInvisible = document.getElementById('shadow-invisible');
const $undoDeleteBTN = document.getElementById('undo-delete');
const getParams = new URLSearchParams(location.search);
const localCacheName = getParams.get("localCacheName");
var urlLibreria2 = "";
var taskList = [];
if(localCacheName===null)location.href="/notas/";
history.pushState(null, null, "/notas/app.html");
const cacheParcial = sessionStorage.getItem(localCacheName) || localStorage.getItem(localCacheName);
const cache = JSON.parse(cacheParcial);
for (let key in cache){
  let propertyValue = cache[key];
  sessionStorage.setItem(key,propertyValue);
}

var urlLibreria2 = sessionStorage.getItem("libreria2");
var spreadSheetId = sessionStorage.getItem("spreadSheetId");
/* const cache.END_POINT = cache.END_POINT; */
//console.log(cache)
//Funciones
let originalTaklist = [];
(function ocultar() {
  if (document.cookie.split(";")[0]) {
    $form.hidden = JSON.parse(document.cookie.split(";")[0].split("=")[1]);
  }

  //cargando lista
  $alertMessage.innerText = 'Cargando';
  messageToggle(false);
  /* getSheetData(cache.END_POINT, 'lista', 'takList', (list) => {
    renderList(list);
    messageToggle(true);
    originalTaklist = list;
  }); */
  var url = `${urlLibreria2}?spreadSheetId=${spreadSheetId}&sheetIdType=name&sheetId=lista`
  console.log(url)
  fetch(url)
  .then(re=> re.json())
  .then((e)=>{
    var {data}=e;
    taskList=data;
    renderList(data);
    messageToggle(true);
    originalTaklist = JSON.parse(JSON.stringify(data));
  })
  .catch(r=>console.error(r))
})();

//getSheetData(END_POINT,"lista","dta",(res)=>{console.log(res)})

//ocultar y desocultar shadow

function messageToggle(oculto) {
  $shadow.hidden = oculto;
  $shadowInvisible.hidden = oculto;
}

function saveOrUpdateTak() {
  if (sessionStorage.getItem('id-u')) {
    updateTak();
    return;
  }

  saveTak();
}

function saveTak() {
  //message
  $alertMessage.innerText = 'Guardando';
  messageToggle(false);

  var tarea = $textarea.value;
  var keywords = $('input#tak-keywords').val();

  var id = generateUUID();
  sessionStorage.setItem('saved-id', id);
  var modificado = Date.now();
  var htmlMode = $htmlMode.checked ? "SI":"NO";
  var object = { tarea, id, modificado, keywords,htmlMode };
  /* insertRows(cache.END_POINT, 'lista', [object], 'takList', (list) => {
    $('input#tak-keywords').tagsinput('removeAll');
    renderList(list);
    var id = sessionStorage.getItem('saved-id');
    var saved = document.getElementById(id);
    saved.scrollIntoView();
    saved.classList.add('btn-info');
    setTimeout(() => {
      saved.classList.remove('btn-info');
    }, 2500);
    messageToggle(true);
    $textarea.value = '';
  }); */
  
  fetch(urlLibreria2,{
    method:"POST",
    body:JSON.stringify({
      queryParameters:{
        spreadSheetId,
        sheetIdType:"name",
        sheetId:"lista"
      },
      action:"ADD",
      payload:[object]

    })
  })
  .then(re=> re.json())
  .then(jsonRes=>{
    /* 
    console.log(taskList)
    renderList(jsonRes.data);
    messageToggle(true);
    originalTaklist = jsonRes.data;
    */
    var list=jsonRes.data;
    taskList=JSON.parse(JSON.stringify(list))
    renderList(list);
    $('input#tak-keywords').tagsinput('removeAll');
    var id = sessionStorage.getItem('saved-id');
    var saved = document.getElementById(id);
    saved.scrollIntoView();
    saved.classList.add('btn-info');
    setTimeout(() => {
      saved.classList.remove('btn-info');
    }, 2500);
    messageToggle(true);
    $htmlMode.checked=false;
    $textarea.value = '';
  })
  .catch(r=>console.error(r))

}

function updateTak() {
  //mensage
  $alertMessage.innerText = 'Actualizando';
  messageToggle(false);

  var id = sessionStorage.getItem('id-u');
  var tarea = $textarea.value;
  var keywords = $('input#tak-keywords').val();
  var htmlMode = $htmlMode.checked ? "SI":"NO";
  var object = { tarea, id, keywords, htmlMode };
  /* updateRows(cache.END_POINT, 'lista', [object], 'id', 'takList', (list) => {
    $('input#tak-keywords').tagsinput('removeAll');
    renderList(list);
    cancelEdit();
    var edited = document.getElementById(id);
    edited.scrollIntoView();
    edited.classList.add('btn-secondary');
    setTimeout(() => {
      edited.classList.remove('btn-secondary');
    }, 2500);
    messageToggle(true);
  }); */
  fetch(urlLibreria2,{
    method:"POST",
    body:JSON.stringify({
      queryParameters:{
        spreadSheetId,
        sheetIdType:"name",
        sheetId:"lista"
      },
      action:"UPDATE_IF",
      payload:[object],
      condition:"ROW_OBJECT['id'] === @id@"

    })
  })
  .then(re=> re.json())
  .then((e)=>{
    var {data} = e;
    taskList=data;
    $('input#tak-keywords').tagsinput('removeAll');
    renderList(data);
    cancelEdit();
    var edited = document.getElementById(id);
    edited.scrollIntoView();
    edited.classList.add('btn-secondary');
    setTimeout(() => {
      edited.classList.remove('btn-secondary');
    }, 2500);
    messageToggle(true);
    $htmlMode.checked=false;
  })
  .catch(r=>console.error(r))
}

function actualizar(e) {
  // si esta oculto el formulario
  if ($form.hidden) {
    closeWindowADDTak();
  }

  var tag = e.target;

  var tak = taskList.filter((tak) => {
    return e.target.id == tak.id;
  })[0];
  if (document.querySelector('div.bg-info.tak')) {
    document.querySelector('div.bg-info.tak').classList.remove('bg-info');
  }
  $('input#tak-keywords').tagsinput('removeAll');
  $('input#tak-keywords').tagsinput('add', tak.keywords);

  tag.classList.add('bg-info');
  sessionStorage.setItem('id-u', tag.id);
  $textarea.value = tak.tarea;
  $htmlMode.checked = tak.htmlMode === "SI";
  $saveBTN.innerText = 'Actualizar';
  $form.scrollIntoView();
  $textarea.focus();

  //agregar btn para cancelar ediccion
  if (document.querySelector('#cancel-edit')) {
    document.querySelector('#cancel-edit').outerHTML = '';
  }
  var btnCancelEdit = document.createElement('button');
  $saveBTN.parentElement.appendChild(btnCancelEdit);
  btnCancelEdit.outerHTML = `<button
    type="submit"
    id="cancel-edit"
    onclick="javascript: cancelEdit();"
    class="btn btn-danger"
  >
    Cancelar
  </button>`;
}

function cancelEdit() {
  $textarea.value = '';
  $saveBTN.innerText = 'Guardar Tarea';
  $('input#tak-keywords').tagsinput('removeAll');
  if (document.querySelector('div.bg-info.tak')) {
    document.querySelector('div.bg-info.tak').classList.remove('bg-info');
  }

  document.getElementById(sessionStorage.getItem('id-u')).scrollIntoView();
  sessionStorage.removeItem('id-u');
  document.getElementById('cancel-edit').outerHTML = '';
}

function renderList(list) {
  //Borrar Lista
  $listContent.innerHTML = '';
  var takDivClasses = '';
  //estilo borde
  takDivClasses += 'border border-danger';
  //numero de columnas
  takDivClasses += ' col-11';

  //reorganizando lista:
  var RankedList = list.sort(function (a, b) {
    return b.modificado - a.modificado;
  });

  for (object of RankedList) {
    var div = document.createElement('div');
    $listContent.appendChild(div);
    var keywordsTag = '';
    if (object.keywords.length > 0) {
      keywordsTag = '<div class="bootstrap-tagsinput" style="margin: 2dvh 0;">';
      for (keyword of object.keywords.split(',')) {
        //console.log(keyword);
        keywordsTag =
          keywordsTag + `<span class="tag label bg-dark" >${keyword}</span> `;
      }
      keywordsTag += '</div>';
    }

    div.outerHTML = `
      <div class="row">
      <div class="${takDivClasses}" >
      <div id="${object.id}" class="tak" ondblclick="javascript: actualizar(event);" ">${""/* object.tarea */}</div>
      ${keywordsTag}
      </div>
      <!--Estilos para x de borrar-->
      <div data-id="${object.id}" class="col-1 btn-danger" style="cursor: pointer;align-items: center;display: flex;" onclick="javascript: deleteTak(event);">
        <span style="margin: 0 auto;">X</span>
      </div>

      <div>
      `;
     // console.log(object)
    div = document.getElementById(object.id);
    // console.log()
    if(object.htmlMode==="SI"){
      div.innerHTML = object.tarea.replaceAll("\n","<br>");
    }else{
      div.innerText = object.tarea;
    }
  }
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

// variable que usa para deshacer borrado de tarea
let lastTimeUndo = 0;
takDeletedId = null;
function deleteTak(e) {
  takDeletedId =  e.target.dataset.id;

  $alertMessage.innerText = 'Eliminando';
  messageToggle(false);
  // guardando el objecto en el session Storage borrado
  /* deleteRows(
    cache.END_POINT,
    'lista',
    [{ id: e.target.dataset.id }],
    'id',
    null,
    (list) => {
      renderList(list);
      messageToggle(true);
      $undoDeleteBTN.hidden = false;
      lastTimeUndo = Date.now();
      setTimeout(() => {
        //desaparecer opcion de deshacer borrado
        if (Date.now() - lastTimeUndo >= 3000) {
          $undoDeleteBTN.hidden = true;
        }
      }, 3000);
    }
  ); */

  fetch(urlLibreria2,{
    method:"POST",
    body:JSON.stringify({
      queryParameters:{
        sheetId:"lista",
        spreadSheetId,
        sheetIdType:"name"
      },
      action:"DELETE_IF",
      payload:[{takDeletedId}],
      condition:"@id@ === ROW_OBJECT.takDeletedId"
    })
  })
  .then(e=>e.json())
  .then(e=>{
    var {data}=e;
    taskList=data;
    renderList(data);
      messageToggle(true);
      $undoDeleteBTN.hidden = false;
      lastTimeUndo = Date.now();
      setTimeout(() => {
        //desaparecer opcion de deshacer borrado
        if (Date.now() - lastTimeUndo >= 3000) {
          $undoDeleteBTN.hidden = true;
        }
      }, 3000);
  })
  .catch(err=>console.error(err))
}

function undoDelete() {
  takDeleted = originalTaklist.filter(
    (tak) => tak.id === takDeletedId
  )[0];
  $alertMessage.innerText = 'Deshaciendo';
  messageToggle(false);
  sessionStorage.setItem('saved-id', takDeleted.id);
  /* insertRows(cache.END_POINT, 'lista', [takDeleted], null, (list) => {
    renderList(list);
    var id = sessionStorage.getItem('saved-id');
    var saved = document.getElementById(id);
    saved.scrollIntoView();
    saved.classList.add('btn-info');
    setTimeout(() => {
      saved.classList.remove('btn-info');
    }, 2500);
    messageToggle(true);
  }); */

  fetch(urlLibreria2,{
    method:"POST",
    body:JSON.stringify({
      queryParameters:{
        spreadSheetId,
        sheetIdType:"name",
        sheetId:"lista"
      },
      action:"ADD",
      payload:[takDeleted]

    })
  })
  .then(re=> re.json())
  .then(jsonRes=>{
    taskList=jsonRes.data;
   
    renderList(jsonRes.data);
    var id = sessionStorage.getItem('saved-id');
    var saved = document.getElementById(id);
    saved.scrollIntoView();
    saved.classList.add('btn-info');
    setTimeout(() => {
      saved.classList.remove('btn-info');
    }, 2500);
    messageToggle(true);

  })
  .catch(r=>console.error(r))

}

function closeWindowADDTak() {
  $form.hidden = !$form.hidden;
  document.cookie='form-hidden='+ $form.hidden;
}

//ocultar();

//SUBIR ARCHIVOS

async function uploadFiles(e) {
  e.preventDefault();
  const filesInput = document.querySelector('#files-loaded');

  if (filesInput.files.length > 0) {
    $htmlMode.checked=true;
    messageToggle(false);
    $alertMessage.innerText = 'Subiendo';
    var takDescription = document.querySelector('#tak-description');
    for (file of filesInput.files) {
      var base64 = await fileToBase64(file)
        .then((base64String) => {
          return base64String;
        })
        .catch((error) => {
          return error;
        });
      if (!(typeof base64 == 'string')) {
        console.error(
          'ocurrio un error con el base64 del archivo ' +
            file.name +
            ': ' +
            base64
        );
        console.log('se detuvo la funcion');
        return;
      }

      var payload = {
        archivo_name: file.name,
        file_mime: file.type,
        archivo_base64: base64,
      };

      var result = await fetch(cache.ftpServer,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )
        .then((res) => res.json())
        .then((res) => res);
      result=JSON.parse(result);
      if (result.status == 'error') {
        console.error('ocurrio con la respuesta del servidor de appscript: ');
        console.log(result);
        console.log('se detuvo la funcion');
        return;
      }
      var fileTemplate=`<a href="https://drive.google.com/uc?id=${result.fileId}" target="_blank">${file.name}</a> <button class="btn btn-danger p-0" onclick="deleteFile('${result.fileId}')">Borrar archivo</button> <br>`;
      if (takDescription[takDescription.length - 1] === '\n') {
        takDescription.value +=
          /* '"' +
          file.name +
          '"' +
          ': https://drive.google.com/uc?id=' +
          result.fileId; */
          fileTemplate;
      } else {
        takDescription.value +=
          /* '\n' +
          '"' +
          file.name +
          '"' +
          ': https://drive.google.com/uc?id=' +
          result.fileId; */
          `\n${fileTemplate}`
      }
    }
    messageToggle(true);
    filesInput.value="";
  } else {
    alert(filesInput.files.length + ' archivos cargados.');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}


function logOut() {
  sessionStorage.clear();
  localStorage.clear();
  location.href=location.href.replace("app.html","")
}

/* function deleteFile(fileId){
  $alertMessage.innerText = 'Borrando archivo';
  messageToggle(true);
  fetch(cache.ftpServer+"?fileId="+fileId)
  .then(e=>{
    
    messageToggle(false);
    $textarea.value=$textarea.value.replace(/<a.+·${fileId}.+<br>/g,"")
  })
} */

  function deleteFile(fileId){
    var {id} = taskList.find(e=>e.tarea.includes(fileId));
    $alertMessage.innerText = 'Borrando archivo';
    messageToggle(false);
    fetch(cache.ftpServer+"?fileId="+fileId)
    .then(e=>{
      
      
      var rowdiv = document.getElementById(id);
      actualizar({target:rowdiv});
      $textarea.value=$textarea.value.replace(new RegExp(`<a.+${fileId}.+<br>`, 'g'), "")
      updateTak();
    })
  }


  function isInViewport(querySelector) {
    var elem = document.querySelector(querySelector)
    var bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

window.addEventListener("scroll", () => {
  if(isInViewport("#lista-title")){
    //console.log("si esta")
    //document.querySelector("#arrow-up").style.display="none"
    document.querySelector("#arrow-up").classList.add("not-to-show")
  }else{
   //console.log ("no esta")
    //document.querySelector("#arrow-up").style.display=""
    document.querySelector("#arrow-up").classList.remove("not-to-show")

  }
});

document.querySelector("#arrow-up").addEventListener("click",()=>{
  window.scroll(0,0)
})