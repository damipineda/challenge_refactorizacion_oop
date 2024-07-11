class Mapa {
  constructor(filas, columnas) {
      this.filas = filas;
      this.columnas = columnas;
      this.escenario = this.creaTabla(filas, columnas);
      this.casillaAbierta = [];
      this.casillaCerrada = [];
      this.camino = [];
      this.terminado = false;
      this.principio = null;
      this.fin = null;
  }

  creaTabla(filas, columnas) {
      let tabla = [];
      for (let i = 0; i < filas; i++) {
          tabla[i] = [];
          for (let j = 0; j < columnas; j++) {
              tabla[i][j] = null;
          }
      }
      return tabla;
  }

  heuristicaManhattan(a, b) {
      let x = Math.abs(a.x - b.x);
      let y = Math.abs(a.y - b.y);
      return x + y;
  }

  borraDelArray(array, elemento) {
      for (let i = array.length - 1; i >= 0; i--) {
          if (array[i] === elemento) {
              array.splice(i, 1);
          }
      }
  }

  inicializa() {
      for (let i = 0; i < this.filas; i++) {
          for (let j = 0; j < this.columnas; j++) {
              this.escenario[i][j] = new Casilla(j, i, this);
          }
      }
      for (let i = 0; i < this.filas; i++) {
          for (let j = 0; j < this.columnas; j++) {
              this.escenario[i][j].addVecinos();
          }
      }
      this.dibujaMapa();
  }

  dibujaMapa() {
      let tabla = document.getElementById('mapa');
      tabla.innerHTML = '';
      for (let i = 0; i < this.filas; i++) {
          let fila = document.createElement('tr');
          for (let j = 0; j < this.columnas; j++) {
              let celda = document.createElement('td');
              celda.textContent = `${j},${i}`;
              if (this.escenario[i][j].tipo === 1) celda.className = 'muro';
              if (this.escenario[i][j] === this.principio) celda.className = 'inicio';
              if (this.escenario[i][j] === this.fin) celda.className = 'fin';
              if (this.camino.includes(this.escenario[i][j]) && this.escenario[i][j] !== this.principio && this.escenario[i][j] !== this.fin) {
                  celda.className = 'camino';
              }
              fila.appendChild(celda);
          }
          tabla.appendChild(fila);
      }
  }

  actualizaInicioFin() {
      let inicioCoords = document.getElementById('inicio').value.split(',');
      let finCoords = document.getElementById('fin').value.split(',');

      if (inicioCoords.length === 2 && finCoords.length === 2) {
          let inicioX = parseInt(inicioCoords[0]);
          let inicioY = parseInt(inicioCoords[1]);
          let finX = parseInt(finCoords[0]);
          let finY = parseInt(finCoords[1]);

          if (this.isValidCoord(inicioX, inicioY) && this.isValidCoord(finX, finY)) {
              this.principio = this.escenario[inicioY][inicioX];
              this.fin = this.escenario[finY][finX];
              this.reiniciaAlgoritmo();
              this.principal();  // Ejecutar el algoritmo
          } else {
              alert('Coordenadas inválidas. Deben estar dentro del rango 0-24.');
          }
      } else {
          alert('Formato de coordenadas incorrecto. Use el formato x,y.');
      }
  }

  isValidCoord(x, y) {
      return x >= 0 && x < this.columnas && y >= 0 && y < this.filas;
  }

  reiniciaAlgoritmo() {
      this.casillaAbierta = [this.principio];
      this.casillaCerrada = [];
      this.camino = [];
      this.terminado = false;
      this.dibujaMapa();
  }

  algoritmo() {
      if (!this.terminado) {
          if (this.casillaAbierta.length > 0) {
              let ganador = 0;
              for (let i = 0; i < this.casillaAbierta.length; i++) {
                  if (this.casillaAbierta[i].f < this.casillaAbierta[ganador].f) {
                      ganador = i;
                  }
              }
              let actual = this.casillaAbierta[ganador];
              if (actual === this.fin) {
                  let temporal = actual;
                  this.camino.push(temporal);
                  while (temporal.padre != null) {
                      temporal = temporal.padre;
                      this.camino.push(temporal);
                  }
                  this.terminado = true;
                  alert('camino encontrado');
              } else {
                  this.borraDelArray(this.casillaAbierta, actual);
                  this.casillaCerrada.push(actual);
                  let vecinos = actual.vecinos;
                  for (let i = 0; i < vecinos.length; i++) {
                      let vecino = vecinos[i];
                      if (!this.casillaCerrada.includes(vecino) && vecino.tipo !== 1) {
                          let tempG = actual.g + 1;
                          if (this.casillaAbierta.includes(vecino)) {
                              if (tempG < vecino.g) {
                                  vecino.g = tempG;
                              }
                          } else {
                              vecino.g = tempG;
                              this.casillaAbierta.push(vecino);
                          }
                          vecino.h = this.heuristicaManhattan(vecino, this.fin);
                          vecino.f = vecino.g + vecino.h;
                          vecino.padre = actual;
                      }
                  }
              }
          } else {
              alert('No hay un camino posible');
              this.terminado = true;
          }
      }
  }

  principal() {
      while (!this.terminado) {
          this.algoritmo();
      }
      this.dibujaMapa();
      this.imprimeResultado();
  }

  imprimeResultado() {
      let resultado = document.getElementById('resultado');
      resultado.innerHTML = 'Casilla visitadas:<br>';
      for (let i = this.camino.length - 1; i >= 0; i--) {
          resultado.innerHTML += `(${this.camino[i].x},${this.camino[i].y}) `;
      }
      resultado.innerHTML += '<br>Total de casilla visitadas: ' + this.camino.length;
  }

  agregarMuro(event) {
      if (event.target.tagName === "TD") {
          let x = parseInt(event.target.textContent.split(",")[0]);
          let y = parseInt(event.target.textContent.split(",")[1]);
          this.escenario[y][x].tipo = this.escenario[y][x].tipo === 1 ? 0 : 1;
          this.dibujaMapa();
      }
  }
}

