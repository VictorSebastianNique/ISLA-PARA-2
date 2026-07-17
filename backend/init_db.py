import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "adredi_db")

async def seed_db():
    print("Connecting to DB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Clean previous data
    await db.categorias_tiempo.delete_many({})
    await db.items_menu.delete_many({})
    
    print("Seeding Categorias...")
    categorias = [
        {"nombre": "Aperitivo", "orden": 1},
        {"nombre": "Entrada", "orden": 2},
        {"nombre": "Fondo", "orden": 3},
        {"nombre": "Bebida", "orden": 4},
        {"nombre": "Postre", "orden": 5},
    ]
    
    cat_result = await db.categorias_tiempo.insert_many(categorias)
    cat_ids = cat_result.inserted_ids
    
    print("Seeding Items...")
    items = [
        {"id_categoria": str(cat_ids[0]), "nombre": "Pisco Sour", "costo_interno": 5.0, "markup_extra": 0.0, "estado": True},
        {"id_categoria": str(cat_ids[0]), "nombre": "Chilcano Premium", "costo_interno": 8.0, "markup_extra": 5.0, "estado": True},
        
        {"id_categoria": str(cat_ids[1]), "nombre": "Causa Limeña", "costo_interno": 10.0, "markup_extra": 0.0, "estado": True},
        {"id_categoria": str(cat_ids[1]), "nombre": "Ceviche de Pescado", "costo_interno": 15.0, "markup_extra": 8.5, "estado": True},
        
        {"id_categoria": str(cat_ids[2]), "nombre": "Lomo Saltado", "costo_interno": 20.0, "markup_extra": 0.0, "estado": True},
        {"id_categoria": str(cat_ids[2]), "nombre": "Cabrito con Frijoles", "costo_interno": 22.0, "markup_extra": 12.0, "estado": True},
        
        {"id_categoria": str(cat_ids[3]), "nombre": "Chicha Morada", "costo_interno": 2.0, "markup_extra": 0.0, "estado": True},
        {"id_categoria": str(cat_ids[3]), "nombre": "Limonada Frozen", "costo_interno": 2.5, "markup_extra": 1.5, "estado": True},
        
        {"id_categoria": str(cat_ids[4]), "nombre": "Crema Volteada", "costo_interno": 4.0, "markup_extra": 0.0, "estado": True},
        {"id_categoria": str(cat_ids[4]), "nombre": "Suspiro a la Limeña", "costo_interno": 5.0, "markup_extra": 3.0, "estado": True},
    ]
    
    await db.items_menu.insert_many(items)
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
