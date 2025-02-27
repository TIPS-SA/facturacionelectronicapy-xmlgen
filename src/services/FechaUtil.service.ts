import stringUtilService from './StringUtil.service';

class FechaUtilService {
  convertToAAAAMMDD(fecha: Date) {
    return (
      fecha.getFullYear() +
      stringUtilService.leftZero(fecha.getMonth() + 1, 2) +
      stringUtilService.leftZero(fecha.getDate(), 2)
    );
  }
  convertToAAAA_MM_DD(fecha: Date) {
    return (
      fecha.getFullYear() +
      '-' +
      stringUtilService.leftZero(fecha.getMonth() + 1, 2) +
      '-' +
      stringUtilService.leftZero(fecha.getDate(), 2)
    );
  }
  convertToJSONFormat(fecha: Date) {
    return (
      fecha.getFullYear() +
      '-' +
      stringUtilService.leftZero(fecha.getMonth() + 1, 2) +
      '-' +
      stringUtilService.leftZero(fecha.getDate(), 2) +
      'T' +
      stringUtilService.leftZero(fecha.getHours(), 2) +
      ':' +
      stringUtilService.leftZero(fecha.getMinutes(), 2) +
      ':' +
      stringUtilService.leftZero(fecha.getSeconds(), 2)
    );
  }

  isIsoDateTime(str: string) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return false;
    var d = new Date(str + '.000Z');
    return d.toISOString() === str + '.000Z';
  }

  isIsoDate(str: string) {
    if (!/\d{4}-\d{2}-\d{2}/.test(str)) return false;
    return true;
    //var d = new Date(str + '.000Z');
    //return d.toISOString() === str + '.000Z';
  }
}

export default new FechaUtilService();
