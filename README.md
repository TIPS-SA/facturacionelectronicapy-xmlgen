# Facturación Electrónica - Generación de XML para SIFEN (Paraguay)

Módulo NodeJS que genera el **archivo XML** para enviar a la **SET** _(Subsecretaria de Estado de Tributación del Ministerio de Hacienda)_ para el proceso y generación del documento electrónico, a partir de una estructura de datos en formato JSON.

Versión del Manual Técnico: **150**

Este paquete pretende servir de **modelo de transferencia estandarizado** para la **comunicación** con la **SET** contemplando la totalidad de los campos exigidos para cada bloque y tipos de documentos electrónicos.

El mismo es utilizado y mantenido por el autor y otorgado a la comunidad de desarrolladores de forma gratuita bajo licencia **MIT**

El módulo está preparado de forma a proveer una fácil integración dentro de su entorno **NodeJS** y para con cualquier otro lenguaje, sistema o librería que requiera, por ejemplo publicando el médoto desde un REST.

## Características
- Genera el CDC automáticamente de acuerdo a los datos del documento electrónico
- Implementa el Algoritmo del dígito verificador del CDC
- Permite sobreescribir el valor del código de seguridad, de acuerdo a las necesidades del implementador
- Realiza la validación de los datos de entrada conforme el menual técnico de SIFEN

## Instalación

Para instalar el módulo en su proyecto node, ejecute el siguiente comando:
``` sh
  npm install facturacionelectronicapy-xmlgen
```

El método requiere 2 argumentos tipo **JSON** para general el XML. El primero es un argumento `params` con las informaciones estáticas del Contribuyente emisor, y el segundo es un `data` con los datos variables para cada documento electrónico a generar.

La promesa devuelve el documento XML con los datos generados.

Ejemplos de Uso:

Javascript:
``` js
  const xmlgen = require('facturacionelectronicapy-xmlgen');
  //O const xmlgen = require('facturacionelectronicapy-xmlgen').default;
  
  xmlgen.generateXMLDE(params, data, options).then(xml => {
      console.log(xml);
  }).catch(error => {
      console.log(error);
  });     
```

TypeScript:
``` ts
  import xmlgen from 'facturacionelectronicapy-xmlgen';

  xmlgen.generateXMLDE(params, data, options).then(xml => {
      console.log(xml);
  }).catch(error => {
      console.log(error);
  }); 
```

Ambos parámetros `params` y `data` pueden ser proveidos a partir de una vista de base de datos, leyendo datos de un CSV o proceso generado por otro sistema, para lograr una fácil integración 

Al final podrá encontrar la estructura completa para el PARAMS y el JSON 


## Estructura completa del `params` JSON de Ejemplo
``` json 
{
  "version" : 150,
  "ruc" : "80069563-1",
  "razonSocial" : "DE generado en ambiente de prueba - sin valor comercial ni fiscal",
  "nombreFantasia" : "TIPS S.A. TECNOLOGIA Y SERVICIOS",
  "actividadesEconomicas" : [{
    "codigo": "1254",
    "descripcion": "Desarrollo de Software",
  }],   
  "timbradoNumero" : "12558946",
  "timbradoFecha" : "2022-08-25",
  "tipoContribuyente" : 2, 
  "tipoRegimen" : 8, 
  "establecimientos" : [{
    "codigo" : "001",
    "direccion" : "Barrio Carolina", 
    "numeroCasa" : "0", 
    "complementoDireccion1" : "Entre calle 2", 
    "complementoDireccion2" : "y Calle 7",
    "departamento" : 11,
    "departamentoDescripcion" : "ALTO PARANA",
    "distrito" : 145,
    "distritoDescripcion" : "CIUDAD DEL ESTE",
    "ciudad" : 3432,
    "ciudadDescripcion" : "PUERTO PTE.STROESSNER (MUNIC)",
    "telefono" : "0973-527155",
    "email" : "tips@tips.com.py, tips@gmail.com",
    "denominacion" : "Sucursal 1",
  }]
}
```  
El campo Email, si bien puede informarse mas de 1 (uno), en el Sifen solamente será enviado el primero

