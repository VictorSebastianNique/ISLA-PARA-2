import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from models.reservation import SimularPrecioRequest, SimularPrecioResponse, ProcesarLiquidacionRequest
from database import get_db
from bson import ObjectId
from services.pdf_generator import generar_pdf_liquidacion
from services.notifications import enviar_notificacion

router = APIRouter()

PRECIO_BASE_CUBIERTO = float(os.getenv("PRECIO_BASE_CUBIERTO", "50.00"))

@router.post("/simular-precio", response_model=SimularPrecioResponse)
async def simular_precio(req: SimularPrecioRequest, db=Depends(get_db)):
    precio_cubierto = PRECIO_BASE_CUBIERTO
    
    # Obtener los items desde DB
    object_ids = []
    for item_id in req.items_ids:
        try:
            object_ids.append(ObjectId(item_id))
        except:
            pass
            
    items = await db.items_menu.find({"_id": {"$in": object_ids}}).to_list(length=100)
    
    for item in items:
        precio_cubierto += float(item.get("markup_extra", 0.0))
        
    total_general = precio_cubierto * req.cantidad_personas
    
    return SimularPrecioResponse(
        precio_cubierto=precio_cubierto,
        cantidad_personas=req.cantidad_personas,
        total_general=total_general
    )

@router.post("/procesar-liquidacion")
async def procesar_liquidacion(req: ProcesarLiquidacionRequest, background_tasks: BackgroundTasks, db=Depends(get_db)):
    # 1. Validación de IDs y Cálculo
    precio_cubierto = PRECIO_BASE_CUBIERTO
    object_ids = []
    for item_id in req.items_ids:
        try:
            object_ids.append(ObjectId(item_id))
        except:
            raise HTTPException(status_code=400, detail=f"Invalid ID: {item_id}")
            
    items = await db.items_menu.find({"_id": {"$in": object_ids}}).to_list(length=100)
    if len(items) != len(req.items_ids):
        raise HTTPException(status_code=404, detail="Algunos items no fueron encontrados en el catálogo.")
        
    for item in items:
        precio_cubierto += float(item.get("markup_extra", 0.0))
        
    total_general = precio_cubierto * req.cantidad_personas
    
    # 2. Inserción en DB
    nueva_reserva = {
        "cliente_nombre": req.cliente_nombre,
        "contacto": req.contacto,
        "fecha_evento": req.fecha_evento,
        "cantidad_personas": req.cantidad_personas,
        "precio_unitario_final": precio_cubierto,
        "total_general": total_general,
        "estado": "Liquidada"
    }
    
    reserva_insert = await db.reservas.insert_one(nueva_reserva)
    reserva_id = str(reserva_insert.inserted_id)
    
    detalles = [{"id_reserva": reserva_id, "id_item": str(i["_id"])} for i in items]
    await db.reserva_detalle.insert_many(detalles)
    
    # 3. y 4. Generación PDF (Almacenamiento temporal)
    pdf_path = generar_pdf_liquidacion(nueva_reserva, items)
    
    # 5. Enviar Notificación (En background para no bloquear la respuesta)
    background_tasks.add_task(enviar_notificacion, req.contacto, pdf_path)
    
    return {
        "message": "Liquidación procesada con éxito", 
        "reserva_id": reserva_id,
        "total_general": total_general,
        "pdf_temporal": pdf_path
    }
