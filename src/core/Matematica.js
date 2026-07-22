window.Matematica = {
  soma: (a, b) => Number(a) + Number(b),
  subtrair: (a, b) => Number(a) - Number(b),
  multiplicar: (a, b) => Number(a) * Number(b),
  dividir: (a, b) => Number(b) !== 0 ? Number(a) / Number(b) : NaN,
  raiz: (a) => Math.sqrt(Number(a)),
  potencia: (base, exp) => Math.pow(Number(base), Number(exp)),
  aleatorio: (min, max) => Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min)
};