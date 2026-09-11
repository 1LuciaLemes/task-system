# Task System — Requirements

## 1. Descripción

Desarrollar una aplicación web para gestionar tareas de un pequeño
equipo de desarrollo.

La aplicación debe permitir crear, visualizar, actualizar y eliminar
tareas, organizar tareas mediante subtareas con múltiples niveles de
profundidad.

---

## 2. Objetivo

El objetivo es desarrollar una aplicación funcional, mantenible y
fácil de ejecutar localmente.

La aplicación debe incluir:

- Frontend web.
- Backend con API REST.
- Persistencia de datos.
- Tests de la lógica de negocio.
- Ejecución local mediante Docker Compose.
- Documentación clara.

---

# 3. Gestión de tareas

Los usuarios deben poder:

- Crear tareas.
- Visualizar tareas.
- Actualizar tareas.
- Eliminar tareas.
- Visualizar el detalle de una tarea.

Cada tarea debe contener como mínimo:

- `id`
- `title`
- `description`
- `status`
- `priority`
- `estimate`
- `parentTaskId`
- `position`
- `createdAt`
- `updatedAt`

### Título

El título es obligatorio.

Un título compuesto únicamente por espacios debe considerarse inválido.

### Descripción

La descripción es opcional.

### Estimación

La estimación es opcional.

Debe ser un número no negativo.

El valor `0` es válido.

---

# 4. Estados

