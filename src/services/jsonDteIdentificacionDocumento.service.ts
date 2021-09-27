
import constanteService from './Constante.service';

class JSonDteIdentificacionDocumentoService {
 
       
    /**
     * H. Campos que identifican al documento asociado (H001-H049)
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    public generateDatosDocumentoAsociado(params: any, data: any) {

        if (data['tipoTransaccion'] == 11 && !data['documentoAsociado']['resolucionCreditoFiscal']) {
            throw new Error("Obligatorio informar data.documentoAsociado.resolucionCreditoFiscal");
        }

        //Validaciones
        if (constanteService.tiposDocumentosAsociados.filter(um => um.codigo === data['documentoAsociado']['formato']).length == 0){
            throw new Error("Formato de Documento Asociado '" + data['documentoAsociado']['formato'] + "' en data.documentoAsociado.formato no encontrado. Valores: " + constanteService.tiposDocumentosAsociados.map(a=>a.codigo + '-' + a.descripcion));
        }
        if (data['documentoAsociado']['tipo'] == 2) {
            if (constanteService.tiposDocumentosImpresos.filter(um => um.codigo === data['documentoAsociado']['tipoDocumentoImpreso']).length == 0){
                throw new Error("Tipo de Documento impreso '" + data['documentoAsociado']['tipoDocumentoImpreso'] + "' en data.documentoAsociado.tipoDocumentoImpreso no encontrado. Valores: " + constanteService.tiposDocumentosImpresos.map(a=>a.codigo + '-' + a.descripcion));
            }
            if (constanteService.tiposConstancias.filter(um => um.codigo === data['documentoAsociado']['constanciaTipo']).length == 0){
                throw new Error("Tipo de Constancia '" + data['documentoAsociado']['constanciaTipo'] + "' en data.documentoAsociado.constanciaTipo no encontrado. Valores: " + constanteService.tiposConstancias.map(a=>a.codigo + '-' + a.descripcion));
            }
        }
        const jsonResult : any = {
            iTipDocAso : data['documentoAsociado']['formato'], 
            dDesTipDocAso : constanteService.tiposDocumentosAsociados.filter(td => td.codigo === data['documentoAsociado']['formato'])[0]['descripcion'],
            dCdCDERef : data['documentoAsociado']['tipo'] == 1 ? data['documentoAsociado']['cdc'] : null,
            dNTimDI : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['timbrado'] : null,
            dEstDocAso : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['establecimiento'] : null,
            dPExpDocAso : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['punto'] : null,
            dNumDocAso : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['numero'] : null,
            iTipoDocAso : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['tipoDocumentoImpreso'] : null,
            dDTipoDocAso : data['documentoAsociado']['tipo'] == 2 ? constanteService.tiposDocumentosImpresos.filter(td => td.codigo === data['documentoAsociado']['tipoDocumentoImpreso'])[0]['descripcion'] : null,
            dFecEmiDI : data['documentoAsociado']['tipo'] == 2 ? data['documentoAsociado']['fecha'] : null,
            dNumComRet : data['documentoAsociado']['numeroRetencion'],  //TODO Validar
            dNumResCF : data['tipoTransaccion'] == 11 ? data['documentoAsociado']['resolucionCreditoFiscal'] : null,
            iTipCons : data['documentoAsociado']['constanciaTipo'],
            dDesTipCons : data['documentoAsociado']['tipo'] == 2 ? constanteService.tiposConstancias.filter(tc => tc.codigo === data['documentoAsociado']['constanciaTipo'])[0]['descripcion'] : null,
            dNumCons : data['documentoAsociado']['constanciaNumero'],
            dNumControl : data['documentoAsociado']['constanciaControl']
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
    public generateDatosCarga(params: any, data: any) {

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

export default new JSonDteIdentificacionDocumentoService();
