// Datos iniciales de ejemplo para la Universidad de Guayaquil
const eventosIniciales = [
    {
        id: 1,
        titulo: "Congreso Internacional de Ingeniería de Software e IA",
        categoria: "Académico",
        fecha: "2026-11-25",
        lugar: "Auditorio Facultad de Ciencias Matemáticas y Físicas",
        cupos: 120,
        descripcion: "Ponencias magistrales sobre desarrollo web moderno, inteligencia artificial y ciberseguridad con certificación avalada por la UG."
    },
    {
        id: 2,
        titulo: "Festival Universitario de Música, Danza y Arte UG",
        categoria: "Cultural",
        fecha: "2026-11-28",
        lugar: "Plaza Cívica - Ciudadela Universitaria",
        cupos: 200,
        descripcion: "Encuentro artístico con grupos de danza folclórica, bandas estudiantiles y exposición de pintura de la Facultad de Filosofía."
    },
    {
        id: 3,
        titulo: "Copa Interfacultades de Fútbol Sala Masculino y Femenino",
        categoria: "Deportivo",
        fecha: "2026-12-02",
        lugar: "Coliseo Deportivo Universidad de Guayaquil",
        cupos: 40,
        descripcion: "Torneo relámpago entre facultades. Inscribe a tu equipo o regístrate como espectador oficial."
    }
];

// Cargar datos desde localStorage o usar los iniciales
let eventos = JSON.parse(localStorage.getItem('ug_eventos')) || eventosIniciales;
let inscripciones = JSON.parse(localStorage.getItem('ug_inscripciones')) || [];
let categoriaActual = 'Todos';

// Referencias al DOM
const contenedorEventos = document.getElementById('contenedorEventos');
const buscadorEventos = document.getElementById('buscadorEventos');
const filterBtns = document.querySelectorAll('.filter-btn');
const contadorInscritos = document.getElementById('contadorInscritos');

// Guardar en localStorage
function guardarDatos() {
    localStorage.setItem('ug_eventos', JSON.stringify(eventos));
    localStorage.setItem('ug_inscripciones', JSON.stringify(inscripciones));
    contadorInscritos.textContent = inscripciones.length;
}

// Renderizar tarjetas de eventos
function renderizarEventos() {
    const textoBusqueda = buscadorEventos.value.toLowerCase();
    contenedorEventos.innerHTML = '';

    const filtrados = eventos.filter(ev => {
        const coincideCategoria = categoriaActual === 'Todos' || ev.categoria === categoriaActual;
        const coincideTexto = ev.titulo.toLowerCase().includes(textoBusqueda) || 
                              ev.lugar.toLowerCase().includes(textoBusqueda);
        return coincideCategoria && coincideTexto;
    });

    document.getElementById('totalEventosText').textContent = `Mostrando ${filtrados.length} evento(s)`;

    if (filtrados.length === 0) {
        contenedorEventos.innerHTML = `<p>No se encontraron eventos con esos criterios de búsqueda.</p>`;
        return;
    }

    filtrados.forEach(ev => {
        const sinCupos = ev.cupos <= 0;
        const card = document.createElement('article');
        card.className = 'evento-card';
        card.innerHTML = `
            <div>
                <span class="badge-cat cat-${ev.categoria}">${ev.categoria}</span>
                <h4>${ev.titulo}</h4>
                <div class="evento-meta">
                    <span>📅 <strong>Fecha:</strong> ${ev.fecha}</span>
                    <span>📍 <strong>Lugar:</strong> ${ev.lugar}</span>
                </div>
                <p class="evento-desc">${ev.descripcion}</p>
            </div>
            <div class="card-footer">
                <span class="cupos-info">${sinCupos ? '❌ Cupos agotados' : `🎟️ ${ev.cupos} cupos`}</span>
                <button class="btn btn-primary" ${sinCupos ? 'disabled' : ''} onclick="abrirInscripcion(${ev.id})">
                    ${sinCupos ? 'Cerrado' : 'Inscribirme'}
                </button>
            </div>
        `;
        contenedorEventos.appendChild(card);
    });
}

