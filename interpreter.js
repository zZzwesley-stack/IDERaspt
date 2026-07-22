function interpret(src){let v={},o=[];let lines=src.split(/\n/);for(let l of lines){l=l.trim();if(!l||l.startsWith('<'))continue;
if(l.startsWith('texto ')){let[p,x]=l.split('=');v[p.split(' ')[1].trim()]=x.replace(/[\[\]"]/g,'').trim();}
else if(l.startsWith('numero ')){let[p,x]=l.split('=');v[p.split(' ')[1].trim()]=parseFloat(x.replace(/[\[\]]/g,''));}
else if(/^[A-Za-z_]+\s*=/.test(l)&&!l.startsWith('texto')&&!l.startsWith('numero')){let[n,e]=l.split('=');n=n.trim();e=e.trim();if(e.includes('+')){let[a,b]=e.split('+');v[n]=v[a.trim()]+(+b)}}
else if(l.startsWith('mostrar')){let c=l.match(/\[(.*)\]/)[1].replace(/"/g,'').trim();o.push(v[c]??c);}
}return o.join('\n');}