class JSonDteTotalesService {
        
    /**
     * F. Campos que describen los subtotales y totales de la transacción documentada (F001-F099)
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    public generateDatosTotales(params: any, data: any, items : any[]) {

        let dSubExe = 0, dSubExo = 0, dSub5 = 0, dSub10 = 0, dTotOpe = 0, dTotDesc = 0, dTotDescGlotem = 0,
            dTotAntItem = 0, dTotAnt = 0, dDescTotal = 0, dAnticipo = 0, dTotOpeGs = 0,
            dIVA5 = 0, dIVA10 = 0, dLiqTotIVA5 = 0, dLiqTotIVA10  = 0,
            dBaseGrav5 = 0, dBaseGrav10 = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item['iAfecIVA'] == 3) {    //E731==3
                dSubExe += item['dTotOpeItem']; //Suma de EA008
            }
            if (item['iAfecIVA'] == 2) {    //E731==2
                dSubExo += item['dTotOpeItem']; //Suma de EA008
            }
            if (item['iAfecIVA'] == 1 || item['iAfecIVA'] == 4) {
                if (item['gCamIVA']['dTasaIVA'] == 5) { //E734
                    dSub5 += item['gCamIVA']['dTotOpeItem']; 
                    dIVA5 += item['gCamIVA']['dLiqIVAItem'];
                    //dLiqTotIVA5 = 0;    //TODO COMO
                    dBaseGrav5 += item['gCamIVA']['dBasGravIVA'];
                }
            }
            if (item['iAfecIVA'] == 1 || item['iAfecIVA'] == 4) {   
                if (item['gCamIVA']['dTasaIVA'] == 10) {
                    dSub10 += item['gCamIVA']['dTotOpeItem']; 
                    dIVA10 += item['gCamIVA']['dLiqIVAItem'];
                    //dLiqTotIVA10 = 0;   //TODO COMO
                    dBaseGrav10 += item['gCamIVA']['dBasGravIVA']
                }
            }
            if (data['tipoDocumento'] == 4) {
                dTotOpe = item['dTotOpeItem'];
            }

            dTotDesc += item['dDescItem'] || 0;
            dTotDescGlotem += item['dDescGloItem'] || 0;
            dTotAntItem += item['dAntPreUniIt'] || 0;
            dTotAnt += item['dAntGloPreUniIt'] || 0;
            dDescTotal += (item['dDescItem'] || 0) + (item['dTotDescGlotem'] || 0);
            dAnticipo += (item['dTotAntItem'] || 0) + (item['dTotAnt'] || 0);
            dTotOpeGs += item['dTotOpeGs']; //Suma del monto total en Gs.
        }   //end-for

        if (data['tipoImpuesto'] == 1 || data['tipoImpuesto'] == 3 || data['tipoImpuesto'] == 4 || data['tipoImpuesto'] == 5) {
            if (data['tipoDocumento'] != 4) {
                dTotOpe = dSubExe + dSubExo + dSub5 + dSub10; // Suma (F002, F003, F004 y F005)
            }
        }
        const dRedon = this.redondeo(dTotOpe);
        const montoRedondeado = dTotOpe - dRedon;

        dLiqTotIVA5 = (dIVA5 - this.redondeo(dIVA5) ) / 1.05;   //Consultar
        dLiqTotIVA10 = (dIVA10 - this.redondeo(dIVA10) ) / 1.1;
        let comisionLiquid = (data['comision'] * 10) / 100;
        let dTotGralOpe = dTotOpe + dRedon + data['comision'];
        const jsonResult : any = {
            dSubExe : dSubExe, 
            dSubExo : dSubExo,
            dSub5 : data['tipoImpuesto'] != 1 ? null : dSub5,   //No si D013 != 1
            dSub10 : data['tipoImpuesto'] != 1 ? null : dSub10, //No si D013 != 1
            dTotOpe : dTotOpe,  //F008
            dTotDesc : dTotDesc,
            dTotDescGlotem : dTotDescGlotem,
            dTotAntItem : dTotAntItem,
            dTotAnt : dTotAnt,
            dPorcDescTotal : data['***'],   //TODO, ver de donde sale
            dDescTotal : dDescTotal,
            dAnticipo : dAnticipo,
            dRedon : dRedon,    //F013
            dComi : data['comision'], //F025 //TODO, ver de donde sale
            dTotGralOpe: dTotGralOpe,   //F014
            //dIVA5  : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dIVA5,  //No si D013 != 1 o !=5
            //dIVA10 : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dIVA10, //No si D013 != 1 o !=5
            //dLiqTotIVA5 : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dLiqTotIVA5,  //No si D013 != 1 o !=5
            //dLiqTotIVA10 : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dLiqTotIVA10,  //No si D013 != 1 o !=5
            dIVAComi : comisionLiquid,
            dTotIVA : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : (dIVA5 + dIVA10 - dLiqTotIVA5 - dLiqTotIVA10 + comisionLiquid),   //F017
            //dBaseGrav5 : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dBaseGrav5,
            //dBaseGrav10 : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : dBaseGrav10,
            //dTBasGraIVA : data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5 ? null : (dBaseGrav5 + dBaseGrav10),
            //dTotalGs : null //Sera sobreescrito
        };
        
        if (!(data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5)) {
            jsonResult['dIVA5'] = dIVA5;
            jsonResult['dLiqTotIVA5'] = dLiqTotIVA5;
            jsonResult['dBaseGrav5'] = dBaseGrav5;
        //}
        //if (!(data['tipoImpuesto'] != 1 || data['tipoImpuesto'] != 5)) {
            jsonResult['dIVA5'] = dIVA10;
            jsonResult['dLiqTotIVA10'] = dLiqTotIVA10;
            jsonResult['dBaseGrav10'] = dBaseGrav10;

            jsonResult['dTotIVA'] = (dIVA5 + dIVA10 - dLiqTotIVA5 - dLiqTotIVA10 + comisionLiquid);
            jsonResult['dTBasGraIVA'] = (dBaseGrav5 + dBaseGrav10);
        }
        

        if (data['moneda'] != 'PYG' && data['condicionTipoCambio'] == 1) {  //Por el Global
            jsonResult['dTotalGs'] = dTotGralOpe * data['cambio'];
        }
        if (data['moneda'] != 'PYG' && data['condicionTipoCambio'] == 2) {  //Por item
            jsonResult['dTotalGs'] = dTotOpeGs;
        }
        if (data['tipoDocumento'] == 4) {
            jsonResult['dTotalGs'] = dTotGralOpe;
        }       

        // Cuando C002= 4, no informar F002, F003, F004, F005, 
        // F015, F016, F017, F018, F019, F020, 
        // F023, F025 y F026
        if (data['tipoDocumento'] == 4) {
            jsonResult['dSubExe'] = jsonResult['dSubExo'] = jsonResult['dSub5'] = jsonResult['dSub10'] = null;
            jsonResult['dIVA5'] = jsonResult['dIVA10'] = jsonResult['dTotIVA'] = jsonResult['dBaseGrav5'] = jsonResult['dBaseGrav10'] = jsonResult['dTBasGraIVA'] = null;
            jsonResult['dTotalGs'] = jsonResult['dIVAComi'] = jsonResult['dIVAComi'] = null;
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
    public redondeo(numero : any){
        let parteDecimal : number = parseFloat((numero / 100).toFixed(2));
		let parteEntera : number = (numero / 100.0) | 0;
        let resta : any = parteDecimal - parteEntera;
		let aComparar : any = (resta).toFixed(2) * 100;
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