## Estructura completa del `data` JSON de Ejemplo
``` json
{
    "tipoDocumento" : 1,
    "establecimiento" : "001",
    "codigoSeguridadAleatorio" : "298398",
    "punto" : "001",
    "numero" : "0000001", 
    "descripcion" : "Aparece en el documento",
    "observacion" : "Cualquier informacion de marketing, publicidad, sorteos, promociones para el Receptor",
    "fecha" : "2022-08-14T10:11:00",
    "tipoEmision" : 1,
    "tipoTransaccion" : 1,
    "tipoImpuesto" : 1,
    "moneda" : "PYG",
    "condicionAnticipo" : 1,
    "condicionTipoCambio": 1,
    "descuentoGlobal": 0,
    "anticipoGlobal": 0,
    "cambio": 6700,
    "cliente" : {
        "contribuyente" : true,
        "ruc" : "2005001-1",
        "razonSocial" : "Marcos Adrian Jara Rodriguez",
        "nombreFantasia" : "Marcos Adrian Jara Rodriguez",
        "tipoOperacion" : 1,
        "direccion" : "Avda Calle Segunda y Proyectada",
        "numeroCasa" : "1515",
        "departamento" : 11,
        "departamentoDescripcion" : "ALTO PARANA",
        "distrito" : 143,
        "distritoDescripcion" : "DOMINGO MARTINEZ DE IRALA",
        "ciudad" : 3344,
        "ciudadDescripcion" : "PASO ITA (INDIGENA)",
        "pais" : "PRY",
        "paisDescripcion" : "Paraguay",
        "tipoContribuyente" : 1,
        "documentoTipo" : 1,
        "documentoNumero" : "2324234",
        "telefono" : "061-575903",
        "celular" : "0973-809103",
        "email" : "cliente@empresa.com, cliente@personal.com",
        "codigo" : "1548"
    },
    "usuario" : {
        "documentoTipo" : 1,
        "documentoNumero" : "157264",
        "nombre" : "Marcos Jara",
        "cargo" : "Vendedor"
    },
    "factura" : {
        "presencia" : 1,
        "fechaEnvio" : "2023-10-21",
        "dncp" : {
            "modalidad" : "ABC",
            "entidad" : 1,
            "año" : 2021,
            "secuencia" : 3377,
            "fecha" : "2022-09-14T10:11:00"
        }
    },
    "autoFactura" : {
        "tipoVendedor" : 1,
        "documentoTipo" : 1,
        "documentoNumero" : 1,
        "nombre" : "Vendedor autofactura",
        "direccion" : "Vendedor autofactura",
        "numeroCasa" : "Vendedor autofactura",
        "departamento" : 11,
        "departamentoDescripcion" : "ALTO PARANA",
        "distrito" : 143,
        "distritoDescripcion" : "DOMINGO MARTINEZ DE IRALA",
        "ciudad" : 3344,
        "ciudadDescripcion" : "PASO ITA (INDIGENA)",
        "transaccion" : {
            "lugar" : "Donde se realiza la transaccion",
            "departamento" : 11,
            "departamentoDescripcion" : "ALTO PARANA",
            "distrito" : 143,
            "distritoDescripcion" : "DOMINGO MARTINEZ DE IRALA",
            "ciudad" : 3344,
            "ciudadDescripcion" : "PASO ITA (INDIGENA)"
        }
    },
    "notaCreditoDebito" : {
        "motivo" : 1
    },
    "remision" : {
        "motivo" : 1,
        "tipoResponsable" : 1, 
        "kms" : 150,
        "fechaFactura" : "2022-08-21"
    },
    "condicion" : {
        "tipo" : 1,
        "entregas" : [{ 
            "tipo" : 1,
            "monto" : "150000",
            "moneda" : "PYG",
            "cambio" : 0
        }, { 
            "tipo" : 3,
            "monto" : "150000",
            "moneda" : "PYG",
            "cambio" : 0,
            "infoTarjeta" : {
                "tipo" : 1,
                "tipoDescripcion" : "Dinelco",
                "titular" : "Marcos Jara",
                "ruc" : "6969549654-1",
                "razonSocial" : "Bancard",
                "medioPago" : 1,
                "codigoAutorizacion" : 232524234
            }
        }, { 
            "tipo" : 2,
            "monto" : "150000",
            "moneda" : "PYG",
            "cambio" : 0,
            "infoCheque" : {
                "numeroCheque": "32323232",
                "banco" : "Sudameris"
            }
        }],
        "credito" : {
            "tipo" : 1,
            "plazo" : "30 días",
            "cuotas" : 2,
            "montoEntrega" : 1500000.00,
            "infoCuotas" : [{
                "moneda" : "PYG",
                "monto" : 800000.00,
                "vencimiento" : "2021-10-30"
            }, {
                "moneda" : "PYG",
                "monto" : 800000.00,
                "vencimiento" : "2021-11-30"
            }]
        }
    },
    "items" : [{
        "codigo" : "A-001",
        "descripcion": "Producto o Servicio", 
        "observacion": "Información adicional o complementaria sobre el producto", 
        "partidaArancelaria" : 4444,
        "ncm": "ABCD1234",
        "unidadMedida": 77,
        "cantidad": 10.5,
        "precioUnitario": 10800,
        "cambio": 0,
        "descuento": 0,
        "anticipo": 0,
        "pais" : "PRY",
        "paisDescripcion" : "Paraguay",
        "tolerancia" : 1,
        "toleranciaCantidad" : 1,
        "toleranciaPorcentaje" : 1,
        "cdcAnticipo" : "44digitos",
        "dncp" : {
            "codigoNivelGeneral" : "12345678",
            "codigoNivelEspecifico" : "1234",
            "codigoGtinProducto" : "12345678",
            "codigoNivelPaquete" : "12345678"
        },
        "ivaTipo" : 1,
        "ivaBase" : 100,
        "iva" : 5,
        "lote" : "A-001",
        "vencimiento" : "2022-10-30",
        "numeroSerie" : "",
        "numeroPedido" : "",
        "numeroSeguimiento" : "",
        "importador" : {
            "nombre" : "Importadora Parana S.A.",
            "direccion" : "Importadora Parana S.A.",
            "registroImportador" : "Importadora Parana S.A."
        },
        "registroSenave" : "323223",
        "registroEntidadComercial" : "RI-32/22",
        "sectorAutomotor" : {
            "tipo" : 1,
            "chasis" : "45252345235423532",
            "color" : "Rojo",
            "potencia" : 1500,
            "capacidadMotor" : 5,
            "capacidadPasajeros" : 5,
            "pesoBruto" : 10000,
            "pesoNeto" : 8000,
            "tipoCombustible" : 9,
            "tipoCombustibleDescripcion" : "Vapor",
            "numeroMotor" : "323234234234234234",
            "capacidadTraccion" : 151.01,
            "año" : 2009,
            "tipoVehiculo" : "Camioneta",
            "cilindradas" : "3500"
        }
    }],
    "sectorEnergiaElectrica" : {
        "numeroMedidor" : "132423424235425",
        "codigoActividad" : 125,
        "codigoCategoria" : "001",
        "lecturaAnterior" : 4,
        "lecturaActual" : 5
    },
    "sectorSeguros" : {
        "codigoAseguradora" : "",
        "codigoPoliza" : "AAAA",
        "numeroPoliza" : "BBBB",
        "vigencia" : 1,
        "vigenciaUnidad" : "año",
        "inicioVigencia" : "2021-10-01",
        "finVigencia" : "2022-10-01",
        "codigoInternoItem" : "A-001"
    },
    "sectorSupermercados" : {
        "nombreCajero" : "Juan Antonio Caceres",
        "efectivo" : 150000,
        "vuelto" : 30000,
        "donacion" : 1000,
        "donacionDescripcion" : "Donado para la caridad"
    },
    "sectorAdicional" : {
        "ciclo" : "Mensualidad",
        "inicioCiclo" : "2021-09-01",
        "finCiclo" : "2021-10-01",
        "vencimientoPago" : "2021-11-01",
        "numeroContrato" : "AF-2541",
        "saldoAnterior" : 1550000
    },
    "detalleTransporte" : {
        "tipo" : 1,
        "modalidad" : 1,
        "tipoResponsable" : 1,
        "condicionNegociacion" : "CFR",
        "numeroManifiesto" : "AF-2541",
        "numeroDespachoImportacion" : "153223232332",
        "inicioEstimadoTranslado" : "2021-11-01",
        "finEstimadoTranslado" : "2021-11-01",
        "paisDestino" : "PRY", 
        "paisDestinoNombre" : "Paraguay",
        "salida" : {
            "direccion" : "Paraguay",
            "numeroCasa" : "Paraguay",
            "complementoDireccion1" : "Entre calle 2", 
            "complementoDireccion2" : "y Calle 7",
            "departamento" : 11,
            "departamentoDescripcion" : "ALTO PARANA",
            "distrito" : 143,
            "distritoDescripcion" : "DOMINGO MARTINEZ DE IRALA",
            "ciudad" : 3344,
            "ciudadDescripcion" : "PASO ITA (INDIGENA)",
            "pais" : "PRY",
            "paisDescripcion" : "Paraguay",
            "telefonoContacto" : "097x"
        },
        "entrega" : {
            "direccion" : "Paraguay",
            "numeroCasa" : "Paraguay",
            "complementoDireccion1" : "Entre calle 2", 
            "complementoDireccion2" : "y Calle 7",
            "departamento" : 11,
            "departamentoDescripcion" : "ALTO PARANA",
            "distrito" : 143,
            "distritoDescripcion" : "DOMINGO MARTINEZ DE IRALA",
            "ciudad" : 3344,
            "ciudadDescripcion" : "PASO ITA (INDIGENA)",
            "pais" : "PRY",
            "paisDescripcion" : "Paraguay",
            "telefonoContacto" : "097x"
        },
        "vehiculo" : {
            "tipo" : 1,
            "marca" : "Nissan",
            "documentoTipo" : 1, 
            "documentoNumero" : "232323-1",
            "obs" : "",
            "numeroMatricula" : "ALTO PARANA",
            "numeroVuelo" : 143
        },
        "transportista" : {
            "contribuyente" : true,
            "nombre" : "Paraguay",
            "ruc" : "80068684-1", 
            "documentoTipo" : 1,
            "documentoNumero" : "99714584",
            "direccion" : "y Calle 7",
            "obs" : 11,
            "pais" : "PRY",
            "paisDescripcion" : "Paraguay",
            "chofer" : {
                "documentoNumero" : "",
                "nombre" : "Jose Benitez",
                "direccion" : "Jose Benitez"
            },
            "agente" : {
                "nombre" : "Jose Benitez",
                "ruc" : "515415-1",
                "direccion" : "Jose Benitez"
            }
        }
    },
    "complementarios" : {
        "ordenCompra" : "",
        "ordenVenta" : "",
        "numeroAsiento" : "",
        "carga" : {
            "ordenCompra" : "",
            "ordenVenta" : "",
            "numeroAsiento" : ""
        }
    },
    "documentoAsociado" : {
        "formato" : 1,
        "cdc" : "01800695631001001000000612021112917595714694",
        "tipo" : 1,
        "timbrado" : "32323",
        "establecimiento" : "001",
        "punto" : "001",
        "numero" : "00278211",
        "fecha" : "2022-09-14",
        "numeroRetencion" : "32323232",
        "resolucionCreditoFiscal" : "32323",
        "constanciaTipo" : 1,
        "constanciaNumero" : 32323,
        "constanciaControl" : "33232323"

    }
}
```
El email del Cliente, si bien puede enviarse mas de 1 (uno), en SIFEN solamente será enviado el primero.

