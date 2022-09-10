import constanteService from './constants.service';

class JSonDteComplementariosComercialesService {
  /**
   * G. Campos complementarios comerciales de uso general (G001-G049)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosComercialesUsoGeneral(params: any, data: any) {
    const jsonResult: any = {
      //dOrdCompra : data['complementarios']['ordenCompra'],
      //dOrdVta : data['complementarios']['ordenVenta'],
      //dAsiento : data['complementarios']['numeroAsiento']
    };

    if (data['complementarios'] && data['complementarios']['ordenCompra']) {
      jsonResult['dOrdCompra'] = data['complementarios']['ordenCompra'];
    }
    if (data['complementarios'] && data['complementarios']['ordenVenta']) {
      jsonResult['dOrdVta'] = data['complementarios']['ordenVenta'];
    }
    if (data['complementarios'] && data['complementarios']['numeroAsiento']) {
      jsonResult['dAsiento'] = data['complementarios']['numeroAsiento'];
    }

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 7) {
      //Opcional si 1 o 7
      if (
        (data['complementarios'] &&
          data['complementarios']['carga'] &&
          data['complementarios']['carga']['volumenTotal']) ||
        (data['complementarios'] && data['complementarios']['carga'] && data['complementarios']['carga']['pesoTotal'])
      ) {
        jsonResult['gCamCarg'] = this.generateDatosCarga(params, data);
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
  private generateDatosCarga(params: any, data: any) {
    //TODO ALL
    const jsonResult: any = {
      /*cUniMedTotVol : data['complementarios']['carga']['unidadMedida'], 
            dDesUniMedTotVol : data['complementarios']['carga']['ordenVenta'],
            dTotVolMerc : data['complementarios']['carga']['totalVolumenMercaderia'],
            cUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dDesUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dTotPesMerc : data['complementarios']['carga']['numeroAsiento'],
            iCarCarga : data['complementarios']['carga']['numeroAsiento'],
            dDesCarCarga : data['complementarios']['carga']['numeroAsiento'],*/
    };

    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['unidadMedidaVolumenTotal']
    ) {
      /*if (
        constanteService.unidadesMedidas.filter(
          (um) => um.codigo === data['complementarios']['carga']['unidadMedidaVolumenTotal'],
        ).length == 0
      ) {
        throw new Error(
          "Unidad de Medida '" +
            data['complementarios']['carga']['unidadMedidaVolumenTotal'] +
            "' en data.complementarios.carga.unidadMedidaVolumenTotal no válido. Valores: " +
            constanteService.unidadesMedidas.map((a) => a.codigo + '-' + a.descripcion.trim()),
        );
      }*/
      jsonResult['cUniMedTotVol'] = data['complementarios']['carga']['unidadMedidaVolumenTotal'];
      jsonResult['dDesUniMedTotVol'] = constanteService.unidadesMedidas.filter(
        (td) => td.codigo == data['complementarios']['carga']['unidadMedidaVolumenTotal'],
      )[0]['representacion'];
    }
    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['volumenTotal']
    ) {
      jsonResult['dTotVolMerc'] = data['complementarios']['carga']['volumenTotal'];
    }
    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['unidadMedidaPesoTotal']
    ) {
      /*if (
        constanteService.unidadesMedidas.filter(
          (um) => um.codigo === data['complementarios']['carga']['unidadMedidaPesoTotal'],
        ).length == 0
      ) {
        throw new Error(
          "Unidad de Medida '" +
            data['complementarios']['carga']['unidadMedidaPesoTotal'] +
            "' en data.complementarios.carga.unidadMedidaPesoTotal no válido. Valores: " +
            constanteService.unidadesMedidas.map((a) => a.codigo + '-' + a.descripcion.trim()),
        );
      }*/
      jsonResult['cUniMedTotPes'] = data['complementarios']['carga']['unidadMedidaPesoTotal'];
      jsonResult['dDesUniMedTotPes'] = constanteService.unidadesMedidas.filter(
        (td) => td.codigo == data['complementarios']['carga']['unidadMedidaPesoTotal'],
      )[0]['representacion'];
    }
    if (data['complementarios'] && data['complementarios']['carga'] && data['complementarios']['carga']['pesoTotal']) {
      jsonResult['dTotPesMerc'] = data['complementarios']['carga']['pesoTotal'];
    }
    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['caracteristicaCarga']
    ) {
      /*if (
        constanteService.caracteristicasCargas.filter(
          (um) => um.codigo === data['complementarios']['carga']['caracteristicaCarga'],
        ).length == 0
      ) {
        throw new Error(
          "Característica de Carga '" +
            data['complementarios']['carga']['caracteristicaCarga'] +
            "' en data.complementarios.carga.caracteristicaCarga no válido. Valores: " +
            constanteService.caracteristicasCargas.map((a) => a.codigo + '-' + a.descripcion),
        );
      }*/
      jsonResult['iCarCarga'] = data['complementarios']['carga']['caracteristicaCarga'];
      jsonResult['dDesCarCarga'] = constanteService.caracteristicasCargas.filter(
        (td) => td.codigo == data['complementarios']['carga']['caracteristicaCarga'],
      )[0]['descripcion'];

      if (data['complementarios']['carga']['caracteristicaCarga'] == 3) {
        if (data['complementarios']['carga']['caracteristicaCargaDescripcion']) {
          jsonResult['dDesCarCarga'] = data['complementarios']['carga']['caracteristicaCargaDescripcion'];
          /*} else {
          throw new Error(
            'Para data.complementarios.carga.caracteristicaCarga = 3 debe informar el campo data.complementarios.carga.caracteristicaCargaDescripcion',
          );*/
        }
      }
    }
    return jsonResult;
  }
}

export default new JSonDteComplementariosComercialesService();
