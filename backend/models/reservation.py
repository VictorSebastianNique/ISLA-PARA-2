from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.menu import PyObjectId

class SimularPrecioRequest(BaseModel):
    items_ids: List[str]
    cantidad_personas: int

class SimularPrecioResponse(BaseModel):
    precio_cubierto: float
    cantidad_personas: int
    total_general: float

class ProcesarLiquidacionRequest(BaseModel):
    cliente_nombre: str
    contacto: str
    fecha_evento: str
    cantidad_personas: int
    items_ids: List[str]
    servicios_adicionales: Optional[str] = ""

class ReservaDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    cliente_nombre: str
    contacto: str
    fecha_evento: str
    cantidad_personas: int
    precio_unitario_final: float
    total_general: float
    estado: str = "Liquidada"
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ReservaDetalleDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    id_reserva: str
    id_item: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
