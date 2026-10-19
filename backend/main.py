
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(
    title="SIAL - Sistema Inteligente de Aprobaciones Legales",
    description="API para gestionar solicitudes de aprobación de documentos legales.",
    version="0.1.0",
)


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


solicitudes = {}


@app.get("/")
def inicio():
    return {
        "mensaje": "API de SIAL funcionando",
        "documentacion": "/docs",
    }


@app.post("/solicitudes", status_code=201)
def crear_solicitud(datos: SolicitudCrear):
    solicitud_id = str(uuid4())

    solicitud = {
        "id": solicitud_id,
        **datos.model_dump(),
        "estado": Estado.PENDIENTE,
        "fecha_creacion": datetime.now(timezone.utc).isoformat(),
        "historial": [
            {
                "accion": "Solicitud creada",
                "observaciones": "Registro inicial",
                "fecha": datetime.now(timezone.utc).isoformat(),
            }
        ],
    }

    solicitudes[solicitud_id] = solicitud
    return solicitud


@app.get("/solicitudes")
def listar_solicitudes():
    return list(solicitudes.values())


@app.get("/solicitudes/{solicitud_id}")
def consultar_solicitud(solicitud_id: str):
    solicitud = solicitudes.get(solicitud_id)

    if solicitud is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    return solicitud


@app.patch("/solicitudes/{solicitud_id}/decision")
def decidir_solicitud(solicitud_id: str, decision: DecisionSolicitud):
    solicitud = solicitudes.get(solicitud_id)

    if solicitud is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if solicitud["estado"] in (Estado.APROBADA, Estado.RECHAZADA):
        raise HTTPException(
            status_code=409,
            detail="La solicitud ya tiene una decisión final",
        )

    if decision.estado not in (Estado.APROBADA, Estado.RECHAZADA):
        raise HTTPException(
            status_code=422,
            detail="La decisión debe ser aprobada o rechazada",
        )

    fecha = datetime.now(timezone.utc).isoformat()
    solicitud["estado"] = decision.estado
    solicitud["historial"].append(
        {
            "accion": f"Solicitud {decision.estado.value}",
            "observaciones": decision.observaciones,
            "fecha": fecha,
        }
    )

    return solicitud
