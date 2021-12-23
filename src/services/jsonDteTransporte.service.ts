import constanteService from './Constante.service';
import StringUtilService from './StringUtil.service';

class JSonDteTransporteService {
  /**
   * E10. Campos que describen el transporte de las mercaderías (E900-E999)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosTransporte(params: any, data: any) {
    if (data['tipoDocumento'] == 7) {
      if (!(data['detalleTransporte'] && data['detalleTransporte']['tipo'] && data['detalleTransporte']['tipo'] > 0)) {
        throw new Error('Obligatorio informar detalleTransporte.tipo');
      }
    }
    if (data['detalleTransporte'] && data['detalleTransporte']['condicionNegociacion']) {
      if (constanteService.condicionesNegociaciones.indexOf(data['detalleTransporte']['condicionNegociacion']) < -1) {
        throw new Error(
          'detalleTransporte.condicionNegociación (' +
            data['detalleTransporte']['condicionNegociacion'] +
            ') no válido',
        );
      }
    }
    if (data['tipoDocumento'] == 7) {
      if (data['inicioEstimadoTranslado']) {
        throw new Error('Obligatorio informar detalleTransporte.inicioEstimadoTranslado');
      }
    }
    if (data['tipoDocumento'] == 7) {
      if (data['finEstimadoTranslado']) {
        throw new Error('Obligatorio informar detalleTransporte.finEstimadoTranslado');
      }
    }
    if (constanteService.tiposTransportes.filter((um) => um.codigo === data['detalleTransporte']['tipo']).length == 0) {
      throw new Error(
        "Tipo de Transporte '" +
          data['detalleTransporte']['tipo'] +
          "' en data.detalleTransporte.tipo no encontrado. Valores: " +
          constanteService.tiposTransportes.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    if (
      constanteService.modalidadesTransportes.filter((um) => um.codigo === data['detalleTransporte']['modalidad'])
        .length == 0
    ) {
      throw new Error(
        "Modalidad de Transporte '" +
          data['detalleTransporte']['modalidad'] +
          "' en data.detalleTransporte.modalidad no encontrado. Valores: " +
          constanteService.modalidadesTransportes.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    if (
      constanteService.condicionesNegociaciones.filter(
        (um) => um.codigo === data['detalleTransporte']['condicionNegociacion'],
      ).length == 0
    ) {
      throw new Error(
        "Condicion de Negociacion '" +
          data['detalleTransporte']['condicionNegociacion'] +
          "' en data.detalleTransporte.condicionNegociacion no encontrado. Valores: " +
          constanteService.condicionesNegociaciones.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    const jsonResult: any = {
      iTipTrans: data['detalleTransporte']['tipo'],
      dDesTipTrans: constanteService.tiposTransportes.filter((tt) => tt.codigo == data['detalleTransporte']['tipo'])[0][
        'descripcion'
      ],
      iModTrans: data['detalleTransporte']['modalidad'],
      dDesModTrans: constanteService.modalidadesTransportes.filter(
        (mt) => mt.codigo == data['detalleTransporte']['modalidad'],
      )[0]['descripcion'],
      iRespFlete: data['detalleTransporte']['tipoResponsable'],
      cCondNeg: data['detalleTransporte']['condicionNegociacion'],
      dNuManif: data['detalleTransporte']['numeroManifiesto'],
      //dNuDespImp : data['detalleTransporte']['numeroDespachoImportacion'].substring(0, 16),
      dIniTras: data['detalleTransporte']['inicioEstimadoTranslado'],
      dFinTras: data['detalleTransporte']['finEstimadoTranslado'],
      cPaisDest: data['detalleTransporte']['paisDestino'],
      dDesPaisDest: data['detalleTransporte']['paisDestinoNombre'],
    };

    if (data['detalleTransporte'] && data['detalleTransporte']['numeroDespachoImportacion']) {
      if (data['detalleTransporte']['numeroDespachoImportacion'].length >= 16) {
        jsonResult['dNuDespImp'] = data['detalleTransporte']['numeroDespachoImportacion'].substring(0, 16);
      }
    }
    jsonResult['gCamSal'] = this.generateDatosSalida(params, data);
    jsonResult['gCamEnt'] = this.generateDatosEntrega(params, data);
    jsonResult['gVehTras'] = this.generateDatosVehiculo(params, data);
    if (data['detalleTransporte']['transportista']) {
      jsonResult['gCamTrans'] = this.generateDatosTransportista(params, data);
    }

    return jsonResult;
  }

  /**
   * E10.1. Campos que identifican el local de salida de las mercaderías (E920-E939)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSalida(params: any, data: any) {
    const jsonResult: any = {
      dDirLocSal: data['detalleTransporte']['salida']['direccion'],
      dNumCasSal: data['detalleTransporte']['salida']['numeroCasa'],
      dComp1Sal: data['detalleTransporte']['salida']['complementoDireccion1'],
      dComp2Sal: data['detalleTransporte']['salida']['complementoDireccion1'],

      cDepSal: +data['detalleTransporte']['salida']['departamento'],
      dDesDepSal: constanteService.departamentos.filter(
        (td) => td.codigo === +data['detalleTransporte']['salida']['departamento'],
      )[0]['descripcion'],
      cDisSal: +data['detalleTransporte']['salida']['distrito'],
      dDesDisSal: constanteService.distritos.filter(
        (td) => td.codigo === +data['detalleTransporte']['salida']['distrito'],
      )[0]['descripcion'],
      cCiuSal: +data['detalleTransporte']['salida']['ciudad'],
      dDesCiuSal: constanteService.ciudades.filter(
        (td) => td.codigo === +data['detalleTransporte']['salida']['ciudad'],
      )[0]['descripcion'],
      //dTelSal : data['detalleTransporte']['salida']['telefonoContacto'],
    };

    constanteService.validateDepartamentoDistritoCiudad(
      'data.detalleTransporte.salida',
      +data['autoFactura']['departamento'],
      +data['autoFactura']['distrito'],
      +data['autoFactura']['ciudad'],
    );

    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['salida'] &&
      data['detalleTransporte']['salida']['telefonoContacto']
    ) {
      if (data['detalleTransporte']['salida']['telefonoContacto'].length >= 6) {
        jsonResult['dTelSal'] = data['detalleTransporte']['salida']['telefonoContacto'];
      }
    }
    return jsonResult;
  }

  /**
   * E10.2. Campos que identifican el local de entrega de las mercaderías (E940-E959)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosEntrega(params: any, data: any) {
    const jsonResult: any = {
      dDirLocEnt: data['detalleTransporte']['entrega']['direccion'],
      dNumCasEnt: data['detalleTransporte']['entrega']['numeroCasa'],
      dComp1Ent: data['detalleTransporte']['entrega']['complementoDireccion1'],
      dComp2Ent: data['detalleTransporte']['entrega']['complementoDireccion1'],
      cDepEnt: data['detalleTransporte']['entrega']['departamento'],
      dDesDepEnt: constanteService.departamentos.filter(
        (td) => td.codigo === data['detalleTransporte']['entrega']['departamento'],
      )[0]['descripcion'],
      cDisEnt: data['detalleTransporte']['entrega']['distrito'],
      dDesDisEnt: constanteService.distritos.filter(
        (td) => td.codigo === data['detalleTransporte']['entrega']['distrito'],
      )[0]['descripcion'],
      cCiuEnt: data['detalleTransporte']['entrega']['ciudad'],
      dDesCiuEnt: constanteService.ciudades.filter(
        (td) => td.codigo === data['detalleTransporte']['entrega']['ciudad'],
      )[0]['descripcion'],
      //dTelEnt : data['detalleTransporte']['entrega']['telefonoContacto'],
    };

    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['entrega'] &&
      data['detalleTransporte']['entrega']['telefonoContacto']
    ) {
      if (data['detalleTransporte']['entrega']['telefonoContacto'].length >= 6) {
        jsonResult['dTelEnt'] = data['detalleTransporte']['entrega']['telefonoContacto'];
      }
    }
    return jsonResult;
  }

  /**
     * E10.3. Campos que identifican el vehículo de traslado de mercaderías (E960-E979)

     * 
     * @param params 
     * @param data 
     * @param options 
     * @param items Es el item actual del array de items de "data" que se está iterando
     */
  private generateDatosVehiculo(params: any, data: any) {
    const jsonResult: any = {
      dTiVehTras: data['detalleTransporte']['vehiculo']['tipo'],
      dMarVeh: data['detalleTransporte']['vehiculo']['marca'],
      dTipIdenVeh: data['detalleTransporte']['vehiculo']['documentoTipo'],
      dNroIDVeh: data['detalleTransporte']['vehiculo']['documentoNumero'],
      //dAdicVeh : data['detalleTransporte']['vehiculo']['obs'],
      //dNroMatVeh : data['detalleTransporte']['vehiculo']['numeroMatricula'].substring(0, 6),
      //dNroVuelo : data['detalleTransporte']['vehiculo']['numeroVuelo'].substring(0, 6)
    };
    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['vehiculo'] &&
      data['detalleTransporte']['vehiculo']['obs']
    ) {
      jsonResult['dAdicVeh'] = data['detalleTransporte']['vehiculo']['obs'];
    }
    if (data['detalleTransporte']['vehiculo']['numeroMatricula']) {
      if (data['detalleTransporte']['vehiculo']['numeroMatricula'].length >= 6) {
        jsonResult['dNroMatVeh'] = data['detalleTransporte']['vehiculo']['numeroMatricula'].substring(0, 6);
      }
    }
    if (data['detalleTransporte']['vehiculo']['numeroVuelo']) {
      if (data['detalleTransporte']['vehiculo']['numeroVuelo'].length >= 6) {
        jsonResult['dNroVuelo'] = data['detalleTransporte']['vehiculo']['numeroVuelo'].substring(0, 6);
      }
    }
    return jsonResult;
  }

  /**
   * E10.4. Campos que identifican al transportista (persona física o jurídica) (E980-E999)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosTransportista(params: any, data: any) {
    if (
      constanteService.tiposDocumentosIdentidades.filter(
        (um) => um.codigo === data['detalleTransporte']['transportista']['documentoTipo'],
      ).length == 0
    ) {
      throw new Error(
        "Tipo de Documento '" +
          data['detalleTransporte']['transportista']['documentoTipo'] +
          "' en data.detalleTransporte.transportista.documentoTipo no encontrado. Valores: " +
          constanteService.tiposDocumentosIdentidades.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['transportista'] &&
      data['detalleTransporte']['transportista']['ruc']
    ) {
      if (data['detalleTransporte']['transportista']['ruc'].indexOf('-') == -1) {
        throw new Error('RUC debe contener dígito verificador en data.detalleTransporte.transportista.ruc');
      }
    }

    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['transportista'] &&
      data['detalleTransporte']['transportista']['agente'] &&
      data['detalleTransporte']['transportista']['agente']['ruc']
    ) {
      if (data['detalleTransporte']['transportista']['agente']['ruc'].indexOf('-') == -1) {
        throw new Error('RUC debe contener dígito verificador en data.detalleTransporte.transportista.agente.ruc');
      }
    }

    const jsonResult: any = {
      iNatTrans: data['detalleTransporte']['transportista']['contribuyente'] ? 1 : 2,
      dNomTrans: data['detalleTransporte']['transportista']['nombre'],
    };

    if (data['detalleTransporte']['transportista']['contribuyente']) {
      jsonResult['dRucTrans'] = data['detalleTransporte']['transportista']['ruc'].split('-')[0];
      jsonResult['dDVTrans'] = data['detalleTransporte']['transportista']['ruc'].split('-')[1];
    }

    if (!data['detalleTransporte']['transportista']['contribuyente']) {
      jsonResult['iTipIDTrans'] = data['detalleTransporte']['transportista']['documentoTipo'];
      jsonResult['dDTipIDTrans'] = constanteService.tiposDocumentosIdentidades.filter(
        (td) => td.codigo === data['detalleTransporte']['transportista']['documentoTipo'],
      )[0]['descripcion'];
      jsonResult['dNumIDTrans'] = data['detalleTransporte']['transportista']['documentoNumero'].substring(0, 20);
    }

    if (data['detalleTransporte']['transportista'] && data['detalleTransporte']['transportista']['pais']) {
      if (
        constanteService.paises.filter(
          (pais: any) => pais.codigo === data['detalleTransporte']['transportista']['pais'],
        ).length == 0
      ) {
        throw new Error(
          "Pais '" +
            data['detalleTransporte']['transportista']['pais'] +
            "' del Cliente en data.detalleTransporte.transportista.pais no encontrado. Valores: " +
            constanteService.paises.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      jsonResult['cNacTrans'] = data['detalleTransporte']['transportista']['pais'];
      jsonResult['dDesNacTrans'] = constanteService.paises.filter(
        (pais) => pais.codigo === data['detalleTransporte']['transportista']['pais'],
      )[0]['descripcion'];
    }

    jsonResult['dNumIDChof'] = data['detalleTransporte']['transportista']['chofer']['documentoNumero'].substring(0, 20);
    jsonResult['dNomChof'] = data['detalleTransporte']['transportista']['chofer']['nombre'];
    jsonResult['dDomFisc'] = data['detalleTransporte']['transportista']['direccion'];
    jsonResult['dDirChof'] = data['detalleTransporte']['transportista']['chofer']['direccion'];
    jsonResult['dNombAg'] = data['detalleTransporte']['transportista']['agente']['nombre'];
    jsonResult['dRucAg'] = data['detalleTransporte']['transportista']['agente']['ruc'].split('-')[0];
    jsonResult['dDVAg'] = data['detalleTransporte']['transportista']['agente']['ruc'].split('-')[1];
    jsonResult['dDirAge'] = data['detalleTransporte']['transportista']['agente']['direccion'];

    return jsonResult;
  }
}

export default new JSonDteTransporteService();