## Eventos

Para la invocación de Eventos de SIFEN se debe utilizar como primer parámetro, el mismo `params` utilizado en la Generación de XML.

El segundo parámetro `data` debe ser pasado en el siguiente formato, dependiendo del evento a ser invocado. A continuación los ejemplos para cada evento.

## Evento de Cancelación
``` json
{
    "cdc": "01800695631001001000000612021112917595714694",
    "motivo": "Se cancela este CDC"
}
```

## Evento de Inutilización
``` json
{
    "tipoDocumento": 1,
    "establecimiento": "001",
    "punto": "001",
    "desde": 10,
    "hasta": 12,
    "motivo": "Se inutiliza la numeración"
}
```

## Evento de Conformidad
``` json
{
    "cdc": "01800695631001001000000812021112910953738413",
    "tipoConformidad": 1,
    "fechaRecepcion": "2022-01-31T00:01:01"
}
```

## Evento de Disconformidad
``` json
{
    "cdc": "01800695631001001000000812021112910953738413",
    "motivo": "Se informa de una disconformidad"
}
```

## Evento de Desconocimiento
``` json
{
    "cdc": "01800695631001003000013712022010619364760029",
    "fechaEmision" : "2022-01-31T00:01:01",
    "fechaRecepcion" : "2022-01-31T00:01:01",
    "tipoReceptor" : 1,
    "nombre": "BRASIL CRESCENCIO",
    "ruc": "50062360-0",
    "documentoTipo": 1,
    "documentoNumero" : "",
    "motivo": "teste"
}
```

