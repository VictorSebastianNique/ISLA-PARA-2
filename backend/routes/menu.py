from fastapi import APIRouter, Depends
from typing import List
from models.menu import CategoriaResponse, ItemMenu
from database import get_db

router = APIRouter()

@router.get("/opciones", response_model=List[CategoriaResponse])
async def get_menu_opciones(db=Depends(get_db)):
    categorias_cursor = db.categorias_tiempo.find().sort("orden", 1)
    categorias = await categorias_cursor.to_list(length=100)
    
    result = []
    for cat in categorias:
        items_cursor = db.items_menu.find({"id_categoria": str(cat["_id"]), "estado": True})
        items = await items_cursor.to_list(length=100)
        
        cat_response = CategoriaResponse(
            _id=cat["_id"],
            nombre=cat["nombre"],
            orden=cat["orden"],
            items=[ItemMenu(**item) for item in items]
        )
        result.append(cat_response)
        
    return result
