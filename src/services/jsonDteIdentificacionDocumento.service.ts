import constanteService from './constants.service';
import stringUtilService from './StringUtil.service';

class JSonDteIdentificacionDocumentoService {
  /**
   * H. Campos que identifican al documento asociado (H001-H049)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosDocumentoAsociado(params: any, dataDocumentoAsociado: any) {
    const jsonResult: any = {
      iTipDocAso: dataDocumentoAsociado['formato'],
      dDesTipDocAso: constanteService.tiposDocumentosAsociados.filter(
        (td) => td.codigo === dataDocumentoAsociado['formato'],
      )[0]['descripcion'],
    };

    if (dataDocumentoAsociado['formato'] == 1) {
      //H002 = Electronico
      if (dataDocumentoAsociado['cdc'] && dataDocumentoAsociado['cdc'].length >= 44) {
        jsonResult['dCdCDERef'] = dataDocumentoAsociado['cdc'];
        /*} else {
        throw new Error('Debe indicar el CDC asociado en data.documentoAsociado.cdc');*/
      }
    }
    if (dataDocumentoAsociado['formato'] == 2) {
      //H002 = Impreso
      if (dataDocumentoAsociado['timbrado']) {
        jsonResult['dNTimDI'] = dataDocumentoAsociado['timbrado'];
        /*} else {
        throw new Error(
          'Debe especificar el Timbrado del Documento impreso Asociado en data.documentoAsociado.timbrado',
        );*/
      }
      if (dataDocumentoAsociado['establecimiento']) {
        jsonResult['dEstDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['establecimiento'] + '', 3);
        /*} else {
        throw new Error(
          'Debe especificar el Establecimiento del Documento impreso Asociado en data.documentoAsociado.establecimiento',
        );*/
      }
      if (dataDocumentoAsociado['punto']) {
        jsonResult['dPExpDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['punto'] + '', 3);
        /*} else {
        throw new Error('Debe especificar el Punto del Documento impreso Asociado en data.documentoAsociado.punto');*/
      }
      if (dataDocumentoAsociado['numero']) {
        jsonResult['dNumDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['numero'] + '', 7);
        /*} else {
        throw new Error('Debe especificar el Número del Documento impreso Asociado en data.documentoAsociado.numero');*/
      }
      if (dataDocumentoAsociado['tipoDocumentoImpreso']) {
        jsonResult['iTipoDocAso'] = +dataDocumentoAsociado['tipoDocumentoImpreso'];
        jsonResult['dDTipoDocAso'] = constanteService.tiposDocumentosImpresos.filter(
          (td) => td.codigo === +dataDocumentoAsociado['tipoDocumentoImpreso'],
        )[0]['descripcion'];
      }
      if (dataDocumentoAsociado['fecha']) {
        /*if ((dataDocumentoAsociado['fecha'] + '').length != 10) {
          throw new Error(
            'La Fecha del Documento impreso Asociado en data.documentoAsociado.fecha debe tener una longitud de 10 caracteres',
          );
        }*/
        jsonResult['dFecEmiDI'] = dataDocumentoAsociado['fecha'];
        /*} else {
        throw new Error('Debe especificar la Fecha del Documento impreso Asociado en data.documentoAsociado.fecha');*/
      }
    }
    if (
      dataDocumentoAsociado &&
      dataDocumentoAsociado['numeroRetencion'] &&
      dataDocumentoAsociado['numeroRetencion'].length >= 15
    ) {
      jsonResult['dNumComRet'] = dataDocumentoAsociado['numeroRetencion'].substring(0, 15);
    }
    if (
      dataDocumentoAsociado &&
      dataDocumentoAsociado['resolucionCreditoFiscal'] &&
      dataDocumentoAsociado['resolucionCreditoFiscal'].length >= 15
    ) {
      jsonResult['dNumResCF'] = dataDocumentoAsociado['resolucionCreditoFiscal'].substring(0, 15);
    }

    if (dataDocumentoAsociado['formato'] == 3) {
      //H002 = Constancia electronica
      if (dataDocumentoAsociado['constanciaTipo']) {
        jsonResult['iTipCons'] = dataDocumentoAsociado['constanciaTipo'];
        jsonResult['dDesTipCons'] = constanteService.tiposConstancias.filter(
          (tc) => tc.codigo === dataDocumentoAsociado['constanciaTipo'],
        )[0]['descripcion'];
        jsonResult['dNumCons'] = +dataDocumentoAsociado['constanciaNumero'];
        jsonResult['dNumControl'] = dataDocumentoAsociado['constanciaControl'];
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
