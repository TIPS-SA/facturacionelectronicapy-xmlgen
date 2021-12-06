import * as xml2js from 'xml2js';
import fechaUtilService from './FechaUtil.service';
import constanteService from './Constante.service';
import stringUtilService from './StringUtil.service';

class JSonEventoMainService {
  codigoSeguridad: any = null;
  codigoControl: any = null;
  json: any = {};

  public generateXMLEvento(params: any, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.generateXMLEventoService(params, data));
      } catch (error) {
        reject(error);
      }
    });
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

    if (data.tipoEvento == 1) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosEmisorCancelacion(params, data);
    }

    if (data.tipoEvento == 2) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosEmisorInutilizacion(params, data);
    }

    if (data.tipoEvento == 3) {
      //this.json['gGroupGesEve']['rGesEve']['gGroupTiEvt'] = this.eventos(params, data);
    }

    //Receptor
    if (data.tipoEvento == 10) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorNotificacion(params, data);
    }
    if (data.tipoEvento == 11) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorNotificacion(params, data);
    }
    if (data.tipoEvento == 12) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorNotificacion(params, data);
    }
    if (data.tipoEvento == 13) {
      this.json['gGroupGesEve']['rGesEve']['rEve']['gGroupTiEvt'] = this.eventosReceptorNotificacion(params, data);
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
    if (constanteService.tiposEventos.filter((um) => um.codigo === data['tipoEvento']).length == 0) {
      throw (
        new Error("Tipo de Evento '" + data['tipoEvento']) +
        "' en data.tipoEvento no válido. Valores: " +
        constanteService.tiposEventos.map((a) => a.codigo + '-' + a.descripcion + ' ')
      );
    }
    data['tipoEventoDescripcion'] = constanteService.tiposEventos.filter((td) => td.codigo == data['tipoEvento'])[0][
      'descripcion'
    ];
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
    const jsonResult: any = {};
    jsonResult['rGeVeCan'] = {
      Id: data['cdc'],
      mOtEve: data['motivo'],
    };

    return jsonResult;
  }

  private eventosEmisorInutilizacion(params: any, data: any) {
    //console.log("---", data['timbrado'], data['timbrado'].length, new String(data['timbrado']).length);
    if (!data['timbrado']) {
      throw new Error("Falta el Timbrado en data.timbrado");
      
    }
    if (new String(data['timbrado']).length != 8) {
      throw new Error("El timbrado debe tener una longitud de 8 caracteres");
      
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

    return jsonResult;
  }

  private eventosReceptorNotificacion(params: any, data: any) {
    const jsonResult: any = {};
    jsonResult['rGeVeNotRec'] = {
      $: {
        Id: data['Id'],
      },
      dFecEmi: data['dFecEmi'],
      dFecRecep: data['dFecRecep'],
      iTipRec: data['iTipRec'],
      dNomRec: data['dNomRec'],
    };

    if (data['iTipRec'] == 1) {
      if (data['dRucRec'].indexOf('-') == -1) {
        throw new Error('RUC del Receptor debe contener dígito verificador en data.dRucRec');
      }
      const rucEmisor = data['dRucRec'].split('-')[0];
      const dvEmisor = data['dRucRec'].split('-')[1];

      jsonResult['rGeVeNotRec']['dRucRec'] = rucEmisor;
      jsonResult['rGeVeNotRec']['dDVRec'] = dvEmisor;
    }

    if (data['iTipRec'] == 2) {
      if (
        constanteService.tiposDocumentosIdentidades.filter((um: any) => um.codigo === data['dTipIDRec']).length == 0
      ) {
        throw new Error(
          "Tipoo de Documento '" +
            data['dTipIDRec'] +
            "' en data.dTipIdRec no encontrado. Valores: " +
            constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['rGeVeNotRec']['dTipIDRec'] = data['dTipIDRec'];
      jsonResult['rGeVeNotRec']['dNumID'] = data['dNumID'];
    }

    jsonResult['rGeVeNotRec']['dTotalGs'] = data['dTotalGs'];

    return jsonResult;
  }

  private eventosReceptorConformidad(params: any, data: any) {
    const jsonResult: any = {};

    if (constanteService.eventoConformidadTipo.filter((um: any) => um.codigo === data['iTipConf']).length == 0) {
      throw new Error(
        "Tipoo de Documento '" +
          data['iTipConf'] +
          "' en data.iTipConf no encontrado. Valores: " +
          constanteService.eventoConformidadTipo.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    jsonResult['rGeVeConf'] = {
      $: {
        Id: data['Id'],
      },
      iTipConf: data['iTipConf'],
      dFecRecep: data['dFecRecep'],
    };

    if (data['iTipConf'] == 2) {
      if (!data['dFecRecep']) {
        throw new Error('Obligatorio proporcionar Fecha estimada de recepción en data.dFecRecep');
      }
    }

    return jsonResult;
  }

  private eventosReceptorDisconformidad(params: any, data: any) {
    const jsonResult: any = {};

    jsonResult['rGeVeDisconf'] = {
      $: {
        Id: data['Id'],
      },
      mOtEve: data['mOtEve'],
    };

    return jsonResult;
  }

  private eventosReceptorDesconocimiento(params: any, data: any) {
    const jsonResult: any = {};

    jsonResult['rGeVeDescon'] = {
      $: {
        Id: data['Id'],
      },
      dFecEmi: data['dFecEmi'],
      dFecRecep: data['dFecRecep'],
      iTipRec: data['iTipRec'],
      dNomRec: data['dNomRec'],
    };

    if (data['iTipRec'] == 1) {
      if (data['dRucRec'].indexOf('-') == -1) {
        throw new Error('RUC del Receptor debe contener dígito verificador en data.dRucRec');
      }
      const rucEmisor = data['dRucRec'].split('-')[0];
      const dvEmisor = data['dRucRec'].split('-')[1];

      jsonResult['rGeVeNotRec']['dRucRec'] = rucEmisor;
      jsonResult['rGeVeNotRec']['dDVRec'] = dvEmisor;
    }

    if (data['iTipRec'] == 2) {
      if (
        constanteService.tiposDocumentosIdentidades.filter((um: any) => um.codigo === data['dTipIDRec']).length == 0
      ) {
        throw new Error(
          "Tipoo de Documento '" +
            data['dTipIDRec'] +
            "' en data.dTipIdRec no encontrado. Valores: " +
            constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['rGeVeNotRec']['dTipIDRec'] = data['dTipIDRec'];
      jsonResult['rGeVeNotRec']['dNumID'] = data['dNumID'];
    }

    jsonResult['rGeVeNotRec']['mOtEve'] = data['mOtEve'];
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
