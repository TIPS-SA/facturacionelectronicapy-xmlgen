import stringUtilService from './StringUtil.service';
import fechaUtilService from './FechaUtil.service';
import constanteService from './constants.service';
import jsonDteItemValidate from './jsonDteItemValidate.service';
import jsonDteTotales from './jsonDteTotales.service';
import { XmlgenConfig } from './type.interface.';

class JSonDeMainValidateService {
  errors: Array<string>;

  constructor() {
    this.errors = new Array<string>();
  }
  /**
   * Valida los datos ingresados en el data
   * A. Campos firmados del Documento Electrónico (A001-A099)
   *   1 - Validacion automática
   *   2 - Se realiza en el SIFEN, pero puede ser realizado en la API de integración
   *   3 - Se realiza en el SIFEN, pero puede ser realizado en la API de integración
   *   4 - Validacion automática
   *   5 - Se realiza en el SIFEN, la fecha/hora del servidor debe sincronizarse con el SIFEN
   *   6 - Falta, pero es AO
   *
   * B. Campos inherentes a la operación comercial de los Documentos Electrónicos (B001 -B099)
   *   7 - Falta
   *   8 - Validacion automática, via constante.service
   *
   * C. Campos de datos del Timbrado (C001 - C099)
   *   9 - Validacion automática, via constante.service
   *  10 - Se realiza en el SIFEN, se valida solo la primera vez
   *  11 - Se realiza en el SIFEN, se valida solo la primera vez
   *  12 - Se realiza en el SIFEN, se valida solo la primera vez
   *  13 - Se realiza en el SIFEN, se valida solo la primera vez
   *  14 - Se realiza en el SIFEN, se valida solo la primera vez
   *  15 - Se realiza en el SIFEN, se valida solo la primera vez
   *  16 - Se realiza en el SIFEN, pero puede ser realizado en la API de integración
   *
   * @param data
   */
  public validateValues(params: any, data: any, config: XmlgenConfig) {
    this.errors = new Array<string>();

    if (constanteService.tiposDocumentos.filter((um) => um.codigo === +data['tipoDocumento']).length == 0) {
      this.errors.push(
        "Tipo de Documento '" +
          data['tipoDocumento'] +
          "' en data.tipoDocumento no válido. Valores: " +
          constanteService.tiposDocumentos.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    if (typeof data['cliente'] == 'undefined') {
      this.errors.push('Debe especificar los datos del Cliente en data.cliente');
    }

    if (data['cliente']) {
      if (typeof data['cliente']['contribuyente'] == 'undefined') {
        this.errors.push(
          'Debe indicar si el Cliente es o no un Contribuyente true|false en data.cliente.contribuyente',
        );
      }

      if (typeof data['cliente']['contribuyente'] == 'undefined') {
        this.errors.push(
          'Debe indicar si el Cliente es o no un Contribuyente true|false en data.cliente.contribuyente',
        );
      }

      if (!(data['cliente']['contribuyente'] === true || data['cliente']['contribuyente'] === false)) {
        this.errors.push('data.cliente.contribuyente debe ser true|false');
      }
    }

    this.generateCodigoControlValidate(params, data);

    this.datosEmisorValidate(params, data);

    this.generateDatosOperacionValidate(params, data);

    this.generateDatosGeneralesValidate(params, data, config);

    this.generateDatosEspecificosPorTipoDEValidate(params, data);

    if (data['tipoDocumento'] == 4) {
      this.generateDatosAutofacturaValidate(params, data);
    }

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
      this.generateDatosCondicionOperacionDEValidate(params, data);
    }

    this.errors = jsonDteItemValidate.generateDatosItemsOperacionValidate(params, data, config, this.errors);

    this.generateDatosComplementariosComercialesDeUsoEspecificosValidate(params, data);

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 7) {
      //1 Opcional, 7 Obligatorio
      if (data['tipoDocumento'] == 7) {
        if (!data['detalleTransporte']) {
          this.errors.push(
            'Debe especificar el detalle de transporte en data.transporte para el Tipo de Documento = 7',
          );
        } else {
          this.generateDatosTransporteValidate(params, data);
        }
      } else {
        //Es por que tipoDocumento = 1
        if (data['detalleTransporte']) {
          this.generateDatosTransporteValidate(params, data);
        }
      }
    }

    if (data['tipoDocumento'] != 7) {
      this.generateDatosTotalesValidate(params, data, config);
    }

    if (data['complementarios']) {
      this.generateDatosComercialesUsoGeneralValidate(params, data);
    }

    if (data['moneda'] != 'PYG' && data['condicionTipoCambio'] == 1) {
      if (!data['cambio']) {
        this.errors.push(
          'Debe especificar el valor del Cambio en data.cambio cuando moneda != PYG y la Cotización es Global',
        );
      }
    }

    if (data['tipoDocumento'] == 4 || data['tipoDocumento'] == 5 || data['tipoDocumento'] == 6) {
      if (!data['documentoAsociado']) {
        this.errors.push(
          'Documento asociado es obligatorio para el tipo de documento electrónico (' +
            data['tipoDocumento'] +
            ') seleccionado',
        );
      }
    }
    if (
      data['tipoDocumento'] == 1 ||
      data['tipoDocumento'] == 4 ||
      data['tipoDocumento'] == 5 ||
      data['tipoDocumento'] == 6 ||
      data['tipoDocumento'] == 7
    ) {
      if (data['documentoAsociado']) {
        if (!Array.isArray(data['documentoAsociado'])) {
          this.generateDatosDocumentoAsociadoValidate(params, data['documentoAsociado'], data);
        } else {
          //Caso sea un array.

          for (var i = 0; i < data['documentoAsociado'].length; i++) {
            const dataDocumentoAsociado = data['documentoAsociado'][i];

            this.generateDatosDocumentoAsociadoValidate(params, dataDocumentoAsociado, data);
          }
        }
      }
    }

    //Tratamiento Final, del Envio del Error, no tocar
    if (this.errors.length > 0) {
      let errorExit: any = new Error();

      let msgErrorExit = '';

      let recorrerHasta = this.errors.length;
      if ((config.errorLimit || 3) < recorrerHasta) {
        recorrerHasta = config.errorLimit || 3;
      }

      for (let i = 0; i < recorrerHasta; i++) {
        const error = this.errors[i];
        msgErrorExit += error;

        if (i < recorrerHasta - 1) {
          msgErrorExit += config.errorSeparator + '';
        }
      }

      errorExit.message = msgErrorExit;
      /*errorExit.firstMessage = this.errors[0];
      errorExit.errorsArray = this.errors;*/
      throw errorExit;
    }
  }

  generateCodigoControlValidate(params: any, data: any) {
    if (data.cdc && (data.cdc + '').length == 44) {
      //Caso ya se le pase el CDC
      //const codigoSeguridad = data.cdc.substring(34, 43);
      const codigoControl = data.cdc;

      //Como se va utilizar el CDC enviado como parametro, va a verificar que todos los datos del XML coincidan con el CDC.
      const tipoDocumentoCDC = codigoControl.substring(0, 2);
      //const rucCDC = this.codigoControl.substring(2, 10);
      //const dvCDC = this.codigoControl.substring(10, 11);
      const establecimientoCDC = codigoControl.substring(11, 14);
      const puntoCDC = codigoControl.substring(14, 17);
      const numeroCDC = codigoControl.substring(17, 24);
      //const tipoContribuyenteCDC = this.codigoControl.substring(24, 25);
      const fechaCDC = codigoControl.substring(25, 33);
      const tipoEmisionCDC = codigoControl.substring(33, 34);

      if (+data['tipoDocumento'] != +tipoDocumentoCDC) {
        this.errors.push(
          "El Tipo de Documento '" +
            data['tipoDocumento'] +
            "' en data.tipoDocumento debe coincidir con el CDC re-utilizado (" +
            +tipoDocumentoCDC +
            ')',
        );
      }

      const establecimiento = stringUtilService.leftZero(data['establecimiento'], 3);
      if (establecimiento != establecimientoCDC) {
        this.errors.push(
          "El Establecimiento '" +
            establecimiento +
            "'en data.establecimiento debe coincidir con el CDC reutilizado (" +
            establecimientoCDC +
            ')',
        );
      }

      const punto = stringUtilService.leftZero(data['punto'], 3);
      if (punto != puntoCDC) {
        this.errors.push(
          "El Punto '" + punto + "' en data.punto debe coincidir con el CDC reutilizado (" + puntoCDC + ')',
        );
      }

      const numero = stringUtilService.leftZero(data['numero'], 7);
      if (numero != numeroCDC) {
        this.errors.push(
          "El Numero de Documento '" +
            numero +
            "'en data.numero debe coincidir con el CDC reutilizado (" +
            numeroCDC +
            ')',
        );
      }

      /*if (+data['tipoContribuyente'] != +tipoContribuyenteCDC) {
        this.errors.push("El Tipo de Contribuyente '" + data['tipoContribuyente'] + "' en data.tipoContribuyente debe coincidir con el CDC reutilizado (" + tipoContribuyenteCDC + ")");
      }*/
      const fecha =
        (data['fecha'] + '').substring(0, 4) +
        (data['fecha'] + '').substring(5, 7) +
        (data['fecha'] + '').substring(8, 10);
      if (fecha != fechaCDC) {
        this.errors.push(
          "La fecha '" + fecha + "' en data.fecha debe coincidir con el CDC reutilizado (" + fechaCDC + ')',
        );
      }

      if (+data['tipoEmision'] != +tipoEmisionCDC) {
        this.errors.push(
          "El Tipo de Emisión '" +
            data['tipoEmision'] +
            "' en data.tipoEmision debe coincidir con el CDC reutilizado (" +
            tipoEmisionCDC +
            ')',
        );
      }
    }
  }

  private datosEmisorValidate(params: any, data: any) {
    if (params['ruc'].indexOf('-') == -1) {
      this.errors.push('RUC debe contener dígito verificador en params.ruc');
    }
    let rucEmisor = params['ruc'].split('-')[0];
    const dvEmisor = params['ruc'].split('-')[1];

    var reg = new RegExp(/^\d+$/);
    /*if (!reg.test(rucEmisor)) {
      this.errors.push("La parte que corresponde al RUC '" + params['ruc'] + "' en params.ruc debe ser numérico");
    }*/
    if (rucEmisor.length > 8) {
      this.errors.push(
        "La parte que corresponde al RUC '" + params['ruc'] + "' en params.ruc debe contener de 1 a 8 caracteres",
      );
    }

    if (!reg.test(dvEmisor)) {
      this.errors.push(
        "La parte que corresponde al DV del RUC '" + params['ruc'] + "' en params.ruc debe ser numérico",
      );
    }
    if (dvEmisor > 9) {
      this.errors.push(
        "La parte que corresponde al DV del RUC '" + params['ruc'] + "' en params.ruc debe ser del 1 al 9",
      );
    }

    if (!((params['timbradoNumero'] + '').length == 8)) {
      this.errors.push('Debe especificar un Timbrado de 8 caracteres en params.timbradoNumero');
    }

    if (!fechaUtilService.isIsoDate(params['timbradoFecha'])) {
      this.errors.push(
        "Valor de la Fecha '" + params['timbradoFecha'] + "' en params.fecha no válido. Formato: yyyy-MM-dd",
      );
    }

    if (params['tipoRegimen']) {
      if (constanteService.tiposRegimenes.filter((um) => um.codigo === params['tipoRegimen']).length == 0) {
        this.errors.push(
          "Tipo de Regimen '" +
            data['tipoRegimen'] +
            "' en params.tipoRegimen no válido. Valores: " +
            constanteService.tiposRegimenes.map((a) => a.codigo + '-' + a.descripcion),
        );
      }
    }

    if (!params['razonSocial']) {
      this.errors.push('La razon social del emisor en params.razonSocial no puede ser vacio');
    } else {
      if (!((params['razonSocial'] + '').length >= 4 && (params['razonSocial'] + '').length <= 250)) {
        this.errors.push(
          "La razon Social del Emisor '" +
            params['razonSocial'] +
            "' en params.razonSocial debe tener de 4 a 250 caracteres",
        );
      }
    }

    if (params['nombreFantasia'] && (params['nombreFantasia'] + '').length > 0) {
      if (!((params['nombreFantasia'] + '').length >= 4 && (params['nombreFantasia'] + '').length <= 250)) {
        this.errors.push(
          "El nombre de Fantasia del Emisor '" +
            params['nombreFantasia'] +
            "' en params.nombreFantasia debe tener de 4 a 250 caracteres",
        );
      }
    }

    //Aqui hay que verificar los datos de las sucursales
    if (!(params['establecimientos'] && Array.isArray(params['establecimientos']))) {
      this.errors.push('Debe especificar un array de establecimientos en params.establecimientos');
    } else {
      for (let i = 0; i < params['establecimientos'].length; i++) {
        const establecimiento = params['establecimientos'][i];

        if (!establecimiento.codigo) {
          this.errors.push(
            'Debe especificar el código del establecimiento en params.establecimientos[' + i + '].codigo',
          );
        }

        if (establecimiento['telefono']) {
          if (!(establecimiento['telefono'].length >= 6 && establecimiento['telefono'].length <= 15)) {
            this.errors.push(
              "El valor '" +
                establecimiento['telefono'] +
                "' en params.establecimientos[" +
                i +
                '].telefono debe tener una longitud de 6 a 15 caracteres',
            );
          } else {
            if (
              (establecimiento['telefono'] + '').includes('(') ||
              (establecimiento['telefono'] + '').includes(')') ||
              (establecimiento['telefono'] + '').includes('[') ||
              (establecimiento['telefono'] + '').includes(']')
            ) {
              /*this.errors.push(
                "El valor '" +
                  establecimiento['telefono'] +
                  "' en params.establecimientos[" +
                  i +
                  '].telefono no puede contener () o []',
              );*/
              //Finalmente no da error en SIFEN por esto
            }
          }
        }
      }
    }
  }

