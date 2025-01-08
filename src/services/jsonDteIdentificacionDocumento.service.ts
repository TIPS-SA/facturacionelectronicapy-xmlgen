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
  public generateDatosDocumentoAsociado(params: any, dataDocumentoAsociado: any, data: any) {
    const jsonResult: any = {
      iTipDocAso: dataDocumentoAsociado['formato'],
      dDesTipDocAso: constanteService.tiposDocumentosAsociados.filter(
        (td) => td.codigo === +dataDocumentoAsociado['formato'],
      )[0]['descripcion'],
    };

    if (dataDocumentoAsociado['formato'] == 1) {
      //H002 = Electronico
      if (dataDocumentoAsociado['cdc'] && dataDocumentoAsociado['cdc'].length >= 44) {
        jsonResult['dCdCDERef'] = dataDocumentoAsociado['cdc'];
      }
      if (data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6 || data['tipoDocumento'] == 7) {
        if (dataDocumentoAsociado['rucFusionado'] && dataDocumentoAsociado['rucFusionado'].length >= 3) {
          jsonResult['dRucFus'] = dataDocumentoAsociado['rucFusionado'];
        }
      }
    }
    if (dataDocumentoAsociado['formato'] == 2) {
      //H002 = Impreso
      if (dataDocumentoAsociado['timbrado']) {
        jsonResult['dNTimDI'] = dataDocumentoAsociado['timbrado'];
      }
      if (dataDocumentoAsociado['establecimiento']) {
        jsonResult['dEstDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['establecimiento'] + '', 3);
      }
      if (dataDocumentoAsociado['punto']) {
        jsonResult['dPExpDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['punto'] + '', 3);
      }
      if (dataDocumentoAsociado['numero']) {
        jsonResult['dNumDocAso'] = stringUtilService.leftZero(dataDocumentoAsociado['numero'] + '', 7);
      }
      if (dataDocumentoAsociado['tipoDocumentoImpreso']) {
        jsonResult['iTipoDocAso'] = +dataDocumentoAsociado['tipoDocumentoImpreso'];
        jsonResult['dDTipoDocAso'] = constanteService.tiposDocumentosImpresos.filter(
          (td) => td.codigo === +dataDocumentoAsociado['tipoDocumentoImpreso'],
        )[0]['descripcion'];
      }
      if (dataDocumentoAsociado['fecha']) {
        jsonResult['dFecEmiDI'] = dataDocumentoAsociado['fecha'];
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
