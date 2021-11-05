import deService from './services/jsonDeMain.service';
import eventoService from './services/jsonEventoMain.service';
class DE {
    generateXMLDE = (params: any, data: any) : Promise<any> => {
        return deService.generateXMLDE(params, data);
    }

    generateXMLEvento = (params: any, data: any) : Promise<any> => {
        return eventoService.generateXMLEvento(params, data);
    }
    
    consultarDepartamentos = () : Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(deService.getDepartamentos());
        });
    }

    consultarDistritos = (departamento: number) : Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(deService.getDistritos(departamento));
        });
    }

    consultarCiudades = (distrito: number) : Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(deService.getCiudades(distrito));
        });
    }

    consultarTiposRegimenes = () : Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(deService.getTiposRegimenes());
        });
    }

}

export default new DE();
