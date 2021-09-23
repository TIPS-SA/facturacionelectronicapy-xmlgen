import dteService from './services/jsonDteMain.service';
class DE {

    sayHola = () => `Hola $ {nombre}`; 

    generateXML = (params: any, data: any) : Promise<any> => {
        return dteService.generateXML(params, data);
    }; 
}

export default new DE();
