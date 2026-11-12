
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def fecha_actual():
    return datetime.now(timezone.utc)


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    nombre: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(
        String(150), unique=True, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(String(30))

    historial: Mapped[list["Historial"]] = relationship(
        back_populates="usuario"
    )


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True
    )
    titulo: Mapped[str] = mapped_column(String(150))
    tipo_documento: Mapped[str] = mapped_column(String(80))
    descripcion: Mapped[str] = mapped_column(Text)
    solicitante: Mapped[str] = mapped_column(String(120))

    estado: Mapped[str] = mapped_column(
        String(30), default="pendiente"
    )
    riesgo: Mapped[str] = mapped_column(
        String(30), default="medio"
    )
    prioridad: Mapped[str] = mapped_column(
        String(30), default="media"
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=fecha_actual
    )

    historial: Mapped[list["Historial"]] = relationship(
        back_populates="solicitud",
        cascade="all, delete-orphan"
    )


class Historial(Base):
    __tablename__ = "historial"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    solicitud_id: Mapped[str] = mapped_column(
        ForeignKey("solicitudes.id")
    )
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"), nullable=True
    )

    accion: Mapped[str] = mapped_column(String(100))
    observaciones: Mapped[str] = mapped_column(Text)
    fecha: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=fecha_actual
    )

    solicitud: Mapped["Solicitud"] = relationship(
        back_populates="historial"
    )
    usuario: Mapped["Usuario"] = relationship(
        back_populates="historial"
    )
