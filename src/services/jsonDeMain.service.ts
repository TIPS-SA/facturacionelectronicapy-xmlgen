import * as xml2js from 'xml2js';

import stringUtilService from './StringUtil.service';
import fechaUtilService from './FechaUtil.service';
import constanteService from './constants.service';
import jsonDteItem from './jsonDteItem.service';
import jsonDteAlgoritmos from './jsonDteAlgoritmos.service';
import jsonDteComplementarios from './jsonDteComplementario.service';
import jsonDteTransporte from './jsonDteTransporte.service';
import jsonDteTotales from './jsonDteTotales.service';
import jsonDteComplementarioComercial from './jsonDteComplementariosComerciales.service';
import jsonDteIdentificacionDocumento from './jsonDteIdentificacionDocumento.service';
import jsonDeMainValidate from './jsonDeMainValidate.service';
import { XmlgenConfig } from './type.interface.';

class JSonDeMainService {
  codigoSeguridad: any = null;
  codigoControl: any = null;
  json: any = {};
  validateError = true;

  public generateXMLDE(params: any, data: any, config?: XmlgenConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let defaultConfig: XmlgenConfig = {
          defaultValues: true,
          //arrayValuesSeparator : ', ',
          errorSeparator: '; ',
          errorLimit: 10,
          redondeoSedeco: true,
          decimals: 2,
          taxDecimals: 2,
          pygDecimals: 0,
          partialTaxDecimals: 8,
          pygTaxDecimals: 0,
          userObjectRemove: false,
          test: false,
          sum0_000001SuffixBeforeToFixed: false,
        };

        defaultConfig = Object.assign(defaultConfig, config);

        resolve(this.generateXMLDeService(params, data, defaultConfig));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Metodo principal de generacion de XML del DE
   * @param params
   * @param data
   * @returns
   */
  private generateXMLDeService(params: any, data: any, config: XmlgenConfig) {
    this.removeUnderscoreAndPutCamelCase(data);

    this.addDefaultValues(data);

    if (this.validateError) {
      jsonDeMainValidate.validateValues({ ...params }, { ...data }, config);
    }

    this.json = {};

    this.generateCodigoControl(params, data); //Luego genera el código de Control

    this.generateRte(params);

    this.json['rDE']['DE'] = this.generateDe(params, data);
    //---
    this.generateDatosOperacion(params, data);
    this.generateDatosTimbrado(params, data);
    this.generateDatosGenerales(params, data, config);
    //---
    this.generateDatosEspecificosPorTipoDE(params, data, config);

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
      this.generateDatosCondicionOperacionDE(params, data, config);
    }

    //['gDtipDE']=E001
    this.json['rDE']['DE']['gDtipDE']['gCamItem'] = jsonDteItem.generateDatosItemsOperacion(params, data, config);

    let gCamEsp = jsonDteComplementarios.generateDatosComplementariosComercialesDeUsoEspecificos(params, data);
    if (gCamEsp) {
      this.json['rDE']['DE']['gDtipDE']['gCamEsp'] = gCamEsp;
    }

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 7) {
      //1 Opcional, 7 Obligatorio
      if (data['detalleTransporte']) {
        this.json['rDE']['DE']['gDtipDE']['gTransp'] = jsonDteTransporte.generateDatosTransporte(params, data);
      }
    }

    if (data['tipoDocumento'] != 7) {
      const items = this.json['rDE']['DE']['gDtipDE']['gCamItem'];
      this.json['rDE']['DE']['gTotSub'] = jsonDteTotales.generateDatosTotales(params, data, items, config);
    }

    if (data['complementarios']) {
      this.json['rDE']['DE']['gCamGen'] = jsonDteComplementarioComercial.generateDatosComercialesUsoGeneral(
        params,
        data,
      );
    }

    if (data['tipoDocumento'] == 4 || data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6) {
      if (!data['documentoAsociado']) {
        /*throw new Error(
          'Documento asociado es obligatorio para el tipo de documento electrónico (' +
            data['tipoDocumento'] +
            ') seleccionado',
        );*/
      }
    }
    if (
      data['tipoDocumento'] == 1 ||
      data['tipoDocumento'] == 4 ||
      data['tipoDocumento'] == 5 ||
      data['tipoDocumento'] == 6 ||
      data['tipoDocumento'] == 7
    ) {
      if (data['documentoAsociado']) {
        if (!Array.isArray(data['documentoAsociado'])) {
          this.json['rDE']['DE']['gCamDEAsoc'] = jsonDteIdentificacionDocumento.generateDatosDocumentoAsociado(
            params,
            data['documentoAsociado'],
            data,
          );
        } else {
          //Caso sea un array.
          this.json['rDE']['DE']['gCamDEAsoc'] = new Array();

          for (var i = 0; i < data['documentoAsociado'].length; i++) {
            const dataDocumentoAsociado = data['documentoAsociado'][i];

            this.json['rDE']['DE']['gCamDEAsoc'].push(
              jsonDteIdentificacionDocumento.generateDatosDocumentoAsociado(params, dataDocumentoAsociado, data),
            );
          }
        }
      }
    }
    var builder = new xml2js.Builder({
      xmldec: {
        version: '1.0',
        encoding: 'UTF-8',
        standalone: false,
      },
    });
    var xml = builder.buildObject(this.json);

