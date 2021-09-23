class JSonDteComplementariosComercialesService {
        
    /**
     * G. Campos complementarios comerciales de uso general (G001-G049)
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    public generateDatosComercialesUsoGeneral(params: any, data: any) {

        const jsonResult : any = {
            dOrdCompra : data['complementarios']['ordenCompra'], 
            dOrdVta : data['complementarios']['ordenVenta'],
            dAsiento : data['complementarios']['numeroAsiento']
        };
        
        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 7) { //Opcional si 1 o 7
            jsonResult['gCamCarg'] = this.generateDatosCarga(params, data);
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
        const jsonResult : any = {
            cUniMedTotVol : data['complementarios']['carga']['unidadMedida'], 
            dDesUniMedTotVol : data['complementarios']['carga']['ordenVenta'],
            dTotVolMerc : data['complementarios']['carga']['numeroAsiento'],
            cUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dDesUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dTotPesMerc : data['complementarios']['carga']['numeroAsiento'],
            iCarCarga : data['complementarios']['carga']['numeroAsiento'],
            dDesCarCarga : data['complementarios']['carga']['numeroAsiento'],
        };
        
        return jsonResult;
    }
}

export default new JSonDteComplementariosComercialesService();
