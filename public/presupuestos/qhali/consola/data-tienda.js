// Qhali — catálogo con PRODUCTOS REALES de los proveedores:
//  · Merci (lista mayorista GestionNube, 342-5311386) → alimentos
//  · Natier (Caminos Distribuciones, Santa Fe) → suplementos, apícola y cosmética natural
// Precios minoristas ilustrativos derivados de las listas (granel fraccionado a 100 g).
window.QhaliData = {
  categorias: ['Todos', 'Frutos secos', 'Mix y snacks', 'Frutas secas', 'Semillas', 'Granolas y barritas', 'Harinas', 'Especias', 'Endulzantes y dulces', 'Pastas', 'Aceites y vinagres', 'Yerbas', 'Gluten free', 'Miel y propóleo', 'Suplementos', 'Cosmética natural'],
  rubrosDestacados: [
    { cat: 'Frutos secos', icon: 'Nut', desc: 'Nueces, almendras, pistachos' },
    { cat: 'Gluten free', icon: 'Cookie', desc: 'Alfajores, budines, panes' },
    { cat: 'Granolas y barritas', icon: 'Wheat', desc: 'Meraki y Vitalgy' },
    { cat: 'Suplementos', icon: 'Pill', desc: 'Magnesio, spirulina y más' },
    { cat: 'Miel y propóleo', icon: 'Hexagon', desc: 'Noble Apicultor' },
    { cat: 'Cosmética natural', icon: 'Flower2', desc: 'Botanika y Holistica' },
  ],
  // unit "x 100 g" = granel fraccionado; el resto, envase cerrado
  productos: [
    { id: 'p1', sku: 'FS-NUE1', nombre: 'Nuez mariposa extra light', categoria: 'Frutos secos', unit: 'x 100 g', precio_final: 1990, stock: 40 },
    { id: 'p2', sku: 'FS-ALM1', nombre: 'Almendras Non Pareil', categoria: 'Frutos secos', unit: 'x 100 g', precio_final: 3890, stock: 25 },
    { id: 'p3', sku: 'FS-CAJ4', nombre: 'Castañas de cajú W4', categoria: 'Frutos secos', unit: 'x 100 g', precio_final: 2060, stock: 18 },
    { id: 'p4', sku: 'FS-PIS1', nombre: 'Pistachos salados c/cáscara', categoria: 'Frutos secos', unit: 'x 100 g', precio_final: 5630, stock: 2 },
    { id: 'p5', sku: 'MX-DEP1', nombre: 'Mix deportivo premium', categoria: 'Mix y snacks', unit: 'x 100 g', precio_final: 1850, stock: 30 },
    { id: 'p6', sku: 'MX-SEM1', nombre: 'Mix de semillas', categoria: 'Mix y snacks', unit: 'x 100 g', precio_final: 660, stock: 50 },
    { id: 'p7', sku: 'MX-MAI1', nombre: 'Maíz frito natural', categoria: 'Mix y snacks', unit: 'x 100 g', precio_final: 1500, stock: 22 },
    { id: 'p8', sku: 'FD-ARA1', nombre: 'Arándanos deshidratados', categoria: 'Frutas secas', unit: 'x 100 g', precio_final: 2250, stock: 15 },
    { id: 'p9', sku: 'FD-DAT1', nombre: 'Dátiles Argelia', categoria: 'Frutas secas', unit: 'x 100 g', precio_final: 1560, stock: 28 },
    { id: 'p10', sku: 'FD-CIR1', nombre: "Ciruelas d'Agen sin carozo", categoria: 'Frutas secas', unit: 'x 100 g', precio_final: 1080, stock: 35 },
    { id: 'p11', sku: 'SE-CHI1', nombre: 'Semillas de chía', categoria: 'Semillas', unit: 'x 100 g', precio_final: 1120, stock: 4 },
    { id: 'p12', sku: 'SE-ZAP1', nombre: 'Semillas de zapallo AA', categoria: 'Semillas', unit: 'x 100 g', precio_final: 2310, stock: 20 },
    { id: 'p13', sku: 'GR-FSE1', nombre: 'Granola frutos secos Meraki', categoria: 'Granolas y barritas', unit: 'doypack 250 g', precio_final: 7890, stock: 26 },
    { id: 'p14', sku: 'BA-CAC1', nombre: 'Barritas cacao y almendras Vitalgy', categoria: 'Granolas y barritas', unit: 'caja x 10', precio_final: 12620, stock: 14 },
    { id: 'p15', sku: 'HA-ALM1', nombre: 'Harina de almendras s/piel', categoria: 'Harinas', unit: 'x 100 g', precio_final: 530, stock: 60 },
    { id: 'p16', sku: 'ES-CUR1', nombre: 'Cúrcuma molida', categoria: 'Especias', unit: 'x 100 g', precio_final: 1250, stock: 24 },
    { id: 'p17', sku: 'ES-SAL1', nombre: 'Sal rosada del Himalaya fina', categoria: 'Especias', unit: 'x 100 g', precio_final: 420, stock: 80 },
    { id: 'p18', sku: 'EN-MAS1', nombre: 'Azúcar mascabo orgánica', categoria: 'Endulzantes y dulces', unit: 'x 100 g', precio_final: 570, stock: 45 },
    { id: 'p19', sku: 'DU-ARA1', nombre: 'Dulce del Jardín de arándanos', categoria: 'Endulzantes y dulces', unit: 'frasco 210 g', precio_final: 6730, stock: 12 },
    { id: 'p20', sku: 'UN-MAN1', nombre: 'Pasta de maní Nutis', categoria: 'Pastas', unit: 'pote 360 g', precio_final: 3730, stock: 30 },
    { id: 'p21', sku: 'PA-ESP1', nombre: 'Fusilloni de espinaca Troncoso', categoria: 'Pastas', unit: 'paquete 500 g', precio_final: 6180, stock: 16 },
    { id: 'p22', sku: 'AC-COC1', nombre: 'Aceite de coco neutro Oh Yeah', categoria: 'Aceites y vinagres', unit: 'frasco 300 g', precio_final: 8860, stock: 9 },
    { id: 'p23', sku: 'YE-AJE1', nombre: 'Yerba Ajedrez premium pura hoja', categoria: 'Yerbas', unit: 'paquete 500 g', precio_final: 3200, stock: 0 },
    { id: 'p24', sku: 'GF-ALF1', nombre: 'Alfajores coco y DDL', categoria: 'Gluten free', unit: 'caja x 6', precio_final: 20360, stock: 8 },
    { id: 'p25', sku: 'AP-EVP1', nombre: 'Miel Energía Vital Plus (polen y jalea)', categoria: 'Miel y propóleo', unit: 'frasco 350 g', precio_final: 18000, stock: 10 },
    { id: 'p26', sku: 'AP-PRO1', nombre: 'Propóleo bebible fuerte 10%', categoria: 'Miel y propóleo', unit: 'frasco 125 cm³', precio_final: 18000, stock: 14 },
    { id: 'p27', sku: 'SU-MAG1', nombre: 'Magnesio citrato Natier', categoria: 'Suplementos', unit: '50 cápsulas', precio_final: 24000, stock: 20 },
    { id: 'p28', sku: 'SU-SPI1', nombre: 'Spirulina Natier', categoria: 'Suplementos', unit: '50 cápsulas', precio_final: 24000, stock: 17 },
    { id: 'p29', sku: 'CO-SHA1', nombre: 'Shampoo sólido detox Botanika', categoria: 'Cosmética natural', unit: '90 g', precio_final: 27000, stock: 4 },
    { id: 'p30', sku: 'CO-ALO1', nombre: 'Gel de aloe vera 98%', categoria: 'Cosmética natural', unit: 'pote 200 g', precio_final: 25000, stock: 13 },
  ],
};
