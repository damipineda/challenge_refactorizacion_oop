class Mapa {
    constructor(filas, columnas) {
        // Inicializa el mapa con las filas y columnas especificadas
        this.filas = filas;
        this.columnas = columnas;
        // Crea una tabla bidimensional para representar el escenario
        this.escenario = this.creaTabla(filas, columnas);
        // Lista de casillas abiertas (por explorar)
        this.casillaAbierta = [];
        // Lista de casillas cerradas (ya exploradas)
        this.casillaCerrada = [];
        // Camino encontrado desde el inicio hasta el fin
        this.camino = [];
        // Bandera que indica si el algoritmo ha terminado
        this.terminado = false;
        // Casilla de inicio
        this.principio = null;
        // Casilla de fin
        this.fin = null;
    }
  
    creaTabla(filas, columnas) {
        // Crea una tabla bidimensional vacía con las filas y columnas especificadas
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
        // Calcula la distancia Manhattan entre dos casillas a y b
        let x = Math.abs(a.x - b.x);
        let y = Math.abs(a.y - b.y);
        return x + y;
    }
  
    borraDelArray(array, elemento) {
        // Elimina un elemento de un array
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i] === elemento) {
                array.splice(i, 1);
            }
        }
    }
  
    inicializa() {
        // Inicializa cada casilla del escenario y les agrega sus vecinos
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
        // Dibuja el mapa en el HTML
        this.dibujaMapa();
    }
  
    dibujaMapa() {
        // Dibuja el mapa en una tabla HTML
        let tabla = document.getElementById('mapa');
        tabla.innerHTML = '';
        for (let i = 0; i < this.filas; i++) {
            let fila = document.createElement('tr');
            for (let j = 0; j < this.columnas; j++) {
                let celda = document.createElement('td');
                celda.textContent = `${j},${i}`;
                // Asigna clases CSS según el tipo de casilla
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
        // Actualiza las casillas de inicio y fin a partir de los inputs del HTML
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
                // Reinicia el algoritmo y lo ejecuta
                this.reiniciaAlgoritmo();
                this.principal();
            } else {
                alert('Coordenadas inválidas. Deben estar dentro del rango 0-24.');
            }
        } else {
            alert('Formato de coordenadas incorrecto. Use el formato x,y.');
        }
    }
  
    isValidCoord(x, y) {
        // Verifica si una coordenada está dentro de los límites del escenario
        return x >= 0 && x < this.columnas && y >= 0 && y < this.filas;
    }
  
    reiniciaAlgoritmo() {
        // Reinicia las listas y banderas del algoritmo
        this.casillaAbierta = [this.principio];
        this.casillaCerrada = [];
        this.camino = [];
        this.terminado = false;
        // Vuelve a dibujar el mapa
        this.dibujaMapa();
    }
  
    algoritmo() {
        // Ejecuta un paso del algoritmo A*
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
                    // Si se encontró el camino, se guarda en la lista de camino
                    let temporal = actual;
                    this.camino.push(temporal);
                    while (temporal.padre != null) {
                        temporal = temporal.padre;
                        this.camino.push(temporal);
                    }
                    this.terminado = true;
                    alert('camino encontrado');
                } else {
                    // Se explora la casilla actual y se actualizan sus vecinos
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
                // Si no hay camino posible, se muestra un mensaje
                alert('No hay un camino posible');
                this.terminado = true;
            }
        }
    }
  
    principal() {
        // Ejecuta el algoritmo A* hasta encontrar el camino o determinar que no hay camino posible
        while (!this.terminado) {
            this.algoritmo();
        }
        // Vuelve a dibujar el mapa con el camino encontrado
        this.dibujaMapa();
        // Muestra las casillas visitadas en el HTML
        this.imprimeResultado();
    }
  
    imprimeResultado() {
        // Muestra las casillas visitadas en el HTML
        let resultado = document.getElementById('resultado');
        resultado.innerHTML = 'Casilla visitadas:<br>';
        for (let i = this.camino.length - 1; i >= 0; i--) {
            resultado.innerHTML += `(${this.camino[i].x},${this.camino[i].y}) `;
        }
        resultado.innerHTML += '<br>Total de casilla visitadas: ' + this.camino.length;
    }
  
    agregarMuro(event) {
        // Agrega o quita un muro en la casilla clickeada
        if (event.target.tagName === "TD") {
            let x = parseInt(event.target.textContent.split(",")[0]);
            let y = parseInt(event.target.textContent.split(",")[1]);
            this.escenario[y][x].tipo = this.escenario[y][x].tipo === 1 ? 0 : 1;
            // Vuelve a dibujar el mapa
            this.dibujaMapa();
        }
    }
  }
  
  class Casilla {
    constructor(x, y, mapa) {
        // Inicializa una casilla con su posición y el mapa al que pertenece
        this.x = x;
        this.y = y;
        // Tipo de casilla (0: libre, 1: muro)
        this.tipo = 0;
        // Costo real desde el inicio hasta la casilla actual
        this.f = 0;
        // Costo estimado desde la casilla actual hasta el fin
        this.g = 0;
        // Costo total (f + g)
        this.h = 0;
        // Lista de vecinos de la casilla
        this.vecinos = [];
        // Casilla padre en el camino
        this.padre = null;
        this.mapa = mapa;
  
        // Asigna un tipo aleatorio a la casilla (20% de probabilidad de ser un muro)
        let aleatorio = Math.floor(Math.random() * 5);
        if (aleatorio === 1) this.tipo = 1;
    }
  
    addVecinos() {
        // Agrega los vecinos de la casilla en las 4 direcciones cardinales
        if (this.x > 0) this.vecinos.push(this.mapa.escenario[this.y][this.x - 1]);
        if (this.x < this.mapa.columnas - 1) this.vecinos.push(this.mapa.escenario[this.y][this.x + 1]);
        if (this.y > 0) this.vecinos.push(this.mapa.escenario[this.y - 1][this.x]);
        if (this.y < this.mapa.filas - 1) this.vecinos.push(this.mapa.escenario[this.y + 1][this.x]);
    }
  }
  
  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    // Crea un mapa de 25x25 casillas
    const mapa = new Mapa(25, 25);
    // Inicializa el mapa
    mapa.inicializa();
  
    // Actualiza el inicio y fin del algoritmo al clickear el botón "Actualizar"
    document.getElementById('acturalizar').onclick = () => mapa.actualizaInicioFin();
  
    // Actualiza el inicio y fin del algoritmo al presionar Enter en los inputs de inicio y fin
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
  
    // Agrega un muro al clickear el botón "Agregar muro"
    document.getElementById("agregarMuroButton").addEventListener("click", function() {
        // Cambia el cursor a una mira
        document.body.style.cursor = "crosshair";
        const clickListener = function(event) {
            mapa.agregarMuro(event);
        };
        // Agrega un listener para clickear en una casilla
        document.addEventListener("click", clickListener);
  
        /*setTimeout(() => {
            // Vuelve a cambiar el cursor a normal y elimina el listener después de 2 segundos
            document.body.style.cursor = "default";
            document.removeEventListener("click", clickListener);
        }, 2000); // El tiempo se puede ajustar según la necesidad*/
    });
  });
  