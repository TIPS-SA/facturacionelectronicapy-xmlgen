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
    public generateDatosItemsOperacion(params: any, data: any) {
       const jsonResult : any = [];

        //Recorrer array de infoCuotas e informar en el JSON
        if (data['items'] && data['items'].length > 0) {
            for (let i = 0; i < data['items'].length; i++) {
                const item = data['items'][i];
                
                //Validaciones
                if (constanteService.unidadesMedidas.filter(um => um.codigo === item['unidadMedida']).length == 0){
                    throw new Error("Unidad de Medida '" + item['unidadMedida'] + "' en data.items[" + i + "].unidadMedida no encontrado. Valores: " + constanteService.unidadesMedidas.map(a=>a.codigo + '-' + a.descripcion));
                }
                if (data["tipoDocumento"] === 7) {
                    if (constanteService.relevanciasMercaderias.filter(um => um.codigo === item['tolerancia']).length == 0){
                        throw new Error("Tolerancia de Mercaderia '" + item['tolerancia'] + "' en data.items[" + i + "].tolerancia no encontrado. Valores: " + constanteService.relevanciasMercaderias.map(a=>a.codigo + '-' + a.descripcion));
                    }
                }

                const gCamItem : any = {
                    dCodInt : item['codigo'],
                    //dParAranc : item['partidaArancelaria'],
                    //dNCM : item['ncm'],
                    /*dDncpG : (data["cliente"]["tipoOperacion"] === 3) ? stringUtilService.leftZero(item['dncp']['codigoNivelGeneral'], 8) : null,
                    dDncpE : (data["cliente"]["tipoOperacion"] === 3) ? item['dncp']['codigoNivelEspecifico'] : null,
                    dGtin : (data["cliente"]["tipoOperacion"] === 3) ? item['dncp']['codigoGtinProducto'] : null,
                    dGtinPq : (data["cliente"]["tipoOperacion"] === 3) ? item['dncp']['codigoNivelPaquete'] : null,*/
                    //dDesProSer   : item['descripcion'], // RG 24/2019
                    //cUniMed : item['unidadMedida'],
                    //dDesUniMed : constanteService.unidadesMedidas.filter(um => um.codigo === item['unidadMedida'])[0]['representacion'].trim(),
                    //dCantProSer : item['cantidad'],
                    //cPaisOrig : item['pais'],
                    //dDesPaisOrig : item['paisDescripcion'],
//                    dInfItem : item['observacion'],
                    //cRelMerc : data["tipoDocumento"] === 7 ? item['tolerancia'] : null,
                    //dDesRelMerc : data["tipoDocumento"] === 7 ? constanteService.relevanciasMercaderias.filter(um => um.codigo === item['tolerancia'])[0]['descripcion'] : null,
                    //dCanQuiMer : item['toleranciaCantidad'],
                    //dPorQuiMer : item['toleranciaPorcentaje'],
                    //dCDCAnticipo : null //Sera sobreescrito
                };

                if (item['partidaArancelaria']) {
                    gCamItem['dParAranc'] = item['partidaArancelaria'];
                }
                
                if (item['ncm']) {
                    gCamItem['dNCM'] = item['ncm'];
                }
                
                if (data["cliente"]["tipoOperacion"] && data["cliente"]["tipoOperacion"] === 3) {
                    gCamItem['dDncpG'] = stringUtilService.leftZero(item['dncp']['codigoNivelGeneral'], 8);
                    gCamItem['dDncpE'] = item['dncp']['codigoNivelEspecifico'];
                    gCamItem['dGtin'] = item['dncp']['codigoGtinProducto'];
                    gCamItem['dGtinPq'] = item['dncp']['codigoNivelPaquete'];
                }

                gCamItem['dDesProSer'] = item['descripcion']; // RG 24/2019
                gCamItem['cUniMed'] = item['unidadMedida'];
                gCamItem['dDesUniMed'] = constanteService.unidadesMedidas.filter(um => um.codigo === item['unidadMedida'])[0]['representacion'].trim();

                gCamItem['dCantProSer'] = item['cantidad'];
                
                if (item['pais']) {
                    gCamItem['cPaisOrig'] = item['pais'];
                    gCamItem['dDesPaisOrig'] = item['paisDescripcion'];
                }
                
                if (item['observacion']) {
                    gCamItem['dInfItem'] = item['observacion'];
                }

                if (data["tipoDocumento"] === 7) {
                    if (item['tolerancia']) {
                        gCamItem['cRelMerc'] = item['tolerancia'];
                        gCamItem['dDesRelMerc'] = constanteService.relevanciasMercaderias.filter(um => um.codigo === item['tolerancia'])[0]['descripcion'];
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
                            throw new Error("Debe informar data.items*.cdcAnticipo");
                        }
                    }
                }

                if (data['tipoDocumento'] != 7) {
                    //Oblitatorio informar
                    gCamItem['gValorItem'] = this.generateDatosItemsOperacionPrecioTipoCambioTotal(params, data, item);
                }

                if (data['tipoImpuesto'] == 1 || data['tipoImpuesto'] == 3 || data['tipoImpuesto'] == 4 || data['tipoImpuesto'] == 5) {
                    if (data['tipoDocumento'] != 4 && data['tipoDocumento'] != 7) {
                        gCamItem['gCamIVA'] = this.generateDatosItemsOperacionIVA(params, data, item, i, {...gCamItem});
                    }
                }

                //Rastreo
                if (item['lote'] || item['vencimiento'] || item['numeroSerie'] || item['numeroPedido'] || item['numeroSeguimiento']) {
                    gCamItem['gRasMerc'] = this.generateDatosItemsOperacionRastreoMercaderias(params, data, item, i);
                }

                
                //Automotores
                if (item['sectorAutomotor'] && item['sectorAutomotor']['tipo']) {
                    gCamItem['gVehNuevo'] = this.generateDatosItemsOperacionSectorAutomotores(params, data, item, i);
                }

                jsonResult.push(gCamItem);
            }   //end-for
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
    private generateDatosItemsOperacionPrecioTipoCambioTotal(params: any, data: any, item : any) {
        const jsonResult : any = {
            dPUniProSer: item['precioUnitario'],
            //dTiCamIt : data['condicionTipoCambio'] == 2 ? item['cambio'] : null,    //E725
            dTotBruOpeItem : parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']),
        };
        if (data['condicionTipoCambio'] && data['condicionTipoCambio'] == 2) {
            jsonResult['dTiCamIt'] = item['cambio'];
        }          
        jsonResult['gValorRestaItem'] = this.generateDatosItemsOperacionDescuentoAnticipoValorTotal(params, data, item);

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
     private generateDatosItemsOperacionDescuentoAnticipoValorTotal(params: any, data: any, item : any) {
        const jsonResult : any = {
            dDescItem: item['descuento'],
            dPorcDesIt : item['descuentoPorcentaje'],
            //dDescGloItem : item['**'],  //TODO este debe ser calculado de acuerdo al descuento global
            dAntPreUniIt: item['anticipo'], //Valor del anticipo del item ya emitido en una FE anterior. tipoOperacion=9 Anticipo
            //dAntGloPreUniIt: item['**'],  //TODO este debe ser calculado de acuerdo al anticipo global
            //dTotOpeItem : null, //EA008  sera sobreescrito de acuerdo al calculo
            //dTotOpeGs : null    //EA009  sera sobreescrito.
        };

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
       
        if (data['tipoImpuesto'] == 1 || data['tipoImpuesto'] == 3 || data['tipoImpuesto'] == 4 || data['tipoImpuesto'] == 5) {
            const valores = (parseFloat(item['precioUnitario']) - 
                            parseFloat(jsonResult['dDescItem'] || 0) - 
                            parseFloat(jsonResult['dDescGloItem'] || 0) - 
                            parseFloat(jsonResult['dAntPreUniIt'] || 0) - 
                            parseFloat(jsonResult['dAntGloPreUniIt'] || 0));

            jsonResult['dTotOpeItem'] = parseFloat( valores+"" ) * parseFloat(item['cantidad']);
        }
        if (data['tipoDocumento'] == 4) {   //Si es Autofactura
            jsonResult['dTotOpeItem'] = parseFloat(item['precioUnitario']) * parseFloat(item['cantidad']);
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
    private generateDatosItemsOperacionIVA(params: any, data: any, item : any, i: number, gCamItem: any) {

        if (constanteService.codigosAfectaciones.filter(um => um.codigo === item['ivaTipo']).length == 0){
            throw new Error("Tipo de IVA '" + item['ivaTipo'] + "' en data.items[" + i + "].ivaTipo no encontrado. Valores: " + constanteService.codigosAfectaciones.map(a=>a.codigo + '-' + a.descripcion));
        }

        const jsonResult : any = {
            iAfecIVA: item['ivaTipo'],  //E731
            dDesAfecIVA : constanteService.codigosAfectaciones.filter(ca => ca.codigo === item['ivaTipo'])[0]['descripcion'],
            dPropIVA : item['ivaBase'], //E733
            dTasaIVA : item['iva'],     //E734 
            //dBasGravIVA : 0,            //E735 Sera sobreescrito
            //dLiqIVAItem : 0             //E736 Sera sobreescrito
        };
          
        if (item['ivaTipo'] == 1) {
            if (item['ivaBase'] != 100) {
                throw new Error('Valor de "ivaBase" debe ser igual a 100 para "ivaTipo" = 1 en data.items[' + i + '].ivaBase');
            }
        }
        if (item['iva'] == 0) {
            if (item['ivaTipo'] != 2 && item['ivaTipo'] != 3) {
                throw new Error('"Iva" = 0 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva');                
            }
        }
        if (item['iva'] == 5) {
            if (item['ivaTipo'] != 1 && item['ivaTipo'] != 4) {
                throw new Error('"Iva" = 5 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva');
            }
        }
        if (item['iva'] == 10) {
            if (item['ivaTipo'] != 1 && item['ivaTipo'] != 4) {
                throw new Error('"Iva" = 10 no se admite para "ivaTipo"=' + item['ivaTipo'] + ' proporcionado en data.items[' + i + '].iva');
            }
        }

        /*  Calculo para E735
            Si E731 = 1 o 4 este campo es igual al resultado del cálculo 
                [EA008 * (E733/100)] / 1,1 si la tasa es del 10% 
                [EA008 * (E733/100)] / 1,05 si la tasa es del 5%
            Si E731 = 2 o 3 este campo es igual 0
        */
        if (item['ivaTipo'] == 1 || item['ivaTipo'] == 4) {
            if (item['iva'] == 10) {
                jsonResult['dBasGravIVA'] = ( gCamItem['gValorItem']['gValorRestaItem']['dTotOpeItem'] * (item['ivaBase'] / 100) ) / 1.1
            }
            if (item['iva'] == 5) {
                jsonResult['dBasGravIVA'] = ( gCamItem['gValorItem']['gValorRestaItem']['dTotOpeItem'] * (item['ivaBase'] / 100) ) / 1.05
            }
        }

        /*  Calculo para E736
            Corresponde al cálculo aritmético:
            E735 * ( E734 / 100 )
            Si E731 = 2 o 3 este campo es igual 0 
         */
        if (item['ivaTipo'] == 1 || item['ivaTipo'] == 4) {
            jsonResult['dLiqIVAItem'] = ( jsonResult['dBasGravIVA'] * item['iva'] ) / 100
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
    private generateDatosItemsOperacionRastreoMercaderias(params: any, data: any, item : any, i: number) {
        const jsonResult : any = {
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
    private generateDatosItemsOperacionSectorAutomotores(params: any, data: any, item : any, i: number) {

        if (!item['sectorAutomotor']) {
            //Como no indica que este campo es obligatorio, si no se informa sale con vacio
            return null;
        }

        if (constanteService.tiposOperacionesVehiculos.filter(um => um.codigo === item['sectorAutomotor']['tipo']).length == 0){
            throw new Error("Tipo de Operación de Venta de Automotor '" + item['sectorAutomotor']['tipo'] + "' en data.items[" + i + "].sectorAutomotor.tipo no encontrado. Valores: " + constanteService.tiposOperacionesVehiculos.map(a=>a.codigo + '-' + a.descripcion));
        }
        if (constanteService.tiposCombustibles.filter(um => um.codigo === item['sectorAutomotor']['tipoCombustible']).length == 0){
            throw new Error("Tipo de Combustible '" + item['sectorAutomotor']['tipoCombustible'] + "' en data.items[" + i + "].sectorAutomotor.tipoCombustible no encontrado. Valores: " + constanteService.tiposCombustibles.map(a=>a.codigo + '-' + a.descripcion));
        }
        const jsonResult : any = {
            iTipOpVN: item['sectorAutomotor']['tipo'],
            dDesTipOpVN : constanteService.tiposOperacionesVehiculos.filter(ov => ov.codigo === item['sectorAutomotor']['tipo'])[0]['descripcion'],
            dChasis : item['sectorAutomotor']['chasis'],
            dColor : item['sectorAutomotor']['color'],    
            dPotencia : item['sectorAutomotor']['potencia'], 
            dCapMot : item['sectorAutomotor']['capacidadMotor'], 
            dPNet : item['sectorAutomotor']['pesoNeto'],    
            dPBruto : item['sectorAutomotor']['pesoBruto'],    
            iTipCom : item['sectorAutomotor']['tipoCombustible'],
            dDesTipCom : constanteService.tiposCombustibles.filter(tc => tc.codigo === item['sectorAutomotor']['tipoCombustible'])[0]['descripcion'],
            dNroMotor : item['sectorAutomotor']['numeroMotor'],
            dCapTracc : item['sectorAutomotor']['capacidadTraccion'],
            dAnoFab : item['sectorAutomotor']['año'],
            cTipVeh : item['sectorAutomotor']['tipoVehiculo'],
            dCapac : item['sectorAutomotor']['capacidadPasajeros'],
            dCilin : item['sectorAutomotor']['cilindradas'],
        };
        //Se puede hacer todo por if, para no enviar null
        return jsonResult;
    }

}

export default new JSonDteItemService();