    return this.normalizeXML(xml); //Para firmar tiene que estar normalizado
  }

  /**
   * Genera el CDC para la Factura
   * Corresponde al Id del DE
   *
   * @param params
   * @param data
   */
  generateCodigoControl(params: any, data: any) {
    if (data.cdc && (data.cdc + '').length == 44) {
      //Caso ya se le pase el CDC
      this.codigoSeguridad = data.cdc.substring(34, 43);
      this.codigoControl = data.cdc;

      //Como se va utilizar el CDC enviado como parametro, va a verificar que todos los datos del XML coincidan con el CDC.
      const tipoDocumentoCDC = this.codigoControl.substring(0, 2);
      const establecimientoCDC = this.codigoControl.substring(11, 14);
      const puntoCDC = this.codigoControl.substring(14, 17);
      const numeroCDC = this.codigoControl.substring(17, 24);
      const fechaCDC = this.codigoControl.substring(25, 33);
      const tipoEmisionCDC = this.codigoControl.substring(33, 34);

      const establecimiento = stringUtilService.leftZero(data['establecimiento'], 3);

      const punto = stringUtilService.leftZero(data['punto'], 3);

      const numero = stringUtilService.leftZero(data['numero'], 7);

      const fecha =
        (data['fecha'] + '').substring(0, 4) +
        (data['fecha'] + '').substring(5, 7) +
        (data['fecha'] + '').substring(8, 10);
    } else {
      this.validateCamposDelCDC(params, data);

      this.codigoSeguridad = stringUtilService.leftZero(data.codigoSeguridadAleatorio, 9);
      this.codigoControl = jsonDteAlgoritmos.generateCodigoControl(params, data, this.codigoSeguridad);
    }
  }

  private validateCamposDelCDC(params: any, data: any) {
    //Validar campos básicos para el código de control
    if (!params.ruc) {
      throw new Error('Debe completar Tipo de Documento en params.ruc');
    }
    if (!data.tipoDocumento) {
      throw new Error('Debe completar Tipo de Documento en data.tipoDocumento');
    }
    if (!data.establecimiento) {
      throw new Error('Debe completar Establecimiento de la Emisión en data.establecimiento');
    }
    if (!data.punto) {
      throw new Error('Debe completar el Punto de emisión en data.punto');
    }
    if (!data.numero) {
      throw new Error('Debe completar el Número de Documento en data.numero');
    }
    if (!data.fecha) {
      throw new Error('Debe completar la Fecha de Emisión en data.fecha');
    }

    if (!(params.ruc.indexOf('-') >= 0)) {
      throw new Error('El RUC del Emisor debe contener el DV en params.ruc');
    }

    let rucEmisor = params['ruc'].split('-')[0];
    let dvEmisor = params['ruc'].split('-')[1];

    if ((rucEmisor + '').length > 8) {
      throw new Error('La parte del RUC del Emisor no puede superar los 8 caracteres');
    }
    if ((dvEmisor + '').length > 1) {
      throw new Error('El DV del RUC del Emisor no puede superar 1 caracter');
    }

    if ((data.tipoDocumento + '').length > 1) {
      throw new Error('El Tipo de Documento no puede superar 1 digito en data.tipoDocumento');
    }
    if ((data.establecimiento + '').length > 3) {
      throw new Error('El Establecimiento no puede superar 3 digitos en data.establecimiento');
    }
    if ((data.punto + '').length > 3) {
      throw new Error('El Punto de Emisión no puede superar 3 digitos en data.punto');
    }
    if ((data.numero + '').length > 7) {
      throw new Error('El Número de Documento no puede superar 7 digitos en data.numero');
    }
    if ((data.fecha + '').length > 19) {
      throw new Error('La Fecha de Emisión no puede superar los 19 caracteres en data.fecha');
    }
  }

  /**
   * Si los valores vienen en underscore, crea los valores en formato variableJava que
   * sera utilizado dentro del proceso,
   *
   * Ej. si viene tipo_documento crea una variable tipoDocumento, con el mismo valor.
   *
   * @param data
   */
  private removeUnderscoreAndPutCamelCase(data: any) {
    const regExpOnlyNumber = new RegExp(/^\d+$/);

    if (data.tipo_documento) {
      data.tipoDocumento = data.tipo_documento;
    }

    if (data.tipo_contribuyente) {
      data.tipoContribuyente = data.tipo_contribuyente;
    }

    if (data.tipo_emision) {
      data.tipoEmision = data.tipo_emision;
    }

    if (data.tipo_transaccion) {
      data.tipoTransaccion = data.tipo_transaccion;
    }

    if (data.tipo_impuesto) {
      data.tipoImpuesto = data.tipo_impuesto;
    }

    if (data.condicion_anticipo) {
      data.condicionAnticipo = data.condicion_anticipo;
    }

    if (data.anticipo_global) {
      data.anticipoGlobal = data.anticipo_global;
    }

    if (data.condicion_tipo_cambio) {
      data.condicionTipoCambio = data.condicion_tipo_cambio;
    }

    if (data.descuento_global) {
      data.descuentoGlobal = data.descuento_global;
    }

    //Objeto Cliente
    if (data.cliente?.razon_social) {
      data.cliente.razonSocial = data.cliente.razon_social;
    }
    if (data.cliente?.nombre_fantasia) {
      data.cliente.nombreFantasia = data.cliente.nombre_fantasia;
    }
    if (data.cliente?.tipo_operacion) {
      data.cliente.tipoOperacion = data.cliente.tipo_operacion;
    }

    if (data.cliente?.tipoOperacion == 3) {
      //B2G
      //Completar los datos de la DNCP de forma predeterminada.
      if (!data.dncp) {
        data.dncp = {};
        data.dncp.modalidad = '11';
        data.dncp.entidad = '11111';
        data.dncp.secuencia = '1111111';
        data.dncp.año = '11';
        let fechaContratacion = new Date();
        fechaContratacion.setDate(fechaContratacion.getDate() - 30); //1 mes antes
        data.dncp.fecha = fechaUtilService.convertToAAAA_MM_DD(fechaContratacion);
      } else {
        if (data.dncp?.ano) {
          data.dncp.año = data.dncp.ano;
        }
      }
    } else {
      if (data.dncp?.ano) {
        data.dncp.año = data.dncp.ano;
      }
    }
    //Campo que puede ser un numero = 0, hay que validar de esta forma
    if (typeof data.cliente != 'undefined' && typeof data.cliente.numero_casa != 'undefined') {
      if (data.cliente.numero_casa != null) {
        data.cliente.numeroCasa = data.cliente.numero_casa + '';
      }
    }
    if (data.cliente?.tipo_contribuyente) {
      data.cliente.tipoContribuyente = data.cliente.tipo_contribuyente;
    }
    if (data.cliente?.documento_tipo) {
      data.cliente.documentoTipo = data.cliente.documento_tipo;
    }
    if (data.cliente?.documento_tipo_descripcion) {
      data.cliente.documentoTipoDescripcion = data.cliente.documento_tipo_descripcion;
    }
    if (data.cliente?.documento_numero) {
      data.cliente.documentoNumero = data.cliente.documento_numero;
    }

    //Usuario
    if (data.usuario?.documento_tipo) {
      data.usuario.documentoTipo = data.usuario.documento_tipo;
    }
    if (data.usuario?.documento_tipo_descripcion) {
      data.usuario.documentoTipoDescripcion = data.usuario.documento_tipo_descripcion;
    }
    if (data.usuario?.documento_numero) {
      data.usuario.documentoNumero = data.usuario.documento_numero;
    }

    //Factura
    if (data.factura?.fecha_envio) {
      data.factura.fechaEnvio = data.usuario.fecha_envio;
    }

    //AutoFactura
    if (data.auto_factura) {
      data.autoFactura = { ...data.auto_factura };
    }

    if (data.autoFactura?.tipo_vendedor) {
      data.autoFactura.tipoVendedor = data.autoFactura.tipo_vendedor;
    }

    if (data.autoFactura?.documento_tipo) {
      data.autoFactura.documentoTipo = data.autoFactura.documento_tipo;
    }

    if (data.autoFactura?.documento_numero) {
      data.autoFactura.documentoNumero = data.autoFactura.documento_numero;
    }

    if (
      data.autoFactura != null &&
      typeof data.autoFactura != 'undefined' &&
      data.autoFactura.numero_casa != null &&
      typeof data.autoFactura.numero_casa != 'undefined'
    ) {
      if (data.autoFactura.numero_casa != null) {
        data.autoFactura.numeroCasa = data.autoFactura.numero_casa + '';
      }
    }

    /*if (data.autoFactura?.numero_casa) {
      data.autoFactura.numeroCasa = data.autoFactura.numero_casa;
    }*/

    //Remision
    if (data.nota_credito_debito) {
      data.notaCreditoDebito = data.nota_credito_debito;
    }

    //Remision
    if (data.remision?.tipo_responsable) {
      data.remision.tipoResponsable = data.remision.tipo_responsable;
    }

    if (data.remision?.fecha_factura) {
      data.remision.fechaFactura = data.remision.fecha_factura;
    }

    if (data.remision?.costo_flete) {
      data.remision.costoFlete = data.remision.costo_flete;
    }

    //Documento Asociado
    if (data.documento_asociado) {
      data.documentoAsociado = { ...data.documento_asociado };
    }

    if (data.documentoAsociado?.numero_retencion) {
      data.documentoAsociado.numeroRetencion = data.documentoAsociado.numero_retencion;
    }

    if (data.documentoAsociado?.resolucion_credito_fiscal) {
      data.documentoAsociado.resolucionCreditoFiscal = data.documentoAsociado.resolucion_credito_fiscal;
    }

    if (data.documentoAsociado?.tipo_documento_impreso) {
      data.documentoAsociado.tipoDocumentoImpreso = data.documentoAsociado.tipo_documento_impreso;
    }

    if (data.documentoAsociado?.constancia_tipo) {
      data.documentoAsociado.constanciaTipo = data.documentoAsociado.constancia_tipo;
    }

    if (data.documentoAsociado?.constancia_numero) {
      data.documentoAsociado.constanciaNumero = data.documentoAsociado.constancia_numero;
    }

    if (data.documentoAsociado?.constancia_control) {
      data.documentoAsociado.constanciaControl = data.documentoAsociado.constancia_control;
    }

    if (data.documentoAsociado?.ruc_fusionado) {
      data.documentoAsociado.rucFusionado = data.documentoAsociado.ruc_fusionado;
    }

    //Condicion entregas
    if (data.condicion?.entregas && data.condicion?.entregas.length > 0) {
      for (let i = 0; i < data.condicion.entregas.length; i++) {
        const entrega = data.condicion.entregas[i];

        if (entrega.info_tarjeta) {
          entrega.infoTarjeta = { ...entrega.info_tarjeta };
        }

        if (entrega.infoTarjeta?.razon_social) {
          entrega.infoTarjeta.razonSocial = entrega.infoTarjeta.razon_social;
        }

        if (entrega.infoTarjeta?.medio_pago) {
          entrega.infoTarjeta.medioPago = entrega.infoTarjeta.medio_pago;
        }

        if (entrega.infoTarjeta?.codigo_autorizacion) {
          entrega.infoTarjeta.codigoAutorizacion = entrega.infoTarjeta.codigo_autorizacion;
        }

        if (entrega.info_cheque) {
          entrega.infoCheque = { ...entrega.info_cheque };
        }

        if (entrega.infoCheque?.numero_cheque) {
          entrega.infoCheque.numeroCheque = entrega.infoCheque.numero_cheque;
        }
      }
    }

    if (data.condicion?.monto_entrega) {
      data.condicion.montoEntrega = data.condicion.monto_entrega;
    }

    if (data.condicion?.credito) {
      if (data.condicion.credito.info_cuotas) {
        data.condicion.credito.infoCuotas = [...data.condicion.credito.info_cuotas];
      }
    }

    //Items
    if (data.items && data.items?.length > 0) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];

        if (item.partida_arancelaria) {
          item.partidaArancelaria = item.partida_arancelaria;
        }
        if (item.unidad_medida) {
          item.unidadMedida = item.unidad_medida;
        }

        //if (item.precio_unitario) {
        //Los valores numericos que pueden aceptar 0 hay que validar de esta manera.
        if (item['precio_unitario'] != null && (item['precio_unitario'] + '').length > 0) {
          item.precioUnitario = item.precio_unitario;
        }
        if (item.tolerancia_cantidad) {
          item.toleranciaCantidad = item.tolerancia_cantidad;
        }
        if (item.tolerancia_porcentaje) {
          item.toleranciaPorcentaje = item.tolerancia_porcentaje;
        }
        if (item.cdc_anticipo) {
          item.cdcAnticipo = item.cdc_anticipo;
        }

        //if (item.iva_tipo) {
        if (typeof item.iva_tipo != 'undefined') {
          item.ivaTipo = item.iva_tipo;
        }
        //if (item.iva_base) {
        if (typeof item.iva_base != 'undefined') {
          item.ivaBase = item.iva_base;
        }
        if (item.numero_serie) {
          item.numeroSerie = item.numero_serie;
        }
        if (item.numero_pedido) {
          item.numeroPedido = item.numero_pedido;
        }
        if (item.numero_seguimiento) {
          item.numeroSeguimiento = item.numero_seguimiento;
        }

        //DNCP
        if (item.dncp) {
          if (item.dncp.codigo_nivel_general) {
            item.dncp.codigoNivelGeneral = item.dncp.codigo_nivel_general;
          }

          if (item.dncp.codigo_nivel_especifico) {
            item.dncp.codigoNivelEspecifico = item.dncp.codigo_nivel_especifico;
          }

          if (item.dncp.codigo_gtin_producto) {
            item.dncp.codigoGtinProducto = item.dncp.codigo_gtin_producto;
          }

          if (item.dncp.codigo_nivel_paquete) {
            item.dncp.codigoNivelPaquete = item.dncp.codigo_nivel_paquete;
          }
        }

        //Datos predeterminados para DNCP, si no se le pasa
        if (data.cliente?.tipoOperacion == 3) {
          //B2G - NT20
          if (!item.dncp) {
            item.dncp = {};
            item.dncp.codigoNivelGeneral = '00000000';
            item.dncp.codigoNivelEspecifico = '000';
            item.dncp.codigoGtinProducto = '11111111'; //Numerico
            item.dncp.codigoNivelPaquete = '11111111'; //Numerico
          }
        }

        //Importador
        if (item.importador) {
          if (item.importador.registro_importador) {
            item.importador.registroImportador = item.importador.registro_importador;
          }

          if (item.registro_senave) {
            item.registroSenave = item.registro_senave;
          }

          if (item.registro_entidad_comercial) {
            item.registroEntidadComercial = item.registro_entidad_comercial;
          }
        }
        //Sector Automotor
        if (item.sector_automotor) {
          if (item.sector_automotor.capacidad_motor) {
            item.sector_automotor.capacidadMotor = item.sector_automotor.capacidad_motor;
          }

          if (item.sector_automotor.capacidad_pasajeros) {
            item.sector_automotor.capacidadPasajeros = item.sector_automotor.capacidad_pasajeros;
          }

          if (item.sector_automotor.peso_bruto) {
            item.sector_automotor.pesoBruto = item.sector_automotor.peso_bruto;
          }

          if (item.sector_automotor.peso_neto) {
            item.sector_automotor.pesoNeto = item.sector_automotor.peso_neto;
          }

          if (item.sector_automotor.tipo_combustible) {
            item.sector_automotor.tipoCombustible = item.sector_automotor.tipo_combustible;
          }

          if (item.sector_automotor.numero_motor) {
            item.sector_automotor.numeroMotor = item.sector_automotor.numero_motor;
          }

          if (item.sector_automotor.capacidad_traccion) {
            item.sector_automotor.capacidadTraccion = item.sector_automotor.capacidad_traccion;
          }

          if (item.sector_automotor.tipo_vehiculo) {
            item.sector_automotor.tipoVehiculo = item.sector_automotor.tipo_vehiculo;
          }
        }
      }
    }

    //Detalle de Tranposte
    if (data.detalle_transporte) {
      data.detalleTransporte = { ...data.detalle_transporte };
    }
    if (data.transporte) {
      //Nueva version quedara solamente data.trasnsporte
      data.detalleTransporte = { ...data.transporte };
    }

    if (data.detalleTransporte?.tipo_responsable) {
      data.detalleTransporte.tipoResponsable = data.detalleTransporte.tipo_responsable;
    }

    if (data.detalleTransporte?.condicion_negociacion) {
      data.detalleTransporte.condicionNegociacion = data.detalleTransporte.condicion_negociacion;
    }

    if (data.detalleTransporte?.numero_manifiesto) {
      data.detalleTransporte.numeroManifiesto = data.detalleTransporte.numero_manifiesto;
    }
    if (data.detalleTransporte?.numero_despacho_importacion) {
      data.detalleTransporte.numeroDespachoImportacion = data.detalleTransporte.numero_despacho_importacion;
    }
    if (data.detalleTransporte?.inicio_estimado_translado) {
      data.detalleTransporte.inicioEstimadoTranslado = data.detalleTransporte.inicio_estimado_translado;
    }
    if (data.detalleTransporte?.fin_estimado_translado) {
      data.detalleTransporte.finEstimadoTranslado = data.detalleTransporte.fin_estimado_translado;
    }
    if (data.detalleTransporte?.pais_destino) {
      data.detalleTransporte.paisDestino = data.detalleTransporte.pais_destino;
    }
    if (data.detalleTransporte?.pais_destino_nombre) {
      data.detalleTransporte.paisDestinoNombre = data.detalleTransporte.pais_destino_nombre;
    }

    //Falta los de salida, entrega, etc.

    //Detalle de Transporte Salida
    if (data.detalleTransporte?.salida?.numero_casa) {
      //Nueva version quedara solamente data.trasnsporte
      data.detalleTransporte.salida.numeroCasa = data.detalleTransporte.salida.numero_casa;
    }
    if (data.detalleTransporte?.salida?.complemento_direccion1) {
      data.detalleTransporte.salida.complementoDireccion1 = data.detalleTransporte.salida.complemento_direccion1;
    }
    if (data.detalleTransporte?.salida?.complemento_direccion2) {
      data.detalleTransporte.salida.complementoDireccion2 = data.detalleTransporte.salida.complemento_direccion2;
    }
    if (data.detalleTransporte?.salida?.departamento_descripcion) {
      data.detalleTransporte.salida.departamentoDescripcion = data.detalleTransporte.salida.departamento_descripcion;
    }
    if (data.detalleTransporte?.salida?.distrito_descripcion) {
      data.detalleTransporte.salida.distritoDescripcion = data.detalleTransporte.salida.distrito_descripcion;
    }
    if (data.detalleTransporte?.salida?.ciudad_descripcion) {
      data.detalleTransporte.salida.ciudadDescripcion = data.detalleTransporte.salida.ciudad_descripcion;
    }
    if (data.detalleTransporte?.salida?.pais_descripcion) {
      data.detalleTransporte.salida.paisDescripcion = data.detalleTransporte.salida.pais_descripcion;
    }
    if (data.detalleTransporte?.salida?.telefono_contacto) {
      data.detalleTransporte.salida.telefonoContacto = data.detalleTransporte.salida.telefono_contacto;
    }

    //Detalle de Transporte Entrega
    if (data.detalleTransporte?.entrega?.numero_casa) {
      //Nueva version quedara solamente data.trasnsporte
      data.detalleTransporte.entrega.numeroCasa = data.detalleTransporte.entrega.numero_casa;
    }
    if (data.detalleTransporte?.entrega?.complemento_direccion1) {
      data.detalleTransporte.entrega.complementoDireccion1 = data.detalleTransporte.entrega.complemento_direccion1;
    }
    if (data.detalleTransporte?.entrega?.complemento_direccion2) {
      data.detalleTransporte.entrega.complementoDireccion2 = data.detalleTransporte.entrega.complemento_direccion2;
    }
    if (data.detalleTransporte?.entrega?.departamento_descripcion) {
      data.detalleTransporte.entrega.departamentoDescripcion = data.detalleTransporte.entrega.departamento_descripcion;
    }
    if (data.detalleTransporte?.entrega?.distrito_descripcion) {
      data.detalleTransporte.entrega.distritoDescripcion = data.detalleTransporte.entrega.distrito_descripcion;
    }
    if (data.detalleTransporte?.entrega?.ciudad_descripcion) {
      data.detalleTransporte.entrega.ciudadDescripcion = data.detalleTransporte.entrega.ciudad_descripcion;
    }
    if (data.detalleTransporte?.entrega?.pais_descripcion) {
      data.detalleTransporte.entrega.paisDescripcion = data.detalleTransporte.entrega.pais_descripcion;
    }
    if (data.detalleTransporte?.entrega?.telefono_contacto) {
      data.detalleTransporte.entrega.telefonoContacto = data.detalleTransporte.entrega.telefono_contacto;
    }

    // Detalle de Transporte Vehiculo
    if (data.detalleTransporte?.vehiculo?.documento_tipo) {
      data.detalleTransporte.vehiculo.documentoTipo = data.detalleTransporte.vehiculo.documento_tipo;
    }
    if (data.detalleTransporte?.vehiculo?.documento_numero) {
      data.detalleTransporte.vehiculo.documentoNumero = data.detalleTransporte.vehiculo.documento_numero;
    }
    if (data.detalleTransporte?.vehiculo?.numero_matricula) {
      data.detalleTransporte.vehiculo.numeroMatricula = data.detalleTransporte.vehiculo.numero_matricula;
    }
    if (data.detalleTransporte?.vehiculo?.numero_vuelo) {
      data.detalleTransporte.vehiculo.numeroVuelo = data.detalleTransporte.vehiculo.numero_vuelo;
    }

    // Detalle de Transporte Transportista
    if (data.detalleTransporte?.transportista?.documento_tipo) {
      data.detalleTransporte.transportista.documentoTipo = data.detalleTransporte.transportista.documento_tipo;
    }
    if (data.detalleTransporte?.transportista?.documento_numero) {
      data.detalleTransporte.transportista.documentoNumero = data.detalleTransporte.transportista.documento_numero;
    }
    if (data.detalleTransporte?.transportista?.pais_descripcion) {
      data.detalleTransporte.transportista.paisDescripcion = data.detalleTransporte.transportista.pais_descripcion;
    }

    // Detalle de Transporte Transportista Chofer
    if (data.detalleTransporte?.transportista?.chofer?.documento_numero) {
      data.detalleTransporte.transportista.chofer.documentoNumero =
        data.detalleTransporte.transportista.chofer.documento_numero;
    }

    // Data Complementarios
    if (data.complementarios?.orden_compra) {
      data.complementarios.ordenCompra = data.complementarios.orden_compra;
    }
    if (data.complementarios?.orden_venta) {
      data.complementarios.ordenVenta = data.complementarios.orden_venta;
    }
    if (data.complementarios?.numero_asiento) {
      data.complementarios.numeroAsiento = data.complementarios.numero_asiento;
    }

    // Data complementarios carga
    if (data.complementarios?.carga?.orden_compra) {
      data.complementarios.carga.ordenCompra = data.complementarios.carga.orden_compra;
    }
    if (data.complementarios?.carga?.orden_venta) {
      data.complementarios.carga.ordenVenta = data.complementarios.carga.orden_venta;
    }
    if (data.complementarios?.carga?.numero_asiento) {
      data.complementarios.carga.numeroAsiento = data.complementarios.carga.numero_asiento;
    }

    //Sector Energia
    if (data.sector_energia_electrica) {
      data.sectorEnergiaElectrica = { ...data.sector_energia_electrica };
    }

    if (data.sectorEnergiaElectrica?.numero_medidor) {
      data.sectorEnergiaElectrica.numeroMedidor = data.sectorEnergiaElectrica.numero_medidor;
    }

    if (data.sectorEnergiaElectrica?.codigo_actividad) {
      data.sectorEnergiaElectrica.codigoActividad = data.sectorEnergiaElectrica.codigo_actividad;
    }

    if (data.sectorEnergiaElectrica?.codigo_categoria) {
      data.sectorEnergiaElectrica.codigoCategoria = data.sectorEnergiaElectrica.codigo_categoria;
    }

    if (data.sectorEnergiaElectrica?.lectura_anterior) {
      data.sectorEnergiaElectrica.lecturaAnterior = data.sectorEnergiaElectrica.lectura_anterior;
    }

    if (data.sectorEnergiaElectrica?.lectura_actual) {
      data.sectorEnergiaElectrica.lecturaActual = data.sectorEnergiaElectrica.lectura_actual;
    }

    //Sector Seguros
    if (data.sector_seguros) {
      data.sectorSeguros = { ...data.sector_seguros };
    }

    if (data.sectorSeguros?.codigo_aseguradora) {
      data.sectorSeguros.codigoAseguradora = data.sectorSeguros.codigo_aseguradora;
    }

    if (data.sectorSeguros?.codigo_poliza) {
      data.sectorSeguros.codigoPoliza = data.sectorSeguros.codigo_poliza;
    }

    if (data.sectorSeguros?.numero_poliza) {
      data.sectorSeguros.numeroPoliza = data.sectorSeguros.numero_poliza;
    }

    if (data.sectorSeguros?.vigencia_unidad) {
      data.sectorSeguros.vigenciaUnidad = data.sectorSeguros.vigencia_unidad;
    }

    if (data.sectorSeguros?.inicio_vigencia) {
      data.sectorSeguros.inicioVigencia = data.sectorSeguros.inicio_vigencia;
    }

    if (data.sectorSeguros?.fin_vigencia) {
      data.sectorSeguros.finVigencia = data.sectorSeguros.fin_vigencia;
    }

    if (data.sectorSeguros?.codigo_interno_item) {
      data.sectorSeguros.codigoInternoItem = data.sectorSeguros.codigo_interno_item;
    }
  }

  /**
   * Añade algunos valores por defecto al JSON de entrada, valido para
   * todas las operaciones
   * @param data
   */
  private addDefaultValues(data: any) {
    if (constanteService.tiposDocumentos.filter((um) => um.codigo === +data['tipoDocumento']).length == 0) {
      //No quitar este throw
      throw new Error(
        "Tipo de Documento '" +
          data['tipoDocumento'] +
          "' en data.tipoDocumento no válido. Valores: " +
          constanteService.tiposDocumentos.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    data['tipoDocumentoDescripcion'] = constanteService.tiposDocumentos.filter(
      (td) => td.codigo == +data['tipoDocumento'],
    )[0]['descripcion'];

    if (!data['tipoEmision']) {
      data['tipoEmision'] = 1;
    }

    if (!data['tipoTransaccion']) {
      data['tipoTransaccion'] = 1;
    }

    if (!data['moneda']) {
      data['moneda'] = 'PYG';
    }

    if (data['moneda'] != 'PYG') {
      if (!data['condicionTipoCambio']) {
        data['condicionTipoCambio'] = 1; //Por el Global
      }
    }

    //Valores por defecto para los items
    if (data['items'] && data['items'].length > 0) {
      for (let i = 0; i < data['items'].length; i++) {
        const item = data['items'][i];
        if (!item['unidadMedida']) {
          item['unidadMedida'] = 77;
        }
      }
    }
  }

  private generateRte(params: any) {
    this.json = {
      rDE: {
        $: {
          xmlns: 'http://ekuatia.set.gov.py/sifen/xsd',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation': 'http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd',
        },
        dVerFor: params.version,
      },
    };
  }

  private generateDe(params: any, data: any) {
    if (params['ruc'].indexOf('-') == -1) {
      //throw new Error('RUC debe contener dígito verificador en params.ruc');
    }
    const rucEmisor = params['ruc'].split('-')[0];
    const dvEmisor = params['ruc'].split('-')[1];

    const id = this.codigoControl;

    let fechaFirmaDigital = new Date();
    if (data.fechaFirmaDigital) {
      fechaFirmaDigital = new Date(data.fechaFirmaDigital);
    }

    let digitoVerificadorString = this.codigoControl + '';

    const jsonResult = {
      $: {
        Id: id,
      },
      dDVId: digitoVerificadorString.substring(digitoVerificadorString.length - 1, digitoVerificadorString.length),
      dFecFirma: fechaUtilService.convertToJSONFormat(fechaFirmaDigital),
      dSisFact: 1,
    };

    return jsonResult;
  }

  /**
     * Datos inerentes a la operacion 
     * <gOpeDE>
            <iTipEmi>1</iTipEmi>
            <dDesTipEmi>Normal</dDesTipEmi>
            <dCodSeg>000000023</dCodSeg>
            <dInfoEmi>1</dInfoEmi>
            <dInfoFisc>Información de interés del Fisco respecto al DE</dInfoFisc>
        </gOpeDE>

     * @param params 
     * @param data 
     * @param options 
     */
  private generateDatosOperacion(params: any, data: any) {
    if (params['ruc'].indexOf('-') == -1) {
      //throw new Error('RUC debe contener dígito verificador en params.ruc');
    }
    const rucEmisor = params['ruc'].split('-')[0];
    const dvEmisor = params['ruc'].split('-')[1];

    const id = jsonDteAlgoritmos.generateCodigoControl(params, data, this.codigoSeguridad);
    const digitoVerificador = jsonDteAlgoritmos.calcularDigitoVerificador(rucEmisor, 11);

    if (id.length != 44) {
    }

    const codigoSeguridadAleatorio = this.codigoSeguridad;

    if (constanteService.tiposEmisiones.filter((um) => um.codigo === data['tipoEmision']).length == 0) {
      /*throw new Error(
        "Tipo de Emisión '" +
          data['tipoEmision'] +
          "' en data.tipoEmision no válido. Valores: " +
          constanteService.tiposEmisiones.map((a) => a.codigo + '-' + a.descripcion),
      );*/
    }

    this.json['rDE']['DE']['gOpeDE'] = {
      iTipEmi: data['tipoEmision'],
      dDesTipEmi: constanteService.tiposEmisiones.filter((td) => td.codigo == data['tipoEmision'])[0]['descripcion'],
      dCodSeg: codigoSeguridadAleatorio,
    };

    if (data['observacion'] && data['observacion'].length > 0) {
      this.json['rDE']['DE']['gOpeDE']['dInfoEmi'] = data['observacion'];
    }

    if (data['descripcion'] && data['descripcion'].length > 0) {
      this.json['rDE']['DE']['gOpeDE']['dInfoFisc'] = data['descripcion'];
    }
  }

  /**
     * Genera los datos del timbrado
     * 
     * <gTimb>
			<iTiDE>1</iTiDE>
			<dDesTiDE>Factura electrónica</dDesTiDE>
			<dNumTim>12345678</dNumTim>
			<dEst>001</dEst>
			<dPunExp>001</dPunExp>
			<dNumDoc>1000050</dNumDoc>
			<dSerieNum>AB</dSerieNum>
			<dFeIniT>2019-08-13</dFeIniT>
		</gTimb>

     * @param params 
     * @param data 
     * @param options 
     */
  private generateDatosTimbrado(params: any, data: any) {
    this.json['rDE']['DE']['gTimb'] = {
      iTiDE: data['tipoDocumento'],
      dDesTiDE: data['tipoDocumentoDescripcion'],
      dNumTim: params['timbradoNumero'],
      dEst: stringUtilService.leftZero(data['establecimiento'], 3),
      dPunExp: stringUtilService.leftZero(data['punto'], 3),
      dNumDoc: stringUtilService.leftZero(data['numero'], 7),
      //dSerieNum : null,
      //dFeIniT: params['timbradoFecha'].substring(0, 10),
    };

    if (data['numeroSerie']) {
      this.json['rDE']['DE']['gTimb']['dSerieNum'] = data['numeroSerie'];
    }
    if (data['serie']) {
      this.json['rDE']['DE']['gTimb']['dSerieNum'] = data['serie'];
    }
    //if (data['numeroSerie']) {
    this.json['rDE']['DE']['gTimb']['dFeIniT'] = params['timbradoFecha'].substring(0, 10);
    //}
  }

  /**
     * Genera los campos generales, divide las actividades en diferentes metodos
     * 
     *  <gDatGralOpe>
            <dFeEmiDE>2020-05-07T15:03:57</dFeEmiDE>
        </gDatGralOpe>
     * 
     * @param params 
     * @param data 
     * @param options 
     */
  private generateDatosGenerales(params: any, data: any, config: XmlgenConfig) {
    this.json['rDE']['DE']['gDatGralOpe'] = {
      dFeEmiDE: data['fecha'],
    };
    this.generateDatosGeneralesInherentesOperacion(params, data, config);
    this.generateDatosGeneralesEmisorDE(params, data);
    if (config.userObjectRemove == false) {
      //Si está TRUE no crea el objeto usuario
      if (data['usuario']) {
        //No es obligatorio
        this.generateDatosGeneralesResponsableGeneracionDE(params, data);
      }
    }
    this.generateDatosGeneralesReceptorDE(params, data);
  }

  /**
     * D1. Campos inherentes a la operación comercial (D010-D099)
     * Pertenece al grupo de datos generales
     * 
     * <gOpeCom>
            <iTipTra>1</iTipTra>
            <dDesTipTra>Venta de mercadería</dDesTipTra>
            <iTImp>1</iTImp>
            <dDesTImp>IVA</dDesTImp>
            <cMoneOpe>PYG</cMoneOpe>
            <dDesMoneOpe>Guarani</dDesMoneOpe>
        </gOpeCom>
     * @param params 
     * @param data 
     * @param options 
     */
  private generateDatosGeneralesInherentesOperacion(params: any, data: any, config: XmlgenConfig) {
    if (data['tipoDocumento'] == 7) {
      //C002
      return; //No informa si el tipo de documento es 7
    }

    let moneda = data['moneda'];
    if (!moneda && config.defaultValues === true) {
      moneda = 'PYG';
    }

    this.json['rDE']['DE']['gDatGralOpe']['gOpeCom'] = {};

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
      //Obligatorio informar iTipTra D011
      if (!data['tipoTransaccion']) {
        //throw new Error('Debe proveer el Tipo de Transacción en data.tipoTransaccion');
      }
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iTipTra'] = data['tipoTransaccion'];
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesTipTra'] = constanteService.tiposTransacciones.filter(
        (tt) => tt.codigo == data['tipoTransaccion'],
      )[0]['descripcion'];
    }

    this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iTImp'] = data['tipoImpuesto']; //D013
    this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesTImp'] = constanteService.tiposImpuestos.filter(
      (ti) => ti.codigo == data['tipoImpuesto'],
    )[0]['descripcion']; //D013
    this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['cMoneOpe'] = moneda; //D015
    this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesMoneOpe'] = constanteService.monedas.filter(
      (m) => m.codigo == moneda,
    )[0]['descripcion'];

    if (moneda != 'PYG') {
      if (!data['condicionTipoCambio']) {
        //throw new Error('Debe informar el tipo de Cambio en data.condicionTipoCambio');
      }
      //Obligatorio informar dCondTiCam D017
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dCondTiCam'] = data['condicionTipoCambio'];
    }
    if (data['condicionTipoCambio'] == 1 && moneda != 'PYG') {
      if (!(data['cambio'] && data['cambio'] > 0)) {
        //throw new Error('Debe informar el valor del Cambio en data.cambio');
      }
      //Obligatorio informar dCondTiCam D018
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dTiCam'] = data['cambio'];
    }

    if (data['condicionAnticipo']) {
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iCondAnt'] = data['condicionAnticipo'];
      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesCondAnt'] =
        'Anticipo ' +
        constanteService.globalPorItem.filter((ca) => ca.codigo == data['condicionAnticipo'])[0]['descripcion'];
    }

    if (data['obligaciones'] && Array.isArray(data['obligaciones'])) {
      let gOblAfe = new Array();
      for (let i = 0; i < data['obligaciones'].length; i++) {
        let gOblAfeItem: any = {};
        gOblAfeItem['cOblAfe'] = data['obligaciones'][i]['codigo'];
        //gOblAfeItem['dDesOblAfe'] = params['obligaciones'][i]['descripcion'];
        gOblAfeItem['dDesOblAfe'] = constanteService.obligaciones.filter(
          (ca) => ca.codigo == +data['obligaciones'][i]['codigo'],
        )[0]['descripcion'];
        gOblAfe.push(gOblAfeItem);
      }

      this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['gOblAfe'] = gOblAfe;
    }
  }

  /**
   * D2. Campos que identifican al emisor del Documento Electrónico DE (D100-D129)
   * Pertenece al grupo de datos generales
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosGeneralesEmisorDE(params: any, data: any) {
    if (!(params && params.establecimientos)) {
      //throw new Error('Debe proveer un Array con la información de los establecimientos en params');
    }

    //Validar si el establecimiento viene en params
    let establecimiento = stringUtilService.leftZero(data['establecimiento'], 3);
    //let punto = stringUtilService.leftZero(data['punto'], 3);

    if (params.establecimientos.filter((um: any) => um.codigo === establecimiento).length == 0) {
      /*throw new Error(
        "Establecimiento '" +
          establecimiento +
          "' no encontrado en params.establecimientos*.codigo. Valores: " +
          params.establecimientos.map((a: any) => a.codigo + '-' + a.denominacion),
      );*/
    }
    if (params['ruc'].indexOf('-') == -1) {
      //throw new Error('RUC debe contener dígito verificador en params.ruc');
    }

    this.json['rDE']['DE']['gDatGralOpe']['gEmis'] = {};
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dRucEm'] = params['ruc'].split('-')[0];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDVEmi'] = params['ruc'].split('-')[1];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['iTipCont'] = params['tipoContribuyente'];
    if (typeof params['tipoRegimen'] != undefined) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['cTipReg'] = params['tipoRegimen'];
    }
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dNomEmi'] = params['razonSocial'];
    if (params['nombreFantasia'] && (params['nombreFantasia'] + '').length > 0) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dNomFanEmi'] = params['nombreFantasia'];
    }
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDirEmi'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['direccion'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dNumCas'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['numeroCasa'];

    let dCompDir1 = params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0][
      'complementoDireccion1'
    ];
    if (dCompDir1 && (dCompDir1 + '').length > 1) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dCompDir1'] = dCompDir1;
    }

    let dCompDir2 = params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0][
      'complementoDireccion2'
    ];
    if (dCompDir2 && (dCompDir2 + '').length > 1) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dCompDir2'] = dCompDir2;
    }

    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['cDepEmi'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['departamento'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDesDepEmi'] = constanteService.departamentos.filter(
      (td) =>
        td.codigo === params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0]['departamento'],
    )[0]['descripcion'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['cDisEmi'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['distrito'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDesDisEmi'] = constanteService.distritos.filter(
      (td) => td.codigo === params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0]['distrito'],
    )[0]['descripcion'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['cCiuEmi'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['ciudad'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDesCiuEmi'] = constanteService.ciudades.filter(
      (td) => td.codigo === params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0]['ciudad'],
    )[0]['descripcion'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dTelEmi'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['telefono'];

    if (params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0]['email']) {
      let email = new String(params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0]['email']); //Hace una copia, para no alterar.

      //Verificar si tiene varios correos.
      if (email.indexOf(',') > -1) {
        //Si el Email tiene , (coma) entonces va enviar solo el primer valor, ya que SIFEN no acepta Comas
        email = email.split(',')[0].trim();
      }

      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dEmailE'] = email.trim();
    }
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['dDenSuc'] = params['establecimientos'].filter(
      (e: any) => e.codigo === establecimiento,
    )[0]['denominacion'];

    if (params['actividadesEconomicas'] && params['actividadesEconomicas'].length > 0) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gActEco'] = [];
      for (let i = 0; i < params['actividadesEconomicas'].length; i++) {
        const actividadEconomica = params['actividadesEconomicas'][i];
        const gActEco = {
          cActEco: actividadEconomica.codigo,
          dDesActEco: actividadEconomica.descripcion,
        };
        this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gActEco'].push(gActEco);
      }
    } else {
      //throw new Error('Debe proveer el array de actividades económicas en params.actividadesEconomicas');
    }
  }

  /**
   * Datos generales del responsable de generacion del DE
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosGeneralesResponsableGeneracionDE(params: any, data: any) {
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE'] = {
      iTipIDRespDE: data['usuario']['documentoTipo'],
      dDTipIDRespDE: constanteService.tiposDocumentosIdentidades.filter(
        (td) => td.codigo === +data['usuario']['documentoTipo'],
      )[0]['descripcion'],
    };

    if (data['usuario']['documentoTipo'] == 9) {
      this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE']['dDTipIDRespDE'] =
        data['usuario']['documentoTipoDescripcion'];
    }

    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE']['dNumIDRespDE'] = data['usuario']['documentoNumero'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE']['dNomRespDE'] = data['usuario']['nombre'];
    this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE']['dCarRespDE'] = data['usuario']['cargo'];
  }

  /**
     * Datos generales del receptor del documento electrónico
     * Pertenece al grupo de datos generales
     * 
     * <gDatRec>
                <iNatRec>1</iNatRec>
                <iTiOpe>1</iTiOpe>
                <cPaisRec>PRY</cPaisRec>
                <dDesPaisRe>Paraguay</dDesPaisRe>
                <iTiContRec>2</iTiContRec>
                <dRucRec>00000002</dRucRec>
                <dDVRec>7</dDVRec>
                <dNomRec>RECEPTOR DEL DOCUMENTO</dNomRec>
                <dDirRec>CALLE 1 ENTRE CALLE 2 Y CALLE 3</dDirRec>
                <dNumCasRec>123</dNumCasRec>
                <cDepRec>1</cDepRec>
                <dDesDepRec>CAPITAL</dDesDepRec>
                <cDisRec>1</cDisRec>
                <dDesDisRec>ASUNCION (DISTRITO)</dDesDisRec>
                <cCiuRec>1</cCiuRec>
                <dDesCiuRec>ASUNCION (DISTRITO)</dDesCiuRec>
                <dTelRec>012123456</dTelRec>
                <dCodCliente>AAA</dCodCliente>
            </gDatRec>
     * 
     * @param params 
     * @param data 
     * @param options 
     */
  private generateDatosGeneralesReceptorDE(params: any, data: any) {
    this.json['rDE']['DE']['gDatGralOpe']['gDatRec'] = {
      iNatRec: data['cliente']['contribuyente'] ? 1 : 2,
      iTiOpe: +data['cliente']['tipoOperacion'],
      cPaisRec: data['cliente']['pais'],
      dDesPaisRe: constanteService.paises.filter((pais) => pais.codigo === data['cliente']['pais'])[0]['descripcion'],
    };

    if (data['cliente']['contribuyente']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['iTiContRec'] = data['cliente']['tipoContribuyente'];
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dRucRec'] = (data['cliente']['ruc'].split('-')[0] + '').trim();
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDVRec'] = (data['cliente']['ruc'].split('-')[1] + '').trim();
    }

    //if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion']) { 2024-09-03
    if (!data['cliente']['contribuyente']) {
      //Obligatorio completar D210

      if (data['cliente']['documentoTipo']) {
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['iTipIDRec'] = +data['cliente']['documentoTipo'];
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDTipIDRec'] =
          constanteService.tiposDocumentosReceptor.filter((tdr) => tdr.codigo === +data['cliente']['documentoTipo'])[0][
            'descripcion'
          ];
      }

      if (+data['cliente']['documentoTipo'] == 9) {
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDTipIDRec'] = data['cliente']['documentoTipoDescripcion'];
      }

      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = (data['cliente']['documentoNumero'] + '').trim();

      if (+data['cliente']['documentoTipo'] === 5) {
        //Si es innominado completar con cero
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = '0';
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNomRec'] = 'Sin Nombre';
      }
    }

    this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNomRec'] = data['cliente']['razonSocial'].trim();

    if (data['cliente']['nombreFantasia']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNomFanRec'] = data['cliente']['nombreFantasia'].trim();
    }

    if (data['cliente']['direccion']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDirRec'] = data['cliente']['direccion'].trim();
    }

    if (data['cliente']['numeroCasa']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumCasRec'] = (data['cliente']['numeroCasa'] + '').trim();
    }

    //
    if (data['cliente']['direccion'] && +data['cliente']['tipoOperacion'] != 4) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDepRec'] = +data['cliente']['departamento'];
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDepRec'] = constanteService.departamentos.filter(
        (td) => td.codigo === +data['cliente']['departamento'],
      )[0]['descripcion'];
    }

    if (data['cliente']['direccion'] && +data['cliente']['tipoOperacion'] != 4) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDisRec'] = +data['cliente']['distrito'];
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDisRec'] = constanteService.distritos.filter(
        (td) => td.codigo === +data['cliente']['distrito'],
      )[0]['descripcion'];
    }

    if (data['cliente']['direccion'] && +data['cliente']['tipoOperacion'] != 4) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cCiuRec'] = +data['cliente']['ciudad'];
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesCiuRec'] = constanteService.ciudades.filter(
        (td) => td.codigo === +data['cliente']['ciudad'],
      )[0]['descripcion'];
    }

    //Asignar null a departamento, distrito y ciudad si tipoOperacion = 4

    if (data['cliente']['telefono']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec'].dTelRec = (data['cliente']['telefono'] + '').trim();
    }
    if (data['cliente']['celular']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec'].dCelRec = (data['cliente']['celular'] + '').trim();
    }
    if (data['cliente']['email']) {
      let email = new String(data['cliente']['email']); //Hace una copia, para no alterar.

      //Verificar si tiene varios correos.
      if (email.indexOf(',') > -1) {
        //Si el Email tiene , (coma) entonces va enviar solo el primer valor, ya que SIFEN no acepta Comas
        email = email.split(',')[0].trim();
      }

      this.json['rDE']['DE']['gDatGralOpe']['gDatRec'].dEmailRec = email.trim();
    }

    if (data['cliente']['codigo']) {
      this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dCodCliente'] = (data['cliente']['codigo'] + '').trim();
    }
  }

  /**
   * Campos que seran especificos de acuerdo a cada tipo de documento electronico
   * Se dividiran en diferentes métodos por cada tipo de factura.
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosEspecificosPorTipoDE(params: any, data: any, config: XmlgenConfig) {
    this.json['rDE']['DE']['gDtipDE'] = {};

    if (+data['tipoDocumento'] === 1) {
      this.generateDatosEspecificosPorTipoDE_FacturaElectronica(params, data, config);
    }
    if (+data['tipoDocumento'] === 4) {
      this.generateDatosEspecificosPorTipoDE_Autofactura(params, data);
    }

    if (+data['tipoDocumento'] === 5 || data['tipoDocumento'] === 6) {
      this.generateDatosEspecificosPorTipoDE_NotaCreditoDebito(params, data);
    }

    if (+data['tipoDocumento'] === 7) {
      this.generateDatosEspecificosPorTipoDE_RemisionElectronica(params, data);
    }
  }

  /**
   * Datos especificos para la factura electronica
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosEspecificosPorTipoDE_FacturaElectronica(params: any, data: any, config: XmlgenConfig) {
    if (
      constanteService.indicadoresPresencias.filter((um: any) => um.codigo === +data['factura']['presencia']).length ==
      0
    ) {
      /*throw new Error(
        "Indicador de Presencia '" +
          data['factura']['presencia'] +
          "' en data.factura.presencia no encontrado. Valores: " +
          constanteService.indicadoresPresencias.map((a: any) => a.codigo + '-' + a.descripcion),
      );*/
    }

    this.json['rDE']['DE']['gDtipDE']['gCamFE'] = {
      iIndPres: data['factura']['presencia'],
      dDesIndPres: constanteService.indicadoresPresencias.filter(
        (ip) => ip.codigo === +data['factura']['presencia'],
      )[0]['descripcion'],
      //dFecEmNR : data['factura']['fechaEnvio']
    };

    if (data['factura']['fechaEnvio']) {
      let fechaFactura = new Date(data['fecha']);
      let fechaEnvio = new Date(data['factura']['fechaEnvio']);

      if (fechaFactura.getTime() > fechaEnvio.getTime()) {
        /*throw new Error(
          "La Fecha de envío '" +
            data['factura']['fechaEnvio'] +
            "'en data.factura.fechaEnvio, debe ser despues de la fecha de Factura",
        );*/
      }
      this.json['rDE']['DE']['gDtipDE']['gCamFE']['dFecEmNR'] = data['factura']['fechaEnvio'];
    }
    if (data['cliente']['tipoOperacion'] === 3) {
      this.generateDatosEspecificosPorTipoDE_ComprasPublicas(params, data);
    }
  }

  /**
   * Datos especificos cuando el tipo de operacion del receptor es B2G (Campo D202)
   * Dentro de la factura electronica
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosEspecificosPorTipoDE_ComprasPublicas(params: any, data: any) {
    if (
      data['dncp'] &&
      data['dncp']['modalidad'] &&
      data['dncp']['entidad'] &&
      data['dncp']['año'] &&
      data['dncp']['secuencia'] &&
      data['dncp']['fecha']
    ) {
      this.json['rDE']['DE']['gDtipDE']['gCamFE']['gCompPub'] = {
        dModCont: data['dncp']['modalidad'],
        dEntCont: data['dncp']['entidad'],
        dAnoCont: data['dncp']['año'],
        dSecCont: data['dncp']['secuencia'],
        dFeCodCont: data['dncp']['fecha'],
      };
    }
  }

  private generateDatosEspecificosPorTipoDE_Autofactura(params: any, data: any) {
    this.json['rDE']['DE']['gDtipDE']['gCamAE'] = {
      iNatVen: data['autoFactura']['tipoVendedor'], //1=No contribuyente, 2=Extranjero
      dDesNatVen: constanteService.naturalezaVendedorAutofactura.filter(
        (nv) => nv.codigo === data['autoFactura']['tipoVendedor'],
      )[0]['descripcion'],
      iTipIDVen: data['autoFactura']['documentoTipo'],
      dDTipIDVen: constanteService.tiposDocumentosIdentidades.filter(
        (td) => td.codigo === data['autoFactura']['documentoTipo'],
      )[0]['descripcion'],
      dNumIDVen: data['autoFactura']['documentoNumero'],
      dNomVen: data['autoFactura']['nombre'],
      dDirVen: data['autoFactura']['direccion'],
      dNumCasVen: data['autoFactura']['numeroCasa'],

      cDepVen: +data['autoFactura']['departamento'],
      dDesDepVen: constanteService.departamentos.filter((td) => td.codigo === +data['autoFactura']['departamento'])[0][
        'descripcion'
      ],
      cDisVen: +data['autoFactura']['distrito'],
      dDesDisVen: constanteService.distritos.filter((td) => td.codigo === +data['autoFactura']['distrito'])[0][
        'descripcion'
      ],
      cCiuVen: +data['autoFactura']['ciudad'],
      dDesCiuVen: constanteService.ciudades.filter((td) => td.codigo === +data['autoFactura']['ciudad'])[0][
        'descripcion'
      ],
      dDirProv: data['autoFactura']['ubicacion']['lugar'],
      cDepProv: +data['autoFactura']['ubicacion']['departamento'],
      dDesDepProv: constanteService.departamentos.filter(
        (td) => td.codigo === +data['autoFactura']['ubicacion']['departamento'],
      )[0]['descripcion'],
      cDisProv: +data['autoFactura']['ubicacion']['distrito'],
      dDesDisProv: constanteService.distritos.filter(
        (td) => td.codigo === +data['autoFactura']['ubicacion']['distrito'],
      )[0]['descripcion'],
      cCiuProv: +data['autoFactura']['ubicacion']['ciudad'],
      dDesCiuProv: constanteService.ciudades.filter(
        (td) => td.codigo === +data['autoFactura']['ubicacion']['ciudad'],
      )[0]['descripcion'],
    };
  }

  private generateDatosEspecificosPorTipoDE_NotaCreditoDebito(params: any, data: any) {
    this.json['rDE']['DE']['gDtipDE']['gCamNCDE'] = {
      iMotEmi: +data['notaCreditoDebito']['motivo'],
      dDesMotEmi: constanteService.notasCreditosMotivos.filter(
        (nv) => nv.codigo === +data['notaCreditoDebito']['motivo'],
      )[0]['descripcion'],
    };
  }

  private generateDatosEspecificosPorTipoDE_RemisionElectronica(params: any, data: any) {
    this.json['rDE']['DE']['gDtipDE']['gCamNRE'] = {
      iMotEmiNR: +data['remision']['motivo'], //E501
      dDesMotEmiNR: constanteService.remisionesMotivos.filter((nv) => nv.codigo === +data['remision']['motivo'])[0][
        'descripcion'
      ],
      iRespEmiNR: +data['remision']['tipoResponsable'],
      dDesRespEmiNR: constanteService.remisionesResponsables.filter(
        (nv) => nv.codigo === +data['remision']['tipoResponsable'],
      )[0]['descripcion'],
    };

    if (+data['remision']['motivo'] == 99) {
      this.json['rDE']['DE']['gDtipDE']['gCamNRE']['dDesMotEmiNR'] = data['remision']['motivoDescripcion'];
    }
    //if (data['remision']['kms']) {
    //NT009 pasa a ser obligatorio
    this.json['rDE']['DE']['gDtipDE']['gCamNRE']['dKmR'] = data['remision']['kms'];
    //}
    if (data['remision']['fechaFactura']) {
      this.json['rDE']['DE']['gDtipDE']['gCamNRE']['dFecEm'] = data['remision']['fechaFactura'];
    }
    if (data['remision']['costoFlete']) {
      this.json['rDE']['DE']['gDtipDE']['gCamNRE']['cPreFle'] = data['remision']['costoFlete'];
    }
  }

  /**
   * E7. Campos que describen la condición de la operación (E600-E699)
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCondicionOperacionDE(params: any, data: any, config: XmlgenConfig) {
    if (!data['condicion']) {
      return;
    }
    if (
      constanteService.condicionesOperaciones.filter((um: any) => um.codigo === data['condicion']['tipo']).length == 0
    ) {
      /*throw new Error(
        "Condición de la Operación '" +
          data['condicion']['tipo'] +
          "' en data.condicion.tipo no encontrado. Valores: " +
          constanteService.condicionesOperaciones.map((a: any) => a.codigo + '-' + a.descripcion),
      );*/
    }

    this.json['rDE']['DE']['gDtipDE']['gCamCond'] = {
      iCondOpe: data['condicion']['tipo'],
      dDCondOpe: constanteService.condicionesOperaciones.filter((co) => co.codigo === data['condicion']['tipo'])[0][
        'descripcion'
      ],
    };

    //if (data['condicion']['tipo'] === 1) {
    this.generateDatosCondicionOperacionDE_Contado(params, data, config);
    //}

    if (data['condicion']['tipo'] === 2) {
      this.generateDatosCondicionOperacionDE_Credito(params, data, config);
    }
  }

  /**
   * E7.1. Campos que describen la forma de pago de la operación al contado o del monto
   * de la entrega inicial (E605-E619)
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCondicionOperacionDE_Contado(params: any, data: any, config: XmlgenConfig) {
    if (data['condicion']['entregas'] && data['condicion']['entregas'].length > 0) {
      const entregas = [];
      for (let i = 0; i < data['condicion']['entregas'].length; i++) {
        const dataEntrega = data['condicion']['entregas'][i];

        const cuotaInicialEntrega: any = {
          iTiPago: dataEntrega['tipo'],
          dDesTiPag: constanteService.condicionesTiposPagos.filter((co) => co.codigo === dataEntrega['tipo'])[0][
            'descripcion'
          ],
        };

        cuotaInicialEntrega['dMonTiPag'] = parseFloat(dataEntrega['monto']).toFixed(4);

        /*if (data.moneda === 'PYG') {
          //Maximo 4 decimales
          let cantDecimalesMontoTipoPago = config.pygDecimals;
          if (cantDecimalesMontoTipoPago > 4) {
            cantDecimalesMontoTipoPago = 4;
          }
          cuotaInicialEntrega['dMonTiPag'] = parseFloat(dataEntrega['monto']).toFixed(cantDecimalesMontoTipoPago);
        }*/

        if (dataEntrega['tipo'] == 99) {
          cuotaInicialEntrega['dDesTiPag'] = dataEntrega['tipoDescripcion'];
        }

        cuotaInicialEntrega['cMoneTiPag'] = dataEntrega['moneda'];
        cuotaInicialEntrega['dDMoneTiPag'] = constanteService.monedas.filter(
          (m) => m.codigo == dataEntrega['moneda'],
        )[0]['descripcion'];

        if (dataEntrega['moneda'] != 'PYG') {
          if (dataEntrega['cambio']) {
            cuotaInicialEntrega['dTiCamTiPag'] = dataEntrega['cambio'];
          }
        }

        //Verificar si el Pago es con Tarjeta de crédito
        if (dataEntrega['tipo'] === 3 || dataEntrega['tipo'] === 4) {
          cuotaInicialEntrega['gPagTarCD'] = {
            iDenTarj: dataEntrega['infoTarjeta']['tipo'],
            dDesDenTarj:
              +dataEntrega['infoTarjeta']['tipo'] === 99
                ? dataEntrega['infoTarjeta']['tipoDescripcion']
                : constanteService.tarjetasCreditosTipos.filter(
                    (co) => co.codigo === dataEntrega['infoTarjeta']['tipo'],
                  )[0]['descripcion'],
          };

          if (dataEntrega['infoTarjeta']['razonSocial'] && dataEntrega['infoTarjeta']['ruc']) {
            //Solo si se envia éste dato
            cuotaInicialEntrega['gPagTarCD']['dRSProTar'] = dataEntrega['infoTarjeta']['razonSocial'];
            cuotaInicialEntrega['gPagTarCD']['dRUCProTar'] = dataEntrega['infoTarjeta']['ruc'].split('-')[0];
            cuotaInicialEntrega['gPagTarCD']['dDVProTar'] = dataEntrega['infoTarjeta']['ruc'].split('-')[1];
          }

          cuotaInicialEntrega['gPagTarCD']['iForProPa'] = dataEntrega['infoTarjeta']['medioPago'];

          if (dataEntrega['infoTarjeta']['codigoAutorizacion']) {
            if (
              !(
                (dataEntrega['infoTarjeta']['codigoAutorizacion'] + '').length >= 6 &&
                (dataEntrega['infoTarjeta']['codigoAutorizacion'] + '').length <= 10
              )
            ) {
              /*throw new Error(
                'El código de Autorización en data.condicion.entregas[' +
                  i +
                  '].infoTarjeta.codigoAutorizacion debe tener de 6 y 10 caracteres',
              );*/
            }
            cuotaInicialEntrega['gPagTarCD']['dCodAuOpe'] = +dataEntrega['infoTarjeta']['codigoAutorizacion'];
          }

          if (dataEntrega['infoTarjeta']['titular']) {
            cuotaInicialEntrega['gPagTarCD']['dNomTit'] = dataEntrega['infoTarjeta']['titular'];
          }

          if (dataEntrega['infoTarjeta']['numero']) {
            cuotaInicialEntrega['gPagTarCD']['dNumTarj'] = dataEntrega['infoTarjeta']['numero'];
          }
        }

        //Verificar si el Pago es con Cheque
        if (dataEntrega['tipo'] === 2) {
          if (!dataEntrega['infoCheque']) {
            /*throw new Error(
              'Debe informar sobre el cheque en data.condicion.entregas[' +
                i +
                '].infoCheque si la forma de Pago es 2-Cheques',
            );*/
          }

          cuotaInicialEntrega['gPagCheq'] = {
            dNumCheq: stringUtilService.leftZero(dataEntrega['infoCheque']['numeroCheque'], 8),
            dBcoEmi: dataEntrega['infoCheque']['banco'],
          };
        }
        entregas.push(cuotaInicialEntrega);
      }
      this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPaConEIni'] = entregas; //Array de Entregas
    }
  }

  /**
   * E7.2. Campos que describen la operación a crédito (E640-E649)
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCondicionOperacionDE_Credito(params: any, data: any, config: XmlgenConfig) {
    if (!data['condicion']['credito']['tipo']) {
      /*throw new Error(
        'El tipo de Crédito en data.condicion.credito.tipo es obligatorio si la condición posee créditos',
      );*/
    }

    if (
      constanteService.condicionesCreditosTipos.filter((um: any) => um.codigo === data['condicion']['credito']['tipo'])
        .length == 0
    ) {
      /*throw new Error(
        "Tipo de Crédito '" +
          data['condicion']['credito']['tipo'] +
          "' en data.condicion.credito.tipo no encontrado. Valores: " +
          constanteService.condicionesCreditosTipos.map((a: any) => a.codigo + '-' + a.descripcion),
      );*/
    }

    this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred'] = {
      iCondCred: data['condicion']['credito']['tipo'],
      dDCondCred: constanteService.condicionesCreditosTipos.filter(
        (co) => co.codigo === +data['condicion']['credito']['tipo'],
      )[0]['descripcion'],
    };

    if (+data['condicion']['credito']['tipo'] === 1) {
      //Plazo

      this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['dPlazoCre'] = data['condicion']['credito']['plazo'];
    }

    if (+data['condicion']['credito']['tipo'] === 2) {
      //Cuota
      if (!data['condicion']['credito']['cuotas']) {
        /*throw new Error(
          'El tipo de Crédito en data.condicion.credito.tipo es 2 entonces data.condicion.credito.cuotas es obligatorio',
        );*/
      }

      this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['dCuotas'] = +data['condicion']['credito']['cuotas'];
    }

    if (data['condicion']['entregas'] && data['condicion']['entregas'].length > 0) {
      let sumaEntregas = 0;
      //Obtiene la sumatoria
      for (let i = 0; i < data['condicion']['entregas'].length; i++) {
        const entrega = data['condicion']['entregas'][i];
        sumaEntregas += entrega['monto']; //Y cuando es de moneda diferente ? como hace?
      }

      this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['dMonEnt'] = sumaEntregas;
    }

    //Recorrer array de infoCuotas e informar en el JSON
    if (data['condicion']['credito']['tipo'] === 2) {
      this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['gCuotas'] = [];
      //A Cuotas
      if (data['condicion']['credito']['infoCuotas'] && data['condicion']['credito']['infoCuotas'].length > 0) {
        for (let i = 0; i < data['condicion']['credito']['infoCuotas'].length; i++) {
          const infoCuota = data['condicion']['credito']['infoCuotas'][i];

          if (constanteService.monedas.filter((um: any) => um.codigo === infoCuota['moneda']).length == 0) {
            /*throw new Error(
              "Moneda '" +
                infoCuota['moneda'] +
                "' en data.condicion.credito.infoCuotas[" +
                i +
                '].moneda no encontrado. Valores: ' +
                constanteService.monedas.map((a: any) => a.codigo + '-' + a.descripcion),
            );*/
          }

          const gCuotas: any = {
            cMoneCuo: infoCuota['moneda'],
            dDMoneCuo: constanteService.monedas.filter((co) => co.codigo === infoCuota['moneda'])[0]['descripcion'],
            dMonCuota: infoCuota['monto'],
          };

          if (infoCuota['vencimiento']) {
            gCuotas['dVencCuo'] = infoCuota['vencimiento'];
          }
          this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['gCuotas'].push(gCuotas);
        }
      } else {
        //throw new Error('Debe proporcionar data.condicion.credito.infoCuotas[]');
      }
    }
  }

  private normalizeXML(xml: string) {
    xml = xml.split('\r\n').join('');
    xml = xml.split('\n').join('');
    xml = xml.split('\t').join('');
    xml = xml.split('    ').join('');
    xml = xml.split('>    <').join('><');
    xml = xml.split('>  <').join('><');
    xml = xml.replace(/\r?\n|\r/g, '');
    return xml;
  }

  getPaises() {
    return constanteService.paises;
  }

  getDepartamentos() {
    return constanteService.departamentos;
  }

  getDistritos(departamento: number | null) {
    if (departamento) {
      return constanteService.distritos.filter((dis) => dis.departamento === departamento);
    } else {
      return constanteService.distritos;
    }
  }

  getCiudades(distrito: number | null) {
    if (distrito) {
      return constanteService.ciudades.filter((ciu) => ciu.distrito === distrito);
    } else {
      return constanteService.ciudades;
    }
  }

  getTiposRegimenes() {
    return constanteService.tiposRegimenes;
  }

  getDepartamento(departamentoId: number) {
    return constanteService.departamentos.filter((dis) => dis.codigo === departamentoId);
  }

  getDistrito(distritoId: number) {
    return constanteService.distritos.filter((dis) => dis.codigo === distritoId);
  }

  getCiudad(ciudadId: number) {
    return constanteService.ciudades.filter((ciu) => ciu.codigo === ciudadId);
  }
}

export default new JSonDeMainService();
