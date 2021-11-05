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
import validator from 'xsd-schema-validator';

class JSonDeMainService {
    codigoSeguridad : any = null; 
    codigoControl : any = null;
    json : any = {};

    public generateXMLDE(params: any, data: any) : Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.generateXMLDeService(params, data));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Metodo principal de generacion de XML del DE
     * @param params 
     * @param data 
     * @returns 
     */
    private generateXMLDeService(params: any, data: any) {

        this.validateValues(data);

        this.addDefaultValues(data);

        this.json = {};

        this.generateCodigoSeguridad(params, data);  //Primero genera el codigo de seguridad aleatorio único
        this.generateCodigoControl(params, data);   //Luego genera el código de Control

        this.generateRte(params);

        this.json['rDE']['DE'] = this.generateDe(params, data);
        //---
        this.generateDatosOperacion(params, data);
        this.generateDatosTimbrado(params, data);
        this.generateDatosGenerales(params, data);
        //---
        this.generateDatosEspecificosPorTipoDE(params, data);

        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
            this.generateDatosCondicionOperacionDE(params, data);
        }

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

        if (data['complementarios']) {
           this.json['rDE']['DE']['gCamGen'] = jsonDteComplementarioComercial.generateDatosComercialesUsoGeneral(params, data);
        }

        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4 || data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6 || data['tipoDocumento'] == 7) {
            //this.json['rDE']['DE']['gDtipDE']['gCamDEAsoc'] = jsonDteIdentificacionDocumento.generateDatosDocumentoAsociado(params, data);
            if (data['documentoAsociado']) {
                this.json['rDE']['DE']['gCamDEAsoc'] = jsonDteIdentificacionDocumento.generateDatosDocumentoAsociado(params, data);
            }
        }
        var builder = new xml2js.Builder({xmldec : {
            version : '1.0',
            encoding : 'UTF-8',
            standalone : false
        }});
        var xml = builder.buildObject(this.json);
