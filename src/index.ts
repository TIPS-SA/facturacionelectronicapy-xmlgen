import deService from './services/jsonDeMain.service';
import eventoService from './services/jsonEventoMain.service';
class DE {
    generateXMLDE = (params: any, data: any) : Promise<any> => {
        return deService.generateXMLDE(params, data);
    }

    generateXMLEvento = (params: any, data: any) : Promise<any> => {
        return eventoService.generateXMLEvento(params, data);
    }
    
}

export default new DE();
