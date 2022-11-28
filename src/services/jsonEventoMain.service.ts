import * as xml2js from 'xml2js';
import fechaUtilService from './FechaUtil.service';
import constanteService from './constants.service';
import stringUtilService from './StringUtil.service';

class JSonEventoMainService {
  codigoSeguridad: any = null;
  codigoControl: any = null;
  json: any = {};

  public generateXMLEventoCancelacion(id: number, params: any, data: any): Promise<any> {
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

  public generateXMLEventoInutilizacion(id: number, params: any, data: any): Promise<any> {
    data.tipoEvento = 2; //Inutilizacion
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

  public generateXMLEventoConformidad(id: number, params: any, data: any): Promise<any> {
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

  public generateXMLEventoDisconformidad(id: number, params: any, data: any): Promise<any> {
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

  public generateXMLEventoDesconocimiento(id: number, params: any, data: any): Promise<any> {
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

  public generateXMLEventoNotificacion(id: number, params: any, data: any): Promise<any> {
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
    this.json['gGroupGesEve']['rGesEve']['rEve']['dFecFirma'] = fechaUtilService.convertToJSONFormat(new Date());
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
  private addDefaultValues(data: any) {
    /*if (constanteService.tiposEventos.filter((um) => um.codigo === data['tipoEvento']).length == 0) {
      throw (
        new Error("Tipo de Evento '" + data['tipoEvento']) +
        "' en data.tipoEvento no válido. Valores: " +
        constanteService.tiposEventos.map((a) => a.codigo + '-' + a.descripcion + ' ')
      );
    }
    data['tipoEventoDescripcion'] = constanteService.tiposEventos.filter((td) => td.codigo == data['tipoEvento'])[0][
      'descripcion'
    ];*/
  }

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
      throw new Error('Falta el Motivo de la Cancelación en data.motivo');
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