## Evento de Notificación
``` json
{
    "cdc": "01800695631001003000013712022010619364760029",  
    "fechaEmision" : "2022-01-31T00:01:01",
    "fechaRecepcion" : "2022-01-31T00:01:01",
    "tipoReceptor" : 1,
    "nombre": "BRASIL CRESCENCIO",
    "ruc": "50062360-0",
    "documentoTipo": 1,
    "documentoNumero" : "",
    "totalPYG": 1550000
}
```

Ejemplos de Uso de invocación de evento de Cancelación:

Javascript:
``` js
  const xmlgen = require('facturacionelectronicapy-xmlgen');
  // O const xmlgen = require('facturacionelectronicapy-xmlgen').default;
  
  xmlgen.generateXMLEventoCancelacion(id, params, data).then(xml => {
      console.log(xml);
  }).catch(error => {
      console.log(error);
  });
```

TypeScript:
``` ts
  import xmlgen from 'facturacionelectronicapy-xmlgen';

  xmlgen.generateXMLEventoCancelacion(id, params, data).then(xml => {
      console.log(xml);
  }).catch(error => {
      console.log(error);
  }); 
```
Siendo, los demás eventos disponibles:

generateXMLEventoInutilizacion(id, params, data);

generateXMLEventoConformidad(id, params, data);