  private generateDatosOperacionValidate(params: any, data: any) {
    /*if (params['ruc'].indexOf('-') == -1) { //removido temporalmente, parece que no hace falta
      this.errors.push('RUC debe contener dígito verificador en params.ruc');
    }*/

    if (constanteService.tiposEmisiones.filter((um) => um.codigo === data['tipoEmision']).length == 0) {
      this.errors.push(
        "Tipo de Emisión '" +
          data['tipoEmision'] +
          "' en data.tipoEmision no válido. Valores: " +
          constanteService.tiposEmisiones.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    //Validar aqui "dInfoFisc"
    if (data['tipoDocumento'] == 7) {
      //Nota de Remision
      if (!(data['descripcion'] && (data['descripcion'] + '').trim().length > 0)) {
        //Segun dicen en TDE no es obligatorio, entonces se retira la validacion.
        //this.errors.push('Debe informar la Descripción en data.descripcion para el Documento Electrónico');
      }
    }
  }

  private generateDatosGeneralesValidate(params: any, data: any, config: XmlgenConfig) {
    this.generateDatosGeneralesInherentesOperacionValidate(params, data);

    this.generateDatosGeneralesEmisorDEValidate(params, data);

    if (config.userObjectRemove == false) {
      //Si está TRUE no crea el objeto usuario
      if (data['usuario']) {
        //No es obligatorio
        this.generateDatosGeneralesResponsableGeneracionDEValidate(params, data);
      }
    }
    this.generateDatosGeneralesReceptorDEValidate(params, data);
  }

  private generateDatosGeneralesInherentesOperacionValidate(params: any, data: any) {
    if (data['tipoDocumento'] == 7) {
      //C002
      return; //No informa si el tipo de documento es 7
    }

    if (!fechaUtilService.isIsoDateTime(data['fecha'])) {
      this.errors.push(
        "Valor de la Fecha '" + data['fecha'] + "' en data.fecha no válido. Formato: yyyy-MM-ddTHH:mm:ss",
      );
    }

    if (!data['tipoImpuesto']) {
      this.errors.push('Debe especificar el Tipo de Impuesto en data.tipoImpuesto');
    } else {
      if (constanteService.tiposImpuestos.filter((um) => um.codigo === +data['tipoImpuesto']).length == 0) {
        this.errors.push(
          "Tipo de Impuesto '" +
            data['tipoImpuesto'] +
            "' en data.tipoImpuesto no válido. Valores: " +
            constanteService.tiposImpuestos.map((a) => a.codigo + '-' + a.descripcion),
        );
      }
    }

    let moneda = data['moneda'];
    if (!moneda) {
      moneda = 'PYG';
    }

    if (constanteService.monedas.filter((um) => um.codigo === moneda).length == 0) {
      this.errors.push(
        "Moneda '" +
          moneda +
          "' en data.moneda no válido. Valores: " +
          constanteService.monedas.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    if (data['condicionAnticipo']) {
      if (constanteService.globalPorItem.filter((um) => um.codigo === data['condicionAnticipo']).length == 0) {
        this.errors.push(
          "Condición de Anticipo '" +
            data['condicionAnticipo'] +
            "' en data.condicionAnticipo no válido. Valores: " +
            constanteService.globalPorItem.map((a) => a.codigo + '-Anticipo ' + a.descripcion),
        );
      }
    } else {
      //condicionAnticipo - si no tiene condicion anticipo, pero tipo transaccion es 9, que de un error.
    }

    if (constanteService.tiposTransacciones.filter((um) => um.codigo === data['tipoTransaccion']).length == 0) {
      this.errors.push(
        "Tipo de Transacción '" +
          data['tipoTransaccion'] +
          "' en data.tipoTransaccion no válido. Valores: " +
          constanteService.tiposTransacciones.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 4) {
      //Obligatorio informar iTipTra D011
      if (!data['tipoTransaccion']) {
        this.errors.push('Debe proveer el Tipo de Transacción en data.tipoTransaccion');
      }
    }

    if (moneda != 'PYG') {
      if (!data['condicionTipoCambio']) {
        this.errors.push('Debe informar el tipo de Cambio en data.condicionTipoCambio');
      }
    }

    if (data['condicionTipoCambio'] == 1 && moneda != 'PYG') {
      if (!(data['cambio'] && data['cambio'] > 0)) {
        this.errors.push('Debe informar el valor del Cambio en data.cambio');
      }
    }

    if (data['obligaciones']) {
      if (!Array.isArray(data['obligaciones'])) {
        this.errors.push('El valor de data.obligaciones debe ser un Array');
      } else {
        for (let i = 0; i < data['obligaciones'].length; i++) {
          let obligacion = data['obligaciones'][i];

          if (!obligacion.codigo) {
            this.errors.push('No fue especificado un código en data.obligaciones[' + i + '].codigo');
          } else {
            //Verificar cada item
            if (constanteService.obligaciones.filter((um) => um.codigo === +obligacion.codigo).length == 0) {
              this.errors.push(
                "Obligación '" +
                  obligacion.codigo +
                  "' en data.obligaciones[" +
                  i +
                  '].codigo no válido. Valores: ' +
                  constanteService.obligaciones.map((a) => a.codigo + '-' + a.descripcion),
              );
            }
          }
        }
      }
    }
  }

  private generateDatosGeneralesEmisorDEValidate(params: any, data: any) {
    const regExpOnlyNumber = new RegExp(/^\d+$/);

    if (!(params && params.establecimientos)) {
      this.errors.push('Debe proveer un Array con la información de los establecimientos en params');
    }

    //Validar si el establecimiento viene en params
    let establecimiento = stringUtilService.leftZero(data['establecimiento'], 3);
    //let punto = stringUtilService.leftZero(data['punto'], 3);

    if (params.establecimientos.filter((um: any) => um.codigo === establecimiento).length == 0) {
      this.errors.push(
        "Establecimiento '" +
          establecimiento +
          "' no encontrado en params.establecimientos*.codigo. Valores: " +
          params.establecimientos.map((a: any) => a.codigo + '-' + a.denominacion),
      );
    }

    /*if (params['ruc'].indexOf('-') == -1) { //Removido temporalmente, al parecer no hace falta
      this.errors.push('RUC debe contener dígito verificador en params.ruc');
    }*/

    if (!(params['actividadesEconomicas'] && params['actividadesEconomicas'].length > 0)) {
      this.errors.push('Debe proveer el array de actividades económicas en params.actividadesEconomicas');
    }

    //Validacion de algunos datos de la sucursal
    const establecimientoUsado = params['establecimientos'].filter((e: any) => e.codigo === establecimiento)[0];

    if (!establecimientoUsado) {
      this.errors.push(
        'Debe especificar los datos del Establecimiento "' + establecimiento + '" en params.establecimientos*',
      );
    } else {
      if (!establecimientoUsado.ciudad) {
        this.errors.push('Debe proveer la Ciudad del establecimiento en params.establecimientos*.ciudad');
      }
      if (!establecimientoUsado.distrito) {
        this.errors.push('Debe proveer la Distrito del establecimiento en params.establecimientos*.distrito');
      }
      if (!establecimientoUsado.departamento) {
        this.errors.push('Debe proveer la Departamento del establecimiento en params.establecimientos*.departamento');
      }

      constanteService.validateDepartamentoDistritoCiudad(
        'params.establecimientos*',
        +establecimientoUsado.departamento,
        +establecimientoUsado.distrito,
        +establecimientoUsado.ciudad,
        this.errors,
      );

      if (establecimientoUsado['numeroCasa']) {
        if (!regExpOnlyNumber.test(establecimientoUsado['numeroCasa'])) {
          this.errors.push('El Número de Casa en params.establecimientos*.numeroCasa debe ser numérico');
        }
      }
    }
  }

  private generateDatosGeneralesResponsableGeneracionDEValidate(params: any, data: any) {
    if (
      constanteService.tiposDocumentosIdentidades.filter((um: any) => um.codigo === +data['usuario']['documentoTipo'])
        .length == 0
    ) {
      this.errors.push(
        "Tipo de Documento '" +
          data['usuario']['documentoTipo'] +
          "' no encontrado en data.usuario.documentoTipo. Valores: " +
          constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['usuario']['documentoNumero']) {
      this.errors.push('El Documento del Responsable en data.usuario.documentoNumero no puede ser vacio');
    }

    if (!data['usuario']['nombre']) {
      this.errors.push('El Nombre del Responsable en data.usuario.nombre no puede ser vacio');
    }

    if (!data['usuario']['cargo']) {
      this.errors.push('El Cargo del Responsable en data.usuario.cargo no puede ser vacio');
    }
  }

  private generateDatosGeneralesReceptorDEValidate(params: any, data: any) {
    if (!data['cliente']) {
      return; //El error de cliente vacio, ya fue validado arriba
    }

    if (!data['cliente']['tipoOperacion']) {
      this.errors.push('Tipo de Operación del Cliente en data.cliente.tipoOperacion es requerido > 0');
    } else {
      if (
        constanteService.tiposOperaciones.filter((um: any) => um.codigo === +data['cliente']['tipoOperacion']).length ==
        0
      ) {
        this.errors.push(
          "Tipo de Operación '" +
            data['cliente']['tipoOperacion'] +
            "' del Cliente en data.cliente.tipoOperacion no encontrado. Valores: " +
            constanteService.tiposOperaciones.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }
    }
    if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) {
      if (
        constanteService.tiposDocumentosReceptor.filter((um: any) => um.codigo === +data['cliente']['documentoTipo'])
          .length == 0
      ) {
        this.errors.push(
          "Tipo de Documento '" +
            data['cliente']['documentoTipo'] +
            "' del Cliente en data.cliente.documentoTipo no encontrado. Valores: " +
            constanteService.tiposDocumentosReceptor.map((a: any) => a.codigo + '-' + a.descripcion),
        );

        if (+data['cliente']['documentoTipo'] == 9) {
          if (!data['cliente']['documentoTipoDescripcion']) {
            this.errors.push(
              'Debe especificar la Descripción para el tipo de Documento en data.cliente.documentoTipoDescripcion para documentoTipo=9',
            );
          }
        }
      }
    }

    var regExpOnlyNumber = new RegExp(/^\d+$/);
    if (data['cliente']['contribuyente']) {
      if (!data['cliente']['ruc']) {
        this.errors.push('Debe proporcionar el RUC en data.cliente.ruc');
      } else {
        if (data['cliente']['ruc'].indexOf('-') == -1) {
          this.errors.push('RUC debe contener dígito verificador en data.cliente.ruc');
        }

        const rucCliente = data['cliente']['ruc'].split('-');

        //Un RUC puede ser alphanumerico
        /*if (!regExpOnlyNumber.test((rucCliente[0] + '').trim())) {
          this.errors.push(
            "La parte del RUC del Cliente '" + data['cliente']['ruc'] + "' en data.cliente.ruc debe ser numérico",
          );
        }*/
        if (!regExpOnlyNumber.test((rucCliente[1] + '').trim())) {
          this.errors.push(
            "La parte del DV del RUC del Cliente '" +
              data['cliente']['ruc'] +
              "' en data.cliente.ruc debe ser numérico",
          );
        }

        if (!(rucCliente[0].length >= 3 && rucCliente[0].length <= 8)) {
          this.errors.push(
            "La parte del RUC '" + data['cliente']['ruc'] + "' en data.cliente.ruc debe contener de 3 a 8 caracteres",
          );
        }

        if (rucCliente[1] > 9) {
          this.errors.push(
            "La parte del DV del RUC '" + data['cliente']['ruc'] + "' en data.cliente.ruc debe ser del 1 al 9",
          );
        }
      }

      if (!data['cliente']['tipoContribuyente']) {
        this.errors.push('Debe proporcionar el Tipo de Contribuyente en data.cliente.tipoContribuyente');
      }
    }

    if (!data['cliente']['razonSocial']) {
      this.errors.push('La razon social del receptor en data.cliente.razonSocial no puede ser vacio');
    } else {
      if (!((data['cliente']['razonSocial'] + '').length >= 4 && (data['cliente']['razonSocial'] + '').length <= 250)) {
        this.errors.push(
          "La razon Social del Cliente '" +
            data['cliente']['razonSocial'] +
            "' en data.cliente.razonSocial debe tener de 4 a 250 caracteres",
        );
      }
    }

    if (data['cliente']['nombreFantasia'] && (data['cliente']['nombreFantasia'] + '').length > 0) {
      if (
        !(
          (data['cliente']['nombreFantasia'] + '').length >= 4 && (data['cliente']['nombreFantasia'] + '').length <= 250
        )
      ) {
        this.errors.push(
          "El nombre de Fantasia del Cliente '" +
            data['cliente']['nombreFantasia'] +
            "' en data.cliente.nombreFantasia debe tener de 4 a 250 caracteres",
        );
      }
    }

    if (constanteService.paises.filter((pais: any) => pais.codigo === data['cliente']['pais']).length == 0) {
      this.errors.push(
        "Pais '" +
          data['cliente']['pais'] +
          "' del Cliente en data.cliente.pais no encontrado. Valores: " +
          constanteService.paises.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (data['tipoDocumento'] == 4) {
      if (data['cliente']['tipoOperacion'] != 2) {
        this.errors.push('El Tipo de Operación debe ser 2-B2C para el Tipo de Documento AutoFactura');
      }
    }

    if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion']) {
      //No es contribuyente
      //Obligatorio completar D210

      if (!data['cliente']['contribuyente'] && data['cliente']['tipoOperacion'] != 4) {
        if (!data['cliente']['documentoTipo']) {
          //Val.: 59
          this.errors.push('Debe informar el Tipo de Documento del Cliente en data.cliente.documentoTipo');
        }

        //Cuando el campo puede ser un número, y se admite el valor cero, mejor preguntar de ésta forma
        if (typeof data['cliente']['documentoNumero'] == 'undefined') {
          //Val.: 65
          this.errors.push('Debe informar el número de documento en data.cliente.documentoNumero');
        } else {
          //Validar que documentoNumero no tenga .
          if ((data['cliente']['documentoNumero'] + '').indexOf('.') > -1) {
            this.errors.push(
              'El valor "' + data['cliente']['documentoNumero'] + '" en data.cliente.documentoNumero no es válido ',
            );
          }
          //Validar que documentoNumero no tenga /
          if ((data['cliente']['documentoNumero'] + '').indexOf('/') > -1) {
            this.errors.push(
              'El valor "' + data['cliente']['documentoNumero'] + '" en data.cliente.documentoNumero no es válido ',
            );
          }
        }
      }
    }

    if (
      !data['cliente']['contribuyente'] &&
      data['tipoDocumento'] != 4 &&
      data['cliente']['tipoOperacion'] != 2 &&
      data['cliente']['tipoOperacion'] != 4
    ) {
      //Val.: 46. parrafo 1
      this.errors.push('El tipo de Operación debe ser 2-B2C o 4-B2F para el Receptor "No Contribuyente"');
    }

    if (data['cliente']['tipoOperacion'] == 4 && data['cliente']['contribuyente'] == true) {
      //Val.: 46. parrafo 2
      this.errors.push('La naturaleza del Receptor debe ser "No contribuyente" para el Tipo de Operación = 4-B2F');
    }

    //Temporal Mercosys
    /*if (data['tipoDocumento'] === 7 || data['cliente']['tipoOperacion'] === 4) {
      if (!data['cliente']['direccion']) {
        this.errors.push('data.cliente.direccion es Obligatorio para Tipo de Documento 7 o Tipo de Operación 4');
      }
    }*/

    if (data['tipoDocumento'] === 7) {
      if (!data['cliente']['direccion']) {
        this.errors.push('data.cliente.direccion es Obligatorio para Tipo de Documento 7');
      }
    }

    if (data['cliente']['direccion']) {
      //Si tiene dirección hay que completar numero de casa.

      if (
        !(
          (data['cliente']['direccion'] + '').trim().length >= 1 &&
          (data['cliente']['direccion'] + '').trim().length <= 255
        )
      ) {
        this.errors.push(
          "La dirección del Receptor '" +
            data['cliente']['direccion'] +
            "' en data.cliente.direccion debe tener de 1 a 255 caracteres",
        );
      }

      if (data['cliente']['numeroCasa'] == null) {
        this.errors.push('Debe informar el Número de casa del Receptor en data.cliente.numeroCasa');
      }

      if (!((data['cliente']['numeroCasa'] + '').length > 0)) {
        this.errors.push('Debe informar el Número de casa del Receptor en data.cliente.numeroCasa');
      }

      //Nueva forma de validar campos numericos
      /*
      if (  ! ( data['cliente']['numeroCasa'] != null && 
                (data['cliente']['numeroCasa'] + '').length > 0 &&
                regExpOnlyNumber.test(data['cliente']['numeroCasa']) )
      ) {
        this.errors.push('Debe informar el Número de casa del Receptor en data.cliente.numeroCasa');
      }
      */
    }

    if (data['cliente']['numeroCasa']) {
      if (!regExpOnlyNumber.test(data['cliente']['numeroCasa'])) {
        this.errors.push('El Número de Casa en data.cliente.numeroCasa debe ser numérico');
      }
    }

    if (data['cliente']['direccion'] && data['cliente']['tipoOperacion'] != 4) {
      if (!data['cliente']['ciudad']) {
        this.errors.push('Obligatorio especificar la Ciudad en data.cliente.ciudad para Tipo de Operación != 4');
      } else {
        if (
          constanteService.ciudades.filter((ciudad: any) => ciudad.codigo === +data['cliente']['ciudad']).length == 0
        ) {
          this.errors.push(
            "Ciudad '" +
              data['cliente']['ciudad'] +
              "' del Cliente en data.cliente.ciudad no encontrado. Valores: " +
              constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
          );
        }

        //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
        //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
        //data['cliente']['distrito'] y data['cliente']['departamento']
        let objCiudad: any = constanteService.ciudades.filter((ciu) => ciu.codigo === +data['cliente']['ciudad']);

        if (objCiudad && objCiudad[0]) {
          let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

          let objDepartamento: any = constanteService.departamentos.filter(
            (dep) => dep.codigo === +objDistrito[0]['departamento'],
          );

          data['cliente']['distrito'] = objDistrito[0]['codigo'];

          data['cliente']['departamento'] = objDepartamento[0]['codigo'];
        }
      }

      if (!data['cliente']['distrito']) {
        this.errors.push('Obligatorio especificar el Distrito en data.cliente.distrito para Tipo de Operación != 4');
      } else if (
        constanteService.distritos.filter((distrito: any) => distrito.codigo === +data['cliente']['distrito']).length ==
        0
      ) {
        this.errors.push(
          "Distrito '" +
            data['cliente']['distrito'] +
            "' del Cliente en data.cliente.distrito no encontrado. Valores: " +
            constanteService.distritos.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      if (!data['cliente']['departamento']) {
        this.errors.push(
          'Obligatorio especificar el Departamento en data.cliente.departamento para Tipo de Operación != 4',
        );
      } else if (
        constanteService.departamentos.filter(
          (departamento: any) => departamento.codigo === +data['cliente']['departamento'],
        ).length == 0
      ) {
        this.errors.push(
          "Departamento '" +
            data['cliente']['departamento'] +
            "' del Cliente en data.cliente.departamento no encontrado. Valores: " +
            constanteService.departamentos.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }

      //console.log("distrito", data['cliente']['distrito'], "ciudad", data['cliente']['ciudad'], "departamento", data['cliente']['departamento']);
      constanteService.validateDepartamentoDistritoCiudad(
        'data.cliente',
        +data['cliente']['departamento'],
        +data['cliente']['distrito'],
        +data['cliente']['ciudad'],
        this.errors,
      );
    }

    if (data['cliente']['tipoOperacion'] == 4) {
      if (data['cliente']['pais'] == 'PRY') {
        this.errors.push('El tipo de Operación = 4-B2F requiere un pais diferente a PRY');
      }
    }

    if (data['cliente']['telefono']) {
      if (!(data['cliente']['telefono'].length >= 6 && data['cliente']['telefono'].length <= 15)) {
        this.errors.push(
          "El valor '" +
            data['cliente']['telefono'] +
            "' en data.cliente.telefono debe tener una longitud de 6 a 15 caracteres",
        );
      } else {
        if (
          (data['cliente']['telefono'] + '').includes('(') ||
          (data['cliente']['telefono'] + '').includes(')') ||
          (data['cliente']['telefono'] + '').includes('[') ||
          (data['cliente']['telefono'] + '').includes(']')
        ) {
          /*this.errors.push(
            "El valor '" + data['cliente']['telefono'] + "' en data.cliente.telefono no puede contener () o []",
          );*/
          //Finalmente no da error en SIFEN por esto
        }
      }
    }

    const validateNumeroCelular = (celular: any, errors: any) => {
      if (!(celular.length >= 10 && celular.length <= 20)) {
        errors.push("El valor '" + celular + "' en data.cliente.celular debe tener una longitud de 10 a 20 caracteres");
      } else {
        if (
          (celular + '').includes('(') ||
          (celular + '').includes(')') ||
          (celular + '').includes('[') ||
          (celular + '').includes(']') ||
          (celular + '').includes(';') ||
          (celular + '').includes('=') ||
          (celular + '').includes('/') ||
          (celular + '').includes('\\')
        ) {
          errors.push("El valor '" + celular + "' en data.cliente.celular no puede contener (), [] o ;");
        }
      }
    };

    if (data['cliente']['celular']) {
      //Primero verificar si el celular tiene comas
      if ((data['cliente']['celular'] + '').includes(',')) {
        let celulares = data['cliente']['celular'].split(',');
        for (let i = 0; i < celulares.lenght; i++) {
          validateNumeroCelular(celulares[i], this.errors);
        }
      } else {
        validateNumeroCelular(data['cliente']['celular'], this.errors);
      }
    }

    if (data['cliente']['email']) {
      let email = new String(data['cliente']['email']); //Hace una copia, para no alterar.

      //Verificar si tiene varios correos.
      if (email.indexOf(',') > -1) {
        //Si el Email tiene , (coma) entonces va enviar solo el primer valor, ya que SIFEN no acepta Comas
        email = email.split(',')[0].trim();
      }

      //Verificar espacios
      if (email.indexOf(' ') > -1) {
        this.errors.push("El valor '" + email + "' en data.cliente.email no puede poseer espacios");
      }

      if (!(email.length >= 3 && email.length <= 80)) {
        this.errors.push("El valor '" + email + "' en data.cliente.email debe tener una longitud de 3 a 80 caracteres");
      }

      //se valida el mail
      var regExEmail = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm);
      if (!regExEmail.test(email + '')) {
        this.errors.push("El valor '" + email + "' en data.cliente.email es inválido");
      }
    }

    if (data['cliente']['codigo']) {
      if (!((data['cliente']['codigo'] + '').length >= 3 && (data['cliente']['codigo'] + '').length <= 15)) {
        this.errors.push(
          "El código del Cliente '" +
            data['cliente']['codigo'] +
            "' en data.cliente.codigo debe tener de 3 a 15 caracteres",
        );
      }
    }
  }

  private generateDatosEspecificosPorTipoDEValidate(params: any, data: any) {
    if (data['tipoDocumento'] === 1) {
      this.generateDatosEspecificosPorTipoDE_FacturaElectronicaValidate(params, data);
    }
    if (data['tipoDocumento'] === 4) {
      this.generateDatosEspecificosPorTipoDE_AutofacturaValidate(params, data);
    }

    if (data['tipoDocumento'] === 5 || data['tipoDocumento'] === 6) {
      this.generateDatosEspecificosPorTipoDE_NotaCreditoDebitoValidate(params, data);
    }

    if (data['tipoDocumento'] === 7) {
      this.generateDatosEspecificosPorTipoDE_RemisionElectronicaValidate(params, data);
    }
  }

  private generateDatosEspecificosPorTipoDE_FacturaElectronicaValidate(params: any, data: any) {
    if (!data['factura']) {
      this.errors.push('Debe indicar los datos especificos de la Factura en data.factura');
      return; // Termina el metodos
    }

    if (
      constanteService.indicadoresPresencias.filter((um: any) => um.codigo === +data['factura']['presencia']).length ==
      0
    ) {
      this.errors.push(
        "Indicador de Presencia '" +
          data['factura']['presencia'] +
          "' en data.factura.presencia no encontrado. Valores: " +
          constanteService.indicadoresPresencias.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (data['factura']['fechaEnvio']) {
      let fechaFactura = new Date(data['fecha']);
      let fechaEnvio = new Date(data['factura']['fechaEnvio']);

      if (fechaFactura.getTime() > fechaEnvio.getTime()) {
        this.errors.push(
          "La Fecha de envío '" +
            data['factura']['fechaEnvio'] +
            "'en data.factura.fechaEnvio, debe ser despues de la fecha de Factura",
        );
      }
    }

    if (data['cliente']['tipoOperacion'] === 3) {
      this.generateDatosEspecificosPorTipoDE_ComprasPublicasValidate(params, data);
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
  private generateDatosEspecificosPorTipoDE_ComprasPublicasValidate(params: any, data: any) {
    if (!(data['dncp'] && data['dncp']['modalidad'] && (data['dncp']['modalidad'] + '').length == 2)) {
      this.errors.push('Debe informar la modalidad de Contratación DNCP  (2 digitos) en data.dncp.modalidad');
    }
    /*if (
      !(data['dncp'] && data['dncp']['entidad'] && +data['dncp']['entidad'] > 9999 && +data['dncp']['entidad'] < 100000)
    ) {*/
    if (!(data['dncp'] && data['dncp']['entidad'] && (data['dncp']['entidad'] + '').length == 5)) {
      this.errors.push('Debe informar la entidad de Contratación DNCP (5 digitos) en data.dncp.entidad');
    }
    //if (!(data['dncp'] && data['dncp']['año'] && +data['dncp']['año'] > 0 && +data['dncp']['año'] < 100)) {
    if (!(data['dncp'] && data['dncp']['año'] && (data['dncp']['año'] + '').length == 2)) {
      this.errors.push('Debe informar el año de Contratación DNCP (2 digitos) en data.dncp.año');
    }
    /*if (
      !(
        data['dncp'] &&
        data['dncp']['secuencia'] &&
        +data['dncp']['secuencia'] > 999999 &&
        +data['dncp']['secuencia'] < 10000000
      )
    ) {
      this.errors.push('Debe informar la secuencia de Contratación DNCP (7 digitos) en data.dncp.secuencia');
    }*/
    if (!(data['dncp'] && data['dncp']['secuencia'] && (data['dncp']['secuencia'] + '').length == 7)) {
      this.errors.push('Debe informar la secuencia de Contratación DNCP (7 digitos) en data.dncp.secuencia');
    }
    if (!(data['dncp'] && data['dncp']['fecha'] && (data['dncp']['fecha'] + '').length > 0)) {
      this.errors.push('Debe informar la fecha de emisión de código de Contratación DNCP en data.dncp.fecha');
    } else {
      if (!fechaUtilService.isIsoDate(data['dncp']['fecha'])) {
        this.errors.push(
          "Fecha DNCP '" + data['dncp']['fecha'] + "' en data.dncp.fecha no válida. Formato: yyyy-MM-dd",
        );
      }
    }
  }

  private generateDatosEspecificosPorTipoDE_AutofacturaValidate(params: any, data: any) {
    if (!data['autoFactura']) {
      this.errors.push('Para tipoDocumento = 4 debe proveer los datos de Autofactura en data.autoFactura');
    }
    if (!data['autoFactura']['ubicacion']) {
      this.errors.push(
        'Para tipoDocumento = 4 debe proveer los datos del Lugar de Transacción de la Autofactura en data.autoFactura.ubicacion',
      );
    }

    if (!data['autoFactura']['tipoVendedor']) {
      this.errors.push('Debe especificar la Naturaleza del Vendedor en data.autoFactura.tipoVendedor');
    }

    if (!data['autoFactura']['documentoTipo']) {
      this.errors.push('Debe especificar el Tipo de Documento del Vendedor en data.autoFactura.documentoTipo');
    }

    if (
      constanteService.naturalezaVendedorAutofactura.filter(
        (um: any) => um.codigo === data['autoFactura']['tipoVendedor'],
      ).length == 0
    ) {
      this.errors.push(
        "Tipo de Vendedor '" +
          data['autoFactura']['tipoVendedor'] +
          "' en data.autoFactura.tipoVendedor no encontrado. Valores: " +
          constanteService.naturalezaVendedorAutofactura.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (
      constanteService.tiposDocumentosIdentidades.filter(
        (um: any) => um.codigo === data['autoFactura']['documentoTipo'],
      ).length == 0
    ) {
      this.errors.push(
        "Tipo de Documento '" +
          data['autoFactura']['documentoTipo'] +
          "' en data.autoFactura.documentoTipo no encontrado. Valores: " +
          constanteService.tiposDocumentosIdentidades.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['autoFactura']['ubicacion']) {
      this.errors.push('Debe especificar la ubicación de la transacción en data.autoFactura.ubicacion');
    }

    if (!data['autoFactura']['documentoNumero']) {
      this.errors.push('Debe especificar el Nro. de Documento del Vendedor en data.autoFactura.documentoNumero');
    }
    if (!data['autoFactura']['nombre']) {
      this.errors.push('Debe especificar el Nombre del Vendedor en data.autoFactura.nombre');
    }
    if (!data['autoFactura']['direccion']) {
      this.errors.push('Debe especificar la Dirección del Vendedor en data.autoFactura.direccion');
    }
    if (!data['autoFactura']['numeroCasa']) {
      this.errors.push('Debe especificar el Número de Casa del Vendedor en data.autoFactura.numeroCasa');
    }

    let errorDepDisCiu = false;
    let errorDepDisCiuUbi = false;

    if (!data['autoFactura']['ciudad']) {
      this.errors.push('Debe especificar la Ciudad del Vendedor en data.autoFactura.ciudad');
      errorDepDisCiu = true;
    } else {
      if (
        constanteService.ciudades.filter((ciudad: any) => ciudad.codigo === +data['autoFactura']['ciudad']).length == 0
      ) {
        this.errors.push(
          "Ciudad '" +
            data['autoFactura']['ciudad'] +
            "' del Cliente en data.autoFactura.ciudad no encontrado. Valores: " +
            constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
        errorDepDisCiu = true;
      }

      //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
      //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
      //data['autoFactura']['ciudad']['distrito'] y data['autoFactura']['ciudad']['departamento']
      let objCiudad: any = constanteService.ciudades.filter((ciu) => ciu.codigo === +data['autoFactura']['ciudad']);

      if (objCiudad && objCiudad[0]) {
        let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

        let objDepartamento: any = constanteService.departamentos.filter(
          (dep) => dep.codigo === +objDistrito[0]['departamento'],
        );

        //Solo actualiza si no tiene valor
        if (!data['autoFactura']['distrito']) data['autoFactura']['distrito'] = objDistrito[0]['codigo'];

        if (!data['autoFactura']['departamento']) data['autoFactura']['departamento'] = objDepartamento[0]['codigo'];
      }

      if (errorDepDisCiu) {
        if (!data['autoFactura']['departamento']) {
          this.errors.push('Debe especificar el Departamento del Vendedor en data.autoFactura.departamento');
          errorDepDisCiu = true;
        }
        if (!data['autoFactura']['distrito']) {
          this.errors.push('Debe especificar el Distrito Vendedor en data.autoFactura.distrito');
          errorDepDisCiu = true;
        }
      }
    }

    if (!data['autoFactura']['ubicacion']['ciudad']) {
      this.errors.push('Debe especificar la Ciudad del Lugar de la Transacción en data.autoFactura.ubicacion.ciudad');
      errorDepDisCiuUbi = true;
    } else {
      if (
        constanteService.ciudades.filter((ciudad: any) => ciudad.codigo === +data['autoFactura']['ubicacion']['ciudad'])
          .length == 0
      ) {
        this.errors.push(
          "Ciudad '" +
            data['autoFactura']['ubicacion']['ciudad'] +
            "' del Cliente en data.autoFactura.ubicacion.ciudad no encontrado. Valores: " +
            constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
        errorDepDisCiuUbi = true;
      }

      //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
      //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
      //data['autoFactura']['ubicacion']['ciudad']['distrito'] y data['autoFactura']['ubicacion']['ciudad']['departamento']
      let objCiudad: any = constanteService.ciudades.filter(
        (ciu) => ciu.codigo === +data['autoFactura']['ubicacion']['ciudad'],
      );

      if (objCiudad && objCiudad[0]) {
        let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

        let objDepartamento: any = constanteService.departamentos.filter(
          (dep) => dep.codigo === +objDistrito[0]['departamento'],
        );

        //Solo actualiza si no tiene valor
        if (!data['autoFactura']['ubicacion']['distrito'])
          data['autoFactura']['ubicacion']['distrito'] = objDistrito[0]['codigo'];

        if (!data['autoFactura']['ubicacion']['departamento'])
          data['autoFactura']['ubicacion']['departamento'] = objDepartamento[0]['codigo'];
      }

      if (errorDepDisCiuUbi) {
        if (!data['autoFactura']['ubicacion']['departamento']) {
          this.errors.push(
            'Debe especificar el Departamento del Lugar de la Transacción en data.autoFactura.ubicacion.departamento',
          );
          errorDepDisCiuUbi = true;
        }
        if (!data['autoFactura']['ubicacion']['distrito']) {
          this.errors.push(
            'Debe especificar el Distrito del Lugar de la Transacciónen data.autoFactura.ubicacion.distrito',
          );
          errorDepDisCiuUbi = true;
        }
      }
    }

    if (errorDepDisCiu) {
      constanteService.validateDepartamentoDistritoCiudad(
        'data.autoFactura',
        +data['autoFactura']['departamento'],
        +data['autoFactura']['distrito'],
        +data['autoFactura']['ciudad'],
        this.errors,
      );
    }

    if (errorDepDisCiuUbi) {
      constanteService.validateDepartamentoDistritoCiudad(
        'data.autoFactura.ubicacion',
        +data['autoFactura']['ubicacion']['departamento'],
        +data['autoFactura']['ubicacion']['distrito'],
        +data['autoFactura']['ubicacion']['ciudad'],
        this.errors,
      );
    }
  }

  private generateDatosEspecificosPorTipoDE_NotaCreditoDebitoValidate(params: any, data: any) {
    if (!(data['notaCreditoDebito']['motivo'] && data['notaCreditoDebito']['motivo'])) {
      this.errors.push('Debe completar el motivo para la nota de crédito/débito en data.notaCreditoDebito.motivo');
    } else {
      if (
        constanteService.notasCreditosMotivos.filter((um: any) => um.codigo === +data['notaCreditoDebito']['motivo'])
          .length == 0
      ) {
        this.errors.push(
          "Motivo de la Nota de Crédito/Débito '" +
            data['notaCreditoDebito']['motivo'] +
            "' en data.notaCreditoDebito.motivo no encontrado. Valores: " +
            constanteService.notasCreditosMotivos.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }
    }
  }

  private generateDatosEspecificosPorTipoDE_RemisionElectronicaValidate(params: any, data: any) {
    if (!(data['remision'] && data['remision']['motivo'])) {
      this.errors.push('No fue pasado el Motivo de la Remisión en data.remision.motivo.');
    } else {
      if (+data['remision']['motivo'] == 99) {
        if (!(data['remision'] && data['remision']['motivoDescripcion'])) {
          this.errors.push(
            'Debe especificar la Descripción el Motivo de la Remisión en data.remision.motivoDescripcion para el motivo=99.',
          );
        }
      }
    }

    if (!(data['remision'] && data['remision']['tipoResponsable'])) {
      this.errors.push('No fue pasado el Tipo de Responsable de la Remisión en data.remision.tipoResponsable.');
    }

    if (constanteService.remisionesMotivos.filter((um: any) => um.codigo === +data['remision']['motivo']).length == 0) {
      this.errors.push(
        "Motivo de la Remisión '" +
          data['remision']['motivo'] +
          "' en data.remision.motivo no encontrado. Valores: " +
          constanteService.remisionesMotivos.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }

    if (!data['remision']['kms']) {
      //analizar por que se puso
      this.errors.push('Debe especificar Kilometros estimado recorrido en data.remision.kms');
    }

    if (data['remision'] && data['remision']['motivo'] == 7) {
      //Motivo=7-Translado entre locales
      if (data['cliente']['ruc'] != params['ruc']) {
        this.errors.push('RUC del receptor debe coincidir con el RUC del emisor');
      }
    }

    if (
      constanteService.remisionesResponsables.filter((um: any) => um.codigo === data['remision']['tipoResponsable'])
        .length == 0
    ) {
      this.errors.push(
        "Tipo de Responsable '" +
          data['remision']['tipoResponsable'] +
          "' en data.remision.tipoResponsable no encontrado. Valores: " +
          constanteService.remisionesResponsables.map((a: any) => a.codigo + '-' + a.descripcion),
      );
    }
  }

  private generateDatosAutofacturaValidate(params: any, data: any) {
    if (!data['autoFactura']) {
      this.errors.push('Debe especificar los datos de Autofactura en data.autoFactura para el Tipo de Documento = 4');
      return;
    }

    if (!data['autoFactura']['documentoNumero']) {
      this.errors.push(
        'Debe especificar el Documento del Vendedor para la AutoFactura en data.autoFactura.documentoNumero',
      );
    } else {
      if (
        !(
          (data['autoFactura']['documentoNumero'] + '').length >= 1 &&
          (data['autoFactura']['documentoNumero'] + '').length <= 20
        )
      ) {
        this.errors.push(
          'El Numero de Documento del Vendedor en data.autoFactura.numeroDocuemnto debe contener entre 1 y 20 caracteres ',
        );
      }

      if (
        new RegExp(/[a-zA-Z]/g).test(data['autoFactura']['documentoNumero']) ||
        new RegExp(/\./g).test(data['autoFactura']['documentoNumero'])
      ) {
        this.errors.push(
          'El Numero de Documento del Vendedor "' +
            data['autoFactura']['documentoNumero'] +
            '" en data.autoFactura.numeroDocuemnto no puede contener Letras ni puntos',
        );
      }
    }

    if (!data['documentoAsociado']) {
      this.errors.push('Debe indicar el Documento Asociado en data.documentoAsociado para el Tipo de Documento = 4');
    } else {
      if (Array.isArray(data['documentoAsociado'])) {
        this.validateAsociadoConstancia(params, data['documentoAsociado'][0], true);
      } else {
        this.validateAsociadoConstancia(params, data['documentoAsociado'], false);
      }

      if (data['cliente']['contribuyente'] == false) {
        this.errors.push('El Cliente de una Autofactura debe ser Contribuyente en data.cliente.contribuyente');
      }
    }
  }

  private validateAsociadoConstancia(params: any, documentoAsociado: any, isArray: boolean) {
    if (!(documentoAsociado['constanciaControl'] && documentoAsociado['constanciaControl'].length > 0)) {
      this.errors.push(
        'Debe indicar el Número de Control de la Constancia en data.documentoAsociado.constanciaControl. ' +
          (isArray ? 'En la posicion 0' : ''),
      );
    } else {
      if ((documentoAsociado['constanciaControl'] + '').length != 8) {
        this.errors.push(
          'El Numero de Control de la Constancia "' +
            documentoAsociado['constanciaControl'] +
            '" en data.documentoAsociado.constanciaControl debe contener 8 caracteres. ' +
            (isArray ? 'En la posicion 0' : ''),
        );
      }
    }

    if (!(documentoAsociado['constanciaNumero'] && (documentoAsociado['constanciaNumero'] + '').length > 0)) {
      this.errors.push(
        'Debe indicar el Numero de la Constancia en data.documentoAsociado.constanciaNumero. ' +
          (isArray ? 'En la posicion 0' : ''),
      );
    } else {
      if (isNaN(documentoAsociado['constanciaNumero'])) {
        this.errors.push(
          'El Numero de la Constancia "' +
            documentoAsociado['constanciaNumero'] +
            '" en data.documentoAsociado.constanciaNumero debe ser numérico. ' +
            (isArray ? 'En la posicion 0' : ''),
        );
      }
      if ((documentoAsociado['constanciaNumero'] + '').length != 11) {
        this.errors.push(
          'El Numero de la Constancia "' +
            documentoAsociado['constanciaNumero'] +
            '" en data.documentoAsociado.constanciaNumero debe contener 11 caracteres. ' +
            (isArray ? 'En la posicion 0' : ''),
        );
      }
    }
  }
  private generateDatosCondicionOperacionDEValidate(params: any, data: any) {
    const items = data['items'];
    let sumaSubtotales = 0;

    if (true) {
      if (!data['condicion']) {
        this.errors.push('Debe indicar los datos de la Condición de la Operación en data.condicion');
        return; // sale metodo
      } else {
        if (
          constanteService.condicionesOperaciones.filter((um: any) => um.codigo === data['condicion']['tipo']).length ==
          0
        ) {
          this.errors.push(
            "Condición de la Operación '" +
              data['condicion']['tipo'] +
              "' en data.condicion.tipo no encontrado. Valores: " +
              constanteService.condicionesOperaciones.map((a: any) => a.codigo + '-' + a.descripcion),
          );
        }

        this.generateDatosCondicionOperacionDE_ContadoValidate(params, data);

        if (data['condicion']['tipo'] === 2) {
          this.generateDatosCondicionOperacionDE_CreditoValidate(params, data);
        }
      }
    }
  }

  /**
   * E7.1. Campos que describen la forma de pago de la operación al contado o del monto
   * de la entrega inicial (E605-E619)
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCondicionOperacionDE_ContadoValidate(params: any, data: any) {
    if (data['condicion']['tipo'] === 1) {
      if (!(data['condicion']['entregas'] && data['condicion']['entregas'].length > 0)) {
        this.errors.push(
          'El Tipo de Condición es 1 en data.condicion.tipo pero no se encontraron entregas en data.condicion.entregas',
        );
      }
    }

    if (data['condicion']['entregas'] && data['condicion']['entregas'].length > 0) {
      for (let i = 0; i < data['condicion']['entregas'].length; i++) {
        const dataEntrega = data['condicion']['entregas'][i];

        if (constanteService.condicionesTiposPagos.filter((um: any) => um.codigo === dataEntrega['tipo']).length == 0) {
          this.errors.push(
            "Condición de Tipo de Pago '" +
              dataEntrega['tipo'] +
              "' en data.condicion.entregas[" +
              i +
              '].tipo no encontrado. Valores: ' +
              constanteService.condicionesTiposPagos.map((a: any) => a.codigo + '-' + a.descripcion),
          );
        }

        if (dataEntrega['tipo'] == 99 && !dataEntrega['tipoDescripcion']) {
          this.errors.push(
            'Es obligatorio especificar la Descripción en data.condicion.entregas[' +
              i +
              '].tipoDescripcion para el tipo=99',
          );
        } else if (dataEntrega['tipo'] == 99) {
          if (
            !((dataEntrega['tipoDescripcion'] + '').length >= 4 && (dataEntrega['tipoDescripcion'] + '').length <= 30)
          ) {
            this.errors.push(
              'La Descripción del Tipo de Entrega en data.condicion.entregas[' +
                i +
                '].tipoDescripcion debe tener de 4 a 30 caracteres, para el tipo=99',
            );
          }
        }

        if (!dataEntrega['moneda']) {
          this.errors.push('Moneda es obligatorio en data.condicion.entregas[' + i + '].moneda');
        }

        if (constanteService.monedas.filter((um) => um.codigo === dataEntrega['moneda']).length == 0) {
          this.errors.push("Moneda '" + dataEntrega['moneda']) +
            "' data.condicion.entregas[" +
            i +
            '].moneda no válido. Valores: ' +
            constanteService.monedas.map((a) => a.codigo + '-' + a.descripcion);
        }

        //Verificar si el Pago es con Tarjeta de crédito
        if (dataEntrega['tipo'] === 3 || dataEntrega['tipo'] === 4) {
          if (!dataEntrega['infoTarjeta']) {
            this.errors.push(
              'Debe informar los datos de la tarjeta en data.condicion.entregas[' +
                i +
                '].infoTarjeta si la forma de Pago es a Tarjeta',
            );
          } else {
            if (!dataEntrega['infoTarjeta']['tipo']) {
              this.errors.push(
                'Debe especificar el tipo de tarjeta en data.condicion.entregas[' +
                  i +
                  '].infoTarjeta.tipo si la forma de Pago es a Tarjeta',
              );
            } else {
              if (
                constanteService.tarjetasCreditosTipos.filter(
                  (um: any) => um.codigo === dataEntrega['infoTarjeta']['tipo'],
                ).length == 0
              ) {
                this.errors.push(
                  "Tipo de Tarjeta '" +
                    dataEntrega['infoTarjeta']['tipo'] +
                    "' en data.condicion.entregas[" +
                    i +
                    '].infoTarjeta.tipo no encontrado. Valores: ' +
                    constanteService.tarjetasCreditosTipos.map((a: any) => a.codigo + '-' + a.descripcion),
                );
              }

              if (dataEntrega['infoTarjeta']['tipoDescripcion']) {
                if (
                  !(
                    (dataEntrega['infoTarjeta']['tipoDescripcion'] + '').length >= 4 &&
                    (dataEntrega['infoTarjeta']['tipoDescripcion'] + '').length <= 20
                  )
                ) {
                  this.errors.push(
                    'La descripción del Tipo de Tarjeta en data.condicion.entregas[' +
                      i +
                      '].infoTarjeta.tipoDescripcion debe tener de 4 a 20 caracteres',
                  );
                }
              }
            }

            if (dataEntrega['infoTarjeta']['ruc']) {
              if (dataEntrega['infoTarjeta']['ruc'].indexOf('-') == -1) {
                this.errors.push(
                  'RUC de Proveedor de Tarjeta debe contener digito verificador en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.ruc',
                );
              }

              var regExpOnlyNumber = new RegExp(/^\d+$/);
              const rucCliente = dataEntrega['infoTarjeta']['ruc'].split('-');

              //Un RUC puede ser alphanumerico
              /*if (!regExpOnlyNumber.test((rucCliente[0] + '').trim())) {
                this.errors.push(
                  "La parte del RUC del Cliente '" +
                    dataEntrega['infoTarjeta']['ruc'] +
                    "' en data.condicion.entregas[" +
                    i +
                    '].infoTarjeta.ruc debe ser numérico',
                );
              }*/
              if (!regExpOnlyNumber.test((rucCliente[1] + '').trim())) {
                this.errors.push(
                  "La parte del DV del RUC del Cliente '" +
                    dataEntrega['infoTarjeta']['ruc'] +
                    "' en data.condicion.entregas[" +
                    i +
                    '].infoTarjeta.ruc debe ser numérico',
                );
              }

              if (!(rucCliente[0].length >= 3 && rucCliente[0].length <= 8)) {
                this.errors.push(
                  "La parte del RUC '" +
                    dataEntrega['infoTarjeta']['ruc'] +
                    "' en data.condicion.entregas[" +
                    i +
                    '].infoTarjeta.ruc debe contener de 1 a 8 caracteres',
                );
              }

              if (rucCliente[1] > 9) {
                this.errors.push(
                  "La parte del DV del RUC '" +
                    dataEntrega['infoTarjeta']['ruc'] +
                    "' en data.condicion.entregas[" +
                    i +
                    '].infoTarjeta.ruc debe ser del 1 al 9',
                );
              }
            }

            if (dataEntrega['infoTarjeta']['codigoAutorizacion']) {
              if (
                !(
                  (dataEntrega['infoTarjeta']['codigoAutorizacion'] + '').length >= 6 &&
                  (dataEntrega['infoTarjeta']['codigoAutorizacion'] + '').length <= 10
                )
              ) {
                this.errors.push(
                  'El código de Autorización en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.codigoAutorizacion debe tener de 6 y 10 caracteres',
                );
              }
            }

            if (dataEntrega['infoTarjeta']['titular']) {
              if (
                !(
                  (dataEntrega['infoTarjeta']['titular'] + '').length >= 4 &&
                  (dataEntrega['infoTarjeta']['titular'] + '').length <= 30
                )
              ) {
                this.errors.push(
                  'El Titular de la Tarjeta en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.titular debe tener de 4 y 30 caracteres',
                );
              }
              //Validar que titular no tenga .
              if (dataEntrega['infoTarjeta']['titular'].indexOf('.') > -1) {
                this.errors.push(
                  'El valor "' +
                    dataEntrega['infoTarjeta']['titular'] +
                    '" en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.titular no es válido ',
                );
              }
              //Validar que titular no tenga /
              if (dataEntrega['infoTarjeta']['titular'].indexOf('/') > -1) {
                this.errors.push(
                  'El valor "' +
                    dataEntrega['infoTarjeta']['titular'] +
                    '" en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.titular no es válido ',
                );
              }
            }

            if (dataEntrega['infoTarjeta']['numero']) {
              if (!((dataEntrega['infoTarjeta']['numero'] + '').length == 4)) {
                this.errors.push(
                  'El código de Autorización en data.condicion.entregas[' +
                    i +
                    '].infoTarjeta.numero debe tener de 4 caracteres',
                );
              }
            }
          }
        }

        //Verificar si el Pago es con Cheque
        if (dataEntrega['tipo'] === 2) {
          if (!dataEntrega['infoCheque']) {
            this.errors.push(
              'Debe informar sobre el cheque en data.condicion.entregas[' +
                i +
                '].infoCheque si la forma de Pago es 2-Cheques',
            );
          }
        }

        if (dataEntrega['moneda'] !== 'PYG') {
          if (!dataEntrega['cambio']) {
            this.errors.push(
              'Debe informar la cotizacion del monto de la Entrega en data.condicion.entregas[' +
                i +
                '].cambio si la forma de Pago es diferente a PYG',
            );
          }
        }
      }
    }
  }

  /**
   * E7.2. Campos que describen la operación a crédito (E640-E649)
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCondicionOperacionDE_CreditoValidate(params: any, data: any) {
    if (!data['condicion']['credito']) {
      this.errors.push(
        'Fue especificado Condicion Tipo 2 (Crédito) pero el detalle de Crédito en data.condicion.credito es nulo',
      );
    } else {
      if (!data['condicion']['credito']['tipo']) {
        this.errors.push(
          'El tipo de Crédito en data.condicion.credito.tipo es obligatorio si la condición posee créditos',
        );
      } else {
        if (
          constanteService.condicionesCreditosTipos.filter(
            (um: any) => um.codigo === data['condicion']['credito']['tipo'],
          ).length == 0
        ) {
          this.errors.push(
            "Tipo de Crédito '" +
              data['condicion']['credito']['tipo'] +
              "' en data.condicion.credito.tipo no encontrado. Valores: " +
              constanteService.condicionesCreditosTipos.map((a: any) => a.codigo + '-' + a.descripcion),
          );
        }
      }

      if (+data['condicion']['credito']['tipo'] === 1) {
        //Plazo
        if (!data['condicion']['credito']['plazo']) {
          this.errors.push(
            'El tipo de Crédito en data.condicion.credito.tipo es 1 entonces data.condicion.credito.plazo es obligatorio',
          );
        } else {
          if (
            !(
              (data['condicion']['credito']['plazo'] + '').length >= 2 &&
              (data['condicion']['credito']['plazo'] + '').length <= 15
            )
          ) {
            this.errors.push(
              'El Plazo de Crédito en data.condicion.credito.plazo debe contener entre 2 y 15 caracteres ',
            );
          }
        }
      }

      if (+data['condicion']['credito']['tipo'] === 2) {
        //Cuota
        if (!data['condicion']['credito']['cuotas']) {
          this.errors.push(
            'El tipo de Crédito en data.condicion.credito.tipo es 2 entonces data.condicion.credito.cuotas es obligatorio',
          );
        } else {
        }

        //Si es Cuotas
        //Recorrer array de infoCuotas e informar en el JSON

        if (data['condicion']['credito']['infoCuotas'] && data['condicion']['credito']['infoCuotas'].length > 0) {
          for (let i = 0; i < data['condicion']['credito']['infoCuotas'].length; i++) {
            const infoCuota = data['condicion']['credito']['infoCuotas'][i];

            if (constanteService.monedas.filter((um: any) => um.codigo === infoCuota['moneda']).length == 0) {
              this.errors.push(
                "Moneda '" +
                  infoCuota['moneda'] +
                  "' en data.condicion.credito.infoCuotas[" +
                  i +
                  '].moneda no encontrado. Valores: ' +
                  constanteService.monedas.map((a: any) => a.codigo + '-' + a.descripcion),
              );
            }

            if (!infoCuota['vencimiento']) {
              //No es obligatorio
              //this.errors.push('Obligatorio informar data.transporte.inicioEstimadoTranslado. Formato yyyy-MM-dd');
            } else {
              if (!fechaUtilService.isIsoDate(infoCuota['vencimiento'])) {
                this.errors.push(
                  "Vencimiento de la Cuota '" +
                    infoCuota['vencimiento'] +
                    "' en data.condicion.credito.infoCuotas[" +
                    i +
                    '].vencimiento no válido. Formato: yyyy-MM-dd',
                );
              }
            }
          }
        } else {
          this.errors.push('Debe proporcionar data.condicion.credito.infoCuotas[]');
        }
      }
    }
  }

  public generateDatosComplementariosComercialesDeUsoEspecificosValidate(params: any, data: any) {
    if (data['sectorEnergiaElectrica']) {
      this.generateDatosSectorEnergiaElectricaValidate(params, data);
    }

    if (data['sectorSeguros']) {
      this.generateDatosSectorSegurosValidate(params, data);
    }

    if (data['sectorSupermercados']) {
      this.generateDatosSectorSupermercadosValidate(params, data);
    }

    if (data['sectorAdicional']) {
      this.generateDatosDatosAdicionalesUsoComercialValidate(params, data);
    }
  }

  /**
   * E9.2. Sector Energía Eléctrica (E791-E799)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorEnergiaElectricaValidate(params: any, data: any) {
    /*const jsonResult: any = {
      dNroMed: data['sectorEnergiaElectrica']['numeroMedidor'],
      dActiv: data['sectorEnergiaElectrica']['codigoActividad'],
      dCateg: data['sectorEnergiaElectrica']['codigoCategoria'],
      dLecAnt: data['sectorEnergiaElectrica']['lecturaAnterior'],
      dLecAct: data['sectorEnergiaElectrica']['lecturaActual'],
      dConKwh: data['sectorEnergiaElectrica']['lecturaActual'] - data['sectorEnergiaElectrica']['lecturaAnterior'],
    };*/

    if (data['sectorEnergiaElectrica']['lecturaAnterior'] > data['sectorEnergiaElectrica']['lecturaActual']) {
      this.errors.push('Sector Energia Electrica lecturaActual debe ser mayor a lecturaAnterior');
    }
  }

  /**
   * E9.3. Sector de Seguros (E800-E809)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorSegurosValidate(params: any, data: any) {
    /*const jsonResult: any = {
      dCodEmpSeg: data['sectorSeguros']['codigoAseguradora'],
      gGrupPolSeg: {
        dPoliza: data['sectorSeguros']['codigoPoliza'],
        dUnidVig: data['sectorSeguros']['vigenciaUnidad'], //horas, dias, año
        dVigencia: data['sectorSeguros']['vigencia'],
        dNumPoliza: data['sectorSeguros']['numeroPoliza'],
        dFecIniVig: data['sectorSeguros']['inicioVigencia'],
        dFecFinVig: data['sectorSeguros']['finVigencia'],
        dCodInt: data['sectorSeguros']['codigoInternoItem'],
      },
    };*/
  }

  /**
   * E9.4. Sector de Supermercados (E810-E819
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSectorSupermercadosValidate(params: any, data: any) {
    /*const jsonResult: any = {
      dNomCaj: data['sectorSupermercados']['nombreCajero'],
      dEfectivo: data['sectorSupermercados']['efectivo'],
      dVuelto: data['sectorSupermercados']['vuelto'],
      dDonac: data['sectorSupermercados']['donacion'],
      dDesDonac: data['sectorSupermercados']['donacionDescripcion'].substring(0, 20),
    };*/
  }

  /**
   * E9.5. Grupo de datos adicionales de uso comercial (E820-E829)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosDatosAdicionalesUsoComercialValidate(params: any, data: any) {
    /*const jsonResult: any = {
      dCiclo: data['sectorAdicional']['ciclo'].substring(0, 15),
      dFecIniC: data['sectorAdicional']['inicioCiclo'],
      dFecFinC: data['sectorAdicional']['finCiclo'],
      dVencPag: data['sectorAdicional']['vencimientoPago'],
      dContrato: data['sectorAdicional']['numeroContrato'],
      dSalAnt: data['sectorAdicional']['saldoAnterior'],
    };*/

    if (data['sectorAdicional']['ciclo']) {
      if (
        !((data['sectorAdicional']['ciclo'] + '').length >= 1 && (data['sectorAdicional']['ciclo'] + '').length <= 15)
      ) {
        this.errors.push('El Ciclo en data.sectorAdicional.ciclo debe contener entre 1 y 15 caracteres ');
      }
    }

    if (data['sectorAdicional']['inicioCiclo']) {
      if (!((data['sectorAdicional']['inicioCiclo'] + '').length == 10)) {
        this.errors.push('El Inicio de Ciclo en data.sectorAdicional.inicioCiclo debe contener 10 caracteres ');
      }
    }

    if (data['sectorAdicional']['finCiclo']) {
      if (!((data['sectorAdicional']['finCiclo'] + '').length == 10)) {
        this.errors.push('El Fin de Ciclo en data.sectorAdicional.finCiclo debe contener 10 caracteres ');
      }
    }

    if (data['sectorAdicional']['vencimientoPago']) {
      if (!((data['sectorAdicional']['vencimientoPago'] + '').length == 10)) {
        this.errors.push('La fecha de Pago en data.sectorAdicional.vencimientoPago debe contener 10 caracteres ');
      }

      let fecha = new Date(data.fecha);
      let fechaPago = new Date(data['sectorAdicional']['vencimientoPago']);
      if (fecha.getTime() > fechaPago.getTime()) {
        this.errors.push(
          "La fecha de pago '" +
            data['sectorAdicional']['vencimientoPago'] +
            "' en data.sectorAdicional.vencimientoPago debe ser despues de la Fecha del Documento",
        );
      }
    }

    if (data['sectorAdicional']['numeroContrato']) {
      if (
        !(
          (data['sectorAdicional']['numeroContrato'] + '').length >= 1 &&
          (data['sectorAdicional']['numeroContrato'] + '').length <= 30
        )
      ) {
        this.errors.push(
          'El numero de Contrato en data.sectorAdicional.numeroContrato debe contener entre 1 y 30 caracteres ',
        );
      }
    }

    if (data['sectorAdicional']['saldoAnterior']) {
      /*if ( ! ( (data['sectorAdicional']['saldoAnterior']+"").length >= 1 && (data['sectorAdicional']['saldoAnterior']+"").length <= 30 ) ) {
        this.errors.push("El numero de Contrato en data.sectorAdicional.saldoAnterior debe contener entre 1 y 30 caracteres ");        
      }*/
    }
  }

  /**
   * E10. Campos que describen el transporte de las mercaderías (E900-E999)
   *
   * Aqui puede entrar si tipoDocumento = 1 (opcional) o tipoDocumento = 7 (obligatorio)
   * @param params
   * @param data
   * @param options
   */
  public generateDatosTransporteValidate(params: any, data: any) {
    if (data['tipoDocumento'] == 7) {
      if (!(data['detalleTransporte'] && data['detalleTransporte']['tipo'] && data['detalleTransporte']['tipo'] > 0)) {
        this.errors.push('Obligatorio informar transporte.tipo');
      }
    }
    if (data['detalleTransporte'] && data['detalleTransporte']['condicionNegociacion']) {
      if (constanteService.condicionesNegociaciones.indexOf(data['detalleTransporte']['condicionNegociacion']) < -1) {
        this.errors.push(
          'detalleTransporte.condicionNegociación (' +
            data['detalleTransporte']['condicionNegociacion'] +
            ') no válido',
        );
      }
    }
    if (data['tipoDocumento'] == 7) {
      if (!data['detalleTransporte']['inicioEstimadoTranslado']) {
        this.errors.push('Obligatorio informar data.transporte.inicioEstimadoTranslado. Formato yyyy-MM-dd');
      } else {
        if (!fechaUtilService.isIsoDate(data['detalleTransporte']['inicioEstimadoTranslado'])) {
          this.errors.push(
            "Valor de la Fecha '" +
              data['detalleTransporte']['inicioEstimadoTranslado'] +
              "' en data.transporte.inicioEstimadoTranslado no válido. Formato: yyyy-MM-dd",
          );
        }
      }
    }
    if (data['tipoDocumento'] == 7) {
      if (!data['detalleTransporte']['finEstimadoTranslado']) {
        this.errors.push('Obligatorio informar data.transporte.finEstimadoTranslado. Formato yyyy-MM-dd');
      } else {
        if (!fechaUtilService.isIsoDate(data['detalleTransporte']['finEstimadoTranslado'])) {
          this.errors.push(
            "Valor de la Fecha '" +
              data['detalleTransporte']['finEstimadoTranslado'] +
              "' en data.transporte.finEstimadoTranslado no válido. Formato: yyyy-MM-dd",
          );
        }
      }
    }

    if (data['tipoDocumento'] == 7) {
      if (data['detalleTransporte']['inicioEstimadoTranslado'] && data['detalleTransporte']['finEstimadoTranslado']) {
        let fechaInicio = new Date(data['detalleTransporte']['inicioEstimadoTranslado']);
        let fechaFin = new Date(data['detalleTransporte']['finEstimadoTranslado']);

        let fechaHoy = new Date(new Date().toISOString().slice(0, -14));
        fechaHoy.setHours(0);
        fechaHoy.setMinutes(0);
        fechaHoy.setSeconds(0);
        fechaHoy.setMilliseconds(0);
      }
    }

    if (constanteService.tiposTransportes.filter((um) => um.codigo === data['detalleTransporte']['tipo']).length == 0) {
      this.errors.push(
        "Tipo de Transporte '" +
          data['detalleTransporte']['tipo'] +
          "' en data.transporte.tipo no encontrado. Valores: " +
          constanteService.tiposTransportes.map((a) => a.codigo + '-' + a.descripcion),
      );
    }
    if (
      constanteService.modalidadesTransportes.filter((um) => um.codigo === data['detalleTransporte']['modalidad'])
        .length == 0
    ) {
      this.errors.push(
        "Modalidad de Transporte '" +
          data['detalleTransporte']['modalidad'] +
          "' en data.transporte.modalidad no encontrado. Valores: " +
          constanteService.modalidadesTransportes.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    /*if (
      constanteService.condicionesNegociaciones.filter(
        (um) => um.codigo === data['detalleTransporte']['condicionNegociacion'],
      ).length == 0
    ) {
      this.errors.push(
        "Condición de Negociación '" +
          data['detalleTransporte']['condicionNegociacion'] +
          "' en data.transporte.condicionNegociacion no encontrado. Valores: " +
          constanteService.condicionesNegociaciones.map((a) => a.codigo + '-' + a.descripcion),
      );
    }*/

    if (data['detalleTransporte']['salida']) {
      this.generateDatosSalidaValidate(params, data);
    }
    if (data['detalleTransporte']['entrega']) {
      this.generateDatosEntregaValidate(params, data);
    }
    if (data['detalleTransporte']['vehiculo']) {
      this.generateDatosVehiculoValidate(params, data);
    }
    if (data['detalleTransporte']['transportista']) {
      this.generateDatosTransportistaValidate(params, data);
    }
  }

  /**
   * E10.1. Campos que identifican el local de salida de las mercaderías (E920-E939)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosSalidaValidate(params: any, data: any) {
    var regExpOnlyNumber = new RegExp(/^\d+$/);

    let errorDepDisCiu = false;
    if (!data['detalleTransporte']['salida']['ciudad']) {
      this.errors.push('Debe especificar la Ciudad del Local de Salida en data.transporte.salida.ciudad');
      errorDepDisCiu = true;
    } else {
      if (
        constanteService.ciudades.filter(
          (ciudad: any) => ciudad.codigo === +data['detalleTransporte']['salida']['ciudad'],
        ).length == 0
      ) {
        this.errors.push(
          "Ciudad '" +
            data['detalleTransporte']['salida']['ciudad'] +
            "' del Cliente en data.transporte.salida.ciudad no encontrado. Valores: " +
            constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
        errorDepDisCiu = true;
      }

      //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
      //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
      //data['detalleTransporte']['salida']['distrito'] y data['detalleTransporte']['salida']['departamento']
      let objCiudad: any = constanteService.ciudades.filter(
        (ciu) => ciu.codigo === +data['detalleTransporte']['salida']['ciudad'],
      );

      if (objCiudad && objCiudad[0]) {
        let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

        let objDepartamento: any = constanteService.departamentos.filter(
          (dep) => dep.codigo === +objDistrito[0]['departamento'],
        );

        //Solo actualiza si no tiene valor
        if (!data['detalleTransporte']['salida']['distrito'])
          data['detalleTransporte']['salida']['distrito'] = objDistrito[0]['codigo'];

        if (!data['detalleTransporte']['salida']['departamento'])
          data['detalleTransporte']['salida']['departamento'] = objDepartamento[0]['codigo'];
      }

      if (!errorDepDisCiu) {
        if (!data['detalleTransporte']['salida']['departamento']) {
          this.errors.push(
            'Debe especificar el Departamento del Local de Salida en data.transporte.salida.departamento',
          );
          errorDepDisCiu = true;
        }
        if (!data['detalleTransporte']['salida']['distrito']) {
          this.errors.push('Debe especificar el Distrito del Local de Salida en data.transporte.salida.distrito');
          errorDepDisCiu = true;
        }
      }
    }

    if (!errorDepDisCiu) {
      constanteService.validateDepartamentoDistritoCiudad(
        'data.transporte.salida',
        +data['detalleTransporte']['salida']['departamento'],
        +data['detalleTransporte']['salida']['distrito'],
        +data['detalleTransporte']['salida']['ciudad'],
        this.errors,
      );
    }

    if (!data['detalleTransporte']['salida']['direccion']) {
      this.errors.push('Debe especificar la Dirección del Local de Salida en data.transporte.salida.direccion');
    } else {
      if (
        !(
          data['detalleTransporte']['salida']['direccion'].length >= 1 &&
          data['detalleTransporte']['salida']['direccion'].length <= 255
        )
      ) {
        this.errors.push(
          "Dirección del Local de Salida '" +
            data['detalleTransporte']['salida']['direccion'] +
            "' en data.transporte.salida.direccion debe tener una longitud de 1 a 255 caracteres",
        );
      }
    }

    if (data['detalleTransporte']['salida']['numeroCasa'] == null) {
      this.errors.push('Debe especificar el Número de Casa del Local de Salida en data.transporte.salida.numeroCasa');
    } else {
      if (!((data['detalleTransporte']['salida']['numeroCasa'] + '').length > 0)) {
        this.errors.push('Debe especificar el Número de Casa del Local de Salida en data.transporte.salida.numeroCasa');
      } else {
        if (data['detalleTransporte']['salida']['numeroCasa']) {
          if (!regExpOnlyNumber.test(data['detalleTransporte']['salida']['numeroCasa'])) {
            this.errors.push('El Número de Casa en data.transporte.salida.numeroCasa debe ser numérico');
          }
        } else {
          if (
            !(
              (data['detalleTransporte']['salida']['numeroCasa'] + '').length >= 1 &&
              (data['detalleTransporte']['salida']['numeroCasa'] + '').length <= 6
            )
          ) {
            this.errors.push(
              "Número de Casa del Local de Salida '" +
                data['detalleTransporte']['salida']['numeroCasa'] +
                "' en data.transporte.salida.numeroCasa debe tener una longitud de 1 a 6 caracteres",
            );
          }
        }
      }
    }

    /*if (!data['detalleTransporte']['salida']['numeroCasa']) {
      this.errors.push('Debe especificar el Número de Casa del Local de Salida en data.transporte.salida.numeroCasa');
    } else {
      if (
        !(
          (data['detalleTransporte']['salida']['numeroCasa'] + '').length >= 1 &&
          (data['detalleTransporte']['salida']['numeroCasa'] + '').length <= 6
        )
      ) {
        this.errors.push(
          "Número de Casa del Local de Salida '" +
            data['detalleTransporte']['salida']['numeroCasa'] +
            "' en data.transporte.salida.numeroCasa debe tener una longitud de 1 a 6 caracteres",
        );
      }
    }*/
  }

  /**
   * E10.2. Campos que identifican el local de entrega de las mercaderías (E940-E959)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosEntregaValidate(params: any, data: any) {
    var regExpOnlyNumber = new RegExp(/^\d+$/);
    let errorDepDisCiu = false;
    if (!data['detalleTransporte']['entrega']['ciudad']) {
      this.errors.push('Debe especificar la Ciudad del Local de Entrega en data.transporte.entrega.ciudad');
      errorDepDisCiu = true;
    } else {
      if (
        constanteService.ciudades.filter(
          (ciudad: any) => ciudad.codigo === +data['detalleTransporte']['entrega']['ciudad'],
        ).length == 0
      ) {
        this.errors.push(
          "Ciudad '" +
            data['detalleTransporte']['entrega']['ciudad'] +
            "' del Cliente en data.transporte.entrega.ciudad no encontrado. Valores: " +
            constanteService.ciudades.map((a: any) => a.codigo + '-' + a.descripcion),
        );
        errorDepDisCiu = true;
      }

      //De acuerdo a la Ciudad pasada como parametro, buscar el distrito y departamento y asignar dichos
      //valores de forma predeterminada, aunque este valor sera sobre-escrito caso el usuario envie
      //data['detalleTransporte']['entrega']['distrito'] y data['detalleTransporte']['entrega']['departamento']
      let objCiudad: any = constanteService.ciudades.filter(
        (ciu) => ciu.codigo === +data['detalleTransporte']['entrega']['ciudad'],
      );

      if (objCiudad && objCiudad[0]) {
        let objDistrito: any = constanteService.distritos.filter((dis) => dis.codigo === +objCiudad[0]['distrito']);

        let objDepartamento: any = constanteService.departamentos.filter(
          (dep) => dep.codigo === +objDistrito[0]['departamento'],
        );

        //Solo actualiza si no tiene valor
        if (!data['detalleTransporte']['entrega']['distrito'])
          data['detalleTransporte']['entrega']['distrito'] = objDistrito[0]['codigo'];

        if (!data['detalleTransporte']['entrega']['departamento'])
          data['detalleTransporte']['entrega']['departamento'] = objDepartamento[0]['codigo'];
      }

      if (!errorDepDisCiu) {
        if (!data['detalleTransporte']['entrega']['departamento']) {
          this.errors.push(
            'Debe especificar el Departamento del Local de Entrega en data.transporte.entrega.departamento',
          );
          errorDepDisCiu = true;
        }
        if (!data['detalleTransporte']['entrega']['distrito']) {
          this.errors.push('Debe especificar el Distrito del Local de Entrega en data.transporte.entrega.distrito');
          errorDepDisCiu = true;
        }
      }
    }

    if (!errorDepDisCiu) {
      constanteService.validateDepartamentoDistritoCiudad(
        'data.transporte.entrega',
        +data['detalleTransporte']['entrega']['departamento'],
        +data['detalleTransporte']['entrega']['distrito'],
        +data['detalleTransporte']['entrega']['ciudad'],
        this.errors,
      );
    }

    /*
      const jsonResult: any = {
        dDirLocEnt: data['detalleTransporte']['entrega']['direccion'],
        dNumCasEnt: data['detalleTransporte']['entrega']['numeroCasa'],
        dComp1Ent: data['detalleTransporte']['entrega']['complementoDireccion1'],
        dComp2Ent: data['detalleTransporte']['entrega']['complementoDireccion1'],
        cDepEnt: data['detalleTransporte']['entrega']['departamento'],
        dDesDepEnt: constanteService.departamentos.filter(
          (td) => td.codigo === data['detalleTransporte']['entrega']['departamento'],
        )[0]['descripcion'],
        cDisEnt: data['detalleTransporte']['entrega']['distrito'],
        dDesDisEnt: constanteService.distritos.filter(
          (td) => td.codigo === data['detalleTransporte']['entrega']['distrito'],
        )[0]['descripcion'],
        cCiuEnt: data['detalleTransporte']['entrega']['ciudad'],
        dDesCiuEnt: constanteService.ciudades.filter(
          (td) => td.codigo === data['detalleTransporte']['entrega']['ciudad'],
        )[0]['descripcion'],
        //dTelEnt : data['detalleTransporte']['entrega']['telefonoContacto'],
      };
    */
    if (!data['detalleTransporte']['entrega']['direccion']) {
      this.errors.push('Debe especificar la Dirección del Local de Entrega en data.transporte.entrega.direccion');
    } else {
      if (
        !(
          data['detalleTransporte']['entrega']['direccion'].length >= 1 &&
          data['detalleTransporte']['entrega']['direccion'].length <= 255
        )
      ) {
        this.errors.push(
          "Dirección del Local de Entrega '" +
            data['detalleTransporte']['entrega']['direccion'] +
            "' en data.transporte.entrega.direccion debe tener una longitud de 1 a 255 caracteres",
        );
      }
    }

    if (data['detalleTransporte']['entrega']['numeroCasa'] == null) {
      this.errors.push('Debe especificar el Número de Casa del Local de Entrega en data.transporte.entrega.numeroCasa');
    } else {
      if (!((data['detalleTransporte']['entrega']['numeroCasa'] + '').length > 0)) {
        this.errors.push(
          'Debe especificar el Número de Casa del Local de Entrega en data.transporte.entrega.numeroCasa',
        );
      } else {
        if (data['detalleTransporte']['entrega']['numeroCasa']) {
          if (!regExpOnlyNumber.test(data['detalleTransporte']['entrega']['numeroCasa'])) {
            this.errors.push('El Número de Casa en data.transporte.entrega.numeroCasa debe ser numérico');
          }
        } else {
          if (
            !(
              (data['detalleTransporte']['entrega']['numeroCasa'] + '').length >= 1 &&
              (data['detalleTransporte']['entrega']['numeroCasa'] + '').length <= 6
            )
          ) {
            this.errors.push(
              "Número de Casa del Local de Entrega '" +
                data['detalleTransporte']['entrega']['numeroCasa'] +
                "' en data.transporte.entrega.numeroCasa debe tener una longitud de 1 a 6 caracteres",
            );
          }
        }
      }
    }

    /*if (!data['detalleTransporte']['entrega']['numeroCasa']) {
      this.errors.push('Debe especificar el Número de Casa del Local de Entrega en data.transporte.entrega.numeroCasa');
    } else {
      if (
        !(
          data['detalleTransporte']['entrega']['numeroCasa'].length >= 1 &&
          data['detalleTransporte']['entrega']['numeroCasa'].length <= 255
        )
      ) {
        this.errors.push(
          "Número de Casa del Local de Entrega '" +
            data['detalleTransporte']['entrega']['numeroCasa'] +
            "' en data.transporte.entrega.numeroCasa debe tener una longitud de 1 a 255 caracteres",
        );
      }
    }*/
  }

  /**
       * E10.3. Campos que identifican el vehículo de traslado de mercaderías (E960-E979)
  
       * 
       * @param params 
       * @param data 
       * @param options 
       * @param items Es el item actual del array de items de "data" que se está iterando
       */
  private generateDatosVehiculoValidate(params: any, data: any) {
    if (!(data['detalleTransporte'] && data['detalleTransporte']['vehiculo'])) {
      this.errors.push('Los datos del Vehiculo en data.transporte.vehiculo no fueron informados');
    } else {
      if (!data['detalleTransporte']['vehiculo']['tipo']) {
        this.errors.push('El tipo de Vehiculo en data.transporte.vehiculo.tipo no fue informado');
      } else {
        if (
          !(
            data['detalleTransporte']['vehiculo']['tipo'].length >= 4 &&
            data['detalleTransporte']['vehiculo']['tipo'].length <= 10
          )
        ) {
          this.errors.push(
            "Tipo de Vehiculo '" +
              data['detalleTransporte']['vehiculo']['tipo'] +
              "' en data.transporte.vehiculo.tipo debe tener una longitud de 4 a 10 caracteres ",
          );
        }
      }

      if (!data['detalleTransporte']['vehiculo']['documentoTipo']) {
        this.errors.push(
          'El Tipo de Documento del Vehiculo en data.transporte.vehiculo.documentoTipo no fue informado',
        );
      } else {
        if (+data['detalleTransporte']['vehiculo']['documentoTipo'] == 1) {
          if (!data['detalleTransporte']['vehiculo']['documentoNumero']) {
            this.errors.push(
              'El numero de identificacion del Vehiculo en data.transporte.vehiculo.documentoNumero no fue informado',
            );
          } else {
            if (
              !(
                data['detalleTransporte']['vehiculo']['documentoNumero'].length >= 1 &&
                data['detalleTransporte']['vehiculo']['documentoNumero'].length <= 20
              )
            ) {
              this.errors.push(
                "Número de Identificacion del Vehiculo '" +
                  data['detalleTransporte']['vehiculo']['documentoNumero'] +
                  "' en data.transporte.vehiculo.documentoNumero debe tener una longitud de 1 a 20 caracteres ",
              );
            }
          }
        }

        if (+data['detalleTransporte']['vehiculo']['documentoTipo'] == 2) {
          if (!data['detalleTransporte']['vehiculo']['numeroMatricula']) {
            this.errors.push(
              'El numero de matricula del Vehiculo en data.transporte.vehiculo.numeroMatricula no fue informado',
            );
          } else {
            if (
              !(
                data['detalleTransporte']['vehiculo']['numeroMatricula'].length >= 6 &&
                data['detalleTransporte']['vehiculo']['numeroMatricula'].length <= 7
              )
            ) {
              this.errors.push(
                "Número de Matricula '" +
                  data['detalleTransporte']['vehiculo']['numeroMatricula'] +
                  "' en data.transporte.vehiculo.numeroMatricula debe tener una longitud de 6 a 7 caracteres ",
              );
            }
          }
        }
      }
    }

    if (!data['detalleTransporte']['vehiculo']['marca']) {
      this.errors.push('La marca del Vehiculo en data.transporte.vehiculo.marca no fue informado');
    } else {
      if (
        !(
          data['detalleTransporte']['vehiculo']['marca'].length >= 1 &&
          data['detalleTransporte']['vehiculo']['marca'].length <= 10
        )
      ) {
        this.errors.push(
          "Marca del Vehiculo '" +
            data['detalleTransporte']['vehiculo']['marca'] +
            "' en data.transporte.vehiculo.marca debe tener una longitud de 1 a 10 caracteres",
        );
      }
    }
  }

  /**
   * E10.4. Campos que identifican al transportista (persona física o jurídica) (E980-E999)
   *
   * @param params
   * @param data
   * @param options
   * @param items Es el item actual del array de items de "data" que se está iterando
   */
  private generateDatosTransportistaValidate(params: any, data: any) {
    let errorEsContribuyente = false;
    if (data['detalleTransporte']['transportista']) {
      if (typeof data['detalleTransporte']['transportista']['contribuyente'] == 'undefined') {
        this.errors.push(
          'Debe indicar si el Transportista es o no un Contribuyente true|false en data.transporte.transportista.contribuyente',
        );
        errorEsContribuyente = true;
      }

      if (typeof data['detalleTransporte']['transportista']['contribuyente'] == 'undefined') {
        this.errors.push(
          'Debe indicar si el Transportista es o no un Contribuyente true|false en data.transporte.transportista.contribuyente',
        );
        errorEsContribuyente = true;
      }

      if (
        !(
          data['detalleTransporte']['transportista']['contribuyente'] === true ||
          data['detalleTransporte']['transportista']['contribuyente'] === false
        )
      ) {
        this.errors.push('data.transporte.transportista.contribuyente debe ser true|false');
        errorEsContribuyente = true;
      }
    }

    if (!errorEsContribuyente) {
      if (
        data['detalleTransporte'] &&
        data['detalleTransporte']['transportista'] &&
        data['detalleTransporte']['transportista']['contribuyente'] === true
      ) {
        if (
          !(
            data['detalleTransporte'] &&
            data['detalleTransporte']['transportista'] &&
            data['detalleTransporte']['transportista']['ruc']
          )
        ) {
          this.errors.push('Debe especificar el RUC para el Transportista en data.transporte.transportista.ruc');
        } else {
          if (data['detalleTransporte']['transportista']['ruc'].indexOf('-') == -1) {
            console.log('agregar error');

            this.errors.push('RUC debe contener dígito verificador en data.transporte.transportista.ruc');
          }

          var regExpOnlyNumber = new RegExp(/^\d+$/);
          const rucCliente = data['detalleTransporte']['transportista']['ruc'].split('-');

          //Un RUC puede ser alphanumerico
          /*if (!regExpOnlyNumber.test((rucCliente[0] + '').trim())) {
            this.errors.push(
              "La parte del RUC del Cliente '" +
                data['detalleTransporte']['transportista']['ruc'] +
                "' en data.transporte.transportista.ruc debe ser numérico",
            );
          }*/
          if (!regExpOnlyNumber.test((rucCliente[1] + '').trim())) {
            this.errors.push(
              "La parte del DV del RUC del Cliente '" +
                data['detalleTransporte']['transportista']['ruc'] +
                "' en data.transporte.transportista.ruc debe ser numérico",
            );
          }

          if (!(rucCliente[0].length >= 3 && rucCliente[0].length <= 8)) {
            this.errors.push(
              "La parte del RUC '" +
                data['detalleTransporte']['transportista']['ruc'] +
                "' en data.transporte.transportista.ruc debe contener de 1 a 8 caracteres",
            );
          }

          if (rucCliente[1] > 9) {
            this.errors.push(
              "La parte del DV del RUC '" +
                data['detalleTransporte']['transportista']['ruc'] +
                "' data.transporte.transportista.ruc debe ser del 1 al 9",
            );
          }
        }
      } else {
        //No es contribuyente
        if (!data['detalleTransporte']['transportista']['documentoTipo']) {
          this.errors.push('Debe especificar el Tipo de Documento en data.transporte.transportista.documentoTipo');
        } else {
          if (
            constanteService.tiposDocumentosIdentidades.filter(
              (um) => um.codigo === data['detalleTransporte']['transportista']['documentoTipo'],
            ).length == 0
          ) {
            this.errors.push(
              "Tipo de Documento '" +
                data['detalleTransporte']['transportista']['documentoTipo'] +
                "' en data.transporte.transportista.documentoTipo no encontrado. Valores: " +
                constanteService.tiposDocumentosIdentidades.map((a) => a.codigo + '-' + a.descripcion),
            );
          }
        }

        if (!data['detalleTransporte']['transportista']['documentoNumero']) {
          this.errors.push(
            'Es obligatorio especificar el Número de Documento la Empresa transportista en data.transporte.transportista.documentoNumero',
          );
        }
      }
    }

    //Datos obligatorios que no dependen de si es o no contribuyente
    if (!data['detalleTransporte']['transportista']['direccion']) {
      this.errors.push(
        'Es obligatorio especificar la dirección de la Empresa transportista en data.transporte.transportista.direccion',
      );
    } else {
      //Validar longitud
      if (
        !(
          data['detalleTransporte']['transportista']['direccion'].length >= 1 &&
          data['detalleTransporte']['transportista']['direccion'].length <= 150
        )
      ) {
        this.errors.push(
          'La direccion de la Empresa Transportista (' +
            data['detalleTransporte']['transportista']['direccion'] +
            ') en data.transporte.transportista.direccion debe tener una longitud de 1 a 150 caracteres',
        );
      }
    }

    //Chofer - Obligatorio
    if (
      !(
        data['detalleTransporte'] &&
        data['detalleTransporte']['transportista'] &&
        data['detalleTransporte']['transportista']['chofer']
      )
    ) {
      this.errors.push('Es obligatorio especificar los datos del chofer en data.transporte.transportista.chofer');
    } else {
      //Valida los datos del chofer

      if (!data['detalleTransporte']['transportista']['chofer']['documentoNumero']) {
        this.errors.push(
          'Es obligatorio especificar el nombre del chofer en data.transporte.transportista.chofer.documentoNumero',
        );
      } else {
        //Validar longitud
        if (
          !(
            data['detalleTransporte']['transportista']['chofer']['documentoNumero'].length >= 1 &&
            data['detalleTransporte']['transportista']['chofer']['documentoNumero'].length <= 20
          )
        ) {
          this.errors.push(
            'El número de documento del Chofer (' +
              data['detalleTransporte']['transportista']['chofer']['documentoNumero'] +
              ') en data.transporte.transportista.chofer.documentoNumero debe tener una longitud de 1 a 20 caracteres',
          );
        }

        //Validar si tiene puntos
        if ((data['detalleTransporte']['transportista']['chofer']['documentoNumero'] + '').includes('.')) {
          this.errors.push(
            'El número de documento del Chofer (' +
              data['detalleTransporte']['transportista']['chofer']['documentoNumero'] +
              ') en data.transporte.transportista.chofer.documentoNumero debe estar sin puntos',
          );
        }
      }

      if (!data['detalleTransporte']['transportista']['chofer']['nombre']) {
        this.errors.push(
          'Es obligatorio especificar el nombre del chofer en data.transporte.transportista.chofer.nombre',
        );
      } else {
        //Validar longitud
        if (
          !(
            data['detalleTransporte']['transportista']['chofer']['nombre'].length >= 4 &&
            data['detalleTransporte']['transportista']['chofer']['nombre'].length <= 60
          )
        ) {
          this.errors.push(
            'El nombre del Chofer (' +
              data['detalleTransporte']['transportista']['chofer']['nombre'] +
              ') en data.transporte.transportista.chofer.nombre debe tener una longitud de 4 a 60 caracteres',
          );
        }
      }

      if (!data['detalleTransporte']['transportista']['chofer']['direccion']) {
        this.errors.push(
          'Es obligatorio especificar la dirección del chofer en data.transporte.transportista.chofer.direccion',
        );
      } else {
        //Validar longitud
        if (
          !(
            data['detalleTransporte']['transportista']['chofer']['direccion'].length >= 4 &&
            data['detalleTransporte']['transportista']['chofer']['direccion'].length <= 60
          )
        ) {
          this.errors.push(
            'La direccion del Chofer (' +
              data['detalleTransporte']['transportista']['chofer']['direccion'] +
              ') en data.transporte.transportista.chofer.direccion debe tener una longitud de 4 a 60 caracteres',
          );
        }
      }
    }

    if (
      data['detalleTransporte'] &&
      data['detalleTransporte']['transportista'] &&
      data['detalleTransporte']['transportista']['agente'] &&
      data['detalleTransporte']['transportista']['agente']['ruc']
    ) {
      if (data['detalleTransporte']['transportista']['agente']['ruc'].indexOf('-') == -1) {
        this.errors.push('RUC debe contener dígito verificador en data.transporte.transportista.agente.ruc');
      }

      var regExpOnlyNumber = new RegExp(/^\d+$/);
      const rucCliente = data['detalleTransporte']['transportista']['agente']['ruc'].split('-');

      //Un RUC puede ser alphanumerico
      /*if (!regExpOnlyNumber.test((rucCliente[0] + '').trim())) {
        this.errors.push(
          "La parte del RUC del Cliente '" +
            data['detalleTransporte']['transportista']['agente']['ruc'] +
            "' en data.transporte.transportista.agente.ruc debe ser numérico",
        );
      }*/
      if (!regExpOnlyNumber.test((rucCliente[1] + '').trim())) {
        this.errors.push(
          "La parte del DV del RUC del Cliente '" +
            data['detalleTransporte']['transportista']['agente']['ruc'] +
            "' en data.transporte.transportista.agente.ruc debe ser numérico",
        );
      }

      if (!(rucCliente[0].length >= 3 && rucCliente[0].length <= 8)) {
        this.errors.push(
          "La parte del RUC '" +
            data['detalleTransporte']['transportista']['agente']['ruc'] +
            "' en data.transporte.transportista.agente.ruc debe contener de 3 a 8 caracteres",
        );
      }

      if (rucCliente[1] > 9) {
        this.errors.push(
          "La parte del DV del RUC '" +
            data['detalleTransporte']['transportista']['agente']['ruc'] +
            "' data.transporte.transportista.agente.ruc debe ser del 1 al 9",
        );
      }
    }

    if (data['detalleTransporte']['transportista'] && data['detalleTransporte']['transportista']['pais']) {
      if (
        constanteService.paises.filter(
          (pais: any) => pais.codigo === data['detalleTransporte']['transportista']['pais'],
        ).length == 0
      ) {
        this.errors.push(
          "Pais '" +
            data['detalleTransporte']['transportista']['pais'] +
            "' del Cliente en data.transporte.transportista.pais no encontrado. Valores: " +
            constanteService.paises.map((a: any) => a.codigo + '-' + a.descripcion),
        );
      }
    }
  }

  public generateDatosTotalesValidate(params: any, data: any, config: XmlgenConfig) {
    /*let temporalTotal = jsonDteTotales.generateDatosTotales(params, data, data.items, config);
    console.log("temporalTotal", temporalTotal);

    if (data.descuentoGlobal > 0) {
      console.log("temporalTotal", data.descuentoGlobal);
    }*/

    if (data['moneda'] != 'PYG' && data['condicionTipoCambio'] == 1) {
      if (!data['cambio']) {
        this.errors.push(
          'Debe especificar el valor del Cambio en data.cambio cuando moneda != PYG y la Cotización es Global',
        );
      }
    }

    if (data.moneda == 'PYG') {
      if ((data['descuentoGlobal'] + '').split('.')[1]?.length > 0) {
        this.errors.push(
          'El Descuento Global "' +
            data['descuentoGlobal'] +
            '" en "PYG" en data.descuentoGlobal, no puede contener decimales',
        );
      }
    } else {
      if ((data['descuentoGlobal'] + '').split('.')[1]?.length > 8) {
        this.errors.push(
          'El Descuento Global "' +
            data['descuentoGlobal'] +
            '" en data.descuentoGlobal, no puede contener mas de 8 decimales',
        );
      }
    }

    if (data.moneda == 'PYG') {
      if ((data['anticipoGlobal'] + '').split('.')[1]?.length > 0) {
        this.errors.push(
          'El Anticipo Global "' +
            data['anticipoGlobal'] +
            '" en "PYG" en data.anticipoGlobal, no puede contener decimales',
        );
      }
    } else {
      if ((data['anticipoGlobal'] + '').split('.')[1]?.length > 8) {
        this.errors.push(
          'El Anticipo Global "' +
            data['anticipoGlobal'] +
            '" en data.anticipoGlobal, no puede contener mas de 8 decimales',
        );
      }
    }
  }

  /**
   * G. Campos complementarios comerciales de uso general (G001-G049)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosComercialesUsoGeneralValidate(params: any, data: any) {
    const jsonResult: any = {
      //dOrdCompra : data['complementarios']['ordenCompra'],
      //dOrdVta : data['complementarios']['ordenVenta'],
      //dAsiento : data['complementarios']['numeroAsiento']
    };

    if (data['tipoDocumento'] == 1 || data['tipoDocumento'] == 7) {
      //Opcional si 1 o 7
      if (
        (data['complementarios'] &&
          data['complementarios']['carga'] &&
          data['complementarios']['carga']['volumenTotal']) ||
        (data['complementarios'] && data['complementarios']['carga'] && data['complementarios']['carga']['pesoTotal'])
      ) {
        this.generateDatosCargaValidate(params, data);
      }
    }
  }

  /**
   * G1. Campos generales de la carga (G050 - G099)
   *
   * @param params
   * @param data
   * @param options
   */
  private generateDatosCargaValidate(params: any, data: any) {
    //TODO ALL
    /*const jsonResult: any = {
      cUniMedTotVol : data['complementarios']['carga']['unidadMedida'], 
            dDesUniMedTotVol : data['complementarios']['carga']['ordenVenta'],
            dTotVolMerc : data['complementarios']['carga']['totalVolumenMercaderia'],
            cUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dDesUniMedTotPes : data['complementarios']['carga']['numeroAsiento'],
            dTotPesMerc : data['complementarios']['carga']['numeroAsiento'],
            iCarCarga : data['complementarios']['carga']['numeroAsiento'],
            dDesCarCarga : data['complementarios']['carga']['numeroAsiento'],
    };*/

    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['unidadMedidaVolumenTotal']
    ) {
      if (
        constanteService.unidadesMedidas.filter(
          (um) => um.codigo === data['complementarios']['carga']['unidadMedidaVolumenTotal'],
        ).length == 0
      ) {
        this.errors.push(
          "Unidad de Medida '" +
            data['complementarios']['carga']['unidadMedidaVolumenTotal'] +
            "' en data.complementarios.carga.unidadMedidaVolumenTotal no válido. Valores: " +
            constanteService.unidadesMedidas.map((a) => a.codigo + '-' + a.descripcion.trim()),
        );
      }
    }

    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['unidadMedidaPesoTotal']
    ) {
      if (
        constanteService.unidadesMedidas.filter(
          (um) => um.codigo === data['complementarios']['carga']['unidadMedidaPesoTotal'],
        ).length == 0
      ) {
        this.errors.push(
          "Unidad de Medida '" +
            data['complementarios']['carga']['unidadMedidaPesoTotal'] +
            "' en data.complementarios.carga.unidadMedidaPesoTotal no válido. Valores: " +
            constanteService.unidadesMedidas.map((a) => a.codigo + '-' + a.descripcion.trim()),
        );
      }
    }

    if (
      data['complementarios'] &&
      data['complementarios']['carga'] &&
      data['complementarios']['carga']['caracteristicaCarga']
    ) {
      if (
        constanteService.caracteristicasCargas.filter(
          (um) => um.codigo === data['complementarios']['carga']['caracteristicaCarga'],
        ).length == 0
      ) {
        this.errors.push(
          "Característica de Carga '" +
            data['complementarios']['carga']['caracteristicaCarga'] +
            "' en data.complementarios.carga.caracteristicaCarga no válido. Valores: " +
            constanteService.caracteristicasCargas.map((a) => a.codigo + '-' + a.descripcion),
        );
      }

      if (data['complementarios']['carga']['caracteristicaCarga'] == 3) {
        if (!data['complementarios']['carga']['caracteristicaCargaDescripcion']) {
          this.errors.push(
            'Para data.complementarios.carga.caracteristicaCarga = 3 debe informar el campo data.complementarios.carga.caracteristicaCargaDescripcion',
          );
        }
      }
    }
  }

  /**
   * H. Campos que identifican al documento asociado (H001-H049)
   *
   * @param params
   * @param data
   * @param options
   */
  public generateDatosDocumentoAsociadoValidate(params: any, dataDocumentoAsociado: any, data: any) {
    if (data['tipoTransaccion'] == 11 && !dataDocumentoAsociado['resolucionCreditoFiscal']) {
      this.errors.push('Obligatorio informar data.documentoAsociado.resolucionCreditoFiscal');
    }

    //Validaciones
    if (
      constanteService.tiposDocumentosAsociados.filter((um) => um.codigo === +dataDocumentoAsociado['formato'])
        .length == 0
    ) {
      this.errors.push(
        "Formato de Documento Asociado '" +
          dataDocumentoAsociado['formato'] +
          "' en data.documentoAsociado.formato no encontrado. Valores: " +
          constanteService.tiposDocumentosAsociados.map((a) => a.codigo + '-' + a.descripcion),
      );
    }

    if (dataDocumentoAsociado['tipo'] == 2) {
      if (
        constanteService.tiposDocumentosImpresos.filter(
          (um) => um.codigo === dataDocumentoAsociado['tipoDocumentoImpreso'],
        ).length == 0
      ) {
        this.errors.push(
          "Tipo de Documento impreso '" +
            dataDocumentoAsociado['tipoDocumentoImpreso'] +
            "' en data.documentoAsociado.tipoDocumentoImpreso no encontrado. Valores: " +
            constanteService.tiposDocumentosImpresos.map((a) => a.codigo + '-' + a.descripcion),
        );
      }
    }

    if (dataDocumentoAsociado['formato'] == 1) {
      //H002 = Electronico
      if (!(dataDocumentoAsociado['cdc'] && dataDocumentoAsociado['cdc'].length >= 44)) {
        this.errors.push('Debe indicar el CDC asociado en data.documentoAsociado.cdc');
      }
      if (dataDocumentoAsociado['rucFusionado']) {
        if (!(dataDocumentoAsociado['rucFusionado'] >= 3 && dataDocumentoAsociado['rucFusionado'].length <= 8)) {
          this.errors.push('El RUC fusionado debe estar entre 3 y 8 caracteres');
        }
      }
    }
    if (dataDocumentoAsociado['formato'] == 2) {
      //H002 = Impreso
      if (!dataDocumentoAsociado['timbrado']) {
        this.errors.push(
          'Debe especificar el Timbrado del Documento impreso Asociado en data.documentoAsociado.timbrado',
        );
      }
      if (!dataDocumentoAsociado['establecimiento']) {
        this.errors.push(
          'Debe especificar el Establecimiento del Documento impreso Asociado en data.documentoAsociado.establecimiento',
        );
      }
      if (!dataDocumentoAsociado['punto']) {
        this.errors.push('Debe especificar el Punto del Documento impreso Asociado en data.documentoAsociado.punto');
      }

      if (!dataDocumentoAsociado['numero']) {
        this.errors.push('Debe especificar el Número del Documento impreso Asociado en data.documentoAsociado.numero');
      }

      if (!dataDocumentoAsociado['tipoDocumentoImpreso']) {
        this.errors.push(
          'Debe especificar el Tipo del Documento Impreso Asociado en data.documentoAsociado.tipoDocumentoImpreso',
        );
      }

      if (dataDocumentoAsociado['fecha']) {
        if ((dataDocumentoAsociado['fecha'] + '').length != 10) {
          this.errors.push(
            'La Fecha del Documento impreso Asociado en data.documentoAsociado.fecha debe tener una longitud de 10 caracteres',
          );
        }
      } else {
        this.errors.push('Debe especificar la Fecha del Documento impreso Asociado en data.documentoAsociado.fecha');
      }
    }

    if (dataDocumentoAsociado['formato'] == 3) {
      //H002 = Constancia electronica
      if (!dataDocumentoAsociado['constanciaTipo']) {
        this.errors.push('Debe especificar el Tipo de Constancia data.documentoAsociado.constanciaTipo');
      } else {
        if (
          constanteService.tiposConstancias.filter((um) => um.codigo === dataDocumentoAsociado['constanciaTipo'])
            .length == 0
        ) {
          this.errors.push(
            "Tipo de Constancia '" +
              dataDocumentoAsociado['constanciaTipo'] +
              "' en data.documentoAsociado.constanciaTipo no encontrado. Valores: " +
              constanteService.tiposConstancias.map((a) => a.codigo + '-' + a.descripcion),
          );
        }
      }
    }
  }
}

export default new JSonDeMainValidateService();
