from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import menu, reservation

app = FastAPI(title="ADREDI Solutions API", version="1.0.0")

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router, prefix="/api/v1/menu", tags=["Menu"])
app.include_router(reservation.router, prefix="/api/v1/reservas", tags=["Reservations"])

@app.get("/")
def read_root():
    return {"message": "ADREDI Solutions Backend API is running"}
