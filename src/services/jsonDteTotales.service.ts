class JSonDteTotalesService {
  /**
   * F. Campos que describen los subtotales y totales de la transacción documentada (F001-F099)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosTotales(params: any, data: any, items: any[], defaultValues?: boolean) {
    let moneda = data['moneda'];
    if (!moneda && defaultValues === true) {
      moneda = 'PYG';
    }

    let dSubExe = 0,
      dSubExo = 0,
      dSub5 = 0,
      dSub10 = 0,
      dTotOpe = 0,
      dTotDesc = 0,
      dTotDescGlotem = 0,
      dTotAntItem = 0,
      dTotAnt = 0,
      dDescTotal = 0,
      dAnticipo = 0,
      dTotOpeGs = 0,
      dIVA5 = 0,
      dIVA10 = 0,
      dLiqTotIVA5 = 0,
      dLiqTotIVA10 = 0,
      dBaseGrav5 = 0,
      dBaseGrav10 = 0;

    let agregarDSub = false;
    //Crear las variables
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item['gCamIVA']) {
        //gCamIVA puede ser null (MT150=No informar si D013=2 y C002= 4 o 7)

        //Subtotal
        if (item['gCamIVA']['iAfecIVA'] == 3) {
          //E731==3
          dSubExe += item['gValorItem']['gValorRestaItem']['dTotOpeItem']; //Suma de EA008
        }
        //Exenta
        if (item['gCamIVA']['iAfecIVA'] == 2) {
          //E731==2
          dSubExo += item['gValorItem']['gValorRestaItem']['dTotOpeItem']; //Suma de EA008
        }
        //Gravadas 5 o 10
        if (item['gCamIVA']['iAfecIVA'] == 1 || item['gCamIVA']['iAfecIVA'] == 4) {
          if (!(data['tipoImpuesto'] != 1)) {
            //No debe existir si D013 != 1
            if (item['gCamIVA']['dTasaIVA'] == 5) {
              //E734
              dSub5 += item['gValorItem']['gValorRestaItem']['dTotOpeItem'];
            }
            if (item['gCamIVA']['dTasaIVA'] == 10) {
              dSub10 += item['gValorItem']['gValorRestaItem']['dTotOpeItem'];
            }
            agregarDSub = true;
          }
        }
        //---
        if (!(data['tipoImpuesto'] != 1 && data['tipoImpuesto'] != 5)) {
          //No debe existir si D013 != 1 o D013 != 5
          if (item['gCamIVA']['dTasaIVA'] == 5) {
            //E734
            dIVA5 += item['gCamIVA']['dLiqIVAItem'];
            //dLiqTotIVA5 = 0;    //se hace mas adelante, despues de obtener el redondeo
            dBaseGrav5 += item['gCamIVA']['dBasGravIVA'];
          }
          if (item['gCamIVA']['dTasaIVA'] == 10) {
            dIVA10 += item['gCamIVA']['dLiqIVAItem'];
            //dLiqTotIVA10 = 0;   //se hace mas adelante, despues de obtener el redondeo
            dBaseGrav10 += item['gCamIVA']['dBasGravIVA'];
          }
        }
      }
      //---
      if (data['tipoDocumento'] == 4) {
        dTotOpe += item['gValorItem']['gValorRestaItem']['dTotOpeItem'];
      }
      dTotDesc += (item['gValorItem']['gValorRestaItem']['dDescItem'] || 0) * item['dCantProSer'];
      dTotDescGlotem += item.gValorItem?.gValorRestaItem?.dDescGloItem || 0;
      dTotAntItem += item['gValorItem']['gValorRestaItem']['dAntPreUniIt'] || 0;
      dTotAnt += (item['gValorItem']['gValorRestaItem']['dAntGloPreUniIt'] || 0) * item['dCantProSer'];
      dDescTotal +=
        (item['gValorItem']['gValorRestaItem']['dDescItem'] || 0) * item['dCantProSer'] +
        (item['gValorItem']['gValorRestaItem']['dTotDescGlotem'] || 0);
      dAnticipo +=
        (item['gValorItem']['gValorRestaItem']['dTotAntItem'] || 0) * item['dCantProSer'] +
        (item['gValorItem']['gValorRestaItem']['dTotAnt'] || 0);
      dTotOpeGs += item['gValorItem']['gValorRestaItem']['dTotOpeGs']; //Suma del monto total en Gs.
    } //end-for

    if (
      data['tipoImpuesto'] == 1 ||
      data['tipoImpuesto'] == 3 ||
      data['tipoImpuesto'] == 4 ||
      data['tipoImpuesto'] == 5
    ) {
      if (data['tipoDocumento'] != 4) {
        dTotOpe = dSubExe + dSubExo + dSub5 + dSub10; // Suma (F002, F003, F004 y F005)
      }
    }
    const dRedon = this.redondeo(dTotOpe);
    const montoRedondeado = dTotOpe - dRedon;

    if (!(data['tipoImpuesto'] != 1 && data['tipoImpuesto'] != 5)) {
      //No debe existir si D013 != 1 o D013 != 5
      if (dIVA5 > 0) {
        dLiqTotIVA5 = (dIVA5 - this.redondeo(dIVA5)) / 1.05; //Consultar
        dLiqTotIVA5 = Math.round(dLiqTotIVA5);
      }

      if (dIVA10 > 0) {
        dLiqTotIVA10 = (dIVA10 - this.redondeo(dIVA10)) / 1.1;
        dLiqTotIVA10 = Math.round(dLiqTotIVA10);
      }
    }

    let comisionLiquid = ((data['comision'] || 0) * 10) / 100;

    //---
    //Corresponde al cálculo aritmético F008 - F013 + F025 
    //Si C002 = 1, 5 o 6, entonces dTotGralOpe(F014) = F008 - F011 - F012 - F013
    let dTotGralOpe = dTotOpe - dDescTotal + (data['comision'] || 0);
    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6) {
      dTotGralOpe = dTotOpe - dDescTotal - dAnticipo - dRedon;
    }
    //---

    //Asignar al JSON DATA
    let jsonResult: any = {
      dSubExe: dSubExe,
      dSubExo: dSubExo,
    };

    if (agregarDSub) {
      if (!(data['tipoImpuesto'] != 1)) {
        //No debe existir si D013 != 1        if (dSub5 > 0) {
        jsonResult['dSub5'] = dSub5;
      }
      if (dSub10 > 0) {
        jsonResult['dSub10'] = dSub10;
      }
    }

    jsonResult = Object.assign(jsonResult, {
      dTotOpe: dTotOpe, //F008
      dTotDesc: dTotDesc,
      dTotDescGlotem: dTotDescGlotem,
      dTotAntItem: dTotAntItem,
      dTotAnt: dTotAnt,
      dPorcDescTotal: 0.0, //TODO, ver de donde sale
      dDescTotal: dDescTotal,
      dAnticipo: dAnticipo,
      dRedon: dRedon, //F013
    });

    if (data['comision'] > 0) {
      jsonResult['dComi'] = data['comision'];
    }

    jsonResult = Object.assign(jsonResult, {
      dTotGralOpe: dTotGralOpe, //F014
    });

    //Redondeo
    dIVA5 = parseFloat(dIVA5.toFixed(2));
    dIVA10 = parseFloat(dIVA10.toFixed(2));
    dLiqTotIVA5 = parseFloat(dLiqTotIVA5.toFixed(2));
    dLiqTotIVA10 = parseFloat(dLiqTotIVA10.toFixed(2));

    if (data.moneda === 'PYG') {
      dIVA5 = parseFloat(dIVA5.toFixed(0));
      dIVA10 = parseFloat(dIVA10.toFixed(0));
      dLiqTotIVA5 = parseFloat(dLiqTotIVA5.toFixed(0));
      dLiqTotIVA10 = parseFloat(dLiqTotIVA10.toFixed(0));
    }

    if (agregarDSub) {
      jsonResult['dIVA5'] = dIVA5;
      jsonResult['dIVA10'] = dIVA10;
      jsonResult['dLiqTotIVA5'] = dLiqTotIVA5;
      jsonResult['dLiqTotIVA10'] = dLiqTotIVA10;
    }

    if (comisionLiquid > 0) {
      jsonResult = Object.assign(jsonResult, {
        dIVAComi: comisionLiquid,
      });
    }

    if (agregarDSub) {
      if (dIVA5 > 0 || dIVA10 > 0 || dLiqTotIVA5 > 0 || dLiqTotIVA10 > 0 || comisionLiquid > 0) {
        jsonResult['dTotIVA'] = dIVA5 + dIVA10 - dLiqTotIVA5 - dLiqTotIVA10 + comisionLiquid;

        //Redondeo

        jsonResult['dTotIVA'] = parseFloat(jsonResult['dTotIVA'].toFixed(2));
        if (data.moneda === 'PYG') {
          jsonResult['dTotIVA'] = parseFloat(jsonResult['dTotIVA'].toFixed(0));
        }
      }
      if (dBaseGrav5 > 0) {
        dBaseGrav5 = parseFloat(dBaseGrav5.toFixed(2));
        if (data.moneda === 'PYG') {
          dBaseGrav5 = parseFloat(dBaseGrav5.toFixed(0));
        }

        jsonResult['dBaseGrav5'] = dBaseGrav5;
      }
      if (dBaseGrav10 > 0) {
        dBaseGrav10 = parseFloat(dBaseGrav10.toFixed(2));
        if (data.moneda === 'PYG') {
          dBaseGrav10 = parseFloat(dBaseGrav10.toFixed(0));
        }

        jsonResult['dBaseGrav10'] = dBaseGrav10;
      }
      if (dBaseGrav5 > 0 || dBaseGrav10 > 0) {
        jsonResult['dTBasGraIVA'] = (dBaseGrav5 > 0 ? dBaseGrav5 : 0) + (dBaseGrav10 > 0 ? dBaseGrav10 : 0);
      }
    }
    if (moneda != 'PYG' && data['condicionTipoCambio'] == 1) {
      //Por el Global
      jsonResult['dTotalGs'] = dTotGralOpe * data['cambio'];
    }
    if (moneda != 'PYG' && data['condicionTipoCambio'] == 2) {
      //Por item
      jsonResult['dTotalGs'] = dTotOpeGs;
    }
    if (moneda != 'PYG') {
      if (data['tipoDocumento'] == 4) {
        jsonResult['dTotalGs'] = dTotGralOpe;
      }
    }
    return jsonResult;
  }

  /**
   * En consideración a la Resolución 347 del 2014 (Secretaría de Defensa del Consumidor-
   * SEDECO). Las reglas de redondeo aplican a múltiplos de 50 guaraníes
   *
   * Obtiene solo la parte del valor de redondeo, para obtener el monto del reondeo hay
   * que restar el valor de éste calculo
   *
   * @param numero
   * @returns
   */
  public redondeo(numero: any) {
    let parteDecimal: number = parseFloat((numero / 100).toFixed(2));
    let parteEntera: number = (numero / 100.0) | 0;
    let resta: any = parteDecimal - parteEntera;
    let aComparar: any = resta.toFixed(2) * 100;
    if (aComparar == 50) {
      return 0;
    } else if (aComparar > 50) {
      var diferencia = aComparar - 50;
      return diferencia;
    } else {
      //Redondear a 000
      var diferencia = 50 - (50 - aComparar);
      return diferencia;
    }
  }
}

export default new JSonDteTotalesService();
