code.value=`<RastPt>\ntexto nome=[\"Rato\"]\nnumero idade=[14]\nmostrar[\"Olá\"]\nmostrar[nome]\n</RastPt>`;
function run(){console.textContent=interpret(code.value)}
function clearCode(){code.value='';console.textContent=''}
function saveFile(){let b=new Blob([code.value]);let a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='programa.rpt';a.click()}
function openFile(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>code.value=r.result;r.readAsText(f)}