# SIAL
## Sistema Inteligente de Aprobaciones Legales

SIAL es una aplicación web desarrollada para gestionar solicitudes de aprobación de documentos legales, permitiendo registrar, consultar, revisar y dar seguimiento a las decisiones mediante un historial de movimientos.

## Tecnologías utilizadas

- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- HTML
- CSS
- JavaScript

## Funcionalidades implementadas

- Registro de solicitudes de aprobación.
- Consulta y gestión de solicitudes.
- Búsqueda y filtrado de solicitudes.
- Revisión de documentos legales.
- Aprobación o rechazo de solicitudes.
- Registro de observaciones.
- Historial de movimientos.
- Panel principal con indicadores.

## Estructura del proyecto

```text
SIAL/
├── backend/
│   ├── app/
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── routes/
│   │   ├── static/
│   │   └── templates/
│   ├── main.py
│   └── requirements.txt
├── docs/
│   └── MVP.md
├── .env.example
├── .gitignore
└── README.md
```

## Requisitos previos

- Python 3.12 o superior.
- PowerShell.
- Visual Studio Code (recomendado).

## Instalación

1. Abrir PowerShell.
2. Ubicarse en la carpeta del backend:

```powershell
cd C:\Users\Mono\SIAL\backend
```

3. Crear el entorno virtual si todavía no existe:

```powershell
python -m venv .venv
```

4. Instalar las dependencias:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Ejecución

Desde la carpeta `backend`, ejecutar:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Abrir en el navegador:

- Aplicación: http://127.0.0.1:8000/
- Documentación de API: http://127.0.0.1:8000/docs

Para detener el servidor, presionar `Ctrl + C` en PowerShell.

## Documentación adicional

La descripción del alcance y las funcionalidades del producto mínimo viable se encuentra en:

`docs/MVP.md`

## Funcionalidades futuras

- Autenticación y control de acceso por roles.
- Clasificación inteligente automatizada.
- Firma electrónica avanzada.
- Integraciones con plataformas externas.
- Incorporación de modelos de inteligencia artificial.

## Estado del proyecto

Versión MVP: aplicación web funcional para la gestión del flujo básico de aprobación de documentos legales.