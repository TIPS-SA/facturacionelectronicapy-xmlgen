import constanteService from './Constante.service';

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
                throw new Error("Obligatorio informar detalleTransporte.tipo");
            }
        }
        if (data['detalleTransporte']['condicionNegociacion']) {
            if (constanteService.condicionesNegociaciones.indexOf(data['detalleTransporte']['condicionNegociacion']) < -1) {
                throw new Error("detalleTransporte.condicionNegociación (" + data['detalleTransporte']['condicionNegociacion'] + ") no válido");
            }
        }
        if (data['tipoDocumento'] == 7) {
            if (data['inicioEstimadoTranslado']) {
                throw new Error("Obligatorio informar detalleTransporte.inicioEstimadoTranslado");
            }
        }
        if (data['tipoDocumento'] == 7) {
            if (data['finEstimadoTranslado']) {
                throw new Error("Obligatorio informar detalleTransporte.finEstimadoTranslado");
            }
        }
        if (constanteService.tiposTransportes.filter(um => um.codigo === data['detalleTransporte']['tipo']).length == 0){
            throw new Error("Tipo de Transporte '" + data['detalleTransporte']['tipo'] + "' en data.detalleTransporte.tipo no encontrado. Valores: " + constanteService.tiposTransportes.map(a=>a.codigo + '-' + a.descripcion));
        }
        if (constanteService.modalidadesTransportes.filter(um => um.codigo === data['detalleTransporte']['modalidad']).length == 0){
            throw new Error("Modalidad de Transporte '" + data['detalleTransporte']['modalidad'] + "' en data.detalleTransporte.modalidad no encontrado. Valores: " + constanteService.modalidadesTransportes.map(a=>a.codigo + '-' + a.descripcion));
        }
        const jsonResult : any = {
            iTipTrans : data['detalleTransporte']['tipo'],
            dDesTipTrans : constanteService.tiposTransportes.filter(tt => tt.codigo == data['detalleTransporte']['tipo'])[0]['descripcion'],
            iModTrans : data['detalleTransporte']['modalidad'],
            dDesModTrans : constanteService.modalidadesTransportes.filter(mt => mt.codigo == data['detalleTransporte']['modalidad'])[0]['descripcion'],
            iRespFlete : data['detalleTransporte']['tipoResponsable'],
            cCondNeg : data['detalleTransporte']['condicionNegociacion'],
            dNuManif : data['detalleTransporte']['numeroManifiesto'],
            dNuDespImp : data['detalleTransporte']['numeroDespachoImportacion'],
            dIniTras : data['detalleTransporte']['inicioEstimadoTranslado'],
            dFinTras : data['detalleTransporte']['finEstimadoTranslado'],
            cPaisDest : data['detalleTransporte']['paisDestino'],
            dDesPaisDest : data['detalleTransporte']['paisDestinoNombre'],
        };
        
        jsonResult['gCamSal'] = this.generateDatosSalida(params, data);
        jsonResult['gCamEnt'] = this.generateDatosEntrega(params, data);
        jsonResult['gVehTras'] = this.generateDatosVehiculo(params, data);
        jsonResult['gCamTrans'] = this.generateDatosTransportista(params, data);

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
        const jsonResult : any = {
            dDirLocSal : data['detalleTransporte']['salida']['direccion'],
            dNumCasSal : data['detalleTransporte']['salida']['numeroCasa'],
            dComp1Sal : data['detalleTransporte']['salida']['complementoDireccion1'],
            dComp2Sal : data['detalleTransporte']['salida']['complementoDireccion1'],
            cDepSal : data['detalleTransporte']['salida']['departamento'],
            dDesDepSal : data['detalleTransporte']['salida']['departamentoDescripcion'],
            cDisSal : data['detalleTransporte']['salida']['distrito'],
            dDesDisSal : data['detalleTransporte']['salida']['distritoDescripcion'],
            cCiuSal : data['detalleTransporte']['salida']['ciudad'],
            dDesCiuSal : data['detalleTransporte']['salida']['ciudadDescripcion'],
            dTelSal : data['detalleTransporte']['salida']['telefonoContacto'],
        };

        if (data['lecturaAnterior'] > data['lecturaActual']) {
            throw new Error("Sector Energia Electrica lecturaActual debe ser mayor a lecturaAnterior");
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
        const jsonResult : any = {
            dDirLocEnt : data['detalleTransporte']['entrega']['direccion'],
            dNumCasEnt : data['detalleTransporte']['entrega']['numeroCasa'],
            dComp1Ent : data['detalleTransporte']['entrega']['complementoDireccion1'],
            dComp2Ent : data['detalleTransporte']['entrega']['complementoDireccion1'],
            cDepEnt : data['detalleTransporte']['entrega']['departamento'],
            dDesDepEnt : data['detalleTransporte']['entrega']['departamentoDescripcion'],
            cDisEnt : data['detalleTransporte']['entrega']['distrito'],
            dDesDisEnt : data['detalleTransporte']['entrega']['distritoDescripcion'],
            cCiuEnt : data['detalleTransporte']['entrega']['ciudad'],
            dDesCiuEnt : data['detalleTransporte']['entrega']['ciudadDescripcion'],
            dTelEnt : data['detalleTransporte']['entrega']['telefonoContacto'],
        };
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
        const jsonResult : any = {
            dTiVehTras : data['detalleTransporte']['vehiculo']['tipo'],
            dMarVeh : data['detalleTransporte']['vehiculo']['marca'],
            dTipIdenVeh : data['detalleTransporte']['vehiculo']['documentoTipo'],
            dNroIDVeh : data['detalleTransporte']['vehiculo']['documentoNumero'],
            dAdicVeh : data['detalleTransporte']['vehiculo']['obs'],
            dNroMatVeh : data['detalleTransporte']['vehiculo']['numeroMatricula'],
            dNroVuelo : data['detalleTransporte']['vehiculo']['numeroVuelo']
        };
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
        if (constanteService.tiposDocumentosIdentidades.filter(um => um.codigo === data['detalleTransporte']['transportista']['documentoTipo']).length == 0){
            throw new Error("Tipo de Documento '" + data['detalleTransporte']['transportista']['documentoTipo'] + "' en data.detalleTransporte.transportista.documentoTipo no encontrado. Valores: " + constanteService.tiposDocumentosIdentidades.map(a=>a.codigo + '-' + a.descripcion));
        }

        if (data['detalleTransporte']['transportista']['ruc'] == -1) {
            throw new Error("RUC debe contener dígito verificador en data.detalleTransporte.transportista.ruc");
        }

        if (data['detalleTransporte']['transportista']['agente']['ruc'] == -1) {
            throw new Error("RUC debe contener dígito verificador en data.detalleTransporte.transportista.agente.ruc");
        }

        const jsonResult : any = {
            iNatTrans : data['detalleTransporte']['transportista']['contribuyente'] ? 1 : 2,
            dNomTrans : data['detalleTransporte']['transportista']['nombre'],
            dRucTrans : data['detalleTransporte']['transportista']['ruc'].split("-")[0],
            dDVTrans : data['detalleTransporte']['transportista']['ruc'].split("-")[1],
            iTipIDTrans : data['detalleTransporte']['transportista']['documentoTipo'],
            dDTipIDTrans : constanteService.tiposDocumentosIdentidades.filter(td => td.codigo === data['detalleTransporte']['transportista']['documentoTipo'])[0]['descripcion'],
            dNumIDTrans : data['detalleTransporte']['transportista']['documentoNumero'],
            cNacTrans : data['detalleTransporte']['transportista']['pais'],
            dDesNacTrans : data['detalleTransporte']['transportista']['paisDescripcion'],
            dNumIDChof : data['detalleTransporte']['transportista']['chofer']['documentoNumero'],
            dNomChof : data['detalleTransporte']['transportista']['chofer']['nombre'],
            dDomFisc : data['detalleTransporte']['transportista']['direccion'],
            dDirChof : data['detalleTransporte']['transportista']['chofer']['direccion'],
            dNombAg : data['detalleTransporte']['transportista']['agente']['nombre'],
            dRucAg : data['detalleTransporte']['transportista']['agente']['ruc'].split('-')[0],
            dDVAg : data['detalleTransporte']['transportista']['agente']['ruc'].split('-')[1],
            dDirAge : data['detalleTransporte']['transportista']['agente']['direccion']
        };
        return jsonResult;
    }
}

export default new JSonDteTransporteService();
