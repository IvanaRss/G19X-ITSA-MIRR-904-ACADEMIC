
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app import models

from pathlib import Path
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
app = FastAPI(
    title="SIAL - Sistema Inteligente de Aprobaciones Legales",
    description="API para gestionar solicitudes de aprobación de documentos legales.",
    version="0.2.0",
)


@app.on_event("startup")
def iniciar_base_datos():
    Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent / "app"

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)

templates = Jinja2Templates(directory=BASE_DIR / "templates")

class Estado(str, Enum):
    PENDIENTE = "pendiente"
    EN_REVISION = "en_revision"
    APROBADA = "aprobada"
    RECHAZADA = "rechazada"


class SolicitudCrear(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    tipo_documento: str = Field(min_length=2, max_length=80)
    descripcion: str = Field(min_length=5, max_length=1000)
    solicitante: str = Field(min_length=2, max_length=120)


class DecisionSolicitud(BaseModel):
    estado: Estado
    observaciones: str = Field(min_length=3, max_length=1000)


def convertir_solicitud(solicitud):
    return {
        "id": solicitud.id,
        "titulo": solicitud.titulo,
        "tipo_documento": solicitud.tipo_documento,
        "descripcion": solicitud.descripcion,
        "solicitante": solicitud.solicitante,
        "estado": solicitud.estado,
        "riesgo": solicitud.riesgo,
        "prioridad": solicitud.prioridad,
        "fecha_creacion": solicitud.fecha_creacion,
        "historial": [
            {
                "accion": movimiento.accion,
                "observaciones": movimiento.observaciones,
                "fecha": movimiento.fecha,
            }
            for movimiento in solicitud.historial
        ],
    }


@app.get("/", include_in_schema=False)
def inicio(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={}
    )



@app.get("/gestion-solicitudes", include_in_schema=False)
def pagina_solicitudes(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="solicitudes.html",
        context={}
    )

@app.get("/revision-legal", include_in_schema=False)
def pagina_revision(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="revision_legal.html",
        context={}
    )


@app.get("/historial", include_in_schema=False)
def pagina_historial(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="historial.html",
        context={}
    )
@app.get("/nueva-solicitud", include_in_schema=False)
def pagina_nueva_solicitud(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="nueva_solicitud.html",
        context={}
    )

@app.get("/api/historial")
def listar_historial(db: Session = Depends(get_db)):
    movimientos = (
        db.query(models.Historial)
        .order_by(models.Historial.fecha.desc())
        .all()
    )

    return [
        {
            "solicitud_id": movimiento.solicitud_id,
            "documento": movimiento.solicitud.titulo,
            "solicitante": movimiento.solicitud.solicitante,
            "accion": movimiento.accion,
            "observaciones": movimiento.observaciones,
            "fecha": movimiento.fecha,
        }
        for movimiento in movimientos
    ]

@app.post("/solicitudes", status_code=201)
def crear_solicitud(
    datos: SolicitudCrear,
    db: Session = Depends(get_db)
):
    solicitud = models.Solicitud(
        id=str(uuid4()),
        titulo=datos.titulo,
        tipo_documento=datos.tipo_documento,
        descripcion=datos.descripcion,
        solicitante=datos.solicitante,
        estado=Estado.PENDIENTE.value,
        riesgo="medio",
        prioridad="media",
    )

    db.add(solicitud)
    db.flush()

    movimiento = models.Historial(
        solicitud_id=solicitud.id,
        accion="Solicitud creada",
        observaciones="Registro inicial",
    )

    db.add(movimiento)
    db.commit()
    db.refresh(solicitud)

    return convertir_solicitud(solicitud)


@app.get("/solicitudes")
def listar_solicitudes(db: Session = Depends(get_db)):
    solicitudes = (
        db.query(models.Solicitud)
        .order_by(models.Solicitud.fecha_creacion.desc())
        .all()
    )

    return [convertir_solicitud(s) for s in solicitudes]


@app.get("/solicitudes/{solicitud_id}")
def consultar_solicitud(
    solicitud_id: str,
    db: Session = Depends(get_db)
):
    solicitud = db.query(models.Solicitud).filter(
        models.Solicitud.id == solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada"
        )

    return convertir_solicitud(solicitud)


@app.patch("/solicitudes/{solicitud_id}/decision")
def decidir_solicitud(
    solicitud_id: str,
    decision: DecisionSolicitud,
    db: Session = Depends(get_db)
):
    solicitud = db.query(models.Solicitud).filter(
        models.Solicitud.id == solicitud_id
    ).first()

    if solicitud is None:
        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada"
        )

    if solicitud.estado in (
        Estado.APROBADA.value,
        Estado.RECHAZADA.value
    ):
        raise HTTPException(
            status_code=409,
            detail="La solicitud ya tiene una decisión final"
        )

    if decision.estado not in (
        Estado.APROBADA,
        Estado.RECHAZADA
    ):
        raise HTTPException(
            status_code=422,
            detail="La decisión debe ser aprobada o rechazada"
        )

    solicitud.estado = decision.estado.value

    movimiento = models.Historial(
        solicitud_id=solicitud.id,
        accion=f"Solicitud {decision.estado.value}",
        observaciones=decision.observaciones,
    )

    db.add(movimiento)
    db.commit()
    db.refresh(solicitud)

    return convertir_solicitud(solicitud)
