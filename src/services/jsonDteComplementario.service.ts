/**
 * Contiene la codificacion del XML desde E790-E899
 * E9. Campos complementarios comerciales de uso específico (E790-E899)
 *
 */
class JSonDteComplementariosService {
  /**
   * E9. Campos complementarios comerciales de uso específico (E790-E899)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  public generateDatosComplementariosComercialesDeUsoEspecificos(params: any, data: any) {
    const jsonResult: any = {};
    let entro = false;
    if (data['sectorEnergiaElectrica']) {
      entro = true;
      jsonResult['gGrupEner'] = this.generateDatosSectorEnergiaElectrica(params, data);
    }

    if (data['sectorSeguros']) {
      entro = true;
      jsonResult['gGrupSeg'] = this.generateDatosSectorSeguros(params, data);
    }

    if (data['sectorSupermercados']) {
      entro = true;
      jsonResult['gGrupSup'] = this.generateDatosSectorSupermercados(params, data);
    }

    if (data['sectorAdicional']) {
      entro = true;
      jsonResult['gGrupAdi'] = this.generateDatosAdicionalesUsoComercial(params, data);
    }

    if (entro) {
      return jsonResult;
    } else {
      return null;
    }
  }

  /**
   * E9.2. Sector Energía Eléctrica (E791-E799)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorEnergiaElectrica(params: any, data: any) {
    const jsonResult: any = {
      dNroMed: data['sectorEnergiaElectrica']['numeroMedidor'],
      dActiv: data['sectorEnergiaElectrica']['codigoActividad'],
      dCateg: data['sectorEnergiaElectrica']['codigoCategoria'],
      dLecAnt: data['sectorEnergiaElectrica']['lecturaAnterior'],
      dLecAct: data['sectorEnergiaElectrica']['lecturaActual'],
      dConKwh: data['sectorEnergiaElectrica']['lecturaActual'] - data['sectorEnergiaElectrica']['lecturaAnterior'],
    };

    /*if (data['lecturaAnterior'] > data['lecturaActual']) {
      throw new Error('Sector Energia Electrica lecturaActual debe ser mayor a lecturaAnterior');
    }*/
    return jsonResult;
  }

  /**
   * E9.3. Sector de Seguros (E800-E809)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorSeguros(params: any, data: any) {
    const jsonResult: any = {
      dCodEmpSeg: data['sectorSeguros']['codigoAseguradora'],
      gGrupPolSeg: {
        dPoliza: data['sectorSeguros']['codigoPoliza'],
        dUnidVig: data['sectorSeguros']['vigenciaUnidad'], //horas, dias, año
        dVigencia: data['sectorSeguros']['vigencia'],
        dNumPoliza: data['sectorSeguros']['numeroPoliza'],
        dFecIniVig: data['sectorSeguros']['inicioVigencia'],
        dFecFinVig: data['sectorSeguros']['finVigencia'],
        dCodInt: data['sectorSeguros']['codigoInternoItem'],
      },
    };
    return jsonResult;
  }

  /**
   * E9.4. Sector de Supermercados (E810-E819
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorSupermercados(params: any, data: any) {
    const jsonResult: any = {
      dNomCaj: data['sectorSupermercados']['nombreCajero'],
      dEfectivo: data['sectorSupermercados']['efectivo'],
      dVuelto: data['sectorSupermercados']['vuelto'],
      dDonac: data['sectorSupermercados']['donacion'],
      dDesDonac: data['sectorSupermercados']['donacionDescripcion'].substring(0, 20),
    };
    return jsonResult;
  }

  /**
   * E9.5. Grupo de datos adicionales de uso comercial (E820-E829)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosAdicionalesUsoComercial(params: any, data: any) {
    const jsonResult: any = {};

    if (data['sectorAdicional']['ciclo']) {
      jsonResult['dCiclo'] = data['sectorAdicional']['ciclo'];
    }

    if (data['sectorAdicional']['inicioCiclo']) {
      jsonResult['dFecIniC'] = data['sectorAdicional']['inicioCiclo'];
    }

    if (data['sectorAdicional']['finCiclo']) {
      jsonResult['dFecFinC'] = data['sectorAdicional']['finCiclo'];
    }

    if (data['sectorAdicional']['vencimientoPago']) {
      let fecha = new Date(data.fecha);
      let fechaPago = new Date(data['sectorAdicional']['vencimientoPago']);
      jsonResult['dVencPag'] = data['sectorAdicional']['vencimientoPago'];
    }

    if (data['sectorAdicional']['numeroContrato']) {
      jsonResult['dContrato'] = data['sectorAdicional']['numeroContrato'];
    }

    if (data['sectorAdicional']['saldoAnterior']) {
      jsonResult['dSalAnt'] = data['sectorAdicional']['saldoAnterior'];
    }

    if (data['sectorAdicional']['codigoContratacionDNCP']) {
      jsonResult['dCodConDncp'] = data['sectorAdicional']['codigoContratacionDNCP']; //NT20
    }

    return jsonResult;
  }
}

export default new JSonDteComplementariosService();
