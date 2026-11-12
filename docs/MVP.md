# MVP - Sistema Inteligente de Aprobaciones Legales (SIAL)

## 1. Objetivo

Desarrollar una aplicación web que permita gestionar solicitudes de aprobación de documentos legales, facilitando su registro, consulta, revisión, toma de decisiones y seguimiento mediante un historial de movimientos.

## 2. Alcance del MVP

La primera versión funcional contempla los siguientes módulos:

### 2.1. Registro de solicitudes
- Registrar nuevas solicitudes.
- Capturar título, tipo de documento, nombre del solicitante y descripción.
- Guardar la información en una base de datos SQLite.
- Asignar un identificador único y un estado inicial pendiente.

### 2.2. Gestión de solicitudes
- Consultar las solicitudes registradas.
- Buscar solicitudes.
- Filtrar solicitudes por estado.
- Consultar los detalles de cada solicitud.

### 2.3. Revisión legal
- Consultar las solicitudes pendientes.
- Revisar la información registrada.
- Aprobar o rechazar solicitudes.
- Registrar observaciones relacionadas con la decisión.

### 2.4. Historial de movimientos
- Registrar la creación de solicitudes.
- Registrar las decisiones de aprobación o rechazo.
- Consultar las acciones realizadas.
- Visualizar las observaciones y fechas de cada movimiento.

### 2.5. Panel principal
- Visualizar indicadores generales.
- Consultar las solicitudes registradas.
- Dar seguimiento a los estados de las solicitudes.

## 3. Flujo principal

1. El solicitante registra una nueva solicitud.
2. La aplicación almacena la información.
3. La solicitud queda registrada con estado pendiente.
4. El revisor legal consulta la solicitud.
5. El revisor analiza la información.
6. El revisor aprueba o rechaza la solicitud y registra observaciones.
7. La aplicación actualiza el estado.
8. La decisión queda registrada en el historial.

## 4. Tecnologías utilizadas

- Python.
- FastAPI.
- SQLAlchemy.
- SQLite.
- HTML.
- CSS.
- JavaScript.

## 5. Estado de implementación

Las funcionalidades implementadas y probadas comprenden el registro, consulta y gestión de solicitudes, la revisión legal, la aprobación o rechazo y el historial de movimientos.

Los campos de riesgo y prioridad existen en el modelo de datos y cuentan con valores predeterminados. Sin embargo, no representan todavía una clasificación automática inteligente.

## 6. Fuera del alcance de esta versión

- Autenticación y control de acceso por roles.
- Clasificación inteligente automatizada de documentos.
- Firma electrónica avanzada.
- Integraciones con plataformas externas.
- Modelo de inteligencia artificial entrenado.

## 7. Resultado del MVP

Se cuenta con una aplicación web funcional que permite administrar el flujo básico de aprobación de documentos legales, desde el registro de una solicitud hasta la resolución y consulta de su historial de movimientos.