Las tareas pueden tener los siguientes estados:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETE`

El estado inicial de una nueva tarea será `PENDING`.

El estado de una tarea es independiente del estado de sus tareas
padre o hijas.

Cuando una tarea está `COMPLETE`, su título debe visualizarse
tachado en la interfaz.

---

# 5. Prioridades

Las tareas pueden tener:

- `LOW`
- `MEDIUM`
- `HIGH`

La interfaz debe diferenciar visualmente las prioridades.

Referencia visual:

- LOW → verde
- MEDIUM → amarillo
- HIGH → rojo

La prioridad inicial sugerida para nuevas tareas es `MEDIUM`.

---

# 6. Subtareas

Una tarea puede contener subtareas.

Las subtareas utilizan la misma estructura y reglas que una tarea normal.

Las subtareas pueden contener otras subtareas, permitiendo múltiples
niveles de profundidad.

Ejemplo:

Task A
├── Task A.1
│   ├── Task A.1.1
│   └── Task A.1.2
└── Task A.2

La relación entre una tarea y su padre se representa mediante
`parentTaskId`.

Una tarea raíz tiene `parentTaskId = null`.

El padre de una tarea no puede modificarse desde la edición normal
de la tarea.

---

# 7. Orden de las tareas

Las tareas deben poder tener un orden definido dentro de su mismo
nivel jerárquico.

Para representar este orden se utilizará el campo `position`.

Las tareas raíz se pueden ordenar independientemente.

Las subtareas también se pueden ordenar independientemente dentro de
su tarea padre.

La posibilidad de modificar el orden mediante drag & drop es una
funcionalidad deseable, pero no es prioritaria frente a los requisitos
obligatorios.

---

# 8. Eliminación

Eliminar una tarea requiere confirmación del usuario.

Si la tarea tiene descendientes, la eliminación debe eliminar también
todos sus descendientes.

Si existen descendientes incompletos, la confirmación debe advertir
explícitamente al usuario antes de eliminar.

Ejemplo:

"Tenés tareas incompletas, ¿aún así deseás eliminar la tarea X?"

Si los descendientes están completos, la confirmación debe informar
que las subtareas también serán eliminadas.

---

# 9. Estimación

Cada tarea puede tener una estimación individual de esfuerzo, opcional y
expresada en horas (número no negativo; `0` válido).

La aplicación debe ayudar al equipo a entender su carga de trabajo
mostrando un resumen del esfuerzo estimado:
- cuánto trabajo aún no empezó (suma de estimaciones de tareas pendientes);
- cuánto está en progreso (suma de estimaciones de tareas en progreso);
- el esfuerzo estimado total.

Estas sumas deben considerar toda la jerarquía de subtareas: el esfuerzo
de una tarea incluye el de sus descendientes en cualquier nivel de
profundidad.

De los criterios del campo estimación se encarga la sección de campos
básicos (número no negativo, `0` válido).

---

# 10. Interfaz principal

La aplicación debe abrir directamente en el dashboard principal.

No se requiere autenticación ni registro de usuarios.

El dashboard debe permitir visualizar las tareas principales.

Las tareas principales deben poder visualizarse como tarjetas organizadas
horizontalmente.

Las subtareas deben visualizarse dentro de su tarea correspondiente,
organizadas verticalmente.

Una tarea debe aparecer aunque no tenga subtareas.

Cada tarjeta debe mostrar como mínimo:

- Título.
- Descripción resumida.
- Prioridad.
- Acceso al detalle.

La descripción puede truncarse visualmente.

Ejemplo:

"Descripción de la tarea blablabla..."

---

# 11. Crear tareas

Debe existir una acción visible para crear una tarea.

La acción puede abrir o expandir un formulario.

Campos:

- Title — obligatorio.
- Description — opcional.
- Status — obligatorio.
- Priority — obligatorio.

Debe existir la posibilidad de confirmar o cancelar la creación.

---

# 12. Detalle de tarea

La vista de detalle debe mostrar toda la información de la tarea.

Desde el detalle se debe poder:

- Editar la tarea.
- Eliminar la tarea.
- Crear una subtarea.
- Visualizar sus subtareas.
- Gestionar las subtareas.

La acción para agregar una subtarea debe ser directa desde el detalle
de la tarea.

La edición y eliminación estarán disponibles mediante un menú de
acciones.

---

# 13. API REST

El backend debe proporcionar una API CRUD para tareas.

Endpoints mínimos:

GET    /tasks
GET    /tasks/:id
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id

Las subtareas utilizarán los mismos endpoints de tareas y se
representarán mediante `parentTaskId`.

No es necesario crear endpoints separados para subtareas.

---

# 14. Persistencia

La aplicación utilizará PostgreSQL como sistema de persistencia.

La lógica de negocio no debe depender directamente de la implementación
concreta de PostgreSQL.

Se busca mantener una separación entre:

- API.
- Lógica de negocio.
- Persistencia.

Esto permitirá utilizar una implementación en memoria durante las
primeras etapas de desarrollo y posteriormente PostgreSQL.

---

# 15. Tests

Se deben implementar tests unitarios para la lógica de negocio.

Como mínimo se deben cubrir las reglas importantes relacionadas con:

- Validación de tareas.
- Estimaciones (validación del campo y cálculo de esfuerzo).
- Jerarquía de tareas.
- Eliminación de descendientes.
- Estados.
- Prioridades.

También es recomendable cubrir mediante tests la API y los flujos
principales de la aplicación cuando el tiempo lo permita.

---

# 16. Docker Compose

La aplicación y sus dependencias deben poder ejecutarse localmente
mediante un único comando de Docker Compose.

El proyecto debe permitir que otra persona clone el repositorio y,
siguiendo el README, pueda ejecutar la aplicación localmente sin
depender de servicios cloud de terceros.

Comando objetivo:

docker compose up

---

# 17. Restricciones

- No se requiere autenticación.
- No se requieren roles o permisos.
- No se requieren servicios cloud de terceros.
- No se requieren cuentas externas.
- No agregar funcionalidades que no sean necesarias para el challenge
  sin una justificación clara.
- Priorizar simplicidad, mantenibilidad y claridad del código.

---

# 18. Nice to have

Las siguientes funcionalidades son deseables pero secundarias:

1. Diseño responsive.
2. Filtros.
3. Ordenamiento.
4. Paginación.
5. Drag & drop para modificar el orden de las tareas.

Los requisitos obligatorios y la estabilidad del proyecto tienen
prioridad sobre estas funcionalidades.

---

# 19. Criterios generales

El proyecto debe:

- Tener una arquitectura clara.
- Mantener responsabilidades separadas.
- Utilizar nombres de variables y funciones en inglés.
- Mantener código consistente y legible.
- Tener tests para la lógica importante.
- Tener documentación clara.
- Tener un historial de commits que refleje el proceso de desarrollo.

La documentación Markdown del proyecto se escribirá en español.

Los commits se escribirán en español.

---

# 20. Uso de IA

Se permite y fomenta el uso de herramientas de IA.

Cuando se utilice un coding agent, se deben incluir en el repositorio
los archivos de configuración correspondientes.

El código generado o asistido por IA debe ser revisado, comprendido
y probado antes de considerarse terminado.

La responsabilidad final sobre la calidad, corrección y consistencia
del código corresponde al desarrollador.
