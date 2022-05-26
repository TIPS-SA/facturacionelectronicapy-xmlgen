import constanteService from './Constante.service';
import stringUtilService from './StringUtil.service';

class JSonDteIdentificacionDocumentoService {
  /**
   * H. Campos que identifican al documento asociado (H001-H049)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosDocumentoAsociado(params: any, data: any) {
    const jsonResult: any = {
      iTipDocAso: data['documentoAsociado']['formato'],
      dDesTipDocAso: constanteService.tiposDocumentosAsociados.filter(
        (td) => td.codigo === data['documentoAsociado']['formato'],
      )[0]['descripcion'],
    };

    if (data['documentoAsociado']['formato'] == 1) {
      //H002 = Electronico
      if (data['documentoAsociado']['cdc'] && data['documentoAsociado']['cdc'].length >= 44) {
        jsonResult['dCdCDERef'] = data['documentoAsociado']['cdc'];
        /*} else {
        throw new Error('Debe indicar el CDC asociado en data.documentoAsociado.cdc');*/
      }
    }
    if (data['documentoAsociado']['formato'] == 2) {
      //H002 = Impreso
      if (data['documentoAsociado']['timbrado']) {
        jsonResult['dNTimDI'] = data['documentoAsociado']['timbrado'];
        /*} else {
        throw new Error(
          'Debe especificar el Timbrado del Documento impreso Asociado en data.documentoAsociado.timbrado',
        );*/
      }
      if (data['documentoAsociado']['establecimiento']) {
        jsonResult['dEstDocAso'] = stringUtilService.leftZero(data['documentoAsociado']['establecimiento'] + '', 3);
        /*} else {
        throw new Error(
          'Debe especificar el Establecimiento del Documento impreso Asociado en data.documentoAsociado.establecimiento',
        );*/
      }
      if (data['documentoAsociado']['punto']) {
        jsonResult['dPExpDocAso'] = stringUtilService.leftZero(data['documentoAsociado']['punto'] + '', 3);
        /*} else {
        throw new Error('Debe especificar el Punto del Documento impreso Asociado en data.documentoAsociado.punto');*/
      }
      if (data['documentoAsociado']['numero']) {
        jsonResult['dNumDocAso'] = stringUtilService.leftZero(data['documentoAsociado']['numero'] + '', 7);
        /*} else {
        throw new Error('Debe especificar el Número del Documento impreso Asociado en data.documentoAsociado.numero');*/
      }
      if (data['documentoAsociado']['tipoDocumentoImpreso']) {
        jsonResult['iTipoDocAso'] = data['documentoAsociado']['tipoDocumentoImpreso'];
        jsonResult['dDTipoDocAso'] = constanteService.tiposDocumentosImpresos.filter(
          (td) => td.codigo === data['documentoAsociado']['tipoDocumentoImpreso'],
        )[0]['descripcion'];
        /*} else {
        throw new Error(
          'Debe especificar el Tipo del Documento Impreso Asociado en data.documentoAsociado.tipoDocumentoImpreso',
        );*/
      }
      if (data['documentoAsociado']['fecha']) {
        /*if ((data['documentoAsociado']['fecha'] + '').length != 10) {
          throw new Error(
            'La Fecha del Documento impreso Asociado en data.documentoAsociado.fecha debe tener una longitud de 10 caracteres',
          );
        }*/
        jsonResult['dFecEmiDI'] = data['documentoAsociado']['fecha'];
        /*} else {
        throw new Error('Debe especificar la Fecha del Documento impreso Asociado en data.documentoAsociado.fecha');*/
      }
    }
    if (
      data['documentoAsociado'] &&
      data['documentoAsociado']['numeroRetencion'] &&
      data['documentoAsociado']['numeroRetencion'].length >= 15
    ) {
      jsonResult['dNumComRet'] = data['documentoAsociado']['numeroRetencion'].substring(0, 15);
    }
    if (
      data['documentoAsociado'] &&
      data['documentoAsociado']['resolucionCreditoFiscal'] &&
      data['documentoAsociado']['resolucionCreditoFiscal'].length >= 15
    ) {
      jsonResult['dNumResCF'] = data['documentoAsociado']['resolucionCreditoFiscal'].substring(0, 15);
    }

    if (data['documentoAsociado']['formato'] == 3) {
      //H002 = Constancia electronica
      if (data['documentoAsociado']['constanciaTipo']) {
        /*if (
          constanteService.tiposConstancias.filter((um) => um.codigo === data['documentoAsociado']['constanciaTipo'])
            .length == 0
        ) {
          throw new Error(
            "Tipo de Constancia '" +
              data['documentoAsociado']['constanciaTipo'] +
              "' en data.documentoAsociado.constanciaTipo no encontrado. Valores: " +
              constanteService.tiposConstancias.map((a) => a.codigo + '-' + a.descripcion),
          );
        }*/

        jsonResult['iTipCons'] = data['documentoAsociado']['constanciaTipo'];
        jsonResult['dDesTipCons'] = constanteService.tiposConstancias.filter(
          (tc) => tc.codigo === data['documentoAsociado']['constanciaTipo'],
        )[0]['descripcion'];
        jsonResult['dNumCons'] = +data['documentoAsociado']['constanciaNumero'];
        jsonResult['dNumControl'] = data['documentoAsociado']['constanciaControl'];
      }
    }
    return jsonResult;
  }

  /**
   * G1. Campos generales de la carga (G050 - G099)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosCarga(params: any, data: any) {
    const jsonResult: any = {
      cUniMedTotVol: data['complementarios']['carga']['unidadMedida'],
      dDesUniMedTotVol: data['complementarios']['carga']['ordenVenta'],
      dTotVolMerc: data['complementarios']['carga']['numeroAsiento'],
      cUniMedTotPes: data['complementarios']['carga']['numeroAsiento'],
      dDesUniMedTotPes: data['complementarios']['carga']['numeroAsiento'],
      dTotPesMerc: data['complementarios']['carga']['numeroAsiento'],
      iCarCarga: data['complementarios']['carga']['numeroAsiento'],
      dDesCarCarga: data['complementarios']['carga']['numeroAsiento'],
    };

    return jsonResult;
  }
}

export default new JSonDteIdentificacionDocumentoService();
