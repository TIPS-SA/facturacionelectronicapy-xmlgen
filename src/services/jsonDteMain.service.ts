import * as xml2js from 'xml2js';

import stringUtilService from './StringUtil.service';
import fechaUtilService from './FechaUtil.service';
import constanteService from './Constante.service';
import jsonDteItem from './jsonDteItem.service';
import jsonDteAlgoritmos from './jsonDteAlgoritmos.service';
import jsonDteComplementarios from './jsonDteComplementario.service';
import jsonDteTransporte from './jsonDteTransporte.service';
import jsonDteTotales from './jsonDteTotales.service';
import jsonDteComplementarioComercial from './jsonDteComplementariosComerciales.service';
import jsonDteIdentificacionDocumento from './jsonDteIdentificacionDocumento.service';

class JSonDteMainService {
    codigoSeguridad : any = null; 
    codigoControl : any = null;
    json : any = {};

    public generateXML(params: any, data: any, oThis: any) : Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.generateXMLService(params, data, oThis));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Metodo principal de generacion de XML
     * @param params 
     * @param data 
     * @returns 
     */
    private generateXMLService(params: any, data: any, oThis: any) {
        //console.log("data", data);

        this.validateValues(data);

        this.addDefaultValues(data);

        this.json = {};

        this.generateCodigoSeguridad(params, data, oThis);  //Primero genera el codigo de seguridad aleatorio único
        this.generateCodigoControl(params, data);   //Luego genera el código de Control

        this.generateRte(params);

        this.json['rDE']['DE'] = this.generateDe(params, data);
        //---
        this.generateDatosOperacion(params, data);
        this.generateDatosTimbrado(params, data);
        this.generateDatosGenerales(params, data);
        //---
        this.generateDatosEspecificosPorTipoDE(params, data);

        this.generateDatosCondicionOperacionDE(params, data);

        //['gDtipDE']=E001
        this.json['rDE']['DE']['gDtipDE']['gCamItem'] = jsonDteItem.generateDatosItemsOperacion(params, data);

        this.json['rDE']['DE']['gDtipDE']['gCamEsp'] = jsonDteComplementarios.generateDatosComplementariosComercialesDeUsoEspecificos(params, data);

        if (data['tipoDocumento'] ==1 || data['tipoDocumento'] ==7) {
            //1 Opcional, 7 Obligatorio
            this.json['rDE']['DE']['gDtipDE']['gTransp'] = jsonDteTransporte.generateDatosTransporte(params, data);
        }
        
        if (data['tipoDocumento'] !=7) {
            const items = this.json['rDE']['DE']['gDtipDE']['gCamItem'];
            this.json['rDE']['DE']['gTotSub'] = jsonDteTotales.generateDatosTotales(params, data, items);
        }

        this.json['rDE']['DE']['gDtipDE']['gCamGen'] = jsonDteComplementarioComercial.generateDatosComercialesUsoGeneral(params, data);

        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4 || data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6 || data['tipoDocumento'] == 7) {
            this.json['rDE']['DE']['gDtipDE']['gCamDEAsoc'] = jsonDteIdentificacionDocumento.generateDatosDocumentoAsociado(params, data);
        }
        //console.log("JSon a Convertir", this.json);
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(this.json);

        //console.log(xml);
        return xml;            
           
    }

    generateCodigoSeguridad(params: any, data: any, oThis: any) {
        this.codigoSeguridad = oThis.generateCodigoSeguridadAleatorio(params, data);
    }

    generateCodigoControl(params: any, data: any) {
        this.codigoControl = jsonDteAlgoritmos.generateCodigoControl(params, data, this.codigoSeguridad);
    }

    /**
     * Valida los datos ingresados en el data del req.body
     * @param data 
     */
    private validateValues(data: any) {

    }

    /**
     * Añade algunos valores por defecto al JSON de entrada, valido para
     * todas las operaciones 
     * @param data 
     */
    private addDefaultValues(data: any) {
        data["tipoEmision"] = 1;
        data["tipoEmisionDescripcion"] = "Normal";

        //data["tipoEmision"] = 2;
        //data["tipoEmisionDescripcion"] = "Contingencia";

        if (constanteService.tiposDocumentos.filter(um => um.codigo === data["tipoDocumento"]).length == 0){
            throw new Error("Tipo de Documento '" + data["tipoDocumento"]) + "' en data.tipoDocumento no válido. Valores: " + constanteService.tiposDocumentos.map(a=>a.codigo);
        }
        data["tipoDocumentoDescripcion"] = constanteService.tiposDocumentos.filter(td => td.codigo == data["tipoDocumento"])[0]['descripcion'];
    }
    
    private generateRte(params: any) {
        this.json = { 
            rDE: {
                $: {
                    'xmlns': 'http://ekuatia.set.gov.py/sifen/xsd',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xsi:schemaLocation': 'https://ekuatia.set.gov.py/sifen/xsd/siRecepDE_v150.xsd'
                },
                'dVerFor' : params.version
            }
        };
        
    }

    private generateDe(params: any, data: any) {

        if (params['ruc'].indexOf('-') == -1) {
            throw new Error("RUC debe contener dígito verificador en params.ruc");
        }
        const rucEmisor = params['ruc'].split('-')[0];
        const dvEmisor = params['ruc'].split('-')[1];

        const id = this.codigoControl;
        const digitoVerificador = jsonDteAlgoritmos.calcularDigitoVerificador(rucEmisor, 11 );

        const jsonResult = {
            $: {
                'Id' : id
            },
            dDVId : 1,
            dFecFirma : fechaUtilService.convertToJSONFormat(params.fechaFirmaDigital), //Fecha de la Firma Digital
            dSisFact : 1
        };

        return jsonResult;
    }

    /**
     * Datos inerentes a la operacion 
     * <gOpeDE>
            <iTipEmi>1</iTipEmi>
            <dDesTipEmi>Normal</dDesTipEmi>
            <dCodSeg>000000023</dCodSeg>
            <dInfoEmi>1</dInfoEmi>
            <dInfoFisc>Información de interés del Fisco respecto al DE</dInfoFisc>
        </gOpeDE>

     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosOperacion(params: any, data: any) {
        if (params['ruc'].indexOf('-') == -1) {
            throw new Error("RUC debe contener dígito verificador en params.ruc");
        }
        const rucEmisor = params['ruc'].split('-')[0];
        const dvEmisor = params['ruc'].split('-')[1];
        
        const id = jsonDteAlgoritmos.generateCodigoControl(params, data, this.codigoSeguridad);
        const digitoVerificador = jsonDteAlgoritmos.calcularDigitoVerificador(rucEmisor, 11 );

        const codigoSeguridadAleatorio = this.codigoSeguridad;

        this.json['rDE']['DE']['gOpeDE'] = {
            iTipEmi : data['tipoEmision'],
            dDesTipEmi : data['tipoEmisionDescripcion'],
            dCodSeg : codigoSeguridadAleatorio,
            dInfoEmi : data['observacion'],
            dInfoFisc : data['descripcion'],    //Este es obligatorio cuando es Nota de Remision
        };

        //Validar aqui "dInfoFisc"
        if (data['tipoDocumento'] == 7) { //Nota de Remision
            if (!(data['descripcion'] && data['descripcion'] != "")) {
                throw new Error("Debe informar la Descripción para el Documento Electrónico");
            }
        }
    }

    /**
     * Genera los datos del timbrado
     * 
     * <gTimb>
			<iTiDE>1</iTiDE>
			<dDesTiDE>Factura electrónica</dDesTiDE>
			<dNumTim>12345678</dNumTim>
			<dEst>001</dEst>
			<dPunExp>001</dPunExp>
			<dNumDoc>1000050</dNumDoc>
			<dSerieNum>AB</dSerieNum>
			<dFeIniT>2019-08-13</dFeIniT>
		</gTimb>

     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosTimbrado(params: any, data: any) {

        this.json['rDE']['DE']['gTimb'] = {
            iTiDE : data['tipoDocumento'],
            dDesTiDE : data['tipoDocumentoDescripcion'],
            dNumTim : params['timbradoNumero'],
            dEst : data['establecimiento'],
            dPunExp : data['punto'],
            dNumDoc :  data['numero'],
            dSerieNum : data['numeroSerie'],
            dFeIniT : params['timbradoFecha'].substring(0, 10)
        };
    }

    /**
     * Genera los campos generales, divide las actividades en diferentes metodos
     * 
     *  <gDatGralOpe>
            <dFeEmiDE>2020-05-07T15:03:57</dFeEmiDE>
        </gDatGralOpe>
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGenerales(params: any, data: any) {

        this.json['rDE']['DE']['gDatGralOpe'] = {
            dFeEmiDE : data['fecha']
        };
        this.generateDatosGeneralesInherentesOperacion(params, data);
        this.generateDatosGeneralesEmisorDE(params, data);
        this.generateDatosGeneralesResponsableGeneracionDE(params, data);
        this.generateDatosGeneralesReceptorDE(params, data);
    }

    /**
     * D1. Campos inherentes a la operación comercial (D010-D099)
     * Pertenece al grupo de datos generales
     * 
     * <gOpeCom>
            <iTipTra>1</iTipTra>
            <dDesTipTra>Venta de mercadería</dDesTipTra>
            <iTImp>1</iTImp>
            <dDesTImp>IVA</dDesTImp>
            <cMoneOpe>PYG</cMoneOpe>
            <dDesMoneOpe>Guarani</dDesMoneOpe>
        </gOpeCom>
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGeneralesInherentesOperacion(params: any, data: any) {

        if (data['tipoDocumento'] == 7){    //C002
            return; //No informa si el tipo de documento es 7
        }

        if (constanteService.tiposImpuestos.filter(um => um.codigo === data["tipoImpuesto"]).length == 0){
            throw new Error("Tipo de Impuesto '" + data["tipoImpuesto"]) + "' en data.tipoImpuesto no válido. Valores: " + constanteService.tiposImpuestos.map(a=>a.codigo);
        }
        if (constanteService.monedas.filter(um => um.codigo === data["moneda"]).length == 0){
            throw new Error("Moneda '" + data["moneda"]) + "' en data.moneda no válido. Valores: " + constanteService.monedas.map(a=>a.codigo);
        }
        if (constanteService.globalPorItem.filter(um => um.codigo === data["condicionAnticipo"]).length == 0){
            throw new Error("Condición de Anticipo '" + data["condicionAnticipo"]) + "' en data.condicionAnticipo no válido. Valores: " + constanteService.globalPorItem.map(a=>a.codigo);
        }
        if (constanteService.tiposTransacciones.filter(um => um.codigo === data["tipoTransaccion"]).length == 0){
            throw new Error("Tipo de Transacción '" + data["tipoTransaccion"]) + "' en data.tipoTransaccion no válido. Valores: " + constanteService.tiposTransacciones.map(a=>a.codigo);
        }

        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom'] = {
            iTipTra : null, //Será sobre escrito
            dDesTipTra : null, //Será sobre escrito
            iTImp : data['tipoImpuesto'],   //D013
            dDesTImp : constanteService.tiposImpuestos.filter(ti => ti.codigo == data['tipoImpuesto'])[0]['descripcion'],
            cMoneOpe : data['moneda'],  //D015
            dDesMoneOpe : constanteService.monedas.filter(m => m.codigo == data['moneda'])[0]['descripcion'],
            dCondTiCam : null, //D017 Será sobre escrito
            dTiCam : null, //Será sobre escrito
            iCondAnt : data['condicionAnticipo'], 
            dDesCondAnt : "Anticipo " + constanteService.globalPorItem.filter(ca => ca.codigo == data['condicionAnticipo'])[0]['descripcion']
        };

        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
            //Obligatorio informar iTipTra D011
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iTipTra'] = data['tipoTransaccion'];
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesTipTra'] = constanteService.tiposTransacciones.filter(tt => tt.codigo == data['tipoTransaccion'])[0]['descripcion'];
        }
        if (data['moneda'] != 'PYG') {
            //Obligatorio informar dCondTiCam D017
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dCondTiCam'] = data['condicionTipoCambio'];
        }
        if (data['cambio'] == 1 && data['moneda'] != 'PYG') {
            //Obligatorio informar dCondTiCam D018
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dTiCam'] = data['cambio'];
        }

    }

    /**
     * D2. Campos que identifican al emisor del Documento Electrónico DE (D100-D129)
     * Pertenece al grupo de datos generales
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGeneralesEmisorDE(params: any, data: any) {

        if (!(params && params.establecimientos)){
            throw new Error("Debe proveer un Array con la información de los establecimientos en params");
        }
        
        //Validar si el establecimiento viene en params
        if (params.establecimientos.filter((um:any) => um.codigo === data['establecimiento']).length == 0){
            throw new Error("Establecimiento '" + data['establecimiento'] + "' no encontrado en params.establecimientos*.codigo. Valores: " + params.establecimientos.map((a:any)=>a.codigo));
        }
        if (params['ruc'].indexOf('-') == -1) {
            throw new Error("RUC debe contener dígito verificador en params.ruc");
        }
        this.json['rDE']['DE']['gDatGralOpe']['gEmis'] = {
            dRucEm : params['ruc'].split('-')[0],
            dDVEmi : params['ruc'].split('-')[1],
            iTipCont : params['tipoContribuyente'],
            cTipReg : params['tipoRegimen'],
            dNomEmi : params['razonSocial'],
            dNomFanEmi : params['nombreFantasia'],
            dDirEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['direccion'],
            dNumCas : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['numeroCasa'],
            dCompDir1 : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['complementoDireccion1'],
            dCompDir2 : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['complementoDireccion2'],
            cDepEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['departamento'],
            dDesDepEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['departamentoDescripcion'],
            cDisEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['distrito'],
            dDesDisEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['distritoDescripcion'],
            cCiuEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['ciudad'],
            dDesCiuEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['ciudadDescripcion'],
            dTelEmi : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['telefono'],
            dEmailE : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['email'],
            dDenSuc : params["establecimientos"].filter( (e:any) => e.codigo === data['establecimiento'])[0]['denominacion'],
            gActEco : {
                cActEco : params["actividadEconomica"],
                dDesActEco : params["actividadEconomicaDescripcion"]
            }
        };
    }

    /**
     * Datos generales del responsable de generacion del DE
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGeneralesResponsableGeneracionDE(params: any, data: any) {

        this.json['rDE']['DE']['gDatGralOpe']['gRespDE'] = {
            iTipIDRespDE : data['usuario']['documentoTipo'],
            dDTipIDRespDE : constanteService.tiposDocumentosIdentidades.filter(td=> td.codigo === data['usuario']['documentoTipo'])[0]["descripcion"],
            dNumIDRespDE : data['usuario']['documentoNumero'],
            dNomRespDE : data['usuario']['nombre'],
            dCarRespDE : data['usuario']['cargo']
        };
    }

    /**
     * Datos generales del receptor del documento electrónico
     * Pertenece al grupo de datos generales
     * 
     * <gDatRec>
                <iNatRec>1</iNatRec>
                <iTiOpe>1</iTiOpe>
                <cPaisRec>PRY</cPaisRec>
                <dDesPaisRe>Paraguay</dDesPaisRe>
                <iTiContRec>2</iTiContRec>
                <dRucRec>00000002</dRucRec>
                <dDVRec>7</dDVRec>
                <dNomRec>RECEPTOR DEL DOCUMENTO</dNomRec>
                <dDirRec>CALLE 1 ENTRE CALLE 2 Y CALLE 3</dDirRec>
                <dNumCasRec>123</dNumCasRec>
                <cDepRec>1</cDepRec>
                <dDesDepRec>CAPITAL</dDesDepRec>
                <cDisRec>1</cDisRec>
                <dDesDisRec>ASUNCION (DISTRITO)</dDesDisRec>
                <cCiuRec>1</cCiuRec>
                <dDesCiuRec>ASUNCION (DISTRITO)</dDesCiuRec>
                <dTelRec>012123456</dTelRec>
                <dCodCliente>AAA</dCodCliente>
            </gDatRec>
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGeneralesReceptorDE(params: any, data: any) {

        if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) {
            if (params.tiposDocumentosReceptor.filter((um:any) => um.codigo === data['cliente']['documentoTipo']).length == 0){
                throw new Error("Tipo de Documento '" + data['cliente']['documentoTipo'] + "' del Cliente en data.cliente.documentoTipo no encontrado. Valores: " + params.tiposDocumentosReceptor.map((a:any)=>a.codigo));
            }
        }
        if (data['cliente']['ruc'].indexOf('-') == -1) {
            throw new Error("RUC debe contener dígito verificador en data.cliente.ruc");
        }
        this.json['rDE']['DE']['gDatGralOpe']['gDatRec'] = {
            iNatRec : data['cliente']['contribuyente'] ? 1 : 2,
            iTiOpe : data['cliente']['tipoOperacion'],
            cPaisRec : data['cliente']['pais'],
            dDesPaisRe : data['cliente']['paisDescripcion'],
            iTiContRec : data['cliente']['contribuyente'] ? data['cliente']['tipoContribuyente'] : null,
            dRucRec :  data['cliente']['contribuyente'] ? data['cliente']['ruc'].split('-')[0] : null,
            dDVRec : data['cliente']['contribuyente'] ? data['cliente']['ruc'].split('-')[1] : null,
            iTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['documentoTipo'] : null,
            dDTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? constanteService.tiposDocumentosReceptor.filter(tdr => { tdr.codigo === data['cliente']['documentoTipo']})[0]["descripcion"]  : null,
            dNumIDRec : null,   //Sera Sobreescito D210
            dNomRec : (data['cliente']['documentoTipo'] === 5) ? "Sin Nombre": data['cliente']['razonSocial'],
            dNomFanRec : (data['cliente']['documentoTipo'] === 5) ? null: data['cliente']['nombreFantasia'],
            dDirRec : (data['tipoDocumento'] === 7 || data['cliente']['tipoOperacion'] === 4) ? data['cliente']['direccion'] : null,
            dNumCasRec : data['cliente']['direccion'] ? data['cliente']['numeroCasa'] : null,
            cDepRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['departamento'] : null,
            dDesDepRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['departamentoDescripcion'] : null,
            cDisRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['distrito'] : null,
            dDesDisRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['distritoDescripcion'] : null,
            cCiuRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['ciudad'] : null,
            dDesCiuRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['ciudadDescripcion'] : null,
            dTelRec : data['cliente']['telefono'],
            dCelRec : data['cliente']['celular'],
            dEmailRec : data['cliente']['email'],
            dCodCliente : data['cliente']['']
        };

        if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion']) {
            //Obligatorio completar D210
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = data['cliente']['documentoNumero'];
            
            if (data['cliente']['documentoTipo'] = 5){
                //Si es innominado completar con cero
                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = "0";
            }
        }

        //Asignar null a departamento, distrito y ciudad si tipoOperacion = 4
        if (data['cliente']['tipoOperacion'] === 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDepRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDepRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDisRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDisRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cCiuRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesCiuRec'] = null;
        }
    }

    /**
     * Campos que seran especificos de acuerdo a cada tipo de documento electronico
     * Se dividiran en diferentes métodos por cada tipo de factura.
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosEspecificosPorTipoDE(params: any, data: any) {

        this.json['rDE']['DE']['gDtipDE'] = {
            
        };

        if (data["tipoDocumento"] === 1){
            this.generateDatosEspecificosPorTipoDE_FacturaElectronica(params, data);
        }
        if (data["tipoDocumento"] === 4){
            this.generateDatosEspecificosPorTipoDE_Autofactura(params, data);
        }

        if (data["tipoDocumento"] === 5 || data["tipoDocumento"] === 6){
            this.generateDatosEspecificosPorTipoDE_NotaCreditoDebito(params, data);
        }
        
        if (data["tipoDocumento"] === 7){
            this.generateDatosEspecificosPorTipoDE_RemisionElectronica(params, data);
        }

    }

    /**
     * Datos especificos para la factura electronica
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosEspecificosPorTipoDE_FacturaElectronica(params: any, data: any) {

        if (constanteService.indicadoresPresencias.filter((um:any) => um.codigo === data['factura']['presencia']).length == 0){
            throw new Error("Indicador de Presencia '" + data['factura']['presencia'] + "' en data.factura.presencia no encontrado. Valores: " + constanteService.indicadoresPresencias.map((a:any)=>a.codigo));
        }
        
        this.json['rDE']['DE']['gDtipDE']['gCamFE'] = {
            iIndPres : data['factura']['presencia'],
            dDesIndPres : constanteService.indicadoresPresencias.filter(ip => ip.codigo === data['factura']['presencia'])[0]['descripcion'],
            dFecEmNR : data['factura']['fechaEnvio']
        };

        if (data["cliente"]["tipoOperacion"] === 3){
            this.generateDatosEspecificosPorTipoDE_ComprasPublicas(params, data);
        }
    }

    /**
     * Datos especificos cuando el tipo de operacion del receptor es B2G (Campo D202)
     * Dentro de la factura electronica
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosEspecificosPorTipoDE_ComprasPublicas(params: any, data: any) {

        this.json['rDE']['DE']['gDtipDE']['gCamFE']['gCompPub'] = {
            dModCont : data['dncp']['modalidad'],
            dEntCont : data['dncp']['entidad'],
            dAnoCont : data['dncp']['año'],
            dSecCont : data['dncp']['secuencia'],
            dFeCodCont : data['dncp']['fecha']
        };
    }

    private generateDatosEspecificosPorTipoDE_Autofactura(params: any, data: any) {

        if (params.naturalezaVendedorAutofactura.filter((um:any) => um.codigo === data['autoFactura']['tipoVendedor']).length == 0){
            throw new Error("Tipo de Vendedor '" + data['autoFactura']['tipoVendedor'] + "' en data.autoFactura.tipoVendedor no encontrado. Valores: " + params.naturalezaVendedorAutofactura.map((a:any)=>a.codigo));
        }

        if (params.tiposDocumentosIdentidades.filter((um:any) => um.codigo === data['autoFactura']['documentoTipo']).length == 0){
            throw new Error("Tipoo de Documento '" + data['autoFactura']['documentoTipo'] + "' en data.autoFactura.documentoTipo no encontrado. Valores: " + params.tiposDocumentosIdentidades.map((a:any)=>a.codigo));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamAE'] = {
            iNatVen : data['autoFactura']['tipoVendedor'],  //1=No Contribuyente, 2=Extranjero
            dDesNatVen : constanteService.naturalezaVendedorAutofactura.filter(nv => nv.codigo === data['autoFactura']['tipoVendedor'])[0]['descripcion'],
            iTipIDVen : data['autoFactura']['documentoTipo'],
            dDTipIDVen : constanteService.tiposDocumentosIdentidades.filter(td => td.codigo === data['autoFactura']['documentoTipo'])[0]['descripcion'],
            dNumIDVen : data['autoFactura']['documentoNumero'],
            dNomVen : data['autoFactura']['documentoNombre'],
            dDirVen : data['autoFactura']['direccion'],
            dNumCasVen : data['autoFactura']['numeroCasa'],
            cDepVen : data['autoFactura']['departamento'],
            dDesDepVen : data['autoFactura']['departamentoDescripcion'],
            cDisVen : data['autoFactura']['distrito'],
            dDesDisVen : data['autoFactura']['distritoDescripcion'],
            cCiuVen : data['autoFactura']['ciudad'],
            dDesCiuVen : data['autoFactura']['ciudadDescripcion'],
            dDirProv : data['autoFactura']['transaccion']['lugar'],
            cDepProv : data['autoFactura']['transaccion']['departamento'],
            dDesDepProv : data['autoFactura']['transaccion']['departamentoDescripcion'],
            cDisProv : data['autoFactura']['transaccion']['distrito'],
            dDesDisProv : data['autoFactura']['transaccion']['distritoDescripcion'],
            cCiuProv : data['autoFactura']['transaccion']['ciudad'],
            dDesCiuProv  : data['autoFactura']['transaccion']['ciudadDescripcion'],
        };
    }

    private generateDatosEspecificosPorTipoDE_NotaCreditoDebito(params: any, data: any) {
        if (params.notasCreditosMotivos.filter((um:any) => um.codigo === data['notaCreditoDebito']['motivo']).length == 0){
            throw new Error("Motivo de la Nota de Crédito/Débito '" + data['notaCreditoDebito']['motivo'] + "' en data.notaCreditoDebito.motivo no encontrado. Valores: " + params.notasCreditosMotivos.map((a:any)=>a.codigo));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamNCDE'] = {
            iMotEmi : data['notaCreditoDebito']['motivo'],  
            dDesMotEmi : constanteService.notasCreditosMotivos.filter(nv => nv.codigo === data['notaCreditoDebito']['motivo'])[0]['descripcion'],
        };
    }

    private generateDatosEspecificosPorTipoDE_RemisionElectronica(params: any, data: any) {
        if (params.remisionesMotivos.filter((um:any) => um.codigo === data['remision']['motivo']).length == 0){
            throw new Error("Motivo de la Remisión '" + data['remision']['motivo'] + "' en data.remision.motivo no encontrado. Valores: " + params.remisionesMotivos.map((a:any)=>a.codigo));
        }
        if (params.remisionesResponsables.filter((um:any) => um.codigo === data['remision']['remisionesResponsables']).length == 0){
            throw new Error("Tipo de Documento '" + data['remision']['remisionesResponsables'] + "' en data.remision.remisionesResponsables no encontrado. Valores: " + params.remisionesResponsables.map((a:any)=>a.codigo));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamNRE'] = {
            iMotEmiNR : data['remision']['motivo'],  
            dDesMotEmiNR : constanteService.remisionesMotivos.filter(nv => nv.codigo === data['remision']['motivo'])[0]['descripcion'],
            iRespEmiNR : data['remision']['remisionesResponsables'],
            dDesRespEmiNR : constanteService.remisionesResponsables.filter(nv => nv.codigo === data['remision']['remisionesResponsables'])[0]['descripcion'],
            dKmR : data['remision']['kms'],
            dFecEm : data['remision']['fechaFactura']
        };
    }

    /**
     * E7. Campos que describen la condición de la operación (E600-E699)
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosCondicionOperacionDE(params: any, data: any) {

        if (constanteService.condicionesOperaciones.filter((um:any) => um.codigo === data['condicion']['tipo']).length == 0){
            throw new Error("Condición de la Operación '" + data['condicion']['tipo'] + "' en data.condicion.tipo no encontrado. Valores: " + constanteService.condicionesOperaciones.map((a:any)=>a.codigo));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamCond'] = {
            iCondOpe : data['condicion']['tipo'],  
            dDCondOpe : constanteService.condicionesOperaciones.filter(co => co.codigo === data['condicion']['tipo'])[0]['descripcion'],
            
        };

        if (data['condicion']['tipo'] === 1) {
            this.generateDatosCondicionOperacionDE_Contado(params, data);
        }

        if (data['condicion']['tipo'] === 2) {
            this.generateDatosCondicionOperacionDE_Credito(params, data);
        }
    }
    
    /**
     * E7.1. Campos que describen la forma de pago de la operación al contado o del monto 
     * de la entrega inicial (E605-E619)
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosCondicionOperacionDE_Contado(params: any, data: any) {

        if (data['condicion']['entregas'] && data['condicion']['entregas'].length > 0) {
            const entregas = [];
            for (let i = 0; i < data['condicion']['entregas'].length; i++) {
                const dataEntrega = data['condicion']['entregas'][i];

                if (constanteService.condicionesTiposPagos.filter((um:any) => um.codigo === dataEntrega['tipo']).length == 0){
                    throw new Error("Condición de Tipo de Pago '" + dataEntrega['tipo'] + "' en data.condicion.entregas[" + i + "].tipo no encontrado. Valores: " + constanteService.condicionesTiposPagos.map((a:any)=>a.codigo));
                }

                const cuotaInicialEntrega : any = {
                    iTiPago : dataEntrega['tipo'],  
                    dDesTiPag : constanteService.condicionesTiposPagos.filter(co => co.codigo === dataEntrega['tipo'])[0]['descripcion'],
                    dMonTiPag : dataEntrega['monto'],
                    cMoneTiPag : dataEntrega['moneda'],
                    dDMoneTiPag : dataEntrega['monedaDescripcion'],
                    dTiCamTiPag : dataEntrega['cambio'],
                };

                //Verificar si el Pago es con Tarjeta de crédito
                if (dataEntrega['tipo'] === 3 || dataEntrega['tipo'] === 4) {
                    if (constanteService.condicionesOperaciones.filter((um:any) => um.codigo ===  dataEntrega['infoTarjeta']["tipo"]).length == 0){
                        throw new Error("Tipo de Tarjeta de Crédito '" +  dataEntrega['infoTarjeta']["tipo"] + "' en data.condicion.entregas[" + i + "].infoTarjeta.tipo no encontrado. Valores: " + constanteService.condicionesOperaciones.map((a:any)=>a.codigo));
                    }
    
                    cuotaInicialEntrega['gPagTarCD'] = {
                        iDenTarj : dataEntrega['infoTarjeta']["tipo"],  
                        dDesDenTarj : dataEntrega['infoTarjeta']["tipo"] === 99 ? dataEntrega['infoTarjeta']["tipoDescripcion"] : constanteService.tarjetasCreditosTipos.filter(co => co.codigo === dataEntrega['infoTarjeta']['tipo'])[0]['descripcion'],
                        dRSProTar : dataEntrega['infoTarjeta']["razonSocial"],  
                        dRUCProTar  : dataEntrega['infoTarjeta']["ruc"].split("-")[0],  
                        dDVProTar : dataEntrega['infoTarjeta']["ruc"].split("-")[1],  

                        iForProPa : dataEntrega['infoTarjeta']["medioPago"],  //Ver constante.tarjetasCreditosFormasProcesamiento
                        dCodAuOpe : dataEntrega['infoTarjeta']["codigoAutorizacion"],  
                        dNomTit : dataEntrega['infoTarjeta']["titular"],  
                        dNumTarj : dataEntrega['infoTarjeta']["numero"]
                    }
                }

                //Verificar si el Pago es con Cheque
                if (dataEntrega['tipo'] === 2) {
                    cuotaInicialEntrega['gPagCheq'] = {
                        dNumCheq : stringUtilService.leftZero(dataEntrega['infoCheque']["numeroCheque"], 8),  
                        dBcoEmi : dataEntrega['infoCheque']["banco"],
                    }
                }
                entregas.push(cuotaInicialEntrega);
        
            }
            this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPaConEIni'] = entregas; //Array de Entregas
        }

        
    }

    /**
     * E7.2. Campos que describen la operación a crédito (E640-E649)
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosCondicionOperacionDE_Credito(params: any, data: any) {
        if (constanteService.condicionesCreditosTipos.filter((um:any) => um.codigo ===  data['condicion']['credito']['tipo']).length == 0){
            throw new Error("Tipo de Crédito '" +  data['condicion']['credito']['tipo'] + "' en data.condicion.credito.tipo no encontrado. Valores: " + constanteService.condicionesCreditosTipos.map((a:any)=>a.codigo));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred'] = {
            iCondCred : data['condicion']['credito']['tipo'],
            dDCondCred : constanteService.condicionesCreditosTipos.filter(co => co.codigo === data['condicion']['credito']['tipo'])[0]['descripcion'],
            dPlazoCre : data['condicion']['credito']['tipo'] === 1 ? data['condicion']['credito']['plazo'] : null,
            dCuotas : data['condicion']['credito']['tipo'] === 2 ? data['condicion']['credito']['cuotas'] : null,
            dMonEnt : data['condicion']['credito']['montoEntrega'],
            gCuotas : []
        }; 

        //Recorrer array de infoCuotas e informar en el JSON
        if (data['condicion']['credito']['tipo'] === 2) {
            if (data['condicion']['credito']['infoCuotas'] && data['condicion']['credito']['infoCuotas'].length > 0) {
                for (let i = 0; i < data['condicion']['credito']['infoCuotas'].length; i++) {
                    const infoCuota = data['condicion']['credito']['infoCuotas'][i];
                    
                    const gCuotas = {
                        cMoneCuo : infoCuota['moneda'],
                        dDMoneCuo : infoCuota['monedaDescripcion'],
                        dMonCuota : infoCuota['monto'],
                        dVencCuo : infoCuota['vencimiento'],
                    };

                    this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['gCuotas'].push(gCuotas);
                }
            }
        } else {
            throw new Error("Debe proporcionar data.condicion.credito.infoCuotas[]");
        }
    }

}

export default new JSonDteMainService();
