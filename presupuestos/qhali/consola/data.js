// Qhali — Consola. Distribuidores y costos REALES tomados de las listas:
//  · Merci: lista mayorista (GestionNube) — alimentos
//  · Natier: Caminos Distribuciones, Santa Fe — suplementos / apícola / cosmética
window.QhaliAdmin = {
  distribuidores: [
    { id: 'd1', nombre: 'Merci Alimentos (mayorista)', contacto: 'gestionnube.com/lista-precios', tel: '342-5311386' },
    { id: 'd2', nombre: 'Natier — J. y C. Caminos', contacto: 'Distribución Santa Fe', tel: '342-6400003' },
  ],
  // precio_lista = costo mayorista real de lista; margen ilustrativo
  // precio_final = round(precio_lista * (1 + margen))  ← trigger
  // Margen ajustado por producto para que el precio calculado coincida
  // exactamente con el precio publicado en la tienda (~45% / ~43%).
  costos: {
    p1:  { precio_lista: 1375, margen: 0.4473, prov: 'd1' },   // Nuez mariposa 1kg $13.750 → x100g → $1.990
    p4:  { precio_lista: 3886, margen: 0.4488, prov: 'd1' },   // Pistacho salado 1kg $38.860 → $5.630
    p11: { precio_lista: 770,  margen: 0.4545, prov: 'd1' },   // Chía 1kg $7.700 → $1.120
    p13: { precio_lista: 5440, margen: 0.4504, prov: 'd1' },   // Granola Meraki doypack → $7.890
    p22: { precio_lista: 6110, margen: 0.45, prov: 'd1' },     // Aceite coco Oh Yeah → $8.860
    p23: { precio_lista: 2210, margen: 0.448, prov: 'd1' },    // Yerba Ajedrez premium 500g → $3.200
    p26: { precio_lista: 12590, margen: 0.4297, prov: 'd2' },  // Propóleo fuerte 125 → $18.000
    p27: { precio_lista: 16785, margen: 0.42985, prov: 'd2' }, // Magnesio citrato 50 cap → $24.000
    p29: { precio_lista: 18881, margen: 0.43, prov: 'd2' },    // Shampoo sólido detox → $27.000
  },
  pedidos: [
    { id: 'a3f9', cliente: 'María Gómez', tipo: 'envio_nacional', items: 4, total: 8460, estado: 'pendiente', fecha: 'Hoy 10:24' },
    { id: 'b7c1', cliente: 'Lucas Ferreyra', tipo: 'retiro_local', items: 2, total: 3280, estado: 'pagado', fecha: 'Hoy 09:05' },
    { id: 'c2d8', cliente: 'Sofía Ibáñez', tipo: 'retiro_local', items: 6, total: 12550, estado: 'preparado', fecha: 'Ayer 18:40' },
    { id: 'e5f0', cliente: 'Diego Roldán', tipo: 'envio_nacional', items: 3, total: 6120, estado: 'despachado', fecha: 'Ayer 16:12' },
    { id: 'g8h2', cliente: 'Ana Paredes', tipo: 'retiro_local', items: 1, total: 1490, estado: 'entregado', fecha: '12 jul 11:30' },
  ],
};
