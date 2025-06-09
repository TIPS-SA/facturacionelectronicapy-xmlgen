import * as xml2js from 'xml2js';
import fechaUtilService from './FechaUtil.service';
import constanteService from './constants.service';
import stringUtilService from './StringUtil.service';
import { XmlgenConfig } from './type.interface.';

class JSonEventoMainService {
  codigoSeguridad: any = null;
  codigoControl: any = null;
  json: any = {};

  public generateXMLEventoCancelacion(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 1; //Cancelacion
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoInutilizacion(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 2; //Inutilizacion
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        /*if (config && config.debug === true) {
          console.log("generateXMLEventoInutilizacion", soapXMLData); //TODO Agregar esto a todos los demas 
        }*/
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoConformidad(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 11; //Conformidad
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoDisconformidad(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 12; //Disconformidad
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoDesconocimiento(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 13; //Desconocimiento
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoNotificacion(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 14; //Notificacion
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoNominacion(id: number, params: any, data: any, config?: XmlgenConfig): Promise<any> {
    data.tipoEvento = 15; //Nominacion
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  public generateXMLEventoActualizacionDatosTransporte(
    id: number,
    params: any,
    data: any,
    config?: XmlgenConfig,
  ): Promise<any> {
    data.tipoEvento = 16; //ActualizacionDatosTransporte
    return new Promise(async (resolve, reject) => {
      try {
        let xml = await this.generateXMLEventoService(params, data);
        xml = xml.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', '');

        let soapXMLData = this.envelopeEvent(id, xml);
        resolve(soapXMLData);
      } catch (error) {
        reject(error);
      }
    });
  }

  private envelopeEvent(id: number, xml: string) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope">\n\
                <env:Header/>\n\
                <env:Body>\n\
                    <rEnviEventoDe xmlns="http://ekuatia.set.gov.py/sifen/xsd">\n\
                      <dId>${id}</dId>\n\
                      <dEvReg>${xml}</dEvReg>\n\
                    </rEnviEventoDe>\n\
                </env:Body>\n\
            </env:Envelope>\n`;
  }

  /**
   * Metodo principal de generacion de XML del Evento
   * @param params
   * @param data
   * @returns
   */
  private generateXMLEventoService(params: any, data: any) {
    this.addUnderscore(data);

    this.validateValues(data);

    this.addDefaultValues(data);

    this.json = {};

    //this.generateCodigoSeguridad(params, data); //Primero genera el codigo de seguridad aleatorio único
    //this.generateCodigoControl(params, data); //Luego genera el código de Control

    //this.generateRte(params);

    this.json['gGroupGesEve'] = {};
    this.json['gGroupGesEve']['rGesEve'] = {};
    this.json['gGroupGesEve']['$'] = {};
    this.json['gGroupGesEve']['$']['xmlns:xsi'] = 'http://www.w3.org/2001/XMLSchema-instance';
    this.json['gGroupGesEve']['$']['xsi:schemaLocation'] = 'http://ekuatia.set.gov.py/sifen/xsd siRecepEvento_v150.xsd';

    this.json['gGroupGesEve']['rGesEve']['rEve'] = {};

    this.json['gGroupGesEve']['rGesEve']['rEve']['$'] = {};
    this.json['gGroupGesEve']['rGesEve']['rEve']['$']['Id'] = 1;

    let fechaFirmaDigital = new Date();
    if (data.fechaFirmaDigital) {
      fechaFirmaDigital = new Date(data.fechaFirmaDigital);
    }

    this.json['gGroupGesEve']['rGesEve']['rEve']['dFecFirma'] = fechaUtilService.convertToJSONFormat(fechaFirmaDigital);
    this.json['gGroupGesEve']['rGesEve']['rEve']['dVerFor'] = params.version;
    this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = {};

    //Emisor
    if (data.tipoEvento == 1) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosEmisorCancelacion(params, data);
    }

    if (data.tipoEvento == 2) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosEmisorInutilizacion(params, data);
    }

    //if (data.tipoEvento == 3) {
    //this.json['gGroupGesEve']['rGesEve']['gGroupTiEvt'] = this.eventos(params, data);
    //}

    //Receptor (empieza en 11)
    if (data.tipoEvento == 11) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorConformidad(params, data);
    }
    if (data.tipoEvento == 12) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorDisconformidad(params, data);
    }
    if (data.tipoEvento == 13) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorDesconocimiento(params, data);
    }
    if (data.tipoEvento == 14) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorNotificacionRecepcion(
        params,
        data,
      );
    }
    if (data.tipoEvento == 15) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventoEmisorNominacion(params, data);
    }
    if (data.tipoEvento == 16) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventoEmisorActualizacionDatosTransporte(
        params,
        data,
      );
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
   * Valida los datos ingresados en el data del req.body
   * @param data
   */
  private validateValues(data: any) {}

  /**
   * Añade algunos valores por defecto al JSON de entrada, valido para
   * todas las operaciones
   * @param data
   */
  private addDefaultValues(data: any) {}

  /**
   * Si los valores vienen en underscore, crea los valores en formato variableJava que
   * sera utilizado dentro del proceso,
   *
   * Ej. si viene tipo_documento crea una variable tipoDocumento, con el mismo valor.
   *
   * @param data
   */
  private addUnderscore(data: any) {
    if (data.tipo_documento) {
      data.tipoDocumento = data.tipo_documento;
    }

    if (data.tipo_evento) {
      data.tipoEvento = data.tipo_evento;
    }
  }

  private eventosEmisorCancelacion(params: any, data: any) {
    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (!data['motivo']) {
      throw new Error('Debe proporcionar el Motivo de la Cancelación en data.motivo');
    }

    if (!((data['motivo'] + '').length >= 5 && (data['motivo'] + '').length <= 500)) {
      throw new Error('El Motivo de la Cancelación en data.motivo debe contener de [5-500] caracteres');
    }

    const jsonResult: any = {};
    jsonResult['rGeVeCan'] = {
      Id: data['cdc'],
      mOtEve: data['motivo'],
    };

    return jsonResult;
  }

  private eventosEmisorInutilizacion(params: any, data: any) {
    if (!data['timbrado']) {
      throw new Error('Falta el Timbrado en data.timbrado');
    }
    if (!data['establecimiento']) {
      throw new Error('Falta el Establecimiento en data.establecimiento');
    }
    if (new String(data['establecimiento']).length != 3) {
      throw new Error('El establecimiento debe tener una longitud de 3 caracteres');
    }
    if (!data['punto']) {
      throw new Error('Falta el Punto en data.punto');
    }
    if (new String(data['punto']).length != 3) {
      throw new Error('El punto debe tener una longitud de 3 caracteres');
    }

    if (!data['desde']) {
      throw new Error('Falta el valor inicial Desde en data.desde');
    }
    if (!data['hasta']) {
      throw new Error('Falta el valor final hasta en data.hasta');
    }
    if (+data['desde'] > +data['hasta']) {
      throw new Error('El valor inicial en data.desde debe ser inferior o igual al valor final en data.hasta');
    }
    if (!data['tipoDocumento']) {
      throw new Error('Falta el Tipo de Documento en data.tipoDocumento');
    }
    if (new String(data['timbrado']).length != 8) {
      throw new Error('El timbrado debe tener una longitud de 8 caracteres');
    }
    if (!data['motivo']) {
      throw new Error('Falta el Motivo de la Inutilización en data.motivo');
    }
    if (!((data['motivo'] + '').length >= 5 && (data['motivo'] + '').length <= 500)) {
      throw new Error('El Motivo de la Inutilización en data.motivo debe contener de [5-500] caracteres');
    }

    if (data['serie']) {
      if ((data['serie'] + '').length != 2) {
        throw new Error('El número de serie en data.serie debe contener [2] caracteres');
      }
    }

    const jsonResult: any = {};
    jsonResult['rGeVeInu'] = {
      dNumTim: stringUtilService.leftZero(data['timbrado'], 8),
      dEst: stringUtilService.leftZero(data['establecimiento'], 3),
      dPunExp: stringUtilService.leftZero(data['punto'], 3),
      dNumIn: stringUtilService.leftZero(data['desde'], 7),
      dNumFin: stringUtilService.leftZero(data['hasta'], 7),
      iTiDE: data['tipoDocumento'],
      mOtEve: data['motivo'],
    };

    if (data['serie']) {
      jsonResult['rGeVeInu']['dSerieNum'] = data['serie'];
    }

    return jsonResult;
  }

  //---
  //---
  //---

  private eventosReceptorConformidad(params: any, data: any) {
    const jsonResult: any = {};

    if (constanteService.eventoConformidadTipo.filter((um: any) => um.codigo === data['tipoConformidad']).length == 0) {
      throw new Error(
        "Tipo de Conformidad '" +
          data['tipoConformidad'] +
          "' en data.tipoConformidad no encontrado. Valores: " +
          constanteService.eventoConformidadTipo.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (new String(data['cdc']).length != 44) {
      throw new Error('El CDC en data.cdc debe tener una longitud de 44 caracteres');
    }

    jsonResult['rGeVeConf'] = {
      /*$: {
        ,
      },*/
      Id: data['cdc'],
      iTipConf: data['tipoConformidad'],
    };

    if (data['tipoConformidad'] == 2) {
      if (!data['fechaRecepcion']) {
        throw new Error('Obligatorio proporcionar Fecha estimada de recepción en data.fechaRecepcion');
      }
      if (new String(data['fechaRecepcion']).length != 19) {
        throw new Error('La fecha de recepción debe tener una longitud de 19 caracteres en data.fechaRecepcion');
      }

      jsonResult['rGeVeConf']['dFecRecep'] = data['fechaRecepcion'];
    }

    return jsonResult;
  }

  private eventosReceptorDisconformidad(params: any, data: any) {
    const jsonResult: any = {};

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (!data['motivo']) {
      throw new Error('Debe proporcionar el Motivo de la Disconformidad en data.motivo');
    }

    if (!((data['motivo'] + '').length >= 5 && (data['motivo'] + '').length <= 500)) {
      throw new Error('El Motivo de la Disconformidad en data.motivo debe contener de [5-500] caracteres');
    }

    jsonResult['rGeVeDisconf'] = {
      Id: data['cdc'],
      mOtEve: data['motivo'],
    };

    return jsonResult;
  }

  private eventosReceptorDesconocimiento(params: any, data: any) {
    const jsonResult: any = {};

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (!data['motivo']) {
      throw new Error('Debe proporcionar el Motivo del Desconocimiento en data.motivo');
    }

    if (!((data['motivo'] + '').length >= 5 && (data['motivo'] + '').length <= 500)) {
      throw new Error('El Motivo del Desconocimiento en data.motivo debe contener de [5-500] caracteres');
    }

    if (constanteService.tipoReceptor.filter((um: any) => um.codigo === +data['tipoReceptor']).length == 0) {
      throw new Error(
        "Tipo de Receptor '" +
          data['tipoReceptor'] +
          "' en data.tipoReceptor no encontrado. Valores: " +
          constanteService.tipoReceptor.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['nombre']) {
      throw new Error('Debe especificar el Nombre/Razón Social del receptor en data.nombre');
    }

    if (!(data['nombre'].length >= 4)) {
      throw new Error('El Nombre del Cliente en data.nombre debe tener una longitud mínima de 4 caracteres');
    }

    if (new String(data['fechaRecepcion']).length != 19) {
      throw new Error('La fecha de emisión debe tener una longitud de 19 caracteres en data.fechaRecepcion');
    }

    if (new String(data['fechaRecepcion']).length != 19) {
      throw new Error('La fecha de recepción debe tener una longitud de 19 caracteres en data.fechaRecepcion');
    }

    jsonResult['rGeVeDescon'] = {
      Id: data['cdc'],
      dFecEmi: data['fechaEmision'],
      dFecRecep: data['fechaRecepcion'],
      iTipRec: +data['tipoReceptor'],
      dNomRec: data['nombre'],
    };

    if (+data['tipoReceptor'] == 1) {
      if (data['ruc'].indexOf('-') == -1) {
        throw new Error('RUC del Receptor debe contener dígito verificador en data.ruc');
      }
      const rucEmisor = data['ruc'].split('-')[0];
      const dvEmisor = data['ruc'].split('-')[1];

      jsonResult['rGeVeDescon']['dRucRec'] = rucEmisor;
      jsonResult['rGeVeDescon']['dDVRec'] = dvEmisor;
    }

    if (+data['tipoReceptor'] == 2) {
      if (
        constanteService.tiposDocumentosIdentidades.filter((um: any) => um.codigo === data['documentoTipo']).length == 0
      ) {
        throw new Error(
          "Tipo de Documento '" +
            data['documentoTipo'] +
            "' en data.documentoTipo no encontrado. Valores: " +
            constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['rGeVeDescon']['dTipIDRec'] = data['documentoTipo'];

      if (!data['documentoNumero']) {
        throw new Error('Debe especificar el Número de Documento del receptor en data.documentoNumero');
      }
      jsonResult['rGeVeDescon']['dNumID'] = data['documentoNumero'];
    }

    jsonResult['rGeVeDescon']['mOtEve'] = data['motivo'];
    return jsonResult;
  }

  private eventosReceptorNotificacionRecepcion(params: any, data: any) {
    const jsonResult: any = {};

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (constanteService.tipoReceptor.filter((um: any) => um.codigo === +data['tipoReceptor']).length == 0) {
      throw new Error(
        "Tipo de Receptor '" +
          data['tipoReceptor'] +
          "' en data.tipoReceptor no encontrado. Valores: " +
          constanteService.tipoReceptor.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['nombre']) {
      throw new Error('Debe especificar el Nombre/Razón Social del receptor en data.nombre');
    }

    if (!(data['nombre'].length >= 4)) {
      throw new Error('El Nombre del Cliente en data.nombre debe tener una longitud mínima de 4 caracteres');
    }

    if (new String(data['fechaRecepcion']).length != 19) {
      throw new Error('La fecha de emisión debe tener una longitud de 19 caracteres en data.fechaRecepcion');
    }

    if (new String(data['fechaRecepcion']).length != 19) {
      throw new Error('La fecha de recepción debe tener una longitud de 19 caracteres en data.fechaRecepcion');
    }

    jsonResult['rGeVeNotRec'] = {
      Id: data['cdc'],
      dFecEmi: data['fechaEmision'],
      dFecRecep: data['fechaRecepcion'],
      iTipRec: +data['tipoReceptor'],
      dNomRec: data['nombre'],
    };

    if (+data['tipoReceptor'] == 1) {
      if (data['ruc'].indexOf('-') == -1) {
        throw new Error('RUC del Receptor debe contener dígito verificador en data.ruc');
      }
      const rucEmisor = data['ruc'].split('-')[0];
      const dvEmisor = data['ruc'].split('-')[1];

      jsonResult['rGeVeNotRec']['dRucRec'] = rucEmisor;
      jsonResult['rGeVeNotRec']['dDVRec'] = dvEmisor;
    }

    if (+data['tipoReceptor'] == 2) {
      if (
        constanteService.tiposDocumentosIdentidades.filter((um: any) => um.codigo === data['documentoTipo']).length == 0
      ) {
        throw new Error(
          "Tipo de Documento '" +
            data['documentoTipo'] +
            "' en data.documentoTipo no encontrado. Valores: " +
            constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['rGeVeNotRec']['dTipIDRec'] = data['documentoTipo'];

      if (!data['documentoNumero']) {
        throw new Error('Debe especificar el Número de Documento del receptor en data.documentoNumero');
      }
      jsonResult['rGeVeNotRec']['dNumID'] = data['documentoNumero'];
    }

    jsonResult['rGeVeNotRec']['dTotalGs'] = data['totalPYG'];

    return jsonResult;
  }

  private eventoEmisorNominacion(params: any, data: any) {
    const jsonResult: any = {};

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (!data['motivo']) {
      throw new Error('Debe especificar el Motivo del evento de nominación en data.motivo');
    }
    if (!(data['motivo'].length >= 5 && data['motivo'].length <= 500)) {
      throw new Error('El Motivo del Evento en data.motivo debe tener una longitud entre 5 y 500 caracteres');
    }

    /*if (constanteService.tipoReceptor.filter((um: any) => um.codigo === +data['tipoReceptor']).length == 0) {
      throw new Error(
        "Tipo de Receptor '" +
          data['tipoReceptor'] +
          "' en data.tipoReceptor no encontrado. Valores: " +
          constanteService.tipoReceptor.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }*/

    if (!data['pais']) {
      throw new Error('Debe especificar el Pais del Receptor en data.pais');
    }
    if (!(data['pais'].length >= 3 && data['pais'].length <= 3)) {
      throw new Error('El Pais del Receptor en data.pais debe tener una longitud de 3 caracteres');
    }
    let paisDescripcion: any = constanteService.paises.filter((pais) => pais.codigo === data['pais'])[0].descripcion;

    if (!data['tipoOperacion']) {
      throw new Error('Debe especificar el Tipo de Operación en data.tipoOperacion 1-B2B, 2-B2C o 4-B2F');
    } else {
      if (!(data['tipoOperacion'] == 1 || data['tipoOperacion'] == 2 || data['tipoOperacion'] == 4)) {
        throw new Error('El Tipo de Operación en data.tipoOperacion debe ser 1-B2B, 2-B2C o 4-B2F');
      } else {
        if (!data['contribuyente']) {
          if (data['tipoOperacion'] == 1) {
            throw new Error('Tipo de Operación 1-B2B incorrecto para Receptor No Contribuyente');
          }
        }
      }
    }

    /*if (data['contribuyente']) {
      if (!data['tipoContribuyente']) {
        throw new Error(
          'Debe especificar el Tipo de Contribuyente en data.tipoContribuyente 1-Persona Física o 2-Persona Jurídica',
        );
      }
    }*/

    if (data['contribuyente']) {
      if (!data['tipoReceptor']) {
        throw new Error(
          'Debe especificar el Tipo de Contribuyente en data.tipoReceptor 1-Persona Física o 2-Persona Jurídica',
        );
      }
    }

    if (!data['contribuyente']) {
      if (!data['documentoTipo']) {
        throw new Error('Debe especificar el Tipo de Documento en data.documentoTipo');
      } else {
        if (
          !(
            data['documentoTipo'] == 1 ||
            data['documentoTipo'] == 2 ||
            data['documentoTipo'] == 3 ||
            data['documentoTipo'] == 4 ||
            data['documentoTipo'] == 5
          )
        ) {
          throw new Error(
            'El Tipo de Operación en data.documentoTipo debe ser 1-Cédula paraguaya, 2-Pasaporte, 3-Cédula Extranjera, 4-Carnet de residencia, 5-Tarjeta Diplomatica',
          );
        }
      }

      if (!data['documentoNumero']) {
        throw new Error('Debe especificar el Número de Documento en data.documentoNumero');
      }
    }

    if (!data['razonSocial']) {
      throw new Error('Debe especificar el Nombre/Razón Social del receptor en data.razonSocial');
    }
    if (!(data['razonSocial'].length >= 4 && data['razonSocial'].length <= 255)) {
      throw new Error('El Nombre del Cliente en data.razonSocial debe tener una longitud entre 4 y 255 caracteres');
    }

    if (data['nombreFantasia']) {
      if (!(data['nombreFantasia'].length >= 4 && data['nombreFantasia'].length <= 255)) {
        throw new Error(
          'El Nombre de Fantasía del Cliente en data.nombreFantasia debe tener una longitud entre 4 y 255 caracteres',
        );
      }
    }

    if (data['direccion']) {
      if (!(data['direccion'].length >= 1 && data['direccion'].length <= 255)) {
        throw new Error('La dirección del Cliente en data.direccion debe tener una longitud entre 1 y 255 caracteres');
      }
    }

    if (data['direccion']) {
      if (!data['numeroCasa']) {
        throw new Error('Debe especificar el numero de casa en data.numeroCasa');
      } else {
        if (!((data['numeroCasa']+"").length >= 1 && (data['numeroCasa']+"").length <= 6)) {
          throw new Error('El Número de Casa del Cliente en data.numeroCasa debe tener una longitud entre 1 y 6 caracteres');
        }
      }
    }

    let departamentoDescripcion = null;
    let distritoDescripcion = null;
    let ciudadDescripcion = null;

    if (data['departamento']) {
      let objDepartamento: any = constanteService.departamentos.filter((dep) => dep.codigo === +data['departamento']);

      if (objDepartamento.legth <= 0) {
        throw new Error("No se encontro el Departamento '" + data['departamento'] + "'");
      }

      let errorsDepDisCiu = new Array();
      constanteService.validateDepartamentoDistritoCiudad(
        'data',
        +data['departamento'],
        +data['distrito'],
        +data['ciudad'],
        errorsDepDisCiu,
      );

      if (errorsDepDisCiu.length > 0) {
        throw new Error(errorsDepDisCiu[0]);
      }

      departamentoDescripcion = objDepartamento[0].descripcion;
      distritoDescripcion = constanteService.distritos.filter((dep) => dep.codigo === +data['distrito'])[0].descripcion;
      ciudadDescripcion = constanteService.ciudades.filter((dep) => dep.codigo === +data['ciudad'])[0].descripcion;
    }

    if (data['telefono']) {
      if (!(data['telefono'].length >= 6 && data['telefono'].length <= 65)) {
        throw new Error('El Telefono del Cliente en data.telefono debe tener una longitud entre 6 y 15 caracteres');
      }
    }
    if (data['celular']) {
      if (!(data['celular'].length >= 10 && data['celular'].length <= 20)) {
        throw new Error('El Celular del Cliente en data.celular debe tener una longitud entre 10 y 20 caracteres');
      }
    }
    if (data['codigo']) {
      if (!(data['codigo'].length >= 3 && data['codigo'].length <= 15)) {
        throw new Error('El Código del Cliente en data.codigo debe tener una longitud entre 3 y 15 caracteres');
      }
    }

    jsonResult['rGEveNom'] = {
      Id: data['cdc'],
      mOtEve: data['motivo'],
      iNatRec: data['contribuyente'] ? 1 : 2,
      iTiOpe: +data['tipoOperacion'],
      cPaisRec: data['pais'],
      dDesPaisRe: paisDescripcion,
    };

    if (data['tipoReceptor']) {
      if (data['contribuyente']) {
        jsonResult['rGEveNom']['iTiContRec'] = data['tipoReceptor'];
      }
    }

    if (data['contribuyente']) {
      if (data['ruc'].indexOf('-') == -1) {
        throw new Error('RUC del Receptor debe contener dígito verificador en data.ruc');
      }
      const rucEmisor = data['ruc'].split('-')[0];
      const dvEmisor = data['ruc'].split('-')[1];

      if (!(rucEmisor && (rucEmisor + '').length >= 3 && (rucEmisor + '').length <= 8)) {
        throw new Error('RUC del Receptor debe estar compuesto de 3 a 8 caracteres');
      }

      jsonResult['rGEveNom']['dRucRec'] = rucEmisor;
      jsonResult['rGEveNom']['dDVRec'] = dvEmisor;
    }

    if (!data['contribuyente']) {
      if (
        constanteService.tiposDocumentosReceptorInnominado.filter((um: any) => um.codigo === data['documentoTipo'])
          .length == 0
      ) {
        throw new Error(
          "Tipo de Documento '" +
            data['documentoTipo'] +
            "' en data.documentoTipo no encontrado. Valores: " +
            constanteService.tiposDocumentosReceptorInnominado.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['rGEveNom']['iTipIDRec'] = data['documentoTipo'];
      jsonResult['rGEveNom']['dDTipIDRec'] = constanteService.tiposDocumentosReceptorInnominado.filter(
        (um: any) => um.codigo === data['documentoTipo'],
      )[0].descripcion;

      if (data['documentoTipo'] == 9) {
        jsonResult['rGEveNom']['dDTipIDRec'] = data['documentoTipoDescripcion'];
      }

      //jsonResult['rGEveNom']['dTipIDRec'] = data['tipoContribuyente'];

      if (!data['documentoNumero']) {
        throw new Error('Debe especificar el Número de Documento del receptor en data.documentoNumero');
      }
      jsonResult['rGEveNom']['dNumIDRec'] = data['documentoNumero'];
    }

    jsonResult['rGEveNom']['dNomRec'] = data['razonSocial'];

    if (data['nombreFantasia']) {
      jsonResult['rGEveNom']['dNomFanRec'] = data['nombreFantasia'];
    }
    if (data['direccion']) {
      jsonResult['rGEveNom']['dDirRec'] = data['direccion'];
    }
    if (data['numeroCasa']) {
      jsonResult['rGEveNom']['dNumCasRec'] = data['numeroCasa'];
    }
    if (data['departamento']) {
      jsonResult['rGEveNom']['cDepRec'] = data['departamento'];
    }
    if (data['departamento']) {
      jsonResult['rGEveNom']['dDesDepRec'] = departamentoDescripcion;
    }
    if (data['distrito']) {
      jsonResult['rGEveNom']['cDisRec'] = data['distrito'];
    }
    if (data['distrito']) {
      jsonResult['rGEveNom']['dDesDisRec'] = distritoDescripcion;
    }
    if (data['ciudad']) {
      jsonResult['rGEveNom']['cCiuRec'] = data['ciudad'];
    }
    if (data['ciudad']) {
      jsonResult['rGEveNom']['dDesCiuRec'] = ciudadDescripcion;
    }
    if (data['telefono']) {
      jsonResult['rGEveNom']['dTelRec'] = data['telefono'];
    }
    if (data['celular']) {
      jsonResult['rGEveNom']['dCelRec'] = data['celular'];
    }
    if (data['email']) {
      jsonResult['rGEveNom']['dEmailRec'] = data['email'];
    }
    if (data['codigo']) {
      jsonResult['rGEveNom']['dCodCliente'] = data['codigo'];
    }

    return jsonResult;
  }

  private eventoEmisorActualizacionDatosTransporte(params: any, data: any) {
    const jsonResult: any = {};

    if (!data['cdc']) {
      throw new Error('Debe proporcionar el CDC en data.cdc');
    }

    if (!(data['cdc'].length == 44)) {
      throw new Error('El CDC en data.cdc debe tener 44 caracteres');
    }

    if (!data['motivo']) {
      throw new Error('Debe proporcionar el Motivo en data.motivo');
    }
    /*
    if (constanteService.tipoReceptor.filter((um: any) => um.codigo === +data['tipoReceptor']).length == 0) {
      throw new Error(
        "Tipo de Receptor '" +
          data['tipoReceptor'] +
          "' en data.tipoReceptor no encontrado. Valores: " +
          constanteService.tipoReceptor.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }
*/
    if (data['motivo'] == 1) {
      let errors = new Array();
      var regExpOnlyNumber = new RegExp(/^\d+$/);
      let errorDepDisCiu = false;

      if (!data['entrega']['ciudad']) {
        errors.push('Debe especificar la Ciudad del Local de Entrega en data.entrega.ciudad');
        errorDepDisCiu = true;
      } else {
        if (
          constanteService.ciudades.filter((ciudad: any) => ciudad.codigo === +data['entrega']['ciudad']).length == 0
        ) {
          errors.push(
            "Ciudad '" +
              data['entrega']['ciudad'] +
              "' del Cliente en data.entrega.ciudad no encontrado. Valores: " +
              constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
          );
          errorDepDisCiu = true;
        }

        //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
        //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
        //data['entrega']['distrito'] y data['entrega']['departamento']
        let objCiudad: any = constanteService.ciudades.filter((ciu) => ciu.codigo === +data['entrega']['ciudad']);

        if (objCiudad && objCiudad[0]) {
          let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

          let objDepartamento: any = constanteService.departamentos.filter(
            (dep) => dep.codigo === +objDistrito[0]['departamento'],
          );

          //Solo actualiza si no tiene valor
          if (!data['entrega']['distrito']) data['entrega']['distrito'] = objDistrito[0]['codigo'];

          if (!data['entrega']['departamento']) data['entrega']['departamento'] = objDepartamento[0]['codigo'];
        }

        if (!errorDepDisCiu) {
          if (!data['entrega']['departamento']) {
            errors.push('Debe especificar el Departamento del Local de Entrega en data.entrega.departamento');
            errorDepDisCiu = true;
          }
          if (!data['entrega']['distrito']) {
            errors.push('Debe especificar el Distrito del Local de Entrega en data.entrega.distrito');
            errorDepDisCiu = true;
          }
        }
      }

      if (!errorDepDisCiu) {
        constanteService.validateDepartamentoDistritoCiudad(
          'data.entrega',
          +data['entrega']['departamento'],
          +data['entrega']['distrito'],
          +data['entrega']['ciudad'],
          errors,
        );
      }

      if (errors.length > 0) {
        throw new Error(errors.join(','));
      }

      if (data['entrega']['direccion']) {
        throw new Error('Debe especificar la Dirección de Entrega en data.entrega.direccion');
      }

      if (data['entrega']['numeroCasa']) {
        throw new Error('Debe especificar el Número de Casa de Entrega en data.entrega.numeroCasa');
      }
    }

    if (data['motivo'] == 2) {
      if (!data['transportista']['chofer']['nombre']) {
        throw new Error('Debe especificar el Nombre del chofer en data.transportista.chofer.nombre');
      }
      if (!data['transportista']['chofer']['documentoNumero']) {
        throw new Error('Debe especificar el Documento del chofer en data.transportista.chofer.documentoNumero');
      }
    }

    if (data['motivo'] == 3) {
    }

    /*    if (!(data['nombre'].length >= 4)) {
      throw new Error('El Nombre del Cliente en data.nombre debe tener una longitud mínima de 4 caracteres');
    }*/

    jsonResult['rGeVeTr'] = {
      Id: data['cdc'],
      dMotEv: data['motivo'],
      //dFecEmi: data['fechaEmision'],
      //dFecRecep: data['fechaRecepcion'],
      //iTipRec: +data['tipoReceptor'],
      //dNomRec: data['nombre'],
    };

    if (data['entrega'] && data['entrega']['departamento']) {
      jsonResult['rGeVeTr']['cDepEnt'] = data['entrega']['departamento'];
      jsonResult['rGeVeTr']['dDesDepEnt'] = constanteService.departamentos.filter(
        (td) => td.codigo === data['entrega']['departamento'],
      )[0]['descripcion'];
    }

    if (data['entrega'] && data['entrega']['distrito']) {
      jsonResult['rGeVeTr']['cDisEnt'] = data['entrega']['distrito'];
      jsonResult['rGeVeTr']['dDesDisEnt'] = constanteService.distritos.filter(
        (td) => td.codigo === data['entrega']['distrito'],
      )[0]['descripcion'];
    }

    if (data['entrega'] && data['entrega']['ciudad']) {
      jsonResult['rGeVeTr']['cCiuEnt'] = data['entrega']['ciudad'];
      jsonResult['rGeVeTr']['dDesCiuEnt'] = constanteService.ciudades.filter(
        (td) => td.codigo === data['entrega']['ciudad'],
      )[0]['descripcion'];
    }

    if (data['entrega'] && data['entrega']['direccion']) {
      jsonResult['rGeVeTr']['dDirEnt'] = data['entrega']['direccion'];
    }

    if (data['entrega'] && data['entrega']['dNumCas']) {
      jsonResult['rGeVeTr']['dDirEnt'] = data['entrega']['dNumCas'];
    }

    if (data['entrega'] && data['entrega']['dCompDir1']) {
      jsonResult['rGeVeTr']['dDirEnt'] = data['entrega']['dCompDir1'];
    }

    if (data['motivo'] == 2) {
      jsonResult['rGeVeTr']['dNomChof'] = data['entrega']['transportista']['chofer']['nombre'];
      jsonResult['rGeVeTr']['dNumIDChof'] = data['entrega']['transportista']['chofer']['documentoNumero'];
    }

    if (data['motivo'] == 3) {
      jsonResult['rGeVeTr']['iNatTrans'] = data['entrega']['transportista']['contribuyente'] ? 1 : 0;

      if (data['entrega']['transportista']['contribuyente']) {
        if (data['ruc'].indexOf('-') == -1) {
          throw new Error('RUC del Receptor debe contener dígito verificador en data.ruc');
        }
        const rucEmisor = data['ruc'].split('-')[0];
        const dvEmisor = data['ruc'].split('-')[1];

        jsonResult['rGeVeTr']['dRucRec'] = rucEmisor;
        jsonResult['rGeVeTr']['dDVRec'] = dvEmisor;
        jsonResult['rGeVeTr']['nombre'] = data['entrega']['transportista']['nombre'];
      }

      if (!data['entrega']['transportista']['contribuyente']) {
        jsonResult['rGeVeTr']['dDTipIDTrans'] = data['entrega']['transportista']['documentoTipo'];

        if (
          constanteService.tiposDocumentosIdentidadesTransportistas.filter(
            (um: any) => um.codigo === +data['entrega']['transportista']['documentoTipo'],
          ).length == 0
        ) {
          throw new Error(
            "Tipo de Documento '" +
              data['entrega']['transportista']['documentoTipo'] +
              "' en data.entrega.transportista.documentoTipo no encontrado. Valores: " +
              constanteService.tiposDocumentosIdentidadesTransportistas.map((a: any) => a.codigo + '-' + a.descripcion),
          );
        }

        if (!data['documentoNumero']) {
          throw new Error(
            'Debe especificar el Número de Documento del transportista en data.entrega.transportista.documentoNumero',
          );
        }
        jsonResult['rGeVeTr']['dNumIDTrans'] = data['entrega']['transportista']['documentoNumero'];
      }
    }

    if (data['motivo'] == 4) {
      if (data['entrega'] && data['entrega']['tipoTransporte']) {
        jsonResult['rGeVeTr']['iTipTrans'] = data['entrega']['tipoTransporte'];
        jsonResult['rGeVeTr']['dDesTipTrans'] = constanteService.tiposTransportes.filter(
          (td) => td.codigo === data['entrega']['tipoTransporte'],
        )[0]['descripcion'];
      }

      if (data['entrega'] && data['entrega']['modalidadTransporte']) {
        jsonResult['rGeVeTr']['iModTrans'] = data['entrega']['modalidadTransporte'];
        jsonResult['rGeVeTr']['dDesModTrans'] = constanteService.modalidadesTransportes.filter(
          (td) => td.codigo === data['entrega']['modalidadTransporte'],
        )[0]['descripcion'];
      }

      if (data['entrega'] && data['entrega']['vehiculo']['tipo']) {
        jsonResult['rGeVeTr']['dTiVehTras'] = data['entrega']['vehiculo']['tipo'];
      }
      if (data['entrega'] && data['entrega']['vehiculo']['marca']) {
        jsonResult['rGeVeTr']['dMarVeh'] = data['entrega']['vehiculo']['marca'];
      }
      if (data['entrega'] && data['entrega']['vehiculo']['documentoTipo']) {
        jsonResult['rGeVeTr']['dTipIdenVeh'] = data['entrega']['vehiculo']['documentoTipo'];
        /*jsonResult['rGeVeTr']['dDesTipTrans'] = constanteService.tiposIdentificacionesVehiculos.filter(
          (td) => td.codigo === data['entrega']['vehiculo']['documentoTipo']
        )[0]['descripcion'];*/
      }
      if (data['entrega'] && data['entrega']['vehiculo']['documentoNumero']) {
        jsonResult['rGeVeTr']['dNroIDVeh'] = data['entrega']['vehiculo']['documentoNumero'];
      }
      if (data['entrega'] && data['entrega']['vehiculo']['numeroMatricula']) {
        jsonResult['rGeVeTr']['dNroMatVeh'] = data['entrega']['vehiculo']['numeroMatricula'];
      }
    }

    return jsonResult;
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
}

export default new JSonEventoMainService();
