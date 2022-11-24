import stringUtilService from './StringUtil.service';
import constanteService from './constants.service';
import { XmlgenConfig } from './type.interface.';

class JSonDteItemService {
  /**
   * E8. Campos que describen los ítems de la operación (E700-E899)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosItemsOperacion(params: any, data: any, config: XmlgenConfig) {
    const jsonResult: any = [];

    //Recorrer array de infoCuotas e informar en el JSON
    if (data['items'] && data['items'].length > 0) {
      for (let i = 0; i < data['items'].length; i++) {
        const item = data['items'][i];

        const gCamItem: any = {
          dCodInt: item['codigo'],
        };

        if (item['partidaArancelaria']) {
          gCamItem['dParAranc'] = item['partidaArancelaria'];
        }

        if (item['ncm']) {
          gCamItem['dNCM'] = item['ncm'];
        }

        if (data['cliente']['tipoOperacion'] && data['cliente']['tipoOperacion'] === 3) {
          gCamItem['dDncpG'] = stringUtilService.leftZero(item['dncp']['codigoNivelGeneral'], 8);
          gCamItem['dDncpE'] = item['dncp']['codigoNivelEspecifico'];
          gCamItem['dGtin'] = item['dncp']['codigoGtinProducto'];
          gCamItem['dGtinPq'] = item['dncp']['codigoNivelPaquete'];
        }

        gCamItem['dDesProSer'] = item['descripcion']; // RG 24/2019

        gCamItem['cUniMed'] = item['unidadMedida'];
        gCamItem['dDesUniMed'] = constanteService.unidadesMedidas
          .filter((um) => um.codigo === item['unidadMedida'])[0]
          ['representacion'].trim();

        gCamItem['dCantProSer'] = item['cantidad'];

        if (item['pais']) {
          gCamItem['cPaisOrig'] = item['pais'];
          gCamItem['dDesPaisOrig'] = constanteService.paises.filter((pais) => pais.codigo === item['pais'])[0][
            'descripcion'
          ];
        }

        if (item['observacion'] && item['observacion'].trim().length > 0) {
          gCamItem['dInfItem'] = item['observacion'].trim();
        }

        if (data['tipoDocumento'] === 7) {
          if (item['tolerancia']) {
            gCamItem['cRelMerc'] = item['tolerancia'];
            gCamItem['dDesRelMerc'] = constanteService.relevanciasMercaderias.filter(
              (um) => um.codigo === item['tolerancia'],
            )[0]['descripcion'];
            gCamItem['dCanQuiMer'] = item['toleranciaCantidad'];
            gCamItem['dPorQuiMer'] = item['toleranciaPorcentaje'];
          }
        }

        //Tratamiento E719. Tiene relacion con generateDatosGeneralesInherentesOperacion
        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
          if (data['tipoTransaccion'] === 9) {
            if (item['cdcAnticipo']) {
              gCamItem['dCDCAnticipo'] = item['cdcAnticipo'];
            }
          }
        }

        if (data['tipoDocumento'] != 7) {
          //Oblitatorio informar
          gCamItem['gValorItem'] = this.generateDatosItemsOperacionPrecioTipoCambioTotal(params, data, item, i, config);
        }

        if (
          data['tipoImpuesto'] == 1 ||
          data['tipoImpuesto'] == 3 ||
          data['tipoImpuesto'] == 4 ||
          data['tipoImpuesto'] == 5
        ) {
          if (data['tipoDocumento'] != 4 && data['tipoDocumento'] != 7) {
            gCamItem['gCamIVA'] = this.generateDatosItemsOperacionIVA(params, data, item, i, { ...gCamItem }, config);
          }
        }

        //Rastreo
        if (
          item['lote'] ||
          item['vencimiento'] ||
          item['numeroSerie'] ||
          item['numeroPedido'] ||
          item['numeroSeguimiento'] ||
          item['registroSenave'] ||
          item['registroEntidadComercial']
        ) {
          gCamItem['gRasMerc'] = this.generateDatosItemsOperacionRastreoMercaderias(params, data, item, i);
        }

        //Automotores
        if (item['sectorAutomotor'] && item['sectorAutomotor']['tipo']) {
          gCamItem['gVehNuevo'] = this.generateDatosItemsOperacionSectorAutomotores(params, data, item, i);
        }

        jsonResult.push(gCamItem);
      } //end-for

      //Verificacion de Totales de Descuento Global y Anticipo
      //Con los prorrateos pueden haber diferencias
      //Las diferencias se corrigen en el ultimo item

      let totalDescuentoGlobal = 0;
      let totalAnticipoGlobal = 0;
      if (data['descuentoGlobal'] > 0 || data['anticipoGlobal'] > 0) {
        for (let i = 0; i < jsonResult.length; i++) {
          const gCamItem = jsonResult[i];

          if (data['descuentoGlobal']) {
            totalDescuentoGlobal += gCamItem['dCantProSer'] * gCamItem['gValorItem']['gValorRestaItem']['dDescGloItem'];
          }

          if (data['anticipoGlobal']) {
            totalAnticipoGlobal +=
              gCamItem['dCantProSer'] * gCamItem['gValorItem']['gValorRestaItem']['dAntGloPreUniIt'];
          }
        }

        if (data['descuentoGlobal'] > 0) {
          if (data['descuentoGlobal'] != totalDescuentoGlobal) {
            console.log('hay una diferencia', data['descuentoGlobal'], totalDescuentoGlobal);
            //throw new Error("hay una diferencia", data['descuentoGlobal'], totalDescuentoGlobal);
          }
        }
        if (data['anticipoGlobal'] > 0) {
          if (data['anticipoGlobal'] != totalDescuentoGlobal) {
            console.log('hay una diferencia', data['anticipoGlobal'], totalAnticipoGlobal);
            //throw new Error("hay una diferencia", data['anticipoGlobal'], totalDescuentoGlobal);
          }
        }
      }
    }

    return jsonResult;
  }

  /**
   * E8.1. Campos que describen el precio, tipo de cambio y valor total de la operación por ítem (E720-E729)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosItemsOperacionPrecioTipoCambioTotal(
    params: any,
    data: any,
    item: any,
    i: number,
    config: XmlgenConfig,
  ) {
    const jsonResult: any = {};

    //Corrige Precio Unitario con la cantidad correcta de decimales
    item['precioUnitario'] = parseFloat(item['precioUnitario']).toFixed(config.decimals);
    if (data.moneda === 'PYG') {
      item['precioUnitario'] = parseFloat(item['precioUnitario']).toFixed(0);
    }

    jsonResult['dPUniProSer'] = item['precioUnitario'];

    jsonResult['dTotBruOpeItem'] = parseFloat(jsonResult['dPUniProSer']) * parseFloat(item['cantidad']);

    jsonResult['dTotBruOpeItem'] = parseFloat(jsonResult['dTotBruOpeItem'].toFixed(config.decimals));
    if (data.moneda === 'PYG') {
      jsonResult['dTotBruOpeItem'] = parseFloat(jsonResult['dTotBruOpeItem'].toFixed(0));
    }

    if (data['condicionTipoCambio'] && data['condicionTipoCambio'] == 2) {
      jsonResult['dTiCamIt'] = item['cambio'];
    }
    jsonResult['gValorRestaItem'] = this.generateDatosItemsOperacionDescuentoAnticipoValorTotal(
      params,
      data,
      item,
      i,
      config,
    );

    return jsonResult;
  }

  /**
   * E8.1.1 Campos que describen los descuentos, anticipos y valor total por ítem (EA001-EA050)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosItemsOperacionDescuentoAnticipoValorTotal(
    params: any,
    data: any,
    item: any,
    i: number,
    config: XmlgenConfig,
  ) {
    const jsonResult: any = {};

    jsonResult['dDescItem'] = 0;
    if (item['descuento'] && +item['descuento'] > 0) {
      //Validar que si el descuento es mayor al precio
      jsonResult['dDescItem'] = parseFloat(item['descuento']).toFixed(config.decimals);

      //FacturaSend calcula solo el % Descuento, no hace falta informar
      jsonResult['dPorcDesIt'] = Math.round((parseFloat(item['descuento']) * 100) / parseFloat(item['precioUnitario']));
    }

    let totalGeneral = 0;
    for (let i = 0; i < data['items'].length; i++) {
      const item2 = data['items'][i];
      totalGeneral += item2['cantidad'] * item2['precioUnitario'];
    }

    jsonResult['dDescGloItem'] = 0;
    if (data['descuentoGlobal'] && +data['descuentoGlobal'] > 0) {
      let subtotal = item['cantidad'] * item['precioUnitario'];
      let pesoPorc = (100 * subtotal) / totalGeneral;
      let descuentoGlobalAplicado = (data['descuentoGlobal'] * pesoPorc) / 100;
      let descuentoGlobalUnitario = descuentoGlobalAplicado / item['cantidad'];

      jsonResult['dDescGloItem'] = parseFloat(descuentoGlobalUnitario + '').toFixed(8); //Redondea al maximo decimal, para que el total salga bien
    }

    jsonResult['dAntPreUniIt'] = 0;
    if (item['anticipo'] && +item['anticipo'] > 0) {
      jsonResult['dAntPreUniIt'] = parseFloat(item['anticipo']).toFixed(config.decimals); //Redondea al maximo decimal, para que el total salga bien
    }

    /*
    if (data['anticipoGlobal'] && +data['anticipoGlobal'] > 0) {
      jsonResult['dAntGloPreUniIt'] = parseFloat(data['anticipoGlobal']).toFixed(config.decimals);
    }*/

