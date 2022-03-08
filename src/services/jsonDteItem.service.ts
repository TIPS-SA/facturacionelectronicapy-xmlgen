import stringUtilService from './StringUtil.service';
import constanteService from './Constante.service';

class JSonDteItemService {
  /**
   * E8. Campos que describen los ítems de la operación (E700-E899)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosItemsOperacion(params: any, data: any, defaultValues?: boolean) {
    const jsonResult: any = [];

    //Recorrer array de infoCuotas e informar en el JSON
    if (data['items'] && data['items'].length > 0) {
      for (let i = 0; i < data['items'].length; i++) {
        const item = data['items'][i];

        //Valores por defecto para el Detalle
        let unidadMedida: number = item['unidadMedida'];
        if (!unidadMedida && defaultValues === true) {
          unidadMedida = 77;
        }
        //Validaciones
        if (constanteService.unidadesMedidas.filter((um) => um.codigo === unidadMedida).length == 0) {
          throw new Error(
            "Unidad de Medida '" +
              unidadMedida +
              "' en data.items[" +
              i +
              '].unidadMedida no encontrado. Valores: ' +
              constanteService.unidadesMedidas.map((a) => a.codigo + '-' + a.descripcion.trim()),
          );
        }
        if (data['tipoDocumento'] === 7) {
          if (!item['tolerancia']) {
            throw new Error(
              'La Tolerancia es obligatoria para el Tipo de Documento = 7 en data.items[' + i + '].tolerancia',
            );
          }
          if (constanteService.relevanciasMercaderias.filter((um) => um.codigo === item['tolerancia']).length == 0) {
            throw new Error(
              "Tolerancia de Mercaderia '" +
                item['tolerancia'] +
                "' en data.items[" +
                i +
                '].tolerancia no encontrado. Valores: ' +
                constanteService.relevanciasMercaderias.map((a) => a.codigo + '-' + a.descripcion),
            );
          }
        }

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

        if (!item['descripcion']) {
          throw new Error('La descripción del item en data.items[' + i + '].descripcion no puede ser null');
        }

        if (!(item['descripcion'].length >= 1 && item['descripcion'].length <= 120)) {
          throw new Error(
            'La descripción del item (' +
              item['descripcion'] +
              ') en data.items[' +
              i +
              '].descripcion debe tener una longitud de 1 a 120 caracteres',
          );
        }

        //.replaceAll("<[^>]*>", " ")
        let regexp = new RegExp('<[^>]*>'); //HTML/XML TAGS
        if (regexp.test(item['descripcion'])) {
          throw new Error(
            'La descripción del item (' +
              item['descripcion'] +
              ') en data.items[' +
              i +
              '].descripcion contiene valores inválidos',
          );
        }

        gCamItem['dDesProSer'] = item['descripcion']; // RG 24/2019

        gCamItem['cUniMed'] = unidadMedida;
        gCamItem['dDesUniMed'] = constanteService.unidadesMedidas
          .filter((um) => um.codigo === unidadMedida)[0]
          ['representacion'].trim();

        if (+item['cantidad'] <= 0) {
          throw new Error('La cantidad del item en data.items[' + i + '].cantidad debe ser mayor a cero');
        }
        gCamItem['dCantProSer'] = item['cantidad'];

        if (item['pais']) {
          if (constanteService.paises.filter((pais: any) => pais.codigo === item['pais']).length == 0) {
            throw new Error(
              "Pais '" +
                item['pais'] +
                "' del Producto en data.items[" +
                i +
                '].pais no encontrado. Valores: ' +
                constanteService.paises.map((a: any) => a.codigo + '-' + a.descripcion),
            );
          }

          gCamItem['cPaisOrig'] = item['pais'];
          gCamItem['dDesPaisOrig'] = constanteService.paises.filter((pais) => pais.codigo === item['pais'])[0][
            'descripcion'
          ];
        }

        if (item['observacion']) {
          if (!(item['observacion'].length >= 1 && item['observacion'].length <= 500)) {
            throw new Error(
              'La observación del item (' +
                item['observacion'] +
                ') en data.items[' +
                i +
                '].observacion debe tener una longitud de 1 a 500 caracteres',
            );
          }
          if (regexp.test(item['observacion'])) {
            throw new Error(
              'La observación del item (' +
                item['observacion'] +
                ') en data.items[' +
                i +
                '].observacion contiene valores inválidos',
            );
          }
          gCamItem['dInfItem'] = item['observacion'];
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
            } else {
              throw new Error('Debe informar data.items*.cdcAnticipo');
            }
          }
        }

        if (data['tipoDocumento'] != 7) {
          //Oblitatorio informar
          gCamItem['gValorItem'] = this.generateDatosItemsOperacionPrecioTipoCambioTotal(params, data, item, i);
        }

        if (
          data['tipoImpuesto'] == 1 ||
          data['tipoImpuesto'] == 3 ||
          data['tipoImpuesto'] == 4 ||
          data['tipoImpuesto'] == 5
        ) {
          if (data['tipoDocumento'] != 4 && data['tipoDocumento'] != 7) {
            gCamItem['gCamIVA'] = this.generateDatosItemsOperacionIVA(params, data, item, i, { ...gCamItem });
          }
        }

        //Rastreo
        if (
          item['lote'] ||
          item['vencimiento'] ||
          item['numeroSerie'] ||
          item['numeroPedido'] ||
          item['numeroSeguimiento']
        ) {
          gCamItem['gRasMerc'] = this.generateDatosItemsOperacionRastreoMercaderias(params, data, item, i);
        }

        //Automotores
        if (item['sectorAutomotor'] && item['sectorAutomotor']['tipo']) {
          gCamItem['gVehNuevo'] = this.generateDatosItemsOperacionSectorAutomotores(params, data, item, i);
        }

        jsonResult.push(gCamItem);
      } //end-for
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
  private generateDatosItemsOperacionPrecioTipoCambioTotal(params: any, data: any, item: any, i: number) {
    const jsonResult: any = {
      dPUniProSer: item['precioUnitario'],
      //dTiCamIt : data['condicionTipoCambio'] == 2 ? item['cambio'] : null,    //E725
      //dTotBruOpeItem: parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']),
    };


    jsonResult['dTotBruOpeItem'] = parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']);
    jsonResult['dTotBruOpeItem'] = parseFloat(jsonResult['dTotBruOpeItem'].toFixed(2));
    if (data.moneda === 'PYG') {
      jsonResult['dTotBruOpeItem'] = parseFloat(jsonResult['dTotBruOpeItem'].toFixed(0));
    }

    if (data['condicionTipoCambio'] && data['condicionTipoCambio'] == 2) {
      jsonResult['dTiCamIt'] = item['cambio'];
    }
    jsonResult['gValorRestaItem'] = this.generateDatosItemsOperacionDescuentoAnticipoValorTotal(params, data, item, i);

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
  private generateDatosItemsOperacionDescuentoAnticipoValorTotal(params: any, data: any, item: any, i: number) {
    const jsonResult: any = {};

    jsonResult['dDescItem'] = 0;
    if (item['descuento'] && +item['descuento'] > 0) {
      //Validar que si el descuento es mayor al precio
      if (+item['descuento'] > +item['precioUnitario']) {
        throw new Error(
          "Descuento '" +
            item['descuento'] +
            "' del Producto en data.items[" +
            i +
            "].descuento supera al Precio Unitario '" +
            item['precioUnitario'],
        );
      }

      if (+item['descuento'] == +item['precioUnitario']) {
        //Validar IVA
        //Quiere decir que no va a ir nada en exenta, gravada5 y gravada10, para este item.
        if (item['ivaTipo'] != 3) {
          throw new Error(
            'Descuento igual a Precio Unitario corresponde tener Tipo de Iva = 3-Exento en data.items[' +
              i +
              '].ivaTipo',
          );

          //console.log("=================>>>>>>>>>>>>>>>>>>>>>>>> se asigna iva tipo = 3 tres");
          /*item['ivaTipo'] = 3;  //Exenta
          item['ivaBase'] = 0;
          item['iva'] = 0;*/
        }
      }

      jsonResult['dDescItem'] = item['descuento'];

      /*  if ( ! (item['descuentoPorcentaje'] && item['descuentoPorcentaje'] > 0) ) {
        throw new Error("Debe proveer el Porcentaje de Descuento del Item en data.item[" + i + "].descuentoPorcentaje");
      }*/

      //Calcula solo el % Descuento
      jsonResult['dPorcDesIt'] = Math.round((parseFloat(item['descuento']) * 100) / parseFloat(item['precioUnitario']));
    }

    /*jsonResult['dPorcDesIt'] = 0;
    if (item['descuentoPorcentaje'] && item['descuentoPorcentaje'] > 0) {
      jsonResult['dPorcDesIt'] = item['descuentoPorcentaje'];
    }*/

    jsonResult['dAntPreUniIt'] = 0;
    if (item['anticipo'] && item['anticipo'] > 0) {
      jsonResult['dAntPreUniIt'] = item['anticipo'];
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

      jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(2));
      if (data.moneda === 'PYG') {
        jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(0));
      }

    }
    if (data['tipoDocumento'] == 4) {
      //Si es Autofactura
      jsonResult['dTotOpeItem'] = parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']);

      jsonResult['dTotOpeItem'] = parseFloat(jsonResult['dTotOpeItem'].toFixed(2));
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
  private generateDatosItemsOperacionIVA(params: any, data: any, item: any, i: number, gCamItem: any) {
    if (constanteService.codigosAfectaciones.filter((um) => um.codigo === item['ivaTipo']).length == 0) {
      throw new Error(
        "Tipo de IVA '" +
          item['ivaTipo'] +
          "' en data.items[" +
          i +
          '].ivaTipo no encontrado. Valores: ' +
          constanteService.codigosAfectaciones.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    const jsonResult: any = {
      iAfecIVA: item['ivaTipo'], //E731
      dDesAfecIVA: constanteService.codigosAfectaciones.filter((ca) => ca.codigo === item['ivaTipo'])[0]['descripcion'],
      dPropIVA: item['ivaBase'], //E733
      dTasaIVA: item['iva'], //E734
      //dBasGravIVA : 0,            //E735 Sera sobreescrito
      //dLiqIVAItem : 0             //E736 Sera sobreescrito
    };

    if (item['ivaTipo'] == 1) {
      if (item['ivaBase'] != 100) {
        throw new Error(
          'Valor de "ivaBase"=' +
            item['ivaBase'] +
            ' debe ser igual a 100 para "ivaTipo" = 1 en data.items[' +
            i +
            '].ivaBase',
        );
      }
    }
    if (item['ivaTipo'] == 3) {
      //Exento
      if (item['ivaBase'] != 0) {
        throw new Error(
          'Valor de "ivaBase"=' +
            item['ivaBase'] +
            ' debe ser igual a 0 para "ivaTipo" = 3 en data.items[' +
            i +
            '].ivaBase',
        );
      }

      if (item['iva'] != 0) {
        throw new Error(
          'Valor de "iva"=' + item['iva'] + ' debe ser igual a 0 para "ivaTipo" = 3 en data.items[' + i + '].iva',
        );
      }
    }

    if (item['iva'] == 0) {
      if (item['ivaTipo'] != 2 && item['ivaTipo'] != 3) {
        throw new Error(
          '"Iva" = 0 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva',
        );
      }
    }
    if (item['iva'] == 5) {
      if (item['ivaTipo'] != 1 && item['ivaTipo'] != 4) {
        throw new Error(
          '"Iva" = 5 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva',
        );
      }
    }
    if (item['iva'] == 10) {
      if (item['ivaTipo'] != 1 && item['ivaTipo'] != 4) {
        throw new Error(
          '"Iva" = 10 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva',
        );
      }
    }

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
        jsonResult['dBasGravIVA'] = parseFloat(jsonResult['dBasGravIVA'].toFixed(2));
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
      jsonResult['dLiqIVAItem'] = parseFloat(jsonResult['dLiqIVAItem'].toFixed(2));
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
    const jsonResult: any = {
      //dNumLote: item['lote'],
      //dVencMerc : item['vencimiento'],
      //dNSerie : item['numeroSerie'],
      /*dNumPedi : item['numeroPedido'],    
            dNumSegui : item['numeroSeguimiento'], 
            dNomImp : item['importador']['nombre'], 
            dDirImp : item['importador']['direccion'],    
            dNumFir : item['importador']['registroImportador'],    
            dNumReg : item['importador']['registroSenave'],    
            dNumRegEntCom : item['importador']['registroEntidadComercial']*/
    };

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
      jsonResult['dNomImp'] = item['importador']['nombre'].substring(0, 60);
      jsonResult['dDirImp'] = item['importador']['direccion'].substring(0, 255);
      jsonResult['dNumFir'] = item['importador']['registroImportador'].substring(0, 20);
      jsonResult['dNumReg'] = item['importador']['registroSenave'].substring(0, 20);
      jsonResult['dNumRegEntCom'] = item['importador']['registroEntidadComercial'].substring(0, 20);
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

    if (
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
    }

    if (item['sectorAutomotor']['chasis']) {
      if (item['sectorAutomotor']['chasis'].length != 17) {
        throw new Error(
          "El Chasis '" + item['sectorAutomotor']['chasis'] + "' en data.items[" + i + '] debe tener 17 caracteres',
        );
      }
    }

    if (item['sectorAutomotor']['cilindradas']) {
      if ((item['sectorAutomotor']['cilindradas'] + '').length != 4) {
        throw new Error(
          "La Cilindradas '" +
            item['sectorAutomotor']['cilindradas'] +
            "' en data.items[" +
            i +
            '] debe tener 4 caracteres',
        );
      }
    }

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
