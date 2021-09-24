import dteService from './services/jsonDteMain.service';
class DE {
    generateXML = (params: any, data: any) : Promise<any> => {
        return dteService.generateXML(params, data, this);
    }

    /**
     * Metodo que debe ser sobre-escrito en el proyecto cliente
     * 
     * Genera el Codigo de Seguridad aleatorio, conforme especificaciones DT
     * 
     * - Debe ser un número positivo de 9 dígitos. 
     * - Aleatorio. 
     * - Debe ser distinto para cada DE y generado por un algoritmo de complejidad suficiente 
     *   para evitar la reproducción del valor. 
     * - Rango NO SECUENCIAL entre 000000001 y 999999999. 
     * - No tener relación con ninguna información específica o directa del DE o del emisor 
     *   de manera a garantizar su seguridad. 
     * - No debe ser igual al número de documento campo dNumDoc. 
     * - En caso de ser un número de menos de 9 dígitos completar con 0 a la izquierda. 
     * 
     * @param params 
     * @param data 
     * @returns 
     */
    generateCodigoSeguridadAleatorio(params: any, data: any) : string{
        return "[DebeSobreescribirElMétodo.generateCodigoSeguridadAleatorio(params, data)]";
    }
}

export default new DE();
