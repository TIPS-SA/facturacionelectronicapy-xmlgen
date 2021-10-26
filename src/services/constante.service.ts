class ConstanteService {
 
    tiposDocumentos = [{
        codigo: 1,
        descripcion : "Factura electrónica",
        situacion : 0
    }, {
        codigo: 2,
        descripcion : "Factura electrónica de exportación",
        situacion : 1   //A futuro
    }, {
        codigo: 3,
        descripcion : "Factura electrónica de importación",
        situacion : 1   //A futuro
    }, {
        codigo: 4,
        descripcion : "Autofactura electrónica",
        situacion : 0
    }, {
        codigo: 5,
        descripcion : "Nota de crédito electrónica",
        situacion : 0
    }, {
        codigo: 6,
        descripcion : "Nota de débito electrónica",
        situacion : 0
    }, {
        codigo: 7,
        descripcion : "Nota de remisión electrónica",
        situacion : 0
    }, {
        codigo: 8,
        descripcion : "Comprobante de retención electrónico",
        situacion : 1   //A futuro
    }];
    
    tiposEmisiones = [{
        codigo: 1,
        descripcion : "Normal"
    }, {
        codigo: 2,
        descripcion : "Contingencia"
    }];

    tiposTransacciones = [{
        codigo: 1,
        descripcion : "Venta de mercadería",
        situacion : 0
    }, {
        codigo: 2,
        descripcion : "Prestación de servicios",
        situacion : 1
    }, {
        codigo: 3,
        descripcion : "Mixto (Venta de mercadería y servicios)",
        situacion : 1
    }, {
        codigo: 4,
        descripcion : "Venta de activo fijo",
        situacion : 0
    }, {
        codigo: 5,
        descripcion : "Venta de divisas",
        situacion : 0
    }, {
        codigo: 6,
        descripcion : "Compra de divisas",
        situacion : 0
    }, {
        codigo: 7,
        descripcion : "Promoción o entrega de muestras",
        situacion : 0
    }, {
        codigo: 8,
        descripcion : "Donación",
        situacion : 1
    }, {
        codigo: 9,
        descripcion : "Anticipo",
        situacion : 1
    }, {
        codigo: 10,
        descripcion : "Compra de productos",
        situacion : 1
    }, {
        codigo: 11,
        descripcion : "Compra de servicios",
        situacion : 1
    }, {
        codigo: 12,
        descripcion : "Venta de crédito fiscal",
        situacion : 1
    }, {
        codigo: 13,
        descripcion : "Muestras médicas (Art. 3 RG 24/2014)",
        situacion : 1
    }];

    tiposImpuestos = [{
        codigo: 1,
        descripcion : "IVA",
        situacion : 0
    }, {
        codigo: 2,
        descripcion : "ISC",
        situacion : 1
    }, {
        codigo: 3,
        descripcion : "Renta",
        situacion : 1
    }, {
        codigo: 4,
        descripcion : "Ninguno",
        situacion : 0
    }, {
        codigo: 5,
        descripcion : "IVA - Rent",
        situacion : 0
    }];

    monedas = [{
        codigo: 'PYG',
        descripcion : "Guarani"
    }, {
        codigo: 'ARS',
        descripcion : "Peso"
    }, {
        codigo: 'BRL',
        descripcion : "Real"
    }, {
        codigo: 'USD',
        descripcion : "Dolar"
    }];

    globalPorItem = [{
        codigo: 1,
        descripcion : "Global"
    }, {
        codigo: 2,
        descripcion : "por Item"
    }];

    tiposRegimenes = [{
        codigo: 1,
        descripcion : "Régimen de Turismo"
    }, {
        codigo: 2,
        descripcion : "Importador"
    }, {
        codigo: 3,
        descripcion : "Exportador"
    }, {
        codigo: 4,
        descripcion : "Maquila"
    }, {
        codigo: 5,
        descripcion : "Ley N° 60/90",
    }, {
        codigo: 6,
        descripcion : "Régimen del Pequeño Productor"
    }, {
        codigo: 7,
        descripcion : "Régimen del Mediano Productor"
    }, {
        codigo: 8,
        descripcion : "Régimen Contable"
    }];

    tiposDocumentosIdentidades = [{
        codigo: 1,
        descripcion : "Cédula paraguaya"
    }, {
        codigo: 2,
        descripcion : "Pasaporte"
    }, {
        codigo: 3,
        descripcion : "Cédula extranjera"
    }, {
        codigo: 4,
        descripcion : "Carnet de residencia"
    }, {
        codigo: 9,
        descripcion : "Otro",
    }];

    tiposDocumentosReceptor = [{
        codigo: 1,
        descripcion : "Cédula paraguaya"
    }, {
        codigo: 2,
        descripcion : "Pasaporte"
    }, {
        codigo: 3,
        descripcion : "Cédula extranjera"
    }, {
        codigo: 4,
        descripcion : "Carnet de residencia"
    }, {
        codigo: 5,
        descripcion : "Innominado",
    }, {
        codigo: 6,
        descripcion : "Tarjeta Diplomática de exoneración fiscal",
    }];

    tiposOperaciones = [{
        codigo: 1,
        descripcion : "B2B"
    }, {
        codigo: 2,
        descripcion : "B2C"
    }, {
        codigo: 3,
        descripcion : "B2G"
    }, {
        codigo: 4,
        descripcion : "B2F"
    }];

    indicadoresPresencias = [{
        codigo: 1,
        descripcion : "Operación presencial"
    }, {
        codigo: 2,
        descripcion : "Operación electrónica"
    }, {
        codigo: 3,
        descripcion : "Operación telemarketing"
    }, {
        codigo: 4,
        descripcion : "Venta a domicilio"
    }, {
        codigo: 5,
        descripcion : "Operación bancaria"
    }, {
        codigo: 6,
        descripcion : "Operación cíclica"
    }, {
        codigo: 9,
        descripcion : "Otro"
    }];

    naturalezaVendedorAutofactura = [{
        codigo: 1,
        descripcion : "No contribuyente"
    }, {
        codigo: 2,
        descripcion : "Extranjero"
    }];

    notasCreditosMotivos = [{
        codigo: 1,
        descripcion : "Devolución y Ajuste de precios"
    }, {
        codigo: 2,
        descripcion : "Devolución"
    }, {
        codigo: 3,
        descripcion : "Descuento"
    }, {
        codigo: 4,
        descripcion : "Bonificación"
    }, {
        codigo: 5,
        descripcion : "Crédito incobrable"
    }, {
        codigo: 6,
        descripcion : "Recupero de costo"
    }, {
        codigo: 7,
        descripcion : "Recupero de gasto"
    }, {
        codigo: 8,
        descripcion : "Ajuste de precio"
    }];

    remisionesMotivos = [{
        codigo: 1,
        descripcion : "Traslado por ventas"
    }, {
        codigo: 2,
        descripcion : "Traslado por consignación"
    }, {
        codigo: 3,
        descripcion : "Exportación"
    }, {
        codigo: 4,
        descripcion : "Traslado por compra"
    }, {
        codigo: 5,
        descripcion : "Importación"
    }, {
        codigo: 6,
        descripcion : "Traslado por devolución"
    }, {
        codigo: 7,
        descripcion : "Traslado entre locales de la empresa"
    }, {
        codigo: 8,
        descripcion : "Traslado de bienes por transformación"
    }, {
        codigo: 9,
        descripcion : "Traslado de bienes por reparación"
    }, {
        codigo: 10,
        descripcion : "Traslado por emisor móvil"
    }, {
        codigo: 11,
        descripcion : "Exhibición o demostración"
    }, {
        codigo: 12,
        descripcion : "Participación en ferias"
    }, {
        codigo: 13,
        descripcion : "Traslado de encomienda"
    }, {
        codigo: 14,
        descripcion : "Decomiso"
    }, {
        codigo: 99,
        descripcion : "Otro"
    }];    

    remisionesResponsables = [{
        codigo: 1,
        descripcion : "Emisor de la factura"
    }, {
        codigo: 2,
        descripcion : "Poseedor de la factura y bienes"
    }, {
        codigo: 3,
        descripcion : "Empresa transportista"
    }, {
        codigo: 4,
        descripcion : "Despachante de Aduanas"
    }, {
        codigo: 5,
        descripcion : "Agente de transporte o intermediario"
    }];

    condicionesOperaciones = [{
        codigo: 1,
        descripcion : "Contado"
    }, {
        codigo: 2,
        descripcion : "Crédito"
    }];

    condicionesTiposPagos = [{
        codigo: 1,
        descripcion : "Efectivo"
    },{
        codigo: 2,
        descripcion : "Cheque"
    }, {
        codigo: 3,
        descripcion : "Tarjeta de crédito"
    }, {
        codigo: 4,
        descripcion : "Tarjeta de débito"
    }, {
        codigo: 5,
        descripcion : "Transferencia"
    }, {
        codigo: 6,
        descripcion : "Giro"
    }, {
        codigo: 7,
        descripcion : "Billetera electrónica"
    }, {
        codigo: 8,
        descripcion : "Tarjeta empresarial"
    }, {
        codigo: 9,
        descripcion : "Vale"
    }, {
        codigo: 10,
        descripcion : "Retención"
    }, {
        codigo: 11,
        descripcion : "Pago por anticipo"
    }, {
        codigo: 12,
        descripcion : "Valor fiscal"
    }, {
        codigo: 13,
        descripcion : "Valor comercial"
    }, {
        codigo: 14,
        descripcion : "Compensación"
    }, {
        codigo: 15,
        descripcion : "Permuta"
    }, {
        codigo: 16,
        descripcion : "Pago bancario"
    }, {
        codigo: 17,
        descripcion : "Pago Móvil"
    }, {
        codigo: 18,
        descripcion : "Donación"
    }, {
        codigo: 19,
        descripcion : "Promoción"
    }, {
        codigo: 20,
        descripcion : "Consumo Interno"
    }, {
        codigo: 21,
        descripcion : "Pago Electrónico"
    }, {
        codigo: 99,
        descripcion : "Otro"
    }];

    condicionesCreditosTipos = [{
        codigo: 1,
        descripcion : "Plazo"
    },{
        codigo: 2,
        descripcion : "Cuotas"
    }];

    tarjetasCreditosTipos = [{
        codigo: 1,
        descripcion : "Visa"
    },{
        codigo: 2,
        descripcion : "Mastercard"
    }, {
        codigo: 3,
        descripcion : "American Express"
    }, {
        codigo: 4,
        descripcion : "Maestro"
    }, {
        codigo: 5,
        descripcion : "Panal"
    }, {
        codigo: 6,
        descripcion : "Cabal"
    }, {
        codigo: 99,
        descripcion : "Otro"
    }];

    tarjetasCreditosFormasProcesamiento = [{
        codigo: 1,
        descripcion : "POS"
    },{
        codigo: 2,
        descripcion : "Pago Electrónico"
    }, {
        codigo: 9,
        descripcion : "Otro"
    }];

    unidadesMedidas = [
        { "codigo" : 87  , "representacion" : "m     ", "descripcion" : "Metros                      "},
        { "codigo" : 2366, "representacion" : "CPM   ", "descripcion" : "Costo por Mil               "},
        { "codigo" : 2329, "representacion" : "UI    ", "descripcion" : "Unidad Internacional        "},
        { "codigo" : 110 , "representacion" : "M3    ", "descripcion" : "Metros cúbicos              "},
        { "codigo" : 77  , "representacion" : "UNI   ", "descripcion" : "Unidad                      "},
        { "codigo" : 86  , "representacion" : "g     ", "descripcion" : "Gramos                      "},
        { "codigo" : 89  , "representacion" : "LT    ", "descripcion" : "Litros                      "},
        { "codigo" : 90  , "representacion" : "MG    ", "descripcion" : "Miligramos                  "},
        { "codigo" : 91  , "representacion" : "CM    ", "descripcion" : "Centimetros                 "},
        { "codigo" : 92  , "representacion" : "CM2   ", "descripcion" : "Centimetros cuadrados       "},
        { "codigo" : 93  , "representacion" : "CM3   ", "descripcion" : "Centimetros cubicos         "},
        { "codigo" : 94  , "representacion" : "PUL   ", "descripcion" : "Pulgadas                    "},
        { "codigo" : 96  , "representacion" : "MM2   ", "descripcion" : "Milímetros cuadrados        "},
        { "codigo" : 79  , "representacion" : "kg/m² ", "descripcion" : "Kilogramos s/ metro cuadrado"},
        { "codigo" : 97  , "representacion" : "AA    ", "descripcion" : "Año                         "},
        { "codigo" : 98  , "representacion" : "ME    ", "descripcion" : "Mes                         "},
        { "codigo" : 99  , "representacion" : "TN    ", "descripcion" : "Tonelada                    "},
        { "codigo" : 100 , "representacion" : "Hs    ", "descripcion" : "Hora                        "},
        { "codigo" : 101 , "representacion" : "Mi    ", "descripcion" : "Minuto                      "},
        { "codigo" : 104 , "representacion" : "DET   ", "descripcion" : "Determinación               "},
        { "codigo" : 103 , "representacion" : "Ya    ", "descripcion" : "Yardas                      "},
        { "codigo" : 108 , "representacion" : "MT    ", "descripcion" : "Metros                      "},
        { "codigo" : 109 , "representacion" : "M2    ", "descripcion" : "Metros cuadrados            "},
        { "codigo" : 95  , "representacion" : "MM    ", "descripcion" : "Milímetros                  "},
        { "codigo" : 666 , "representacion" : "Se    ", "descripcion" : "Segundo                     "},
        { "codigo" : 102 , "representacion" : "Di    ", "descripcion" : "Día                         "},
        { "codigo" : 83  , "representacion" : "kg    ", "descripcion" : "Kilogramos                  "},
        { "codigo" : 88  , "representacion" : "ML    ", "descripcion" : "Mililitros                  "},
        { "codigo" : 625 , "representacion" : "Km    ", "descripcion" : "Kilómetros                  "},
        { "codigo" : 660 , "representacion" : "ml    ", "descripcion" : "Metro lineal                "},
        { "codigo" : 885 , "representacion" : "GL    ", "descripcion" : "Unidad Medida Global        "},
        { "codigo" : 891 , "representacion" : "pm    ", "descripcion" : "Por Milaje                  "},
        { "codigo" : 869 , "representacion" : "ha    ", "descripcion" : "Hectáreas                   "},
        { "codigo" : 569 , "representacion" : "ración", "descripcion" : "Ración                      "}
    ];

    codigosAfectaciones = [{
        "codigo" : 1,
        "descripcion" : "Gravado IVA"
    }, {
        "codigo" : 2,
        "descripcion" : "Exonerado (Art.83 - 125)"
    }, {
        "codigo" : 3,
        "descripcion" : "Exento"
    }, {
        "codigo" : 4,
        "descripcion" : "Gravado parcial"
    }];

    categoriasIsc = [{
        "codigo" : 1,
        "descripcion" : "Sección I - (Cigarrillos, Tabacos, Esencias y Otros derivados del Tabaco)"
    }, {
        "codigo" : 2,
        "descripcion" : "Sección II - (Bebidas con y sin alcohol)"
    }, {
        "codigo" : 3,
        "descripcion" : "Sección III - (Alcoholes y Derivados del alcohol)"
    }, {
        "codigo" : 4,
        "descripcion" : "Sección IV- (Combustibles)"
    }, {
        "codigo" : 5,
        "descripcion" : "Sección V- (Artículos considerados de lujo)"
    }];
   
    tasasIsc = [{
        "codigo" : 1,
        "porcentaje" : 1
    }, {
        "codigo" : 2,
        "porcentaje" : 5
    }, {
        "codigo" : 3,
        "porcentaje" : 9
    }, {
        "codigo" : 4,
        "porcentaje" : 10
    }, {
        "codigo" : 5,
        "porcentaje" : 11
    }, {
        "codigo" : 6,
        "porcentaje" : 13
    }, {
        "codigo" : 7,
        "porcentaje" : 16
    }, {
        "codigo" : 8,
        "porcentaje" : 18
    }, {
        "codigo" : 9,
        "porcentaje" : 20
    }, {
        "codigo" : 10,
        "porcentaje" : 24
    }, {
        "codigo" : 11,
        "porcentaje" : 34
    }, {
        "codigo" : 12,
        "porcentaje" : 38
    }];
 
    condicionesNegociaciones = [{
        "codigo" : "CFR",
        "descripcion" : "Costo y flete"
    }, {
        "codigo" : "CIF",
        "descripcion" : "Costo, seguro y flete"
    }, {
        "codigo" : "CIP",
        "descripcion" : "Transporte y seguro pagados hasta"
    }, {
        "codigo" : "CPT",
        "descripcion" : "Transporte pagado hasta"
    }, {
        "codigo" : "DAP",
        "descripcion" : "Entregada en lugar convenido"
    }, {
        "codigo" : "DAT",
        "descripcion" : "Entregada en terminal"
    }, {
        "codigo" : "DDP",
        "descripcion" : "Entregada derechos pagados"
    }, {
        "codigo" : "EXW",
        "descripcion" : "En fabrica"
    }, {
        "codigo" : "FAS",
        "descripcion" : "Franco al costado del buque"
    }, {
        "codigo" : "FCA",
        "descripcion" : "Franco transportista"
    }, {
        "codigo" : "FOB",
        "descripcion" : "Franco a bordo"
    }];

    relevanciasMercaderias = [{
        codigo: 1,
        descripcion : "Tolerancia de quiebra"
    }, {
        codigo: 2,
        descripcion : "Tolerancia de merma"
    }];

    tiposOperacionesVehiculos = [{
        codigo: 1,
        descripcion : "Venta a representante"
    }, {
        codigo: 2,
        descripcion : "Venta al consumidor final"
    }, {
        codigo: 3,
        descripcion : "Venta a gobierno"
    }, {
        codigo: 4,
        descripcion : "Venta a flota de vehículos"
    }];

    tiposCombustibles = [{
        codigo: 1,
        descripcion : "Gasolina"
    }, {
        codigo: 2,
        descripcion : "Diésel"
    }, {
        codigo: 3,
        descripcion : "Etanol"
    }, {
        codigo: 4,
        descripcion : "GNV"
    }, {
        codigo: 5,
        descripcion : "Flex"
    }, {
        codigo: 9,
        descripcion : "Otro"
    }];

    tiposTransportes = [{
        codigo: 1,
        descripcion : "Propio"
    }, {
        codigo: 2,
        descripcion : "Tercero"
    }];

    modalidadesTransportes = [{
        codigo: 1,
        descripcion : "Terrestre"
    }, {
        codigo: 2,
        descripcion : "Fluvial"
    }, {
        codigo: 3,
        descripcion : "Aéreo"
    }, {
        codigo: 4,
        descripcion : "Multimodal"
    }];

    responsablesFletes = [{
        codigo: 1,
        descripcion : "Emisor de la Factura Electrónica"
    }, {
        codigo: 2,
        descripcion : "Receptor de la Factura Electrónica"
    }, {
        codigo: 3,
        descripcion : "Tercero"
    }, {
        codigo: 4,
        descripcion : "Agente intermediario del transporte (cuando intervenga)"
    }, {
        codigo: 5,
        descripcion : "Transporte propio"
    }];

    tiposDocumentosAsociados = [{
        codigo: 1,
        descripcion : "Electrónico"
    }, {
        codigo: 2,
        descripcion : "Impreso"
    }, {
        codigo: 3,
        descripcion : "Constancia Electrónica"
    }];

    tiposDocumentosImpresos = [{
        codigo: 1,
        descripcion : "Factura"
    }, {
        codigo: 2,
        descripcion : "Nota de crédito"
    }, {
        codigo: 3,
        descripcion : "Nota de débito"
    }, {
        codigo: 4,
        descripcion : "Nota de remisión"
    }, {
        codigo: 5,
        descripcion : "Comprobante de retención"
    }];    

    tiposConstancias = [{
        codigo: 1,
        descripcion : "Constancia de no ser contribuyente"
    }, {
        codigo: 2,
        descripcion : "Constancia de microproductores"
    }];

    caracteristicasCargas = [{
        codigo: 1,
        descripcion : "Mercadería con cadena de frio"
    }, {
        codigo: 2,
        descripcion : "Carga peligrosa"
    }, {
        codigo: 3,
        descripcion : "Otro"
    }];

    eventoConformidadTipo = [{
        codigo: 1,
        descripcion : "Conformidad Total del DTE"
    }, {
        codigo: 2,
        descripcion : "Conformidad Parcial del DTE"
    }];
}

export default new ConstanteService();
