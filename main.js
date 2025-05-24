// Constantes del sistema
const ESTADOS_SALUD_PERMITIDOS = ['Excelente', 'Bueno', 'Regular', 'Malo', 'En tratamiento'];
const DELAY_REGISTRO_DUEÑO = 1500;
const DELAY_REGISTRO_MASCOTA = 2000;
const DELAY_BUSQUEDA = 1500;
const DELAY_ACTUALIZACION = 1000;
const DELAY_ELIMINACION = 2000;
const DELAY_CONSULTA = 2000;

function generarIdUnico() {
    return Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function registrarDueño(callback) {
    console.log("Iniciando registro de dueño...");
    
    const id = generarIdUnico();
    const nombre = prompt("Ingrese el nombre del dueño:");
    if (!nombre) {
        alert("El nombre no puede estar vacío");
        return callback(null);
    }

    const cedula = prompt("Ingrese la cédula del dueño:");
    if (!cedula) {
        alert("La cédula no puede estar vacía");
        return callback(null);
    }

    const telefono = prompt("Ingrese el teléfono del dueño:");
    if (!telefono) {
        alert("El teléfono no puede estar vacío");
        return callback(null);
    }

    const correo = prompt("Ingrese el correo electrónico del dueño:");
    if (!correo || !validarEmail(correo)) {
        alert("Correo electrónico no válido");
        return callback(null);
    }

    console.log("Validando datos del dueño...");
    
    setTimeout(() => {
        const dueño = { id, nombre, cedula, telefono, correo };
        const dueños = JSON.parse(sessionStorage.getItem("dueños") || "[]");
        
        if (dueños.some(d => d.cedula === cedula)) {
            alert("Error: Ya existe un dueño con esta cédula");
            return callback(null);
        }
        
        dueños.push(dueño);
        sessionStorage.setItem("dueños", JSON.stringify(dueños));
        console.log("Dueño registrado correctamente");
        callback(dueño);
    }, DELAY_REGISTRO_DUEÑO);
}

function registrarMascota(callback) {
    console.log("Iniciando registro de mascota...");
    
    const cedulaDueño = prompt("Ingrese la cédula del dueño:");
    if (!cedulaDueño) {
        alert("La cédula del dueño es obligatoria");
        return callback(null);
    }

    console.log("Verificando existencia del dueño...");
    
    setTimeout(() => {
        const dueños = JSON.parse(sessionStorage.getItem("dueños") || "[]");
        const dueñoExistente = dueños.find(d => d.cedula === cedulaDueño);
        
        if (!dueñoExistente) {
            alert("Error: No existe un dueño con esa cédula");
            return callback(null);
        }

        const id = generarIdUnico();
        const nombre = prompt("Ingrese el nombre de la mascota:");
        if (!nombre) {
            alert("El nombre no puede estar vacío");
            return callback(null);
        }

        const especie = prompt("Ingrese la especie de la mascota:");
        if (!especie) {
            alert("La especie no puede estar vacía");
            return callback(null);
        }

        const edad = parseFloat(prompt("Ingrese la edad de la mascota (en años):"));
        if (isNaN(edad) || edad <= 0) {
            alert("La edad debe ser un número positivo");
            return callback(null);
        }

        const peso = parseFloat(prompt("Ingrese el peso de la mascota (en kg):"));
        if (isNaN(peso) || peso <= 0) {
            alert("El peso debe ser un número positivo");
            return callback(null);
        }

        const salud = prompt(`Ingrese el estado de salud (${ESTADOS_SALUD_PERMITIDOS.join(", ")}):`);
        if (!ESTADOS_SALUD_PERMITIDOS.includes(salud)) {
            alert("Estado de salud no válido");
            return callback(null);
        }

        const mascota = {
            id,
            nombre,
            especie,
            edad,
            peso,
            salud,
            cedulaDueño
        };

        const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
        mascotas.push(mascota);
        sessionStorage.setItem("mascotas", JSON.stringify(mascotas));
        console.log("Mascota registrada correctamente");
        callback(mascota);
    }, DELAY_REGISTRO_MASCOTA);
}

async function listarMascotas() {
    console.log("Cargando lista de mascotas...");
    await delay(DELAY_CONSULTA);
    
    const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
    const dueños = JSON.parse(sessionStorage.getItem("dueños") || "[]");
    
    if (mascotas.length === 0) {
        alert("No hay mascotas registradas");
        return;
    }
    
    let mensaje = "Mascotas registradas:\n\n";
    mascotas.forEach(mascota => {
        const dueño = dueños.find(d => d.cedula === mascota.cedulaDueño) || { nombre: "Dueño no encontrado" };
        mensaje += `Nombre: ${mascota.nombre}\n`;
        mensaje += `Especie: ${mascota.especie}\n`;
        mensaje += `Edad: ${mascota.edad} años\n`;
        mensaje += `Peso: ${mascota.peso} kg\n`;
        mensaje += `Salud: ${mascota.salud}\n`;
        mensaje += `Dueño: ${dueño.nombre} (${mascota.cedulaDueño})\n\n`;
    });
    
    alert(mensaje);
}

function buscarMascotaPorNombre(nombre) {
    return new Promise((resolve) => {
        console.log(`Buscando mascota: ${nombre}...`);
        
        setTimeout(() => {
            const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
            const resultados = mascotas.filter(m => 
                m.nombre.toLowerCase().includes(nombre.toLowerCase())
            );
            
            if (resultados.length === 0) {
                alert(`No se encontraron mascotas con el nombre: ${nombre}`);
                resolve([]);
            } else {
                resolve(resultados);
            }
        }, DELAY_BUSQUEDA);
    });
}

async function actualizarSaludMascota() {
    const nombre = prompt("Ingrese el nombre de la mascota a actualizar:");
    if (!nombre) return;

    console.log(`Buscando mascota ${nombre} para actualizar...`);
    const mascotasEncontradas = await buscarMascotaPorNombre(nombre);
    
    if (mascotasEncontradas.length === 0) return;
    
    const mascota = mascotasEncontradas[0];
    const nuevoEstado = prompt(
        `Estado actual: ${mascota.salud}\nNuevo estado (${ESTADOS_SALUD_PERMITIDOS.join(", ")}):`
    );
    
    if (!ESTADOS_SALUD_PERMITIDOS.includes(nuevoEstado)) {
        alert("Estado de salud no válido");
        return;
    }

    console.log("Actualizando estado de salud...");
    await delay(DELAY_ACTUALIZACION);
    
    const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
    const mascotaActualizada = mascotas.find(m => m.id === mascota.id);
    mascotaActualizada.salud = nuevoEstado;
    sessionStorage.setItem("mascotas", JSON.stringify(mascotas));
    
    alert(`Estado de salud de ${mascota.nombre} actualizado a: ${nuevoEstado}`);
}

function eliminarMascotaPorNombre(nombre) {
    return new Promise((resolve) => {
        console.log(`Iniciando proceso de eliminación para: ${nombre}...`);
        
        setTimeout(async () => {
            const mascotasEncontradas = await buscarMascotaPorNombre(nombre);
            if (mascotasEncontradas.length === 0) return resolve(false);
            
            const mascota = mascotasEncontradas[0];
            const confirmacion = confirm(`¿Está seguro de eliminar a ${mascota.nombre} (${mascota.especie})?`);
            
            if (!confirmacion) return resolve(false);
            
            const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
            const nuevasMascotas = mascotas.filter(m => m.id !== mascota.id);
            sessionStorage.setItem("mascotas", JSON.stringify(nuevasMascotas));
            
            alert(`${mascota.nombre} ha sido eliminado correctamente`);
            resolve(true);
        }, DELAY_ELIMINACION);
    });
}

async function mostrarMascotasDeDueño() {
    const cedula = prompt("Ingrese la cédula del dueño:");
    if (!cedula) return;

    console.log(`Buscando mascotas del dueño con cédula: ${cedula}...`);
    await delay(DELAY_CONSULTA);
    
    const dueños = JSON.parse(sessionStorage.getItem("dueños") || "[]");
    const dueño = dueños.find(d => d.cedula === cedula);
    
    if (!dueño) {
        alert("No se encontró un dueño con esa cédula");
        return;
    }
    
    const mascotas = JSON.parse(sessionStorage.getItem("mascotas") || "[]");
    const mascotasDueño = mascotas.filter(m => m.cedulaDueño === cedula);
    
    if (mascotasDueño.length === 0) {
        alert(`${dueño.nombre} no tiene mascotas registradas`);
        return;
    }
    
    let mensaje = `Mascotas de ${dueño.nombre} (${cedula}):\n\n`;
    mascotasDueño.forEach(mascota => {
        mensaje += `Nombre: ${mascota.nombre}\n`;
        mensaje += `Especie: ${mascota.especie}\n`;
        mensaje += `Edad: ${mascota.edad} años\n`;
        mensaje += `Peso: ${mascota.peso} kg\n`;
        mensaje += `Salud: ${mascota.salud}\n\n`;
    });
    
    alert(mensaje);
}

async function mostrarMenu() {
    while (true) {
        const opcion = prompt(`🐾 Sistema Veterinario 🐾
1. Registrar nuevo dueño
2. Registrar nueva mascota
3. Listar todas las mascotas
4. Buscar mascota por nombre
5. Actualizar estado de salud
6. Eliminar mascota por nombre
7. Ver mascotas de un dueño
8. Salir

Seleccione una opción:`);

        switch (opcion) {
            case "1":
                registrarDueño((dueño) => {
                    if (dueño) alert(`Dueño ${dueño.nombre} registrado con éxito!`);
                });
                break;
            case "2":
                registrarMascota((mascota) => {
                    if (mascota) alert(`Mascota ${mascota.nombre} registrada con éxito!`);
                });
                break;
            case "3":
                await listarMascotas();
                break;
            case "4":
                const nombreBusqueda = prompt("Ingrese el nombre de la mascota a buscar:");
                if (nombreBusqueda) {
                    const resultados = await buscarMascotaPorNombre(nombreBusqueda);
                    if (resultados.length > 0) {
                        alert(`Encontrada: ${resultados[0].nombre} (${resultados[0].especie})`);
                    }
                }
                break;
            case "5":
                await actualizarSaludMascota();
                break;
            case "6":
                const nombreEliminar = prompt("Ingrese el nombre de la mascota a eliminar:");
                if (nombreEliminar) {
                    await eliminarMascotaPorNombre(nombreEliminar);
                }
                break;
            case "7":
                await mostrarMascotasDeDueño();
                break;
            case "8":
                alert("Saliendo del sistema...");
                return;
            default:
                alert("Opción no válida. Intente nuevamente.");
        }
    }
}

mostrarMenu();