/*
        validator.validateXML(xml, __dirname + '\\xsd\\siRecepDE_v150.xsd', function(err, result) {
        //validator.validateXML(xml.split('\n').slice(1).join('\n'), __dirname + '\\xsd\\siRecepDE_v150.xsd', function(err, result) {
                if (err) {
                throw err;
            }

        });
*/
        return this.normalizeXML(xml);
           
    }

    generateCodigoSeguridad(params: any, data: any) {
        //this.codigoSeguridad = oThis.generateCodigoSeguridadAleatorio(params, data);
        this.codigoSeguridad = stringUtilService.leftZero(data.codigoSeguridadAleatorio, 9);
    }

    /**
     * Genera el CDC para la Factura
     * Corresponde al Id del DE
     * 
     * @param params 
     * @param data 
     */
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

        if (constanteService.tiposDocumentos.filter(um => um.codigo === data["tipoDocumento"]).length == 0){
            throw new Error("Tipo de Documento '" + data["tipoDocumento"]) + "' en data.tipoDocumento no válido. Valores: " + constanteService.tiposDocumentos.map(a=>a.codigo + '-' + a.descripcion);
        }
        data["tipoDocumentoDescripcion"] = constanteService.tiposDocumentos.filter(td => td.codigo == data["tipoDocumento"])[0]['descripcion'];
    }
    
    private generateRte(params: any) {
        this.json = { 
            rDE: {
                $: {
                    'xmlns': 'http://ekuatia.set.gov.py/sifen/xsd',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xsi:schemaLocation': 'http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd'
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
        //const digitoVerificador = jsonDteAlgoritmos.calcularDigitoVerificador(rucEmisor, 11 );

        if (!(params.fechaFirmaDigital && params.fechaFirmaDigital.length >= 10)) {
//            throw new Error("Debe proveer la fecha de la firma digital en params.fechaFirmaDigital");
        }
        const fechaFirmaDigital = new Date(params.fechaFirmaDigital);
        
        let digitoVerificadorString = this.codigoControl + "";
        const jsonResult = {
            $: {
                'Id' : id
            },
            dDVId : digitoVerificadorString.substring(digitoVerificadorString.length-1, digitoVerificadorString.length),
            //dFecFirma : fechaUtilService.convertToJSONFormat(fechaFirmaDigital), //Fecha de la Firma Digital
            dFecFirma : fechaUtilService.convertToJSONFormat(new Date()),
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

        if (constanteService.tiposEmisiones.filter(um => um.codigo === data["tipoEmision"]).length == 0){
            throw new Error("Tipo de Emisión '" + data["tipoEmision"] + "' en data.tipoEmision no válido. Valores: " + constanteService.tiposEmisiones.map(a=>a.codigo + '-' + a.descripcion));
        }

        this.json['rDE']['DE']['gOpeDE'] = {
            iTipEmi : data['tipoEmision'],
            dDesTipEmi : constanteService.tiposEmisiones.filter(td => td.codigo == data["tipoEmision"])[0]['descripcion'],
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
            dEst : stringUtilService.leftZero(data['establecimiento'], 3),
            dPunExp : stringUtilService.leftZero(data['punto'], 3),
            dNumDoc : stringUtilService.leftZero(data['numero'], 7),
            //dSerieNum : null,
            dFeIniT : params['timbradoFecha'].substring(0, 10)
        };

        if (data['numeroSerie']) {
            this.json['rDE']['DE']['gTimb']['dSerieNum'] = data['numeroSerie'];
        }
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
            throw new Error("Tipo de Impuesto '" + data["tipoImpuesto"]) + "' en data.tipoImpuesto no válido. Valores: " + constanteService.tiposImpuestos.map(a=>a.codigo + '-' + a.descripcion);
        }
        if (constanteService.monedas.filter(um => um.codigo === data["moneda"]).length == 0){
            throw new Error("Moneda '" + data["moneda"]) + "' en data.moneda no válido. Valores: " + constanteService.monedas.map(a=>a.codigo + '-' + a.descripcion);
        }
        if (data["condicionAnticipo"]) {
            if (constanteService.globalPorItem.filter(um => um.codigo === data["condicionAnticipo"]).length == 0){
                throw new Error("Condición de Anticipo '" + data["condicionAnticipo"]) + "' en data.condicionAnticipo no válido. Valores: " + constanteService.globalPorItem.map(a=>a.codigo + '-Anticipo ' + a.descripcion);
            }    
        }
        if (constanteService.tiposTransacciones.filter(um => um.codigo === data["tipoTransaccion"]).length == 0){
            throw new Error("Tipo de Transacción '" + data["tipoTransaccion"]) + "' en data.tipoTransaccion no válido. Valores: " + constanteService.tiposTransacciones.map(a=>a.codigo + '-' + a.descripcion);
        }
        
        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom'] = {
        };

        if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
            //Obligatorio informar iTipTra D011
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iTipTra'] = data['tipoTransaccion'];
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesTipTra'] = constanteService.tiposTransacciones.filter(tt => tt.codigo == data['tipoTransaccion'])[0]['descripcion'];
        }

        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iTImp'] = data['tipoImpuesto'];   //D013
        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesTImp'] = constanteService.tiposImpuestos.filter(ti => ti.codigo == data['tipoImpuesto'])[0]['descripcion'];   //D013
        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['cMoneOpe'] = data['moneda'];  //D015
        this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesMoneOpe'] = constanteService.monedas.filter(m => m.codigo == data['moneda'])[0]['descripcion'];

        if (data['moneda'] != 'PYG') {
            if (!data['condicionTipoCambio']) {
                throw new Error("Debe informar el tipo de Cambio en data.condicionTipoCambio");
            }
            //Obligatorio informar dCondTiCam D017
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dCondTiCam'] = data['condicionTipoCambio'];
        }
        if (data['cambio'] == 1 && data['moneda'] != 'PYG') {
            
            if (!(data['cambio'] && data['cambio'] > 0)) {
                throw new Error("Debe informar el valor del Cambio en data.cambio");
            }
            //Obligatorio informar dCondTiCam D018
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dTiCam'] = data['cambio'];
        }

        if (data['condicionAnticipo']){
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['iCondAnt'] = data['condicionAnticipo'];
            this.json['rDE']['DE']['gDatGralOpe']['gOpeCom']['dDesCondAnt'] = "Anticipo " + constanteService.globalPorItem.filter(ca => ca.codigo == data['condicionAnticipo'])[0]['descripcion']
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
        let establecimiento = stringUtilService.leftZero(data['establecimiento'], 3);
        let punto = stringUtilService.leftZero(data['punto'], 3);

        if (params.establecimientos.filter((um:any) => um.codigo === establecimiento).length == 0){
            throw new Error("Establecimiento '" + establecimiento + "' no encontrado en params.establecimientos*.codigo. Valores: " + params.establecimientos.map((a:any)=>a.codigo + '-' + a.denominacion));
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
            dDirEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['direccion'],
            dNumCas : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['numeroCasa'],
            dCompDir1 : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['complementoDireccion1'],
            dCompDir2 : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['complementoDireccion2'],
            cDepEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['departamento'],
            dDesDepEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['departamentoDescripcion'],
            cDisEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['distrito'],
            dDesDisEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['distritoDescripcion'],
            cCiuEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['ciudad'],
            dDesCiuEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['ciudadDescripcion'],
            dTelEmi : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['telefono'],
            dEmailE : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['email'],
            dDenSuc : params["establecimientos"].filter( (e:any) => e.codigo === establecimiento)[0]['denominacion'],
            /*gActEco : {
                cActEco : params["actividadEconomica"],
                dDesActEco : params["actividadEconomicaDescripcion"]
            }*/
        };

        if (params["actividadesEconomicas"] && params["actividadesEconomicas"].length > 0) {
            this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gActEco'] = [];
            for (let i = 0; i < params["actividadesEconomicas"].length; i++) {
                const actividadEconomica = params["actividadesEconomicas"][i];
                const gActEco = {
                    cActEco : actividadEconomica.codigo,
                    dDesActEco : actividadEconomica.descripcion
                };
                this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gActEco'].push(gActEco);
            }
        } else {
            throw new Error("Debe proveer el array de actividades económicas en params.actividadesEconomicas");
        }
    }

    /**
     * Datos generales del responsable de generacion del DE
     * 
     * @param params 
     * @param data 
     * @param options 
     */
    private generateDatosGeneralesResponsableGeneracionDE(params: any, data: any) {

        this.json['rDE']['DE']['gDatGralOpe']['gEmis']['gRespDE'] = {
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
            if (constanteService.tiposDocumentosReceptor.filter((um:any) => um.codigo === data['cliente']['documentoTipo']).length == 0){
                throw new Error("Tipo de Documento '" + data['cliente']['documentoTipo'] + "' del Cliente en data.cliente.documentoTipo no encontrado. Valores: " + constanteService.tiposDocumentosReceptor.map((a:any)=>a.codigo + '-' + a.descripcion));
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
            dDVRec : data['cliente']['contribuyente'] ? data['cliente']['ruc'].split('-')[1] : null
        };
        /*,
            //iTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['documentoTipo'] : null,
            //dDTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? constanteService.tiposDocumentosReceptor.filter(tdr => { tdr.codigo === data['cliente']['documentoTipo']})[0]["descripcion"]  : null,
            //dNumIDRec : null,   //Sera Sobreescito D210
            dNomRec : (data['cliente']['documentoTipo'] === 5) ? "Sin Nombre": data['cliente']['razonSocial'],
            dNomFanRec : (data['cliente']['documentoTipo'] === 5) ? null: data['cliente']['nombreFantasia'],
            //dDirRec : (data['tipoDocumento'] === 7 || data['cliente']['tipoOperacion'] === 4) ? data['cliente']['direccion'] : null,
            dNumCasRec : data['cliente']['direccion'] ? data['cliente']['numeroCasa'] : null,
            cDepRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['departamento'] : null,
            dDesDepRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['departamentoDescripcion'] : null,
            cDisRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['distrito'] : null,
            dDesDisRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['distritoDescripcion'] : null,
            cCiuRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['ciudad'] : null,
            dDesCiuRec : (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['ciudadDescripcion'] : null,
            //dTelRec : data['cliente']['telefono'],
            //dCelRec : data['cliente']['celular'],
            //dEmailRec : data['cliente']['email']
            //dCodCliente : data['cliente']['']
        };*/

        if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion']) {
            //Obligatorio completar D210
            if (data['cliente']['tipoOperacion'] != 4 && !data['cliente']['documentoNumero']) {
                throw new Error("Debe informar el número de documento en data.cliente.documentoNumero");
            }
            //iTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? data['cliente']['documentoTipo'] : null,
            //dDTipIDRec : (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) ? constanteService.tiposDocumentosReceptor.filter(tdr => { tdr.codigo === data['cliente']['documentoTipo']})[0]["descripcion"]  : null,
            //dNumIDRec : null,   //Sera Sobreescito D210

            if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) {

                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['iTipIDRec'] = data['cliente']['documentoTipo'];
                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDTipIDRec'] = constanteService.tiposDocumentosReceptor.filter(tdr => { tdr.codigo === data['cliente']['documentoTipo']})[0]["descripcion"];
                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = data['cliente']['documentoNumero'];
            }

            if (data['cliente']['documentoTipo'] = 5){
                //Si es innominado completar con cero
                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumIDRec'] = "0";
            }
        }

        this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNomRec'] = (data['cliente']['documentoTipo'] === 5) ? "Sin Nombre": data['cliente']['razonSocial'];

        if (data['cliente']['documentoTipo'] === 5) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNomFanRec'] = data['cliente']['nombreFantasia'];
        }

        if (data['tipoDocumento'] === 7 || data['cliente']['tipoOperacion'] === 4) {
            if (data['cliente']['direccion']) {
                this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDirRec'] = data['cliente']['direccion'];
            }
        }

        if (data['cliente']['numeroCasa']) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dNumCasRec'] = data['cliente']['numeroCasa'];
        }
        if (data['cliente']['departamento'] && data['cliente']['tipoOperacion'] != 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDepRec'] = data['cliente']['departamento'];
        }
        if (data['cliente']['departamentoDescripcion'] && data['cliente']['tipoOperacion'] != 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDepRec'] = data['cliente']['departamentoDescripcion'];
        }
        if (data['cliente']['distrito'] && data['cliente']['tipoOperacion'] != 4) {            
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDisRec'] = data['cliente']['distrito'];
        }
        if (data['cliente']['distritoDescripcion'] && data['cliente']['tipoOperacion'] != 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDisRec'] = data['cliente']['distritoDescripcion'];
        }
        if (data['cliente']['ciudad'] && data['cliente']['tipoOperacion'] != 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cCiuRec'] = data['cliente']['ciudad'];
        }
        if (data['cliente']['ciudadDescripcion'] && data['cliente']['tipoOperacion'] != 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesCiuRec'] = data['cliente']['ciudadDescripcion'];
        }
        
        //Asignar null a departamento, distrito y ciudad si tipoOperacion = 4
    /*    if (data['cliente']['tipoOperacion'] === 4) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDepRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDepRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cDisRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesDisRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['cCiuRec'] = null;
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dDesCiuRec'] = null;
        }
    */
        if (data['cliente']['telefono'] && data['cliente']['telefono'].lenght >= 6) {
            dTelRec : data['cliente']['telefono'];
        }
        if (data['cliente']['celular'] && data['cliente']['telefono'].lenght >= 10) {
            dCelRec : data['cliente']['celular'];
        }
        if (data['cliente']['email']) {
            dEmailRec : data['cliente']['email'];
        }

        if (data['cliente']['codigo']) {
            this.json['rDE']['DE']['gDatGralOpe']['gDatRec']['dCodCliente'] = data['cliente']['codigo'];
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
            throw new Error("Indicador de Presencia '" + data['factura']['presencia'] + "' en data.factura.presencia no encontrado. Valores: " + constanteService.indicadoresPresencias.map((a:any)=>a.codigo + '-' + a.descripcion));
        }
        
        this.json['rDE']['DE']['gDtipDE']['gCamFE'] = {
            iIndPres : data['factura']['presencia'],
            dDesIndPres : constanteService.indicadoresPresencias.filter(ip => ip.codigo === data['factura']['presencia'])[0]['descripcion'],
            //dFecEmNR : data['factura']['fechaEnvio']
        };

        if (data['factura']['fechaEnvio']) {
            this.json['rDE']['DE']['gDtipDE']['gCamFE']['dFecEmNR'] = data['factura']['fechaEnvio'];
        }
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

        if (!(data['dncp'] && data['dncp']['modalidad'] && data['dncp']['modalidad'].lenght > 0)) {
            throw new Error("Debe informar la modalidad de Contratación DNCP en data.dncp.modalidad");
        }
        if (!(data['dncp'] && data['dncp']['entidad'] && data['dncp']['entidad'].lenght > 0)) {
            throw new Error("Debe informar la entidad de Contratación DNCP en data.dncp.entidad");
        }
        if (!(data['dncp'] && data['dncp']['año'] && data['dncp']['año'].lenght > 0)) {
            throw new Error("Debe informar la año de Contratación DNCP en data.dncp.año");
        }
        if (!(data['dncp'] && data['dncp']['secuencia'] && data['dncp']['secuencia'].lenght > 0)) {
            throw new Error("Debe informar la secuencia de Contratación DNCP en data.dncp.secuencia");
        }
        if (!(data['dncp'] && data['dncp']['fecha'] && data['dncp']['fecha'].lenght > 0)) {
            throw new Error("Debe informar la fecha de emisión de código de Contratación DNCP en data.dncp.fecha");
        }

        this.json['rDE']['DE']['gDtipDE']['gCamFE']['gCompPub'] = {
            dModCont : data['dncp']['modalidad'],
            dEntCont : data['dncp']['entidad'],
            dAnoCont : data['dncp']['año'],
            dSecCont : data['dncp']['secuencia'],
            dFeCodCont : data['dncp']['fecha']
        };
    }

    private generateDatosEspecificosPorTipoDE_Autofactura(params: any, data: any) {

        if (constanteService.naturalezaVendedorAutofactura.filter((um:any) => um.codigo === data['autoFactura']['tipoVendedor']).length == 0){
            throw new Error("Tipo de Vendedor '" + data['autoFactura']['tipoVendedor'] + "' en data.autoFactura.tipoVendedor no encontrado. Valores: " + constanteService.naturalezaVendedorAutofactura.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        if (constanteService.tiposDocumentosIdentidades.filter((um:any) => um.codigo === data['autoFactura']['documentoTipo']).length == 0){
            throw new Error("Tipoo de Documento '" + data['autoFactura']['documentoTipo'] + "' en data.autoFactura.documentoTipo no encontrado. Valores: " + constanteService.tiposDocumentosIdentidades.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        if (!data['autoFactura']['ubicacion']) {
            throw new Error("Debe especificar la ubicación de la transacción en data.autoFactura.ubicacion");
        }

        this.json['rDE']['DE']['gDtipDE']['gCamAE'] = {
            iNatVen : data['autoFactura']['tipoVendedor'],  //1=No contribuyente, 2=Extranjero
            dDesNatVen : constanteService.naturalezaVendedorAutofactura.filter(nv => nv.codigo === data['autoFactura']['tipoVendedor'])[0]['descripcion'],
            iTipIDVen : data['autoFactura']['documentoTipo'],
            dDTipIDVen : constanteService.tiposDocumentosIdentidades.filter(td => td.codigo === data['autoFactura']['documentoTipo'])[0]['descripcion'],
            dNumIDVen : data['autoFactura']['documentoNumero'],
            dNomVen : data['autoFactura']['nombre'],
            dDirVen : data['autoFactura']['direccion'],
            dNumCasVen : data['autoFactura']['numeroCasa'],
            cDepVen : data['autoFactura']['departamento'],
            dDesDepVen : data['autoFactura']['departamentoDescripcion'],
            cDisVen : data['autoFactura']['distrito'],
            dDesDisVen : data['autoFactura']['distritoDescripcion'],
            cCiuVen : data['autoFactura']['ciudad'],
            dDesCiuVen : data['autoFactura']['ciudadDescripcion'],
            dDirProv : data['autoFactura']['ubicacion']['lugar'],
            cDepProv : data['autoFactura']['ubicacion']['departamento'],
            dDesDepProv : data['autoFactura']['ubicacion']['departamentoDescripcion'],
            cDisProv : data['autoFactura']['ubicacion']['distrito'],
            dDesDisProv : data['autoFactura']['ubicacion']['distritoDescripcion'],
            cCiuProv : data['autoFactura']['ubicacion']['ciudad'],
            dDesCiuProv  : data['autoFactura']['ubicacion']['ciudadDescripcion'],
        };
    }

    private generateDatosEspecificosPorTipoDE_NotaCreditoDebito(params: any, data: any) {
        if (!data['notaCreditoDebito']['motivo']) {
            throw new Error("Debe completar el motivo para la nota de crédito/débito en data.notaCreditoDebito.motivo");
        }
        if (constanteService.notasCreditosMotivos.filter((um:any) => um.codigo === data['notaCreditoDebito']['motivo']).length == 0){
            throw new Error("Motivo de la Nota de Crédito/Débito '" + data['notaCreditoDebito']['motivo'] + "' en data.notaCreditoDebito.motivo no encontrado. Valores: " + constanteService.notasCreditosMotivos.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamNCDE'] = {
            iMotEmi : data['notaCreditoDebito']['motivo'],  
            dDesMotEmi : constanteService.notasCreditosMotivos.filter(nv => nv.codigo === data['notaCreditoDebito']['motivo'])[0]['descripcion'],
        };
    }

    private generateDatosEspecificosPorTipoDE_RemisionElectronica(params: any, data: any) {
        if (!(data['remision'] && data['remision']['motivo'])) {
            throw new Error("No fue pasado el Motivo de la Remisión en data.remision.motivo.");
        }
        if (!(data['remision'] && data['remision']['tipoResponsable'])) {
            throw new Error("No fue pasado el Tipo de Responsable de la Remisión en data.remision.tipoResponsable.");
        }

        if (constanteService.remisionesMotivos.filter((um:any) => um.codigo === data['remision']['motivo']).length == 0){
            throw new Error("Motivo de la Remisión '" + data['remision']['motivo'] + "' en data.remision.motivo no encontrado. Valores: " + constanteService.remisionesMotivos.map((a:any)=>a.codigo + '-' + a.descripcion));
        }
        if (constanteService.remisionesResponsables.filter((um:any) => um.codigo === data['remision']['tipoResponsable']).length == 0){
            throw new Error("Tipo de Responsable '" + data['remision']['tipoResponsable'] + "' en data.remision.tipoResponsable no encontrado. Valores: " + constanteService.remisionesResponsables.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamNRE'] = {
            iMotEmiNR : data['remision']['motivo'],  //E501
            dDesMotEmiNR : constanteService.remisionesMotivos.filter(nv => nv.codigo === data['remision']['motivo'])[0]['descripcion'],
            iRespEmiNR : data['remision']['tipoResponsable'],
            dDesRespEmiNR : constanteService.remisionesResponsables.filter(nv => nv.codigo === data['remision']['tipoResponsable'])[0]['descripcion'],
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
            throw new Error("Condición de la Operación '" + data['condicion']['tipo'] + "' en data.condicion.tipo no encontrado. Valores: " + constanteService.condicionesOperaciones.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamCond'] = {
            iCondOpe : data['condicion']['tipo'],  
            dDCondOpe : constanteService.condicionesOperaciones.filter(co => co.codigo === data['condicion']['tipo'])[0]['descripcion'],
            
        };

        //if (data['condicion']['tipo'] === 1) {
            this.generateDatosCondicionOperacionDE_Contado(params, data);
        //}

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
                    throw new Error("Condición de Tipo de Pago '" + dataEntrega['tipo'] + "' en data.condicion.entregas[" + i + "].tipo no encontrado. Valores: " + constanteService.condicionesTiposPagos.map((a:any)=>a.codigo + '-' + a.descripcion));
                }

                const cuotaInicialEntrega : any = {
                    iTiPago : dataEntrega['tipo'],  
                    dDesTiPag : constanteService.condicionesTiposPagos.filter(co => co.codigo === dataEntrega['tipo'])[0]['descripcion'],
                    dMonTiPag : dataEntrega['monto'],
                    cMoneTiPag : dataEntrega['moneda'],
                    dDMoneTiPag : dataEntrega['monedaDescripcion'],
                    //dTiCamTiPag : dataEntrega['cambio'],
                };

                if (dataEntrega['moneda'] != 'PYG') {
                    if (dataEntrega['cambio']) {
                        cuotaInicialEntrega['dTiCamTiPag'] = dataEntrega['cambio'];
                    }
                }

                //Verificar si el Pago es con Tarjeta de crédito
                if (dataEntrega['tipo'] === 3 || dataEntrega['tipo'] === 4) {
                    if (constanteService.condicionesOperaciones.filter((um:any) => um.codigo ===  dataEntrega['infoTarjeta']["tipo"]).length == 0){
                        throw new Error("Tipo de Tarjeta de Crédito '" +  dataEntrega['infoTarjeta']["tipo"] + "' en data.condicion.entregas[" + i + "].infoTarjeta.tipo no encontrado. Valores: " + constanteService.condicionesOperaciones.map((a:any)=>a.codigo + '-' + a.descripcion));
                    }
    
                    if (dataEntrega['infoTarjeta']["ruc"].indexOf("-") == -1) {
                        throw new Error("Ruc de Proveedor de Tarjeta debe contener digito verificador en data.condicion.entregas[" + i + "].infoTarjeta.ruc");
                        
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
            throw new Error("Tipo de Crédito '" +  data['condicion']['credito']['tipo'] + "' en data.condicion.credito.tipo no encontrado. Valores: " + constanteService.condicionesCreditosTipos.map((a:any)=>a.codigo + '-' + a.descripcion));
        }

        this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred'] = {
            iCondCred : data['condicion']['credito']['tipo'],
            dDCondCred : constanteService.condicionesCreditosTipos.filter(co => co.codigo === data['condicion']['credito']['tipo'])[0]['descripcion'],
            dPlazoCre : data['condicion']['credito']['tipo'] === 1 ? data['condicion']['credito']['plazo'] : null,
            //dCuotas : data['condicion']['credito']['tipo'] === 2 ? data['condicion']['credito']['cuotas'] : null,
            dMonEnt : data['condicion']['credito']['montoEntrega'],
            gCuotas : []
        }; 

        if (data['condicion']['credito']['tipo'] === 2) {
            if (data['condicion']['credito']['cuotas']) {
                this.json['rDE']['DE']['gDtipDE']['gCamCond']['gPagCred']['dCuotas'] = data['condicion']['credito']['cuotas'];
            }
        }
        

        //Recorrer array de infoCuotas e informar en el JSON
        if (data['condicion']['credito']['tipo'] === 2) {   //A Cuotas
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
            } else {
                throw new Error("Debe proporcionar data.condicion.credito.infoCuotas[]");
            }
        } 
    }

    private normalizeXML(xml: string) {
        xml = xml.split('\r\n').join('');
                xml = xml.split('\n').join('');
                xml = xml.split('\t').join('');
                xml = xml.split('    ').join('');
                xml = xml.split('>    <').join('><');
                xml = xml.split('>  <').join('><');
                xml = xml.replace(/\r?\n|\r/g, '');
        return xml;
    }

    getDepartamentos() {
        return constanteService.departamentos;
    }

    getDistritos(departamento: number) {
        return constanteService.distritos.filter(dis => dis.departamento === departamento);
    }

    getCiudades(distrito: number) {
        return constanteService.ciudades.filter(ciu => ciu.distrito === distrito);
    }

    getTiposRegimenes() {
        return constanteService.tiposRegimenes;
    }

}

export default new JSonDeMainService();