class Casilla {
  constructor(x, y, mapa) {
      this.x = x;
      this.y = y;
      this.tipo = 0;
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.vecinos = [];
      this.padre = null;
      this.mapa = mapa;

      let aleatorio = Math.floor(Math.random() * 5);
      if (aleatorio === 1) this.tipo = 1;
  }

  addVecinos() {
      if (this.x > 0) this.vecinos.push(this.mapa.escenario[this.y][this.x - 1]);
      if (this.x < this.mapa.columnas - 1) this.vecinos.push(this.mapa.escenario[this.y][this.x + 1]);
      if (this.y > 0) this.vecinos.push(this.mapa.escenario[this.y - 1][this.x]);
      if (this.y < this.mapa.filas - 1) this.vecinos.push(this.mapa.escenario[this.y + 1][this.x]);
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const mapa = new Mapa(25, 25);
  mapa.inicializa();

  document.getElementById('acturalizar').onclick = () => mapa.actualizaInicioFin();
  
  document.getElementById('inicio').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
          event.preventDefault();
          document.getElementById('acturalizar').click();
      }
  });

  document.getElementById('fin').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
          event.preventDefault();
          document.getElementById('acturalizar').click();
      }
  });

  document.getElementById("agregarMuroButton").addEventListener("click", function() {
      document.body.style.cursor = "crosshair";
      const clickListener = function(event) {
          mapa.agregarMuro(event);
      };
      document.addEventListener("click", clickListener);

      // Restablecer el cursor y eliminar el listener después de agregar el muro
      /*setTimeout(() => {
          document.body.style.cursor = "default";
          document.removeEventListener("click", clickListener);
      }, 2000); // El tiempo se puede ajustar según la necesidad*/
  });
});
