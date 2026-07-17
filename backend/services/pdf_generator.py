import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime

def generar_pdf_liquidacion(datos_reserva: dict, items_detallados: list) -> str:
    # Ruta temporal para guardar el PDF
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"liquidacion_{timestamp}.pdf"
    filepath = os.path.join("/tmp" if os.name != "nt" else os.environ.get("TEMP", "C:\\temp"), filename)
    
    # Crear directorio temp si no existe en Windows
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "ADREDI Solutions - Liquidación de Servicio")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Cliente: {datos_reserva['cliente_nombre']}")
    c.drawString(50, height - 100, f"Contacto: {datos_reserva['contacto']}")
    c.drawString(50, height - 120, f"Fecha Evento: {datos_reserva['fecha_evento']}")
    c.drawString(50, height - 140, f"Personas: {datos_reserva['cantidad_personas']}")
    
    # Detalles del Menú
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 180, "Menú Seleccionado:")
    
    y = height - 200
    c.setFont("Helvetica", 12)
    for item in items_detallados:
        texto_item = f"- {item['nombre']} (Extra: S/ {item.get('markup_extra', 0.0):.2f})"
        c.drawString(60, y, texto_item)
        y -= 20
    
    # Totales
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Precio por Cubierto: S/ {datos_reserva['precio_unitario_final']:.2f}")
    y -= 20
    c.drawString(50, y, f"TOTAL A PAGAR: S/ {datos_reserva['total_general']:.2f}")
    
    c.save()
    
    return filepath