// Filtros por categoría
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        categoriaActual = btn.dataset.categoria;
        renderizarEventos();
    });
});

// Filtro por buscador
buscadorEventos.addEventListener('input', renderizarEventos);

// Control de Modales
function cerrarModales() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

document.getElementById('btnAbrirModalEvento').addEventListener('click', () => {
    document.getElementById('modalCrearEvento').classList.add('active');
});

document.getElementById('btnVerAsistencia').addEventListener('click', () => {
    renderizarTablaAsistencia();
    document.getElementById('modalAsistencia').classList.add('active');
});

// Registrar nuevo evento
document.getElementById('formNuevoEvento').addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevoEvento = {
        id: Date.now(),
        titulo: document.getElementById('tituloEvento').value,
        categoria: document.getElementById('categoriaEvento').value,
        fecha: document.getElementById('fechaEvento').value,
        lugar: document.getElementById('lugarEvento').value,
        cupos: parseInt(document.getElementById('cuposEvento').value),
        descripcion: document.getElementById('descEvento').value
    };

    eventos.unshift(nuevoEvento);
    guardarDatos();
    renderizarEventos();
    e.target.reset();
    cerrarModales();
});

// Abrir modal de inscripción
window.abrirInscripcion = function(eventoId) {
    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) return;

    document.getElementById('eventoIdInscripcion').value = evento.id;
    document.getElementById('tituloEventoInscripcion').textContent = `Evento: ${evento.titulo}`;
    document.getElementById('modalInscripcion').classList.add('active');
};

// Procesar inscripción
document.getElementById('formInscripcion').addEventListener('submit', (e) => {
    e.preventDefault();
    const eventoId = parseInt(document.getElementById('eventoIdInscripcion').value);
    const evento = eventos.find(ev => ev.id === eventoId);

    if (evento && evento.cupos > 0) {
        evento.cupos -= 1;
        const codigoPase = 'UG-' + Math.floor(100000 + Math.random() * 900000);

        const nuevaInscripcion = {
            codigo: codigoPase,
            nombre: document.getElementById('nombreParticipante').value,
            cedula: document.getElementById('cedulaParticipante').value,
            rol: document.getElementById('rolParticipante').value,
            correo: document.getElementById('correoParticipante').value,
            eventoTitulo: evento.titulo,
            asistio: false
        };

        inscripciones.push(nuevaInscripcion);
        guardarDatos();
        renderizarEventos();
        e.target.reset();
        cerrarModales();
        alert(`¡Inscripción exitosa!\nTu código de pase para el ingreso es: ${codigoPase}`);
    }
});

// Control de asistencia
function renderizarTablaAsistencia() {
    const tbody = document.getElementById('listaAsistenciaBody');
    tbody.innerHTML = '';

    if (inscripciones.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Aún no hay participantes inscritos.</td></tr>`;
        return;
    }

    inscripciones.forEach((ins, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge-pase">${ins.codigo}</span></td>
            <td><strong>${ins.nombre}</strong><br><small>${ins.correo}</small></td>
            <td>${ins.rol}<br><small>ID: ${ins.cedula}</small></td>
            <td>${ins.eventoTitulo}</td>
            <td>
                <label style="cursor:pointer; font-weight:600; color: ${ins.asistio ? '#059669' : '#64748B'}">
                    <input type="checkbox" ${ins.asistio ? 'checked' : ''} onchange="toggleAsistencia(${index})">
                    ${ins.asistio ? '✅ Asistió' : 'Pendiente'}
                </label>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.toggleAsistencia = function(index) {
    inscripciones[index].asistio = !inscripciones[index].asistio;
    guardarDatos();
    renderizarTablaAsistencia();
};

// Inicializar aplicación
contadorInscritos.textContent = inscripciones.length;
renderizarEventos();