    jsonResult['dAntGloPreUniIt'] = 0;
    if (data['anticipoGlobal'] && +data['anticipoGlobal'] > 0) {
      let subtotal = item['cantidad'] * item['precioUnitario'];
      let pesoPorc = (100 * subtotal) / totalGeneral;
      let anticipoGlobalAplicado = (data['anticipoGlobal'] * pesoPorc) / 100;
      let anticipoGlobalUnitario = anticipoGlobalAplicado / item['cantidad'];

      jsonResult['dAntGloPreUniIt'] = parseFloat(anticipoGlobalUnitario + '').toFixed(8);
    }

    /* dTotOpeItem (EA008)
            Si D013 = 1, 3, 4 o 5 (afectado al IVA, Renta, ninguno, IVA - Renta), 
                entonces EA008 corresponde al cálculo aritmético: 
                    (E721 (Precio unitario) – 
                    EA002 (Descuento particular) – 
                    EA004 (Descuento global) – 
                    EA006 (Anticipo particular) –
                    EA007 (Anticipo global)) * E711(cantidad)

            Cálculo para Autofactura (C002=4): E721 * E711
        */

    if (
      data['tipoImpuesto'] == 1 ||
      data['tipoImpuesto'] == 3 ||
      data['tipoImpuesto'] == 4 ||
      data['tipoImpuesto'] == 5
    ) {
      const valores =
        parseFloat(item['precioUnitario']) -
        parseFloat(jsonResult['dDescItem'] || 0) -
        parseFloat(jsonResult['dDescGloItem'] || 0) -
        parseFloat(jsonResult['dAntPreUniIt'] || 0) -
        parseFloat(jsonResult['dAntGloPreUniIt'] || 0);

      jsonResult['dTotOpeItem'] = parseFloat(valores + '') * parseFloat(item['cantidad']);

      jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(config.decimals));
      if (data.moneda === 'PYG') {
        jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(0));
      }
    }
    if (data['tipoDocumento'] == 4) {
      //Si es Autofactura
      jsonResult['dTotOpeItem'] = parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']);

      jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(config.decimals));
      if (data.moneda === 'PYG') {
        jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(0));
      }
    }

    if (data['condicionTipoCambio'] == 2) {
      jsonResult['dTotOpeGs'] = jsonResult['dTotOpeItem'] * item['cambio'];
    }
    return jsonResult;
  }

  /**
   * E8.2. Campos que describen el IVA de la operación por ítem (E730-E739)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosItemsOperacionIVA(
    params: any,
    data: any,
    item: any,
    i: number,
    gCamItem: any,
    config: XmlgenConfig,
  ) {
    const jsonResult: any = {
      iAfecIVA: item['ivaTipo'], //E731
      dDesAfecIVA: constanteService.codigosAfectaciones.filter((ca) => ca.codigo === item['ivaTipo'])[0]['descripcion'],
      dPropIVA: item['ivaBase'], //E733
      dTasaIVA: item['iva'], //E734
    };

    /*  Calculo para E735
        Si E731 = 1 o 4 este campo es igual al resultado del cálculo 
            [EA008 * (E733/100)] / 1,1 si la tasa es del 10% 
            [EA008 * (E733/100)] / 1,05 si la tasa es del 5%
        Si E731 = 2 o 3 este campo es igual 0
    */
    jsonResult['dBasGravIVA'] = 0;
    if (item['ivaTipo'] == 1 || item['ivaTipo'] == 4) {
      if (item['iva'] == 10) {
        jsonResult['dBasGravIVA'] =
          (gCamItem['gValorItem']['gValorRestaItem']['dTotOpeItem'] * (item['ivaBase'] / 100)) / 1.1;
      }
      if (item['iva'] == 5) {
        jsonResult['dBasGravIVA'] =
          (gCamItem['gValorItem']['gValorRestaItem']['dTotOpeItem'] * (item['ivaBase'] / 100)) / 1.05;
      }

      //Redondeo inicial a 2 decimales
      if (jsonResult['dBasGravIVA']) {
        //jsonResult['dBasGravIVA'] = parseFloat(jsonResult['dBasGravIVA'].toFixed(config.decimals));
        jsonResult['dBasGravIVA'] = parseFloat(jsonResult['dBasGravIVA'].toFixed(8)); //Calculo intermedio, usa max decimales de la SET.
        if (data.moneda === 'PYG') {
          jsonResult['dBasGravIVA'] = parseFloat(jsonResult['dBasGravIVA'].toFixed(0));
        }
      }
    }

    /*  Calculo para E736
      Corresponde al cálculo aritmético:
      E735 * ( E734 / 100 )
      Si E731 = 2 o 3 este campo es igual 0 
    */
    jsonResult['dLiqIVAItem'] = 0;
    if (item['ivaTipo'] == 1 || item['ivaTipo'] == 4) {
      jsonResult['dLiqIVAItem'] = (jsonResult['dBasGravIVA'] * item['iva']) / 100;

      //Redondeo
      jsonResult['dLiqIVAItem'] = parseFloat(jsonResult['dLiqIVAItem'].toFixed(config.taxDecimals));
      if (data.moneda === 'PYG') {
        jsonResult['dLiqIVAItem'] = parseFloat(jsonResult['dLiqIVAItem'].toFixed(0));
      }
    }

    return jsonResult;
  }

  /**
   * E8.4. Grupo de rastreo de la mercadería (E750-E760)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosItemsOperacionRastreoMercaderias(params: any, data: any, item: any, i: number) {
    const jsonResult: any = {};

    if (item['lote']) {
      jsonResult['dNumLote'] = item['lote'];
    }
    if (item['vencimiento']) {
      jsonResult['dVencMerc'] = item['vencimiento'];
    }
    if (item['numeroSerie']) {
      jsonResult['dNSerie'] = item['numeroSerie'];
    }
    if (item['numeroPedido']) {
      jsonResult['dNumPedi'] = item['numeroPedido'];
    }
    if (item['numeroSeguimiento']) {
      jsonResult['dNumSegui'] = item['numeroSeguimiento'];
    }
    if (item['importador'] && item['importador']['nombre']) {
      //nt009 se retira estos campo
      //jsonResult['dNomImp'] = item['importador']['nombre'].substring(0, 60);
      //jsonResult['dDirImp'] = item['importador']['direccion'].substring(0, 255);
      //jsonResult['dNumFir'] = item['importador']['registroImportador'].substring(0, 20);
      //nt009 se retira estos campo
    }

    if (item['registroSenave']) {
      jsonResult['dNumReg'] = item['registroSenave'];
    }

    if (item['registroEntidadComercial']) {
      jsonResult['dNumRegEntCom'] = item['registroEntidadComercial'];
    }

    if (item['nombreProducto']) {
      jsonResult['dNomPro'] = item['nombreProducto']; //E761
    }

    return jsonResult;
  }

  /**
   * E8.5. Sector de automotores nuevos y usados (E770-E789)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosItemsOperacionSectorAutomotores(params: any, data: any, item: any, i: number) {
    if (!item['sectorAutomotor']) {
      //Como no indica que este campo es obligatorio, si no se informa sale con vacio
      return null;
    }

    /*if (
      constanteService.tiposOperacionesVehiculos.filter((um) => um.codigo === item['sectorAutomotor']['tipo']).length ==
      0
    ) {
      throw new Error(
        "Tipo de Operación de Venta de Automotor '" +
          item['sectorAutomotor']['tipo'] +
          "' en data.items[" +
          i +
          '].sectorAutomotor.tipo no encontrado. Valores: ' +
          constanteService.tiposOperacionesVehiculos.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    if (
      constanteService.tiposCombustibles.filter((um) => um.codigo === item['sectorAutomotor']['tipoCombustible'])
        .length == 0
    ) {
      throw new Error(
        "Tipo de Combustible '" +
          item['sectorAutomotor']['tipoCombustible'] +
          "' en data.items[" +
          i +
          '].sectorAutomotor.tipoCombustible no encontrado. Valores: ' +
          constanteService.tiposCombustibles.map((a) => a.codigo + '-' + a.descripcion),
      );
    }*/

    /*if (item['sectorAutomotor']['chasis']) {
      if (item['sectorAutomotor']['chasis'].length != 17) {
        throw new Error(
          "El Chasis '" + item['sectorAutomotor']['chasis'] + "' en data.items[" + i + '] debe tener 17 caracteres',
        );
      }
    }*/

    /*if (item['sectorAutomotor']['cilindradas']) {
      if ((item['sectorAutomotor']['cilindradas'] + '').length != 4) {
        throw new Error(
          "La Cilindradas '" +
            item['sectorAutomotor']['cilindradas'] +
            "' en data.items[" +
            i +
            '] debe tener 4 caracteres',
        );
      }
    }*/

    const jsonResult: any = {
      iTipOpVN: item['sectorAutomotor']['tipo'],
      dDesTipOpVN: constanteService.tiposOperacionesVehiculos.filter(
        (ov) => ov.codigo === item['sectorAutomotor']['tipo'],
      )[0]['descripcion'],
      dChasis: item['sectorAutomotor']['chasis'],
      dColor: item['sectorAutomotor']['color'],
      dPotencia: item['sectorAutomotor']['potencia'],
      dCapMot: item['sectorAutomotor']['capacidadMotor'],
      dPNet: item['sectorAutomotor']['pesoNeto'],
      dPBruto: item['sectorAutomotor']['pesoBruto'],
      iTipCom: item['sectorAutomotor']['tipoCombustible'],
      dDesTipCom: constanteService.tiposCombustibles.filter(
        (tc) => tc.codigo === item['sectorAutomotor']['tipoCombustible'],
      )[0]['descripcion'],
      dNroMotor: item['sectorAutomotor']['numeroMotor'],
      dCapTracc: item['sectorAutomotor']['capacidadTraccion'],
      dAnoFab: item['sectorAutomotor']['año'],
      cTipVeh: item['sectorAutomotor']['tipoVehiculo'],
      dCapac: item['sectorAutomotor']['capacidadPasajeros'],
      //dCilin: item['sectorAutomotor']['cilindradas'],
    };

    if (item['sectorAutomotor']['cilindradas']) {
      jsonResult['dCilin'] = item['sectorAutomotor']['cilindradas'] + '';
    }

    //Se puede hacer todo por if, para no enviar null
    return jsonResult;
  }
}

export default new JSonDteItemService();
