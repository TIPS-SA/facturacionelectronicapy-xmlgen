import stringUtilService from './StringUtil.service';

class FechaUtilService {
  convertToAAAAMMDD(fecha: Date) {
    return (
      fecha.getFullYear() +
      stringUtilService.leftZero(fecha.getMonth() + 1, 2) +
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
}

export default new FechaUtilService();
