import deService from './services/jsonDeMain.service';
import eventoService from './services/jsonEventoMain.service';
import { XmlgenConfig } from './services/type.interface.';

class DE {
  generateXMLDE = (params: any, data: any, config?: XmlgenConfig): Promise<any> => {
    return deService.generateXMLDE(params, data, config);
  };

  generateXMLEventoCancelacion = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoCancelacion(id, params, data);
  };

  generateXMLEventoInutilizacion = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoInutilizacion(id, params, data);
  };

  generateXMLEventoConformidad = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoConformidad(id, params, data);
  };

  generateXMLEventoDisconformidad = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoDisconformidad(id, params, data);
  };

  generateXMLEventoDesconocimiento = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoDesconocimiento(id, params, data);
  };

  generateXMLEventoNotificacion = (id: number, params: any, data: any): Promise<any> => {
    return eventoService.generateXMLEventoNotificacion(id, params, data);
  };

  consultarDepartamentos = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      resolve(deService.getDepartamentos());
    });
  };

  consultarDistritos = (departamento: number | null): Promise<any> => {
    return new Promise((resolve, reject) => {
      resolve(deService.getDistritos(departamento));
    });
  };

  consultarCiudades = (distrito: number | null): Promise<any> => {
    return new Promise((resolve, reject) => {
      resolve(deService.getCiudades(distrito));
    });
  };

  consultarTiposRegimenes = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      resolve(deService.getTiposRegimenes());
    });
  };

  getDepartamento = (departamentoId: number) : any => {
    let departamentos = deService.getDepartamento(departamentoId);
    if (departamentos.length > 0) {
      return departamentos[0];
    } else {
      return null;
    }
  };

  getDistrito = (distritoId: number) : any => {
    let distritos = deService.getDistrito(distritoId);
    if (distritos.length > 0) {
      return distritos[0];
    } else {
      return null;
    }
  };

  getCiudad = (ciudadId: number) : any => {
    let ciudades = deService.getCiudad(ciudadId);
    if (ciudades.length > 0) {
      return ciudades[0];
    } else {
      return null;
    }
  };
}

export default new DE();