generateXMLEventoDisconformidad(id, params, data);

generateXMLEventoDesconocimiento(id, params, data);

generateXMLEventoNotificacion(id, params, data);


## Serie Técnica sobre Facturación Electrónica - YouTube

Para más información sobre el proceso que llevó a la generación de éste módulo visite la lista de reproducción "Serie técnica sobre Facturación Electrónica" en el canal de youtube del autor  https://www.youtube.com/channel/UC05xmdC5i3Ob7XnYbQDiBTQ


## Todos los proyectos
[Generación de XML](https://www.npmjs.com/package/facturacionelectronicapy-xmlgen)<br/>
[Firma de XML](https://www.npmjs.com/package/facturacionelectronicapy-xmlsign)<br/>
[Generación de QR](https://www.npmjs.com/package/facturacionelectronicapy-qrgen)<br/>
[API de SIFEN](https://www.npmjs.com/package/facturacionelectronicapy-setapi)<br/>
[Generación KUDE](https://www.npmjs.com/package/facturacionelectronicapy-kude)<br/>


## Empresas que utilizan éstos proyectos
[FacturaSend](https://www.facturasend.com.py/)<br/>
[JHF Ingeniería Informática](https://jhf.com.py/)<br/>
[JR Ingeniería y Servicios](https://jringenieriayservicios.com/)<br/>
[Datamex](https://www.datamex.com.py/)<br/>
[Factupar](https://factupar.com.py/)<br/>
[Globe Informatica](https://globeinformatica.com.py/)<br/>
[FZ Sistemas de Gestion](https://fz-gestion.com.py/)<br/>


* * * *

Todos los derechos reservados - 2021